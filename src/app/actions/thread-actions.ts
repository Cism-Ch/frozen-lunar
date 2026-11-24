"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SupportSenderRole, SupportThreadStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
    requireAdmin,
    requireQuoteOwnershipOrAdmin,
} from "@/lib/auth-guard";
import { generateSupportAiResponse } from "@/lib/gemini";
import { formatQuoteReference } from "@/lib/tracking-code";
import { logger } from "@/lib/logger";

export interface SupportMessageDTO {
    id: string;
    threadId: string;
    senderRole: "CLIENT" | "AI" | "ADMIN";
    senderName: string;
    content: string;
    createdAt: string;
}

export interface SupportThreadDTO {
    id: string;
    quoteId: string;
    status: "AI_ACTIVE" | "HUMAN_TAKEOVER" | "RESOLVED";
    assignedTo: string | null;
    messages: SupportMessageDTO[];
}

const sendMessageSchema = z.object({
    quoteId: z.string().min(1, "Identifiant de devis requis"),
    content: z
        .string()
        .trim()
        .min(1, "Le message ne peut pas être vide")
        .max(1500, "Le message ne peut pas dépasser 1500 caractères"),
});

const toggleTakeoverSchema = z.object({
    quoteId: z.string().min(1, "Identifiant de devis requis"),
    mode: z.enum(["AI_ACTIVE", "HUMAN_TAKEOVER", "RESOLVED"]),
});

function wantsHumanValidator(message: string): boolean {
    const lower = message.toLowerCase();
    return (
        lower.includes("humain") ||
        lower.includes("validateur") ||
        lower.includes("conseiller") ||
        lower.includes("dispatcher") ||
        lower.includes("responsable") ||
        lower.includes("appeler") ||
        lower.includes("parler a quelqu") ||
        lower.includes("parler à quelqu")
    );
}

/**
 * Récupère ou initialise le fil de discussion hybride (IA + Validateur humain) lié à un devis.
 * Protégé contre toute tentative d'accès IDOR via `requireQuoteOwnershipOrAdmin`.
 */
