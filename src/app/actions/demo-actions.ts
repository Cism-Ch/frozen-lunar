"use server";

import { requireAdmin } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { handleError } from "@/lib/error-handler";
import demoQuotes from "../../../prisma/demo-data.json";
import { QuoteStatus, QuoteSource } from "@prisma/client";
import { logger } from "@/lib/logger";
import { generateTrackingCode } from "@/lib/tracking-code";

// Anciens emails démo obsolètes à purger également lors du nettoyage
const LEGACY_DEMO_EMAILS = [
    "logistique@sogea-satom.ci",
    "exploitation@agl-ci.example.ci",
    "approvisionnement@pfo-africa.example.ci",
    "direction.travaux@kaydan.example.ci",
    "operations@cfao-equipment.example.ci",
];

/**
 * Server Action pour injecter 8 devis de démonstration modernes (Côte d'Ivoire)
 * avec dates dynamiques relatives à la date du jour et codes HBC-YYYY-XXXX.
 */
export async function injectDemoDataAction() {
    try {
        await requireAdmin();
        let insertedCount = 0;

        for (const item of demoQuotes) {
            const existing = await prisma.quote.findFirst({
                where: {
                    email: item.email,
                    clientName: item.clientName,
                    itemType: item.itemType,
                },
            });

            if (!existing) {
                const targetDate = new Date();
                targetDate.setDate(
                    targetDate.getDate() + (item.daysOffset ?? 3)
                );
                targetDate.setHours(8, 30, 0, 0);

                const isCancelled = item.status === "CANCELLED";
                const trackingCode = generateTrackingCode();

                const quote = await prisma.quote.create({
                    data: {
                        trackingCode,
                        clientName: item.clientName,
                        email: item.email,
                        phone: item.phone,
                        itemType: item.itemType,
                        pickupLocation: item.pickupLocation,
                        dropoffLocation: item.dropoffLocation,
                        transportDate: targetDate,
                        status: item.status as QuoteStatus,
                        amount: item.amount,
                        userNotes: item.userNotes,
                        source: item.source as QuoteSource,
                        supplementaryInfo: item.supplementaryInfo || {},
                        cancellationReason: isCancelled
                            ? item.cancellationReason ||
                              "Report de la date de transport"
                            : null,
                        cancelledAt: isCancelled ? new Date() : null,
                        history: {
                            create: {
                                action: "Création initiale",
                                description: `Demande démo ${trackingCode} enregistrée via ${item.source === "CHAT" ? "Assistant IA" : "Formulaire Web"}`,
                                user: item.clientName,
                            },
                        },
                    },
                });

                if (quote) {
                    insertedCount++;
                }
            }
        }

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/quotes");

        return {
            data: {
                insertedCount,
                totalDemoCount: demoQuotes.length,
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("❌ Erreur lors de l'injection des données démo", error);
        return {
            data: null,
            error: handleError(error).message,
        };
    }
}

/**
 * Server Action pour purger tous les devis de démonstration (nouveaux + anciens obsolètes).
 */
export async function clearDemoDataAction() {
    try {
        await requireAdmin();
        const demoEmails = Array.from(
            new Set([...demoQuotes.map((q) => q.email), ...LEGACY_DEMO_EMAILS])
        );

        const deleteResult = await prisma.quote.deleteMany({
            where: {
                email: {
                    in: demoEmails,
                },
            },
        });

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/quotes");

        return {
            data: {
                deletedCount: deleteResult.count,
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error(
            "❌ Erreur lors de la suppression des données démo",
            error
        );
        return {
            data: null,
            error: handleError(error).message,
        };
    }
}
