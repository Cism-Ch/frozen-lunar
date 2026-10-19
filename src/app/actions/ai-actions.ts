"use server";

import { z } from "zod";
import {
    geminiService,
    generateSupportAiResponse,
    getGeminiApiKey,
    isGeminiAvailable,
    EstimationResult,
} from "@/lib/gemini";
import { requireAdmin } from "@/lib/auth-guard";

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
    mode: "gemini" | "resilient_local";
    model: string;
    hasKey: boolean;
};

/**
 * Récupère le statut opérationnel du sous-système IA et de son fail-safe.
 */
export async function getAiStatusAction(): Promise<{
    data: AiSystemStatus | null;
    error: string | null;
}> {
    try {
        const available = isGeminiAvailable();
        return {
            data: {
                isAvailable: available,
                mode: available ? "gemini" : "resilient_local",
                model: available
                    ? "gemini-1.5-flash"
                    : "moteur-local-heuristique",
                hasKey: getGeminiApiKey() !== null,
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("Erreur getAiStatusAction :", error);
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
        const validated = estimateTransportSchema.parse(input);
        const result = await geminiService.estimateTransport(
            validated.pickup,
            validated.dropoff,
            validated.type
        );
        return { data: result, error: null };
    } catch (error: unknown) {
        console.error("Erreur estimateTransportAction :", error);
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
        console.error("Erreur draftEmailAction :", error);
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

/**
 * Traitement des requêtes conversationnelles du support client.
 * Tente d'appeler Gemini 1.5 Flash ; si indisponible ou erreur, renvoie data=null
 * pour déclencher le moteur de réponses guidées déterministe local sans interruption de service.
 */
export async function generateSupportAiAction(input: unknown): Promise<{
    data: {
        message: string;
        category: "technical" | "billing" | "quote" | "transport" | "general";
        sentiment: "positive" | "neutral" | "negative";
        shouldEscalate: boolean;
        source: "gemini" | "resilient_local";
    } | null;
    error: string | null;
}> {
    try {
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
        console.warn(
            "generateSupportAiAction exception (repli fail-safe automatique) :",
            error instanceof Error ? error.message : error
        );
        return {
            data: null,
            error: null,
        };
    }
}
