"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { geminiService } from "@/lib/gemini";
import { logger } from "@/lib/logger";
import { formatQuoteReference } from "@/lib/tracking-code";
import type {
    QuotePricingBreakdown,
    QuotePricingLine,
} from "@/lib/quote-storage";

const assistPricingSchema = z.object({
    quoteId: z.string().min(1, "Identifiant de devis requis"),
    customInstructions: z.string().max(500).optional(),
});

const pricingLineSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(2, "Libellé requis").max(160),
    category: z.enum([
        "base",
        "distance",
        "handling",
        "insurance",
        "margin",
        "other",
    ]),
    amountFcfa: z.number().min(0).max(500_000_000),
});

const savePricingSchema = z.object({
    quoteId: z.string().min(1),
    vehicleName: z.string().max(120).optional(),
    estimatedDistanceKm: z.number().min(0).max(5000).optional(),
    estimatedDuration: z.string().max(80).optional(),
    lines: z.array(pricingLineSchema).min(1, "Au moins une ligne de coût requise"),
    includeVat: z.boolean(),
    aiReasoning: z.string().max(1000).optional(),
    aiSource: z.string().max(60).optional(),
});

function parseFirstAmountFcfa(priceStr: string): number {
    const clean = priceStr.replace(/\s+/g, "");
    const match = clean.match(/(\d{4,9})/);
    if (match) {
        const val = parseInt(match[1], 10);
        if (!Number.isNaN(val) && val >= 25_000) return val;
    }
    return 450_000;
}

function parseDistanceKm(distanceStr: string): number {
    const match = distanceStr.match(/(\d+(?:[.,]\d+)?)/);
    if (match) {
        const val = Math.round(parseFloat(match[1].replace(",", ".")));
        if (!Number.isNaN(val) && val > 0) return val;
    }
    return 65;
}

function roundToThousand(n: number): number {
    return Math.max(0, Math.round(n / 1000) * 1000);
}

/**
 * Analyse un devis avec notre agent IA (Gemini 2.5 → OpenRouter → Heuristique CI)
 * et le catalogue de flotte réel pour proposer un chiffrage structuré en FCFA.
 */
export async function assistQuotePricingAction(input: unknown): Promise<{
    data: QuotePricingBreakdown | null;
    error: string | null;
}> {
    try {
        await requireAdmin();
        const parsed = assistPricingSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error: parsed.error.issues[0]?.message || "Paramètres invalides.",
            };
        }

        const quote = await prisma.quote.findUnique({
            where: { id: parsed.data.quoteId },
        });
        if (!quote) {
            return { data: null, error: "Devis introuvable." };
        }

        const fleet = await prisma.vehicle.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            take: 10,
        });

        const supp =
            (quote.supplementaryInfo as Record<string, unknown> | null) || {};
        const itemContext = [
            quote.itemType,
            supp.weight ? `Poids: ${String(supp.weight)}` : "",
            supp.requiresCrane ? "Grue requise" : "",
            supp.hazardous ? "Matières dangereuses" : "",
            supp.urgency === "urgent" || supp.urgency === "very_urgent"
                ? "Urgent"
                : "",
            parsed.data.customInstructions
                ? `Consigne admin: ${parsed.data.customInstructions}`
                : "",
        ]
            .filter(Boolean)
            .join(" | ");

        const estimation = await geminiService.estimateTransport(
            quote.pickupLocation,
            quote.dropoffLocation,
            itemContext
        );

        const baseTotal = parseFirstAmountFcfa(estimation.price);
        const distanceKm = parseDistanceKm(estimation.distance);

        // Sélection du véhicule le plus pertinent du catalogue réel
        const lowerType = itemContext.toLowerCase();
        const matchedVehicle =
            fleet.find(
                (v) =>
                    (lowerType.includes("container") &&
                        String(v.category).toLowerCase().includes("container")) ||
                    ((lowerType.includes("pelle") ||
                        lowerType.includes("engin") ||
                        lowerType.includes("machine")) &&
                        v.name.toLowerCase().includes("porte-char")) ||
                    (lowerType.includes("grue") &&
                        v.name.toLowerCase().includes("grue"))
            ) || fleet[0];

        const vehicleName =
            matchedVehicle?.name || "Camion Plateau / Semi-remorque 30T";

        const needsCrane = Boolean(supp.requiresCrane) || lowerType.includes("grue");
        const needsEscort =
            lowerType.includes("escorte") ||
            lowerType.includes("convoi") ||
            lowerType.includes("charpente");
        const isUrgent =
            supp.urgency === "urgent" ||
            supp.urgency === "very_urgent" ||
            lowerType.includes("urgent");

        // Ventilation structurée en FCFA
        const baseMobilization = roundToThousand(
            matchedVehicle?.dailyRateFcfa
                ? Math.min(matchedVehicle.dailyRateFcfa, baseTotal * 0.45)
                : baseTotal * 0.45
        );
        const distanceCost = roundToThousand(baseTotal * 0.35);
        const insuranceAndMargin = roundToThousand(baseTotal * 0.2);

        const lines: QuotePricingLine[] = [
            {
                id: "line-base",
                label: `Mobilisation véhicule (${vehicleName})`,
                category: "base",
                amountFcfa: baseMobilization,
            },
            {
                id: "line-distance",
                label: `Traction & carburant (~${distanceKm} km)`,
                category: "distance",
                amountFcfa: distanceCost,
            },
            {
                id: "line-insurance",
                label: "Assurance marchandise & frais opérationnels CI",
                category: "insurance",
                amountFcfa: insuranceAndMargin,
            },
        ];

        if (needsCrane) {
            lines.push({
                id: "line-crane",
                label: "Manutention / Grue au chargement-déchargement",
                category: "handling",
                amountFcfa: 150_000,
            });
        }
        if (needsEscort) {
            lines.push({
                id: "line-escort",
                label: "Escorte & autorisation convoi exceptionnel",
                category: "handling",
                amountFcfa: 180_000,
            });
        }
        if (isUrgent) {
            lines.push({
                id: "line-urgent",
                label: "Majoration prise en charge prioritaire / urgence",
                category: "margin",
                amountFcfa: 90_000,
            });
        }

        const subtotalHt = lines.reduce((sum, l) => sum + l.amountFcfa, 0);
        const vatRate = 0.18;
        const vatAmount = roundToThousand(subtotalHt * vatRate);

        return {
            data: {
                vehicleName,
                estimatedDistanceKm: distanceKm,
                estimatedDuration: estimation.duration,
                lines,
                includeVat: false,
                vatRate,
                subtotalHt,
                vatAmount,
                totalTtc: subtotalHt + vatAmount,
                aiReasoning: estimation.reasoning,
                aiSource: estimation.source,
                updatedAt: new Date().toISOString(),
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("assistQuotePricingAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de générer l'estimation IA.",
        };
    }
}

