"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
    generateWhatsAppMessage,
    normalizePhoneForWhatsApp,
    GeneratedWhatsAppMessage,
} from "@/lib/huggingface";
import { safeFormatDate } from "@/lib/date-utils";

const prepareWhatsAppSchema = z.object({
    quoteId: z.string().min(1, "L'identifiant du devis est requis"),
    customNote: z.string().optional(),
});

const getQuotesByPhoneSchema = z.object({
    phone: z.string().min(4, "Numéro de téléphone trop court"),
});

/**
 * Prépare un message WhatsApp formaté pour un devis via Hugging Face ou fallback local.
 */
export async function prepareWhatsAppQuoteMessageAction(
    input: unknown
): Promise<{ data: GeneratedWhatsAppMessage | null; error: string | null }> {
    try {
        await requireAdmin();
        const validated = prepareWhatsAppSchema.parse(input);

        const quote = await prisma.quote.findUnique({
            where: { id: validated.quoteId },
        });

        if (!quote) {
            return { data: null, error: "Devis introuvable" };
        }

        const result = await generateWhatsAppMessage(
            {
                id: quote.id,
                client: quote.clientName,
                phone: quote.phone,
                email: quote.email,
                pickup: quote.pickupLocation,
                dropoff: quote.dropoffLocation,
                type: quote.itemType,
                date: safeFormatDate(quote.transportDate, "dd MMMM yyyy"),
                amount: quote.amount,
                notes: quote.userNotes || undefined,
            },
            validated.customNote
        );

        return { data: result, error: null };
    } catch (error: unknown) {
        console.error("Erreur prepareWhatsAppQuoteMessageAction :", error);
        if (error instanceof z.ZodError) {
            return {
                data: null,
                error: error.issues[0]?.message || "Paramètres invalides",
            };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Erreur lors de la préparation du message WhatsApp",
        };
    }
}

/**
 * Enregistre une trace dans l'historique du devis indiquant qu'un échange WhatsApp a eu lieu.
 */
export async function logWhatsAppContactAction(
    quoteId: string,
    details?: string
): Promise<{ data: boolean; error: string | null }> {
    try {
        await requireAdmin();

        await prisma.quoteHistory.create({
            data: {
                quoteId,
                action: "WHATSAPP_CONTACT",
                description:
                    details ||
                    "Échange de suivi initié via lien WhatsApp Click-to-Chat",
            },
        });

        return { data: true, error: null };
    } catch (error: unknown) {
        console.error("Erreur logWhatsAppContactAction :", error);
        return { data: false, error: "Impossible de consigner l'action" };
    }
}

/**
 * Recherche tous les devis associés au même numéro de téléphone pour faciliter le suivi client unifié.
 */
export async function getQuotesByPhoneAction(input: unknown): Promise<{
    data: Array<{
        id: string;
        date: Date;
        pickupLocation: string;
        dropoffLocation: string;
        status: string;
        amount: string;
    }> | null;
    error: string | null;
}> {
    try {
        await requireAdmin();
        const validated = getQuotesByPhoneSchema.parse(input);
        const cleanTarget = normalizePhoneForWhatsApp(validated.phone);

        // Recherche par correspondance brute ou chiffres clés
        const allQuotes = await prisma.quote.findMany({
            select: {
                id: true,
                date: true,
                phone: true,
                pickupLocation: true,
                dropoffLocation: true,
                status: true,
                amount: true,
            },
            orderBy: { date: "desc" },
            take: 100,
        });

        const matched = allQuotes.filter((q) => {
            const cleanQPhone = normalizePhoneForWhatsApp(q.phone);
            return (
                cleanQPhone === cleanTarget ||
                cleanQPhone.endsWith(cleanTarget.slice(-8)) ||
                cleanTarget.endsWith(cleanQPhone.slice(-8))
            );
        });

        return {
            data: matched.map((m) => ({
                id: m.id,
                date: m.date,
                pickupLocation: m.pickupLocation,
                dropoffLocation: m.dropoffLocation,
                status: m.status,
                amount: m.amount,
            })),
            error: null,
        };
    } catch (error: unknown) {
        console.error("Erreur getQuotesByPhoneAction :", error);
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Erreur lors de la recherche des devis liés au numéro",
        };
    }
}