export async function getOrCreateQuoteThreadAction(
    quoteId: string
): Promise<{ data: SupportThreadDTO | null; error: string | null }> {
    try {
        const quote = await prisma.quote.findUnique({
            where: { id: quoteId },
        });

        if (!quote) {
            return { data: null, error: "Devis introuvable." };
        }

        const { user } = await requireQuoteOwnershipOrAdmin(
            quote.userId,
            quote.email
        );

        let thread = await prisma.supportThread.findUnique({
            where: { quoteId: quote.id },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
            },
        });

        if (!thread) {
            const quoteRef = formatQuoteReference({
                trackingCode: quote.trackingCode,
                id: quote.id,
            });
            const welcomeText = `Bonjour ${quote.clientName}, bienvenue sur le suivi dédié de votre dossier ${quoteRef} (${quote.itemType} : ${quote.pickupLocation} vers ${quote.dropoffLocation}). Je suis l'assistant IA HBC Logistique ; posez-moi vos questions ou demandez un validateur humain à tout moment.`;

            thread = await prisma.supportThread.create({
                data: {
                    quoteId: quote.id,
                    userId: quote.userId ?? user.id,
                    status: SupportThreadStatus.AI_ACTIVE,
                    messages: {
                        create: {
                            senderRole: SupportSenderRole.AI,
                            senderName: "Assistant IA HBC",
                            content: welcomeText,
                        },
                    },
                },
                include: {
                    messages: { orderBy: { createdAt: "asc" } },
                },
            });
        }

        return {
            data: {
                id: thread.id,
                quoteId: thread.quoteId,
                status: thread.status,
                assignedTo: thread.assignedTo,
                messages: thread.messages.map((m) => ({
                    id: m.id,
                    threadId: m.threadId,
                    senderRole: m.senderRole,
                    senderName: m.senderName,
                    content: m.content,
                    createdAt: m.createdAt.toISOString(),
                })),
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("getOrCreateQuoteThreadAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de charger la discussion du dossier.",
        };
    }
}

/**
 * Envoie un message dans le fil d'un devis :
 * - Si l'expéditeur est un administrateur, le fil passe automatiquement en `HUMAN_TAKEOVER` (IA en pause).
 * - Si l'expéditeur est le client et que le fil est en `AI_ACTIVE`, l'IA répond de manière concise (2-3 phrases)
 *   ou passe la main au validateur humain si le client le demande.
 */
export async function sendThreadMessageAction(input: {
    quoteId: string;
    content: string;
}): Promise<{ data: SupportThreadDTO | null; error: string | null }> {
    try {
        const parsed = sendMessageSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Message invalide.",
            };
        }

        const { quoteId, content } = parsed.data;
        const quote = await prisma.quote.findUnique({
            where: { id: quoteId },
        });

        if (!quote) {
            return { data: null, error: "Devis introuvable." };
        }

        const { user, isAdmin } = await requireQuoteOwnershipOrAdmin(
            quote.userId,
            quote.email
        );

        let thread = await prisma.supportThread.findUnique({
            where: { quoteId: quote.id },
        });

        if (!thread) {
            thread = await prisma.supportThread.create({
                data: {
                    quoteId: quote.id,
                    userId: quote.userId ?? user.id,
                    status: isAdmin
                        ? SupportThreadStatus.HUMAN_TAKEOVER
                        : SupportThreadStatus.AI_ACTIVE,
                    assignedTo: isAdmin ? user.name || user.email : null,
                },
            });
        }

        if (isAdmin) {
            // L'intervention d'un validateur humain met automatiquement l'IA en pause
            await prisma.$transaction([
                prisma.supportMessage.create({
                    data: {
                        threadId: thread.id,
                        senderRole: SupportSenderRole.ADMIN,
                        senderName: `${user.name || "Validateur HBC"} (Validation)`,
                        content,
                    },
                }),
                prisma.supportThread.update({
                    where: { id: thread.id },
                    data: {
                        status: SupportThreadStatus.HUMAN_TAKEOVER,
                        assignedTo: user.name || user.email,
                    },
                }),
            ]);
        } else {
            // Message du client
            await prisma.supportMessage.create({
                data: {
                    threadId: thread.id,
                    senderRole: SupportSenderRole.CLIENT,
                    senderName: user.name || quote.clientName,
                    content,
                },
            });

            if (thread.status === SupportThreadStatus.AI_ACTIVE) {
                if (wantsHumanValidator(content)) {
                    await prisma.$transaction([
                        prisma.supportThread.update({
                            where: { id: thread.id },
                            data: {
                                status: SupportThreadStatus.HUMAN_TAKEOVER,
                            },
                        }),
                        prisma.supportMessage.create({
                            data: {
                                threadId: thread.id,
                                senderRole: SupportSenderRole.AI,
                                senderName: "Assistant IA HBC",
                                content:
                                    "J'ai notifié nos validateurs humains à Abidjan et je me mets en pause. Un responsable d'exploitation va vous répondre directement dans cette discussion.",
                            },
                        }),
                    ]);
                } else {
                    const contextPrompt = `[Dossier #${quote.id.slice(0, 8)} | Statut: ${quote.status} | Montant: ${quote.amount} | Trajet: ${quote.pickupLocation} -> ${quote.dropoffLocation} | Marchandise: ${quote.itemType}] Question du client: ${content}`;
                    const aiReply = await generateSupportAiResponse(
                        contextPrompt
                    );

                    const replyText =
                        aiReply?.message ||
                        `Votre message concernant le dossier #${quote.id.slice(0, 8)} (${quote.pickupLocation} vers ${quote.dropoffLocation}) est bien noté. Notre validateur humain vérifie votre demande et mettra à jour votre statut très rapidement.`;

                    await prisma.supportMessage.create({
                        data: {
                            threadId: thread.id,
                            senderRole: SupportSenderRole.AI,
                            senderName:
                                aiReply?.source === "openrouter"
                                    ? "Assistant IA HBC (Nemotron)"
                                    : "Assistant IA HBC",
                            content: replyText,
                        },
                    });
                }
            }
        }

        const refreshed = await prisma.supportThread.findUnique({
            where: { id: thread.id },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
            },
        });

        revalidatePath(`/espace-client/quotes/${quote.id}`);
        revalidatePath(`/admin/quotes/${quote.id}`);

        if (!refreshed) {
            return { data: null, error: "Erreur de synchronisation du fil." };
        }

        return {
            data: {
                id: refreshed.id,
                quoteId: refreshed.quoteId,
                status: refreshed.status,
                assignedTo: refreshed.assignedTo,
                messages: refreshed.messages.map((m) => ({
                    id: m.id,
                    threadId: m.threadId,
                    senderRole: m.senderRole,
                    senderName: m.senderName,
                    content: m.content,
                    createdAt: m.createdAt.toISOString(),
                })),
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("sendThreadMessageAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible d'envoyer le message.",
        };
    }
}

