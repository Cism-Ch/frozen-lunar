"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
    PartnerApplication,
    PartnerApplicationStatus,
    Prisma,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { isRedisConfigured } from "@/lib/health-check";
import { requireAdmin } from "@/lib/auth-guard";
import {
    EMAIL_SENDER,
    isAnyEmailProviderConfigured,
    sendTransactionalEmail,
} from "@/lib/email";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { PartnerApplicationEmail } from "@/components/emails/PartnerApplicationEmail";
import { UEMOA_CEDEAO_COUNTRIES } from "@/lib/fleet-catalog";
import { formatQuoteReference } from "@/lib/tracking-code";
import { safeFormatDate } from "@/lib/date-utils";
import type { QuotePartnerAssignment } from "@/lib/quote-storage";
import { logger } from "@/lib/logger";

const partnerApplicationSchema = z
    .object({
        partnerType: z.enum(["INDIVIDUAL", "COMPANY"]).default("COMPANY"),
        companyName: z
            .string()
            .trim()
            .min(2, "Le nom complet ou la raison sociale est requis")
            .max(150),
        rccmNumber: z.string().trim().max(80).optional().or(z.literal("")),
        nccNumber: z.string().trim().max(60).optional().or(z.literal("")),
        idDocumentNumber: z
            .string()
            .trim()
            .max(80)
            .optional()
            .or(z.literal("")),
        country: z
            .enum(UEMOA_CEDEAO_COUNTRIES, {
                message: "Veuillez sélectionner la Côte d'Ivoire",
            })
            .default("Côte d'Ivoire"),
        city: z
            .string()
            .trim()
            .min(2, "La ville d'implantation est requise")
            .max(100),
        contactName: z
            .string()
            .trim()
            .min(2, "Le nom du contact est requis")
            .max(120),
        email: z.string().trim().email("Adresse email valide requise"),
        phone: z
            .string()
            .trim()
            .min(8, "Un numéro de téléphone valide (+225...) est requis")
            .max(40),
        whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
        fleetCategories: z
            .array(z.string().trim().min(1).max(80))
            .min(1, "Sélectionnez au moins une catégorie de véhicules"),
        fleetSummary: z
            .string()
            .trim()
            .min(
                10,
                "Décrivez brièvement votre parc (modèles, tonnages, années...)"
            )
            .max(2000),
        totalVehicles: z.coerce
            .number()
            .int()
            .min(1, "Le parc doit compter au moins 1 véhicule")
            .max(500),
        operatingZones: z
            .array(z.string().trim().min(1).max(120))
            .min(1, "Sélectionnez au moins une zone d'intervention en Côte d'Ivoire"),
        kycDocumentKeys: z
            .array(
                z
                    .string()
                    .trim()
                    .refine(
                        (k) => k.startsWith("partners-kyc/") && !k.includes(".."),
                        "Clé de document KYC non autorisée"
                    )
            )
            .max(5, "Maximum 5 documents par dossier")
            .default([]),
        acceptOhadaCharter: z.literal(true, {
            message:
                "Vous devez accepter la Charte de Qualité et de Sécurité Routière",
        }),
    })
    .superRefine((data, ctx) => {
        if (
            data.partnerType === "COMPANY" &&
            (!data.rccmNumber || data.rccmNumber.trim().length < 4)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["rccmNumber"],
                message: "Le numéro RCCM est requis pour une entreprise.",
            });
        }
        if (
            data.partnerType === "INDIVIDUAL" &&
            (!data.idDocumentNumber || data.idDocumentNumber.trim().length < 4)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["idDocumentNumber"],
                message:
                    "Le numéro de CNI ou de permis de conduire est requis pour un particulier.",
            });
        }
    });

export type PartnerApplicationInput = z.input<typeof partnerApplicationSchema>;

