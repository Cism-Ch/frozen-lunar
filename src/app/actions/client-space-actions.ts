"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, QuoteStatus, QuoteSource } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
    requireAuth,
    requireQuoteOwnershipOrAdmin,
} from "@/lib/auth-guard";
import {
    formatQuoteReference,
    generateTrackingCode,
} from "@/lib/tracking-code";
import {
    canSendKycReminder,
    getKycDocLabel,
    parseProfileStorage,
    serializeProfileStorage,
    type ClientKycState,
    type KycDocType,
} from "@/lib/client-kyc";
import {
    EMAIL_SENDER,
    isAnyEmailProviderConfigured,
    sendTransactionalEmail,
} from "@/lib/email";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const savedAddressSchema = z.object({
    label: z.string().trim().min(2, "Libellé requis").max(80),
    address: z.string().trim().min(5, "Adresse complète requise").max(300),
});

const companyProfileInputSchema = z.object({
    accountType: z.enum(["INDIVIDUAL", "COMPANY"]).default("INDIVIDUAL"),
    companyName: z
        .string()
        .trim()
        .min(2, "Le nom complet ou la raison sociale est requis")
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

const cancelQuoteSchema = z.object({
    quoteId: z.string().min(1, "Identifiant de devis requis"),
    reason: z
        .string()
        .trim()
        .min(3, "Veuillez sélectionner ou saisir un motif d'annulation")
        .max(500, "Le motif ne peut pas dépasser 500 caractères"),
});

export type CompanyProfileInput = z.input<typeof companyProfileInputSchema>;

export interface SavedAddressItem {
    label: string;
    address: string;
}

export interface ClientCompanyProfileDTO {
    id: string;
    accountType: "INDIVIDUAL" | "COMPANY";
    companyName: string;
    rccmNumber: string | null;
    nccNumber: string | null;
    phone: string;
    defaultPickup: string | null;
    defaultDropoff: string | null;
    savedAddresses: SavedAddressItem[];
    kyc: ClientKycState;
}

export interface ClientQuoteSummaryDTO {
    id: string;
    trackingCode: string;
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
    cancellationReason: string | null;
    cancelledAt: string | null;
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

const INTERNAL_HISTORY_ACTIONS = new Set([
    "Partenaire affecté",
    "Affectation partenaire retirée",
    "Fiche mission envoyée au partenaire",
]);

function stripInternalSupplementaryKeys(
    raw: Prisma.JsonValue | null
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return Prisma.JsonNull;
    }
    const cleaned = { ...(raw as Record<string, unknown>) };
    delete cleaned.partnerAssignment;
    delete cleaned.pricingBreakdown;
    return Object.keys(cleaned).length > 0
        ? (cleaned as Prisma.InputJsonValue)
        : Prisma.JsonNull;
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
                take: 100,
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
                    ? (() => {
                          const storage = parseProfileStorage(
                              profile.savedAddresses
                          );
                          return {
                              id: profile.id,
                              accountType:
                                  profile.accountType === "COMPANY"
                                      ? ("COMPANY" as const)
                                      : ("INDIVIDUAL" as const),
                              companyName: profile.companyName,
                              rccmNumber: profile.rccmNumber,
                              nccNumber: profile.nccNumber,
                              phone: profile.phone,
                              defaultPickup: profile.defaultPickup,
                              defaultDropoff: profile.defaultDropoff,
                              savedAddresses: storage.addresses,
                              kyc: storage.kyc,
                          };
                      })()
                    : null,
                quotes: quotes.map((q) => ({
                    id: q.id,
                    trackingCode: formatQuoteReference(q),
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
                    cancellationReason: q.cancellationReason,
                    cancelledAt: q.cancelledAt
                        ? q.cancelledAt.toISOString()
                        : null,
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
        const isIndividual = v.accountType === "INDIVIDUAL";
        const existingProfile = await prisma.companyProfile.findUnique({
            where: { userId: user.id },
            select: { savedAddresses: true },
        });
        const existingStorage = parseProfileStorage(
            existingProfile?.savedAddresses
        );
        const serializedStorage = serializeProfileStorage(
            v.savedAddresses,
            existingStorage.kyc
        );

        const upserted = await prisma.companyProfile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                accountType: v.accountType,
                companyName: v.companyName,
                rccmNumber: isIndividual ? null : v.rccmNumber || null,
                nccNumber: isIndividual ? null : v.nccNumber || null,
                phone: v.phone,
                defaultPickup: v.defaultPickup || null,
                defaultDropoff: v.defaultDropoff || null,
                savedAddresses:
                    serializedStorage as unknown as Prisma.InputJsonValue,
            },
            update: {
                accountType: v.accountType,
                companyName: v.companyName,
                rccmNumber: isIndividual ? null : v.rccmNumber || null,
                nccNumber: isIndividual ? null : v.nccNumber || null,
                phone: v.phone,
                defaultPickup: v.defaultPickup || null,
                defaultDropoff: v.defaultDropoff || null,
                savedAddresses:
                    serializedStorage as unknown as Prisma.InputJsonValue,
            },
        });

        revalidatePath("/espace-client");
        revalidatePath("/admin/users");

        const savedStorage = parseProfileStorage(upserted.savedAddresses);

        return {
            data: {
                id: upserted.id,
                accountType:
                    upserted.accountType === "COMPANY"
                        ? "COMPANY"
                        : "INDIVIDUAL",
                companyName: upserted.companyName,
                rccmNumber: upserted.rccmNumber,
                nccNumber: upserted.nccNumber,
                phone: upserted.phone,
                defaultPickup: upserted.defaultPickup,
                defaultDropoff: upserted.defaultDropoff,
                savedAddresses: savedStorage.addresses,
                kyc: savedStorage.kyc,
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
                trackingCode: formatQuoteReference(quote),
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
                cancellationReason: quote.cancellationReason,
                cancelledAt: quote.cancelledAt
                    ? quote.cancelledAt.toISOString()
                    : null,
                vehicleName: quote.vehicle?.name ?? null,
                vehicleQuantity: quote.vehicleQuantity,
                threadStatus: quote.supportThread?.status ?? null,
                history: quote.history
                    .filter((h) => !INTERNAL_HISTORY_ACTIONS.has(h.action))
                    .map((h) => ({
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
    data: { newQuoteId: string; trackingCode: string } | null;
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
        const sourceRef = formatQuoteReference(sourceQuote);

        const duplicated = await prisma.quote.create({
            data: {
                trackingCode: generateTrackingCode(),
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
                    ? `[Renouvellement de ${sourceRef}] ${sourceQuote.userNotes}`
                    : `Renouvellement rapide de la commande ${sourceRef}`,
                source: QuoteSource.FORM,
                vehicleId: sourceQuote.vehicleId,
                vehicleQuantity: sourceQuote.vehicleQuantity,
                supplementaryInfo: stripInternalSupplementaryKeys(
                    sourceQuote.supplementaryInfo
                ),
            },
        });

        await prisma.quoteHistory.create({
            data: {
                quoteId: duplicated.id,
                action: "Recommande 1-Clic",
                description: `Créé depuis l'Espace Client à partir du devis ${sourceRef}`,
                user: user.name || user.email,
            },
        });

        revalidatePath("/espace-client");
        revalidatePath("/admin/quotes");

        return {
            data: {
                newQuoteId: duplicated.id,
                trackingCode: formatQuoteReference(duplicated),
            },
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

/**
 * Permet au client d'annuler un devis en attente ou validé en renseignant un motif explicite.
 * Protégé contre les accès IDOR via `requireQuoteOwnershipOrAdmin`.
 */
export async function cancelClientQuoteAction(input: {
    quoteId: string;
    reason: string;
}): Promise<{
    data: { id: string; trackingCode: string; status: "CANCELLED" } | null;
    error: string | null;
}> {
    try {
        const parsed = cancelQuoteSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Motif d'annulation invalide.",
            };
        }

        const quote = await prisma.quote.findUnique({
            where: { id: parsed.data.quoteId },
        });

        if (!quote) {
            return { data: null, error: "Devis introuvable." };
        }

        const { user } = await requireQuoteOwnershipOrAdmin(
            quote.userId,
            quote.email
        );

        if (quote.status === QuoteStatus.CANCELLED) {
            return { data: null, error: "Ce devis est déjà annulé." };
        }

        const updated = await prisma.quote.update({
            where: { id: quote.id },
            data: {
                status: QuoteStatus.CANCELLED,
                cancellationReason: parsed.data.reason,
                cancelledAt: new Date(),
            },
        });

        await prisma.quoteHistory.create({
            data: {
                quoteId: quote.id,
                action: "Annulation client",
                description: `Motif : ${parsed.data.reason}`,
                user: user.name || user.email,
            },
        });

        revalidatePath("/espace-client");
        revalidatePath(`/espace-client/quotes/${quote.id}`);
        revalidatePath("/admin/quotes");
        revalidatePath(`/admin/quotes/${quote.id}`);
        revalidatePath("/admin/dashboard");

        return {
            data: {
                id: updated.id,
                trackingCode: formatQuoteReference(updated),
                status: "CANCELLED",
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("cancelClientQuoteAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible d'annuler ce devis.",
        };
    }
}

const saveKycDocumentSchema = z.object({
    docType: z.enum([
        "identity_card",
        "proof_of_address",
        "manager_id",
        "rccm",
        "dfe_ncc",
    ]),
    fileKey: z
        .string()
        .trim()
        .min(5)
        .max(300)
        .refine(
            (val) => val.startsWith("partners-kyc/") && !val.includes(".."),
            "Clé de document KYC invalide."
        ),
    fileName: z.string().trim().min(1).max(160),
    accountType: z.enum(["INDIVIDUAL", "COMPANY"]).optional(),
});

/**
 * Enregistre un document officiel téléversé par le client dans son profil (statut PENDING)
 * en préservant le carnet d'adresses existant.
 */
export async function saveClientKycDocumentAction(input: {
    docType: KycDocType;
    fileKey: string;
    fileName: string;
    accountType?: "INDIVIDUAL" | "COMPANY";
}): Promise<{ data: ClientKycState | null; error: string | null }> {
    try {
        const rl = await checkRateLimit({
            scope: "client-kyc-save",
            limit: 20,
            windowSeconds: 900,
        });
        if (!rl.allowed) {
            return {
                data: null,
                error: "Trop d'enregistrements KYC récents. Veuillez patienter quelques minutes.",
            };
        }

        const user = await requireAuth();
        const parsed = saveKycDocumentSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Paramètres du document invalides.",
            };
        }

        const existing = await prisma.companyProfile.findUnique({
            where: { userId: user.id },
        });
        const storage = parseProfileStorage(existing?.savedAddresses);

        const nextDocs = [
            ...storage.kyc.documents.filter(
                (d) => d.docType !== parsed.data.docType
            ),
            {
                docType: parsed.data.docType,
                fileKey: parsed.data.fileKey,
                fileName: parsed.data.fileName,
                status: "PENDING" as const,
                uploadedAt: new Date().toISOString(),
            },
        ];

        const nextKyc: ClientKycState = {
            documents: nextDocs,
            lastReminderAt: storage.kyc.lastReminderAt,
        };

        const serialized = serializeProfileStorage(storage.addresses, nextKyc);

        await prisma.companyProfile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                accountType: parsed.data.accountType || "INDIVIDUAL",
                companyName: user.name || user.email,
                phone: "À renseigner",
                savedAddresses:
                    serialized as unknown as Prisma.InputJsonValue,
            },
            update: {
                savedAddresses:
                    serialized as unknown as Prisma.InputJsonValue,
            },
        });

        revalidatePath("/espace-client");
        revalidatePath("/admin/users");

        return { data: nextKyc, error: null };
    } catch (error: unknown) {
        logger.error("saveClientKycDocumentAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible d'enregistrer le document.",
        };
    }
}

/**
 * Permet au client de réclamer la validation de ses documents en attente
 * auprès de l'administration (strictement limité à 1 fois par 24 heures).
 */
export async function requestKycValidationReminderAction(): Promise<{
    data: { lastReminderAt: string; message: string } | null;
    error: string | null;
}> {
    try {
        const user = await requireAuth();
        const profile = await prisma.companyProfile.findUnique({
            where: { userId: user.id },
        });

        if (!profile) {
            return {
                data: null,
                error: "Veuillez d'abord téléverser au moins un document d'identité.",
            };
        }

        const storage = parseProfileStorage(profile.savedAddresses);
        const now = new Date();
        const eligibility = canSendKycReminder(storage.kyc, now);

        if (!eligibility.allowed) {
            return {
                data: null,
                error:
                    eligibility.reason ||
                    "Relance temporairement indisponible.",
            };
        }

        const pendingLabels = storage.kyc.documents
            .filter((d) => d.status === "PENDING")
            .map((d) => getKycDocLabel(d.docType))
            .join(", ");

        const nextKyc: ClientKycState = {
            documents: storage.kyc.documents,
            lastReminderAt: now.toISOString(),
        };
        const serialized = serializeProfileStorage(storage.addresses, nextKyc);

        await prisma.companyProfile.update({
            where: { userId: user.id },
            data: {
                savedAddresses:
                    serialized as unknown as Prisma.InputJsonValue,
            },
        });

        // Crée un message non lu visible immédiatement dans le Centre de Notifications Admin & /admin/contacts
        await prisma.contactMessage.create({
            data: {
                firstName: profile.companyName.slice(0, 80),
                lastName: "[Validation KYC]",
                email: user.email,
                phone: profile.phone || "Non renseigné",
                message: `Demande de validation des documents (${profile.accountType === "COMPANY" ? "Entreprise" : "Particulier"}) : ${pendingLabels}. Merci de vérifier le dossier dans /admin/users.`,
                status: "UNREAD",
            },
        });

        // Alerte email admin non-bloquante si un fournisseur email est configuré
        if (isAnyEmailProviderConfigured()) {
            const adminEmail =
                process.env.ADMIN_NOTIFICATION_EMAIL ||
                COMPANY_CONFIG.contact.email;
            void sendTransactionalEmail({
                from: EMAIL_SENDER,
                to: [adminEmail],
                subject: `[KYC] Relance validation documents — ${profile.companyName}`,
                text: `Le client ${profile.companyName} (${user.email}) demande la validation de ses documents en attente : ${pendingLabels}.\nConnectez-vous sur /admin/users pour valider ou refuser le dossier.`,
            }).catch((err: unknown) => {
                logger.warn("KYC reminder admin email failed (non-blocking)", {
                    error: err instanceof Error ? err.message : String(err),
                });
            });
        }

        revalidatePath("/espace-client");
        revalidatePath("/admin/users");
        revalidatePath("/admin/contacts");

        return {
            data: {
                lastReminderAt: nextKyc.lastReminderAt!,
                message:
                    "Votre relance a bien été transmise à notre équipe de validation (limite : 1 rappel / 24h).",
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("requestKycValidationReminderAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible d'envoyer la demande de validation.",
        };
    }
}