/**
 * Permet à un administrateur de basculer explicitement entre le mode Validateur Humain (`HUMAN_TAKEOVER`)
 * et l'Assistant IA (`AI_ACTIVE`).
 */
export async function toggleThreadHumanTakeoverAction(input: {
    quoteId: string;
    mode: "AI_ACTIVE" | "HUMAN_TAKEOVER" | "RESOLVED";
}): Promise<{ data: SupportThreadDTO | null; error: string | null }> {
    try {
        const admin = await requireAdmin();

        const parsed = toggleTakeoverSchema.safeParse(input);
        if (!parsed.success) {
            return { data: null, error: "Paramètres invalides." };
        }

        const { quoteId, mode } = parsed.data;
        let thread = await prisma.supportThread.findUnique({
            where: { quoteId },
        });

        if (!thread) {
            thread = await prisma.supportThread.create({
                data: {
                    quoteId,
                    status: mode as SupportThreadStatus,
                    assignedTo:
                        mode === "HUMAN_TAKEOVER"
                            ? admin.name || admin.email
                            : null,
                },
            });
        } else {
            thread = await prisma.supportThread.update({
                where: { id: thread.id },
                data: {
                    status: mode as SupportThreadStatus,
                    assignedTo:
                        mode === "HUMAN_TAKEOVER"
                            ? admin.name || admin.email
                            : null,
                },
            });
        }

        const notice =
            mode === "HUMAN_TAKEOVER"
                ? `${admin.name || "Un validateur HBC"} a pris la main sur la conversation (Assistant IA mis en pause).`
                : mode === "AI_ACTIVE"
                  ? "L'Assistant IA HBC a été réactivé pour répondre instantanément à vos questions."
                  : "Cet échange a été marqué comme résolu.";

        await prisma.supportMessage.create({
            data: {
                threadId: thread.id,
                senderRole: SupportSenderRole.ADMIN,
                senderName: admin.name || "Supervision HBC",
                content: notice,
            },
        });

        const updated = await prisma.supportThread.findUnique({
            where: { id: thread.id },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
            },
        });

        revalidatePath(`/espace-client/quotes/${quoteId}`);
        revalidatePath(`/admin/quotes/${quoteId}`);

        if (!updated) {
            return { data: null, error: "Fil introuvable." };
        }

        return {
            data: {
                id: updated.id,
                quoteId: updated.quoteId,
                status: updated.status,
                assignedTo: updated.assignedTo,
                messages: updated.messages.map((m) => ({
                    id: m.id,
                    threadId: m.threadId,
                    senderRole: m.senderRole,
                    senderName: m.senderName,
                    content: m.content,
                    createdAt: m.createdAt.toISOString(),
                })),
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("toggleThreadHumanTakeoverAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de changer le mode de supervision.",
        };
    }
}