export interface PartnerApplicationItem {
    id: string;
    partnerType: "INDIVIDUAL" | "COMPANY";
    companyName: string;
    rccmNumber: string | null;
    nccNumber: string | null;
    idDocumentNumber: string | null;
    country: string;
    city: string;
    contactName: string;
    email: string;
    phone: string;
    whatsapp: string | null;
    fleetCategories: string[];
    fleetSummary: string;
    totalVehicles: number;
    operatingZones: string[];
    kycDocumentKeys: string[];
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminNotes: string | null;
    reviewedAt: string | null;
    reviewedBy: string | null;
    createdAt: string;
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 900; // 15 minutes
const memoryPartnerRateLimit = new Map<
    string,
    { count: number; resetAt: number }
>();

async function isPartnerRateLimited(identifier: string): Promise<boolean> {
    const key = `ratelimit:partner:${identifier.toLowerCase()}`;

    if (isRedisConfigured()) {
        try {
            const count = await redis.incr(key);
            if (count === 1) {
                await redis.expire(key, RATE_LIMIT_WINDOW_SEC);
            }
            return count > RATE_LIMIT_MAX;
        } catch {
            // Repli mémoire
        }
    }

    const now = Date.now();
    const existing = memoryPartnerRateLimit.get(key);
    if (!existing || existing.resetAt <= now) {
        memoryPartnerRateLimit.set(key, {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW_SEC * 1000,
        });
        return false;
    }

    existing.count += 1;
    return existing.count > RATE_LIMIT_MAX;
}

function toPartnerItem(app: PartnerApplication): PartnerApplicationItem {
    return {
        id: app.id,
        partnerType:
            app.partnerType === "INDIVIDUAL" ? "INDIVIDUAL" : "COMPANY",
        companyName: app.companyName,
        rccmNumber: app.rccmNumber,
        nccNumber: app.nccNumber,
        idDocumentNumber: app.idDocumentNumber,
        country: app.country,
        city: app.city,
        contactName: app.contactName,
        email: app.email,
        phone: app.phone,
        whatsapp: app.whatsapp,
        fleetCategories: app.fleetCategories ?? [],
        fleetSummary: app.fleetSummary,
        totalVehicles: app.totalVehicles,
        operatingZones: app.operatingZones ?? [],
        kycDocumentKeys: app.kycDocumentKeys ?? [],
        status: app.status,
        adminNotes: app.adminNotes,
        reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString() : null,
        reviewedBy: app.reviewedBy,
        createdAt: app.createdAt.toISOString(),
    };
}

/**
 * Soumet une candidature partenaire transporteur / loueur Afrique.
 * Valide le schéma Zod, applique le rate-limiting, enregistre les clés S3 privées `partners-kyc`
 * et déclenche les emails de confirmation et d'alerte admin via Resend.
 */
export async function submitPartnerApplicationAction(
    input: PartnerApplicationInput
): Promise<{
    data: { id: string; companyName: string } | null;
    error: string | null;
}> {
    try {
        const parsed = partnerApplicationSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Veuillez vérifier les informations du formulaire.",
            };
        }

        const v = parsed.data;

        if (await isPartnerRateLimited(v.email)) {
            return {
                data: null,
                error: "Trop de tentatives récentes pour cette adresse email. Veuillez patienter 15 minutes.",
            };
        }

        const created = await prisma.partnerApplication.create({
            data: {
                partnerType: v.partnerType,
                companyName: v.companyName,
                rccmNumber:
                    v.partnerType === "COMPANY" ? v.rccmNumber || null : null,
                nccNumber:
                    v.partnerType === "COMPANY" ? v.nccNumber || null : null,
                idDocumentNumber:
                    v.partnerType === "INDIVIDUAL"
                        ? v.idDocumentNumber || null
                        : null,
                country: v.country,
                city: v.city,
                contactName: v.contactName,
                email: v.email,
                phone: v.phone,
                whatsapp: v.whatsapp || null,
                fleetCategories: v.fleetCategories,
                fleetSummary: v.fleetSummary,
                totalVehicles: v.totalVehicles,
                operatingZones: v.operatingZones,
                kycDocumentKeys: v.kycDocumentKeys,
                status: PartnerApplicationStatus.PENDING,
            },
        });