/**
 * Enregistre le chiffrage structuré (lignes FCFA + HT/TTC) sur le devis
 * en préservant toutes les autres clés de supplementaryInfo et en traçant dans l'audit.
 */
export async function saveStructuredPricingAction(input: unknown): Promise<{
    data: { amount: string; breakdown: QuotePricingBreakdown } | null;
    error: string | null;
}> {
    try {
        const admin = await requireAdmin();
        const parsed = savePricingSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error: parsed.error.issues[0]?.message || "Chiffrage invalide.",
            };
        }

        const {
            quoteId,
            vehicleName,
            estimatedDistanceKm,
            estimatedDuration,
            lines,
            includeVat,
            aiReasoning,
            aiSource,
        } = parsed.data;

        const existing = await prisma.quote.findUnique({
            where: { id: quoteId },
        });
        if (!existing) {
            return { data: null, error: "Devis introuvable." };
        }

        const subtotalHt = lines.reduce((sum, l) => sum + l.amountFcfa, 0);
        const vatRate = 0.18;
        const vatAmount = includeVat ? roundToThousand(subtotalHt * vatRate) : 0;
        const totalFinal = includeVat ? subtotalHt + vatAmount : subtotalHt;
        const formattedAmount = `${totalFinal.toLocaleString("fr-FR")} FCFA ${includeVat ? "TTC" : "HT"}`;

        const breakdown: QuotePricingBreakdown = {
            vehicleName,
            estimatedDistanceKm,
            estimatedDuration,
            lines,
            includeVat,
            vatRate,
            subtotalHt,
            vatAmount,
            totalTtc: subtotalHt + roundToThousand(subtotalHt * vatRate),
            aiReasoning,
            aiSource,
            updatedAt: new Date().toISOString(),
        };

        const currentSupp =
            (existing.supplementaryInfo as Record<string, unknown> | null) || {};
        const mergedSupp = {
            ...currentSupp,
            pricingBreakdown: breakdown,
        } as unknown as Prisma.InputJsonValue;

        const ref = formatQuoteReference({
            trackingCode: existing.trackingCode,
            id: existing.id,
        });

        await prisma.quote.update({
            where: { id: quoteId },
            data: {
                amount: formattedAmount,
                supplementaryInfo: mergedSupp,
                history: {
                    create: {
                        action: "Chiffrage structuré appliqué",
                        description: `Montant fixé à ${formattedAmount} (${lines.length} poste(s)${vehicleName ? `, ${vehicleName}` : ""}) pour ${ref}`,
                        user: admin.name || admin.email,
                    },
                },
            },
        });

        revalidatePath("/admin/quotes");
        revalidatePath(`/admin/quotes/${quoteId}`);
        revalidatePath("/admin/dashboard");

        return {
            data: { amount: formattedAmount, breakdown },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("saveStructuredPricingAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la sauvegarde du chiffrage.",
        };
    }
}
