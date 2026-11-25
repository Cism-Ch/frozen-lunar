"use server";

import { z } from "zod";
import {
    geminiService,
    generateSupportAiResponse,
    getGeminiApiKey,
    getGeminiModel,
    isGeminiAvailable,
    EstimationResult,
} from "@/lib/gemini";
import {
    getOpenRouterApiKey,
    getOpenRouterModel,
    isOpenRouterAvailable,
} from "@/lib/openrouter";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// Schémas de validation Zod
const estimateTransportSchema = z.object({
    pickup: z.string().min(1, "Le lieu de départ est requis"),
    dropoff: z.string().min(1, "Le lieu d'arrivée est requis"),
    type: z.string().min(1, "Le type de transport est requis"),
});

const draftEmailSchema = z.object({
    type: z.enum(["validation", "refusal", "question"]),
    clientName: z.string().min(1, "Le nom du client est requis"),
    quoteId: z.string().min(1, "L'identifiant du devis est requis"),
});

const supportChatSchema = z.object({
    message: z.string().min(1, "Le message ne peut pas être vide").max(1000),
    history: z
        .array(
            z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string(),
            })
        )
        .optional(),
});

export type AiSystemStatus = {
    isAvailable: boolean;
    mode: "gemini" | "openrouter" | "resilient_local";
    model: string;
    hasKey: boolean;
};

/**
 * Récupère le statut opérationnel du sous-système IA (Gemini 2.5 / OpenRouter / fail-safe).
 */