        // Envoi non-bloquant des emails (Resend -> Fallback Gmail SMTP)
        if (isAnyEmailProviderConfigured()) {
            const categoryText = v.fleetCategories.join(", ");
            const adminEmail =
                process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
                COMPANY_CONFIG.contact.email;

            void Promise.allSettled([
                sendTransactionalEmail({
                    from: EMAIL_SENDER,
                    to: [v.email],
                    subject: `Candidature partenaire reçue — ${COMPANY_CONFIG.shortName}`,
                    react: PartnerApplicationEmail({
                        companyName: v.companyName,
                        contactName: v.contactName,
                        country: v.country,
                        city: v.city,
                        category: categoryText,
                        fleetSummary: `${v.totalVehicles} véhicule(s) • ${v.fleetSummary}`,
                        isAdminCopy: false,
                    }),
                }),
                sendTransactionalEmail({
                    from: EMAIL_SENDER,
                    to: [adminEmail],
                    subject: `[PARTENAIRE CI] Nouvelle candidature : ${v.companyName} (${v.city})`,
                    react: PartnerApplicationEmail({
                        companyName: v.companyName,
                        contactName: `${v.contactName} (${v.phone})`,
                        country: v.country,
                        city: v.city,
                        category: `${categoryText}${v.rccmNumber ? ` • RCCM: ${v.rccmNumber}` : ""}`,
                        fleetSummary: `${v.totalVehicles} véhicule(s) • ${v.fleetSummary}`,
                        isAdminCopy: true,
                    }),
                }),
            ]).catch((err: unknown) => {
                logger.warn("Partner email notification warning", {
                    error: err instanceof Error ? err.message : String(err),
                });
            });
        }

        revalidatePath("/admin/partners");
        revalidatePath("/admin/dashboard");

        return {
            data: { id: created.id, companyName: created.companyName },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("submitPartnerApplicationAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de l'envoi de votre dossier partenaire.",
        };
    }
}

/**
 * Récupère toutes les candidatures partenaires pour la console d'administration `/admin/partners`.
 */
export async function getAdminPartnerApplicationsAction(): Promise<{
    data: PartnerApplicationItem[] | null;
    error: string | null;
}> {
    try {
        await requireAdmin();

        const list = await prisma.partnerApplication.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
        });

        return {
            data: list.map(toPartnerItem),
            error: null,
        };
    } catch (error: unknown) {
        logger.error("getAdminPartnerApplicationsAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de charger les candidatures partenaires.",
        };
    }
}

const reviewPartnerSchema = z.object({
    id: z.string().min(1, "Identifiant dossier requis"),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
    adminNotes: z.string().trim().max(2000).optional(),
});

/**
 * Valide ou refuse un dossier partenaire après contrôle des pièces KYC.
 */
export async function updatePartnerApplicationStatusAction(input: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminNotes?: string;
}): Promise<{ data: PartnerApplicationItem | null; error: string | null }> {
    try {
        const admin = await requireAdmin();

        const parsed = reviewPartnerSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Paramètres de validation invalides.",
            };
        }

        const updated = await prisma.partnerApplication.update({
            where: { id: parsed.data.id },
            data: {
                status: parsed.data.status as PartnerApplicationStatus,
                adminNotes: parsed.data.adminNotes ?? null,
                reviewedAt: new Date(),
                reviewedBy: admin.email || admin.name || "Admin",
            },
        });

        revalidatePath("/admin/partners");

        return {
            data: toPartnerItem(updated),
            error: null,
        };
    } catch (error: unknown) {
        logger.error("updatePartnerApplicationStatusAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la mise à jour du statut partenaire.",
        };
    }
}

/**
 * Supprime un dossier de candidature partenaire.
 */
export async function deletePartnerApplicationAction(
    id: string
): Promise<{ data: { deleted: boolean } | null; error: string | null }> {
    try {
        await requireAdmin();

        await prisma.partnerApplication.delete({ where: { id } });
        revalidatePath("/admin/partners");

        return { data: { deleted: true }, error: null };
    } catch (error: unknown) {
        logger.error("deletePartnerApplicationAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de supprimer ce dossier.",
        };
    }
}

export interface ApprovedPartnerOption {
    id: string;
    companyName: string;
    contactName: string;
    city: string;
    phone: string;
    whatsapp: string | null;
    email: string;
    totalVehicles: number;
    fleetCategories: string[];
}

/**
 * Liste les partenaires agréés (`APPROVED`) disponibles pour affectation sur un devis.
 */
export async function getApprovedPartnersAction(): Promise<{
    data: ApprovedPartnerOption[] | null;
    error: string | null;
}> {
    try {
        await requireAdmin();
        const rows = await prisma.partnerApplication.findMany({
            where: { status: PartnerApplicationStatus.APPROVED },
            orderBy: { companyName: "asc" },
            take: 100,
            select: {
                id: true,
                companyName: true,
                contactName: true,
                city: true,
                phone: true,
                whatsapp: true,
                email: true,
                totalVehicles: true,
                fleetCategories: true,
            },
        });
        return { data: rows, error: null };
    } catch (error: unknown) {
        logger.error("getApprovedPartnersAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de charger les partenaires agréés.",
        };
    }
}

