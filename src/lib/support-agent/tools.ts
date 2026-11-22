import { z } from "zod";
import prisma from "@/lib/prisma";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { logger } from "@/lib/logger";

/**
 * Couche d'Outils Sécurisés (Server-Side Tools) pour l'Agent Support HBC Logistique.
 * Chaque outil valide strictement ses paramètres via Zod et applique les règles
 * de protection des données personnelles (ARTCI - Loi n° 2013-450).
 */

export const lookupQuoteStatusSchema = z.object({
    reference: z
        .string()
        .trim()
        .min(4, "Référence de dossier trop courte")
        .max(64, "Référence invalide"),
    emailOrPhone: z
        .string()
        .trim()
        .min(5, "Email ou téléphone requis pour vérification d'identité")
        .max(120),
});

export const escalateSupportTicketSchema = z.object({
    clientName: z.string().trim().min(2).max(120),
    email: z.string().email("Email invalide"),
    phone: z.string().trim().min(8).max(30),
    summary: z.string().trim().min(10).max(1500),
});

export type ToolResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

const STATUS_LABELS_FR: Record<string, string> = {
    PENDING: "En attente d'étude par notre service d'exploitation",
    VALIDATED: "Validé et planifié par notre équipe logistique",
    COMPLETED: "Transport livré et clôturé",
    REJECTED: "Non retenu / Annulé",
};

/**
 * Outil 1 : Vérification sécurisée du statut d'un devis en base PostgreSQL.
 * Exige une double correspondance (référence + email ou téléphone) pour empêcher
 * toute fuite de données personnelles d'un tiers.
 */
export async function lookupQuoteStatusTool(
    input: unknown
): Promise<
    ToolResult<{
        reference: string;
        status: string;
        statusLabel: string;
        itemType: string;
        pickupLocation: string;
        dropoffLocation: string;
        transportDate: string;
    }>
> {
    const parsed = lookupQuoteStatusSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ||
                "Paramètres de recherche de devis invalides.",
        };
    }

    const { reference, emailOrPhone } = parsed.data;
    const normalizedRef = reference.replace(/^HBC-/i, "").trim();
    const normalizedContact = emailOrPhone.toLowerCase().trim();
    const contactDigits = emailOrPhone.replace(/\D/g, "");

    try {
        const quote = await prisma.quote.findFirst({
            where: {
                OR: [
                    { id: reference },
                    { id: { startsWith: normalizedRef, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                email: true,
                phone: true,
                status: true,
                itemType: true,
                pickupLocation: true,
                dropoffLocation: true,
                transportDate: true,
            },
        });

        if (!quote) {
            return {
                success: false,
                error: "Aucun dossier trouvé avec cette référence.",
            };
        }

        // Vérification stricte d'identité (Anti-fuite PII / Conformité ARTCI)
        const emailMatches = quote.email.toLowerCase() === normalizedContact;
        const quotePhoneDigits = quote.phone.replace(/\D/g, "");
        const phoneMatches =
            contactDigits.length >= 8 &&
            quotePhoneDigits.endsWith(contactDigits.slice(-8));

        if (!emailMatches && !phoneMatches) {
            return {
                success: false,
                error: "Vérification d'identité échouée : l'email ou le téléphone ne correspond pas à ce dossier.",
            };
        }

        return {
            success: true,
            data: {
                reference: quote.id,
                status: quote.status,
                statusLabel:
                    STATUS_LABELS_FR[quote.status] ||
                    "En cours de traitement",
                itemType: quote.itemType,
                pickupLocation: quote.pickupLocation,
                dropoffLocation: quote.dropoffLocation,
                transportDate: quote.transportDate.toISOString().split("T")[0],
            },
        };
    } catch (error: unknown) {
        logger.error("lookupQuoteStatusTool error", error);
        return {
            success: false,
            error: "Service de suivi temporairement indisponible.",
        };
    }
}

/**
 * Outil 2 : Lecture dynamique des coordonnées & paramètres officiels depuis SystemSettings
 * avec repli automatique sur COMPANY_CONFIG (Côte d'Ivoire).
 */
export async function getCompanyInfoTool(): Promise<
    ToolResult<{
        companyName: string;
        email: string;
        phone: string;
        address: string;
        hours: string;
        currency: string;
    }>
> {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: "default" },
            select: {
                companyName: true,
                contactEmail: true,
                contactPhone: true,
            },
        });

        return {
            success: true,
            data: {
                companyName: settings?.companyName || COMPANY_CONFIG.legalName,
                email: settings?.contactEmail || COMPANY_CONFIG.contact.email,
                phone:
                    settings?.contactPhone ||
                    COMPANY_CONFIG.contact.phoneDisplay,
                address: COMPANY_CONFIG.address.full,
                hours: COMPANY_CONFIG.businessHours.summary,
                currency: `${COMPANY_CONFIG.currency.symbol} (${COMPANY_CONFIG.currency.code})`,
            },
        };
    } catch {
        return {
            success: true,
            data: {
                companyName: COMPANY_CONFIG.legalName,
                email: COMPANY_CONFIG.contact.email,
                phone: COMPANY_CONFIG.contact.phoneDisplay,
                address: COMPANY_CONFIG.address.full,
                hours: COMPANY_CONFIG.businessHours.summary,
                currency: `${COMPANY_CONFIG.currency.symbol} (${COMPANY_CONFIG.currency.code})`,
            },
        };
    }
}

/**
 * Outil 3 : Escalade réelle vers un conseiller humain en créant un message prioritaire
 * dans la boîte de réception administrateur (`contact_message`).
 */
export async function escalateSupportTicketTool(
    input: unknown
): Promise<ToolResult<{ ticketId: string; status: string }>> {
    const parsed = escalateSupportTicketSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error:
                parsed.error.issues[0]?.message ||
                "Informations d'escalade incomplètes.",
        };
    }

    try {
        const nameParts = parsed.data.clientName.split(/\s+/);
        const firstName = nameParts[0] || parsed.data.clientName;
        const lastName = nameParts.slice(1).join(" ") || "-";

        const created = await prisma.contactMessage.create({
            data: {
                firstName,
                lastName,
                email: parsed.data.email.toLowerCase(),
                phone: parsed.data.phone,
                message: `[ESCALADE ASSISTANT IA] ${parsed.data.summary}`,
                status: "UNREAD",
            },
            select: { id: true },
        });

        return {
            success: true,
            data: {
                ticketId: created.id,
                status: "TRANSMIS_CONSEILLER",
            },
        };
    } catch (error: unknown) {
        logger.error("escalateSupportTicketTool error", error);
        return {
            success: false,
            error: "Impossible de créer le ticket d'escalade pour le moment.",
        };
    }
}
