"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, QuoteStatus, QuoteSource } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
    requireAuth,
    requireQuoteOwnershipOrAdmin,
} from "@/lib/auth-guard";
import { logger } from "@/lib/logger";

const savedAddressSchema = z.object({
    label: z.string().trim().min(2, "Libellé requis").max(80),
    address: z.string().trim().min(5, "Adresse complète requise").max(300),
});

const companyProfileInputSchema = z.object({
    companyName: z
        .string()
        .trim()
        .min(2, "La raison sociale ou le nom est requis")
        .max(150),
    rccmNumber: z.string().trim().max(80).optional().or(z.literal("")),
    nccNumber: z.string().trim().max(60).optional().or(z.literal("")),
    phone: z
        .string()
        .trim()
        .min(8, "Un numéro de téléphone valide (+225...) est requis")
        .max(40),
    defaultPickup: z.string().trim().max(300).optional().or(z.literal("")),
    defaultDropoff: z.string().trim().max(300).optional().or(z.literal("")),
    savedAddresses: z.array(savedAddressSchema).max(10).default([]),
});

export type CompanyProfileInput = z.input<typeof companyProfileInputSchema>;

export interface SavedAddressItem {
    label: string;
    address: string;
}

export interface ClientCompanyProfileDTO {
    id: string;
    companyName: string;
    rccmNumber: string | null;
    nccNumber: string | null;
    phone: string;
    defaultPickup: string | null;
    defaultDropoff: string | null;
    savedAddresses: SavedAddressItem[];
}

export interface ClientQuoteSummaryDTO {
    id: string;
    date: string;
    clientName: string;
    email: string;
    phone: string;
    itemType: string;
    pickupLocation: string;
    dropoffLocation: string;
    transportDate: string;
    status: "PENDING" | "VALIDATED" | "REJECTED" | "CANCELLED";
    statusLabel: string;
    amount: string;
    userNotes: string | null;
    vehicleName: string | null;
    vehicleQuantity: number;
    threadStatus: "AI_ACTIVE" | "HUMAN_TAKEOVER" | "RESOLVED" | null;
}

export interface ClientDashboardDTO {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    profile: ClientCompanyProfileDTO | null;
    quotes: ClientQuoteSummaryDTO[];
}

function statusToLabel(status: QuoteStatus): string {
    switch (status) {
        case QuoteStatus.VALIDATED:
            return "Validé";
        case QuoteStatus.REJECTED:
            return "Refusé";
        case QuoteStatus.CANCELLED:
            return "Annulé";
        case QuoteStatus.PENDING:
        default:
            return "En attente";
    }
}

function parseSavedAddresses(raw: Prisma.JsonValue | null): SavedAddressItem[] {
    if (!Array.isArray(raw)) return [];
    const items: SavedAddressItem[] = [];
    for (const entry of raw) {
        if (
            entry &&
            typeof entry === "object" &&
            "label" in entry &&
            "address" in entry &&
            typeof entry.label === "string" &&
            typeof entry.address === "string"
        ) {
            items.push({ label: entry.label, address: entry.address });
        }
    }
    return items;
}

/**
 * Charge le tableau de bord de l'Espace Client (`/espace-client`).
 * Associe automatiquement les devis historiques créés avec la même adresse email vérifiée,
 * et applique une isolation stricte par `userId === user.id`.
 */
export async function getClientDashboardAction(): Promise<{
    data: ClientDashboardDTO | null;
    error: string | null;
}> {
    try {
        const user = await requireAuth();

        // Rattachement automatique des anciens devis orphelins partageant l'email exact du client connecté
        if (user.email) {
            await prisma.quote
                .updateMany({
                    where: {
                        userId: null,
                        email: {
                            equals: user.email,
                            mode: "insensitive",
                        },
                    },
                    data: { userId: user.id },
                })
                .catch(() => {});
        }

        const [profile, quotes] = await Promise.all([
            prisma.companyProfile.findUnique({
                where: { userId: user.id },
            }),
            prisma.quote.findMany({
                where: { userId: user.id },
                include: {
                    vehicle: { select: { name: true } },
                    supportThread: { select: { status: true } },
                },
                orderBy: { date: "desc" },
            }),
        ]);

        return {
            data: {
                user: {
                    id: user.id,
                    name: user.name || "Client HBC",
                    email: user.email,
                    role: user.role || "user",
                },
                profile: profile
                    ? {
                          id: profile.id,
                          companyName: profile.companyName,
                          rccmNumber: profile.rccmNumber,
                          nccNumber: profile.nccNumber,
                          phone: profile.phone,
                          defaultPickup: profile.defaultPickup,
                          defaultDropoff: profile.defaultDropoff,
                          savedAddresses: parseSavedAddresses(
                              profile.savedAddresses
                          ),
                      }
                    : null,
                quotes: quotes.map((q) => ({
                    id: q.id,
                    date: q.date.toISOString(),
                    clientName: q.clientName,
                    email: q.email,
                    phone: q.phone,
                    itemType: q.itemType,
                    pickupLocation: q.pickupLocation,
                    dropoffLocation: q.dropoffLocation,
                    transportDate: q.transportDate.toISOString(),
                    status: q.status,
                    statusLabel: statusToLabel(q.status),
                    amount: q.amount,
                    userNotes: q.userNotes,
                    vehicleName: q.vehicle?.name ?? null,
                    vehicleQuantity: q.vehicleQuantity,
                    threadStatus: q.supportThread?.status ?? null,
                })),
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("getClientDashboardAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de charger votre espace client.",
        };
    }
}

/**
 * Crée ou met à jour le profil entreprise et les adresses favorites du client connecté.
 */
export async function upsertCompanyProfileAction(
    input: CompanyProfileInput
): Promise<{
    data: ClientCompanyProfileDTO | null;
    error: string | null;
}> {
    try {
        const user = await requireAuth();

        const parsed = companyProfileInputSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Données du profil entreprise invalides.",
            };
        }

        const v = parsed.data;
        const upserted = await prisma.companyProfile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                companyName: v.companyName,
                rccmNumber: v.rccmNumber || null,
                nccNumber: v.nccNumber || null,
                phone: v.phone,
                defaultPickup: v.defaultPickup || null,
                defaultDropoff: v.defaultDropoff || null,
                savedAddresses: v.savedAddresses as Prisma.InputJsonValue,
            },
            update: {
                companyName: v.companyName,
                rccmNumber: v.rccmNumber || null,
                nccNumber: v.nccNumber || null,
                phone: v.phone,
                defaultPickup: v.defaultPickup || null,
                defaultDropoff: v.defaultDropoff || null,
                savedAddresses: v.savedAddresses as Prisma.InputJsonValue,
            },
        });

        revalidatePath("/espace-client");

        return {
            data: {
                id: upserted.id,
                companyName: upserted.companyName,
                rccmNumber: upserted.rccmNumber,
                nccNumber: upserted.nccNumber,
                phone: upserted.phone,
                defaultPickup: upserted.defaultPickup,
                defaultDropoff: upserted.defaultDropoff,
                savedAddresses: parseSavedAddresses(upserted.savedAddresses),
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("upsertCompanyProfileAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible d'enregistrer votre profil entreprise.",
        };
    }
}