const assignPartnerSchema = z.object({
    quoteId: z.string().min(1, "Identifiant de devis requis"),
    partnerId: z.string().min(1, "Partenaire requis"),
    partnerNetFcfa: z
        .number()
        .int()
        .min(0, "Le tarif net doit être positif")
        .max(500_000_000),
    clientPriceFcfa: z.number().int().min(0).max(500_000_000).optional(),
    missionNotes: z.string().trim().max(1000).optional(),
});

/**
 * Affecte un partenaire agréé à un devis avec calcul automatique de la marge HBC
 * en préservant toutes les autres clés de `supplementaryInfo`.
 */
export async function assignPartnerToQuoteAction(input: {
    quoteId: string;
    partnerId: string;
    partnerNetFcfa: number;
    clientPriceFcfa?: number;
    missionNotes?: string;
}): Promise<{
    data: QuotePartnerAssignment | null;
    error: string | null;
}> {
    try {
        const admin = await requireAdmin();
        const parsed = assignPartnerSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Paramètres d'affectation invalides.",
            };
        }

        const [quote, partner] = await Promise.all([
            prisma.quote.findUnique({ where: { id: parsed.data.quoteId } }),
            prisma.partnerApplication.findUnique({
                where: { id: parsed.data.partnerId },
            }),
        ]);

        if (!quote) {
            return { data: null, error: "Devis introuvable." };
        }
        if (!partner) {
            return { data: null, error: "Partenaire introuvable." };
        }
        if (partner.status !== PartnerApplicationStatus.APPROVED) {
            return {
                data: null,
                error: "Seul un partenaire agréé (statut APPROVED) peut être affecté à une mission.",
            };
        }

        const hbcMarginFcfa =
            parsed.data.clientPriceFcfa !== undefined
                ? parsed.data.clientPriceFcfa - parsed.data.partnerNetFcfa
                : undefined;

        const assignment: QuotePartnerAssignment = {
            partnerId: partner.id,
            partnerName: partner.companyName,
            contactName: partner.contactName,
            phone: partner.phone,
            whatsapp: partner.whatsapp,
            email: partner.email,
            city: partner.city,
            partnerNetFcfa: parsed.data.partnerNetFcfa,
            clientPriceFcfa: parsed.data.clientPriceFcfa,
            hbcMarginFcfa,
            missionNotes: parsed.data.missionNotes || undefined,
            assignedAt: new Date().toISOString(),
            assignedBy: admin.name || admin.email,
        };

        const currentSupp =
            (quote.supplementaryInfo as Record<string, unknown> | null) || {};
        const mergedSupp = {
            ...currentSupp,
            partnerAssignment: assignment,
        } as unknown as Prisma.InputJsonValue;

        const marginLabel =
            hbcMarginFcfa !== undefined
                ? ` • Marge HBC : ${hbcMarginFcfa.toLocaleString("fr-FR")} FCFA`
                : "";

        await prisma.quote.update({
            where: { id: quote.id },
            data: {
                supplementaryInfo: mergedSupp,
                history: {
                    create: {
                        action: "Partenaire affecté",
                        description: `${partner.companyName} (${partner.city}) — Net partenaire : ${parsed.data.partnerNetFcfa.toLocaleString("fr-FR")} FCFA${marginLabel}`,
                        user: admin.name || admin.email,
                    },
                },
            },
        });

        revalidatePath("/admin/quotes");
        revalidatePath(`/admin/quotes/${quote.id}`);
        revalidatePath("/admin/dashboard");

        return { data: assignment, error: null };
    } catch (error: unknown) {
        logger.error("assignPartnerToQuoteAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible d'affecter ce partenaire.",
        };
    }
}

const quoteIdSchema = z
    .string()
    .trim()
    .min(1, "Identifiant de devis requis")
    .max(100, "Identifiant de devis invalide");

/**
 * Retire l'affectation partenaire d'un devis.
 */
