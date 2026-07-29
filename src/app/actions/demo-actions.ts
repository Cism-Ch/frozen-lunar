"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { handleError } from "@/lib/error-handler";
import demoQuotes from "../../../prisma/demo-data.json";
import { QuoteStatus, QuoteSource } from "@prisma/client";

/**
 * Server Action pour injecter les données de démonstration dans la base PostgreSQL
 * simulant de vrais utilisateurs enregistrés.
 */
export async function injectDemoDataAction() {
    try {
        let insertedCount = 0;

        for (const item of demoQuotes) {
            // Vérifier si un devis similaire existe déjà pour éviter le sur-remplissage
            const existing = await prisma.quote.findFirst({
                where: {
                    email: item.email,
                    clientName: item.clientName,
                    itemType: item.itemType,
                },
            });

            if (!existing) {
                const quote = await prisma.quote.create({
                    data: {
                        clientName: item.clientName,
                        email: item.email,
                        phone: item.phone,
                        itemType: item.itemType,
                        pickupLocation: item.pickupLocation,
                        dropoffLocation: item.dropoffLocation,
                        transportDate: new Date(item.transportDate),
                        status: item.status as QuoteStatus,
                        amount: item.amount,
                        userNotes: item.userNotes,
                        source: item.source as QuoteSource,
                        supplementaryInfo: item.supplementaryInfo || {},
                        history: {
                            create: {
                                action: "Création initiale",
                                description: `Demande de devis démo enregistrée via ${item.source === "CHAT" ? "Assistant IA" : "Formulaire Web"}`,
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

        // Réinitialiser le cache des routes admin pour rafraîchir l'interface
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
        console.error("❌ Erreur lors de l'injection des données démo:", error);
        return {
            data: null,
            error: handleError(error).message,
        };
    }
}

/**
 * Server Action pour réinitialiser les devis de démonstration
 */
export async function clearDemoDataAction() {
    try {
        const demoEmails = demoQuotes.map((q) => q.email);

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
        console.error("❌ Erreur lors de la suppression des données démo:", error);
        return {
            data: null,
            error: handleError(error).message,
        };
    }
}