export async function getAiStatusAction(): Promise<{
    data: AiSystemStatus | null;
    error: string | null;
}> {
    try {
        const geminiReady = isGeminiAvailable();
        const openRouterReady = isOpenRouterAvailable();

        if (geminiReady) {
            return {
                data: {
                    isAvailable: true,
                    mode: "gemini",
                    model: getGeminiModel(),
                    hasKey: getGeminiApiKey() !== null,
                },
                error: null,
            };
        }

        if (openRouterReady) {
            return {
                data: {
                    isAvailable: true,
                    mode: "openrouter",
                    model: getOpenRouterModel(),
                    hasKey: getOpenRouterApiKey() !== null,
                },
                error: null,
            };
        }

        return {
            data: {
                isAvailable: false,
                mode: "resilient_local",
                model: "moteur-local-heuristique",
                hasKey: false,
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("Erreur getAiStatusAction", error);
        return {
            data: {
                isAvailable: false,
                mode: "resilient_local",
                model: "moteur-local-heuristique",
                hasKey: false,
            },
            error: null,
        };
    }
}

/**
 * Estimation de transport via Gemini avec basculement automatique sur le moteur heuristique en cas de défaillance.
 */
export async function estimateTransportAction(
    input: unknown
): Promise<{ data: EstimationResult | null; error: string | null }> {
    try {
        const rl = await checkRateLimit({
            scope: "ai-estimate-transport",
            limit: 15,
            windowSeconds: 600,
        });
        if (!rl.allowed) {
            return {
                data: null,
                error: "Trop d'estimations récentes. Veuillez patienter quelques minutes.",
            };
        }

        const validated = estimateTransportSchema.parse(input);
        const result = await geminiService.estimateTransport(
            validated.pickup,
            validated.dropoff,
            validated.type
        );
        return { data: result, error: null };
    } catch (error: unknown) {
        logger.error("Erreur estimateTransportAction", error);
        if (error instanceof z.ZodError) {
            return {
                data: null,
                error:
                    error.issues[0]?.message ||
                    "Données d'estimation invalides",
            };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Erreur lors de l'estimation du transport",
        };
    }
}

/**
 * Génération de brouillon d'email pour l'administration avec basculement automatique sur les modèles métier.
 */
export async function draftEmailAction(input: unknown): Promise<{
    data: { subject: string; body: string } | null;
    error: string | null;
}> {
    try {
        await requireAdmin();
        const validated = draftEmailSchema.parse(input);
        const draft = await geminiService.draftEmail(
            validated.type,
            validated.clientName,
            validated.quoteId
        );
        return { data: draft, error: null };
    } catch (error: unknown) {
        logger.error("Erreur draftEmailAction", error);
        if (error instanceof z.ZodError) {
            return {
                data: null,
                error:
                    error.issues[0]?.message || "Paramètres d'email invalides",
            };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return { data: null, error: "Erreur lors de la rédaction de l'email" };
    }
}

const sendQuoteEmailSchema = z.object({
    quoteId: z.string().min(1, "Identifiant de devis requis"),
    subject: z.string().min(3, "Objet trop court").max(200),
    body: z.string().min(10, "Message trop court").max(6000),
});

function escapeHtml(raw: string): string {
    return raw
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * Envoie directement un email rédigé depuis l'espace de travail admin au client du devis
 * via la passerelle transactionnelle (Resend → fallback Gmail SMTP) et trace l'envoi en audit.
 */
export async function sendAdminQuoteEmailAction(input: unknown): Promise<{
    data: { provider: string } | null;
    error: string | null;
}> {
    try {
        const admin = await requireAdmin();
        const parsed = sendQuoteEmailSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Paramètres d'envoi invalides.",
            };
        }

        const quote = await prisma.quote.findUnique({
            where: { id: parsed.data.quoteId },
            select: { id: true, email: true, clientName: true },
        });
        if (!quote) {
            return { data: null, error: "Devis introuvable." };
        }

        const htmlParagraphs = parsed.data.body
            .split(/\n{2,}/)
            .map(
                (p) =>
                    `<p style="margin:0 0 12px;line-height:1.6;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`
            )
            .join("");

        const sendRes = await sendTransactionalEmail({
            to: quote.email,
            subject: parsed.data.subject,
            text: parsed.data.body,
            html: `<div style="font-family:Arial,sans-serif;color:#111827;max-width:600px;">${htmlParagraphs}</div>`,
        });

        if (sendRes.error) {
            return { data: null, error: sendRes.error.message };
        }

        await prisma.quoteHistory.create({
            data: {
                quoteId: quote.id,
                action: "Email envoyé au client",
                description: `Objet : ${parsed.data.subject} (via ${sendRes.provider})`,
                user: admin.name || admin.email,
            },
        });

        revalidatePath(`/admin/quotes/${quote.id}`);

        return { data: { provider: sendRes.provider }, error: null };
    } catch (error: unknown) {
        logger.error("Erreur sendAdminQuoteEmailAction", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible d'envoyer l'email.",
        };
    }
}

/**
 * Traitement des requêtes conversationnelles du support client (Mode IA).
 * Tente Gemini 2.5 Flash puis OpenRouter ; si indisponible ou erreur, renvoie data=null
 * pour déclencher le Mode Robot déterministe local sans interruption de service.
 */
export async function generateSupportAiAction(input: unknown): Promise<{
    data: {
        message: string;
        category: "technical" | "billing" | "quote" | "transport" | "general";
        sentiment: "positive" | "neutral" | "negative";
        shouldEscalate: boolean;
        suggestedAction?: "start_quote_flow" | "contact_human" | null;
        source: "gemini" | "openrouter" | "resilient_local";
    } | null;
    error: string | null;
}> {
    try {
        const rl = await checkRateLimit({
            scope: "ai-support-chat",
            limit: 25,
            windowSeconds: 600,
        });
        if (!rl.allowed) {
            return {
                data: null,
                error: "Limite temporaire de requêtes IA atteinte. Mode secours disponible.",
            };
        }

        const validated = supportChatSchema.parse(input);
        const aiResponse = await generateSupportAiResponse(
            validated.message,
            validated.history || []
        );

        if (aiResponse) {
            return { data: aiResponse, error: null };
        }

        // Aucune clé ou indisponibilité API : signal pour fallback local sans erreur
        return {
            data: null,
            error: null,
        };
    } catch (error: unknown) {
        logger.warn(
            "generateSupportAiAction exception (repli fail-safe automatique)",
            { error: error instanceof Error ? error.message : String(error) }
        );
        return {
            data: null,
            error: null,
        };
    }
}