export async function unassignPartnerFromQuoteAction(quoteId: string): Promise<{
    data: { removed: boolean } | null;
    error: string | null;
}> {
    try {
        const admin = await requireAdmin();
        const parsedId = quoteIdSchema.safeParse(quoteId);
        if (!parsedId.success) {
            return {
                data: null,
                error:
                    parsedId.error.issues[0]?.message ||
                    "Identifiant de devis invalide.",
            };
        }

        const quote = await prisma.quote.findUnique({
            where: { id: parsedId.data },
        });
        if (!quote) {
            return { data: null, error: "Devis introuvable." };
        }

        const currentSupp =
            (quote.supplementaryInfo as Record<string, unknown> | null) || {};
        const nextSupp = { ...currentSupp };
        delete nextSupp.partnerAssignment;

        await prisma.quote.update({
            where: { id: quote.id },
            data: {
                supplementaryInfo: nextSupp as unknown as Prisma.InputJsonValue,
                history: {
                    create: {
                        action: "Affectation partenaire retirée",
                        description: "Le partenaire a été dissocié de cette mission.",
                        user: admin.name || admin.email,
                    },
                },
            },
        });

        revalidatePath("/admin/quotes");
        revalidatePath(`/admin/quotes/${quote.id}`);

        return { data: { removed: true }, error: null };
    } catch (error: unknown) {
        logger.error("unassignPartnerFromQuoteAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de retirer l'affectation.",
        };
    }
}

/**
 * Envoie la fiche de mission par email au partenaire affecté sur le devis.
 */
export async function sendPartnerMissionEmailAction(quoteId: string): Promise<{
    data: { provider: string } | null;
    error: string | null;
}> {
    try {
        const admin = await requireAdmin();
        const parsedId = quoteIdSchema.safeParse(quoteId);
        if (!parsedId.success) {
            return {
                data: null,
                error:
                    parsedId.error.issues[0]?.message ||
                    "Identifiant de devis invalide.",
            };
        }

        if (!isAnyEmailProviderConfigured()) {
            return {
                data: null,
                error: "Aucun fournisseur email n'est configuré sur le serveur.",
            };
        }

        const quote = await prisma.quote.findUnique({
            where: { id: parsedId.data },
        });
        if (!quote) {
            return { data: null, error: "Devis introuvable." };
        }

        const supp =
            (quote.supplementaryInfo as Record<string, unknown> | null) || {};
        const assignment = supp.partnerAssignment as
            | QuotePartnerAssignment
            | undefined;

        if (!assignment?.email) {
            return {
                data: null,
                error: "Aucun partenaire affecté sur ce dossier.",
            };
        }

        const ref = formatQuoteReference(quote);
        const deadline = safeFormatDate(
            quote.transportDate,
            "dd/MM/yyyy 'à' HH:mm"
        );
        const netLabel = `${assignment.partnerNetFcfa.toLocaleString("fr-FR")} FCFA`;
        const safePickup = quote.pickupLocation.replace(/[\r\n]+/g, " ").trim();
        const safeDropoff = quote.dropoffLocation
            .replace(/[\r\n]+/g, " ")
            .trim();

        const textBody = [
            `Bonjour ${assignment.contactName} (${assignment.partnerName}),`,
            "",
            `HBC Logistique vous propose l'ordre de mission ${ref} :`,
            `- Fret / Prestation : ${quote.itemType}`,
            `- Enlèvement : ${safePickup}`,
            `- Livraison : ${safeDropoff}`,
            `- Échéance souhaitée : ${deadline}`,
            `- Tarif net partenaire convenu : ${netLabel}`,
            assignment.missionNotes
                ? `- Consignes exploitation : ${assignment.missionNotes}`
                : "",
            "",
            `Merci de confirmer votre disponibilité par retour d'email ou par téléphone au ${COMPANY_CONFIG.contact.phoneDisplay}.`,
            "",
            `L'équipe Exploitation ${COMPANY_CONFIG.shortName}`,
        ]
            .filter(Boolean)
            .join("\n");

        const sendRes = await sendTransactionalEmail({
            from: EMAIL_SENDER,
            to: [assignment.email],
            subject: `[ORDRE DE MISSION ${ref}] ${safePickup} → ${safeDropoff} (${netLabel})`,
            text: textBody,
        });

        if (sendRes.error) {
            return { data: null, error: sendRes.error.message };
        }

        await prisma.quoteHistory.create({
            data: {
                quoteId: quote.id,
                action: "Fiche mission envoyée au partenaire",
                description: `Ordre de mission transmis à ${assignment.partnerName} (${assignment.email}) via ${sendRes.provider}.`,
                user: admin.name || admin.email,
            },
        });

        revalidatePath(`/admin/quotes/${quote.id}`);

        return { data: { provider: sendRes.provider }, error: null };
    } catch (error: unknown) {
        logger.error("sendPartnerMissionEmailAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible d'envoyer la fiche de mission.",
        };
    }
}