/**
 * Récupère le détail d'un devis client avec contrôle strict anti-IDOR (`requireQuoteOwnershipOrAdmin`).
 */
export async function getClientQuoteDetailAction(quoteId: string): Promise<{
    data:
        | (ClientQuoteSummaryDTO & {
              history: {
                  id: string;
                  action: string;
                  description: string | null;
                  timestamp: string;
                  user: string;
              }[];
          })
        | null;
    error: string | null;
}> {
    try {
        if (!quoteId?.trim()) {
            return { data: null, error: "Identifiant de devis requis." };
        }

        const quote = await prisma.quote.findUnique({
            where: { id: quoteId },
            include: {
                vehicle: { select: { name: true } },
                supportThread: { select: { status: true } },
                history: { orderBy: { timestamp: "desc" } },
            },
        });

        if (!quote) {
            return { data: null, error: "Devis introuvable." };
        }

        // Vérification anti-IDOR stricte
        await requireQuoteOwnershipOrAdmin(quote.userId, quote.email);

        return {
            data: {
                id: quote.id,
                date: quote.date.toISOString(),
                clientName: quote.clientName,
                email: quote.email,
                phone: quote.phone,
                itemType: quote.itemType,
                pickupLocation: quote.pickupLocation,
                dropoffLocation: quote.dropoffLocation,
                transportDate: quote.transportDate.toISOString(),
                status: quote.status,
                statusLabel: statusToLabel(quote.status),
                amount: quote.amount,
                userNotes: quote.userNotes,
                vehicleName: quote.vehicle?.name ?? null,
                vehicleQuantity: quote.vehicleQuantity,
                threadStatus: quote.supportThread?.status ?? null,
                history: quote.history.map((h) => ({
                    id: h.id,
                    action: h.action,
                    description: h.description,
                    timestamp: h.timestamp.toISOString(),
                    user: h.user,
                })),
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("getClientQuoteDetailAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Accès refusé ou devis indisponible.",
        };
    }
}

/**
 * Recommande un transport en 1 clic à partir d'un devis existant (avec vérification anti-IDOR stricte).
 */
export async function reorderClientQuoteAction(quoteId: string): Promise<{
    data: { newQuoteId: string } | null;
    error: string | null;
}> {
    try {
        const sourceQuote = await prisma.quote.findUnique({
            where: { id: quoteId },
        });

        if (!sourceQuote) {
            return { data: null, error: "Devis d'origine introuvable." };
        }

        const { user } = await requireQuoteOwnershipOrAdmin(
            sourceQuote.userId,
            sourceQuote.email
        );

        const nextDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // J+2 par défaut

        const duplicated = await prisma.quote.create({
            data: {
                userId: user.id,
                clientName: sourceQuote.clientName,
                email: sourceQuote.email,
                phone: sourceQuote.phone,
                itemType: sourceQuote.itemType,
                pickupLocation: sourceQuote.pickupLocation,
                dropoffLocation: sourceQuote.dropoffLocation,
                transportDate: nextDate,
                status: QuoteStatus.PENDING,
                amount: "À calculer",
                userNotes: sourceQuote.userNotes
                    ? `[Renouvellement de #${sourceQuote.id.slice(0, 8)}] ${sourceQuote.userNotes}`
                    : `Renouvellement rapide de la commande #${sourceQuote.id.slice(0, 8)}`,
                source: QuoteSource.FORM,
                vehicleId: sourceQuote.vehicleId,
                vehicleQuantity: sourceQuote.vehicleQuantity,
                supplementaryInfo:
                    sourceQuote.supplementaryInfo ?? Prisma.JsonNull,
            },
        });

        await prisma.quoteHistory.create({
            data: {
                quoteId: duplicated.id,
                action: "Recommande 1-Clic",
                description: `Créé depuis l'Espace Client à partir du devis #${sourceQuote.id.slice(0, 8)}`,
                user: user.name || user.email,
            },
        });

        revalidatePath("/espace-client");
        revalidatePath("/admin/quotes");

        return {
            data: { newQuoteId: duplicated.id },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("reorderClientQuoteAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de dupliquer cette commande.",
        };
    }
}
