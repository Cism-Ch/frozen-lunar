"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";
import {
    QuoteStatus,
    QuoteSource,
    Prisma,
    Quote,
    QuoteHistory,
} from "@prisma/client";
import { handleError } from "@/lib/error-handler";
import { emailQueue, pdfQueue } from "@/lib/qstash";
import { requireAdmin } from "@/lib/auth-guard";

type QuoteWithHistory = Quote & { history: QuoteHistory[] };

/**
 * Server Actions for Quote Management
 * Handles all quote CRUD operations and integrates with Prisma database
 */

// ============================================
// VALIDATION SCHEMAS
// ============================================

const quoteIdSchema = z.string().min(1, "L'identifiant du devis est requis");

const quoteFiltersSchema = z
    .object({
        status: z.string().optional(),
        search: z.string().optional(),
    })
    .optional();

const updateQuoteStatusSchema = z.object({
    id: quoteIdSchema,
    status: z.string().min(1, "Le statut est requis"),
});

const updateQuoteDetailsSchema = z.object({
    amount: z.string().optional(),
    userNotes: z.string().optional(),
    supplementaryInfo: z.record(z.string(), z.unknown()).optional(),
});

const addQuoteNoteSchema = z.object({
    id: quoteIdSchema,
    note: z
        .string()
        .min(1, "La note ne peut pas être vide")
        .max(2000, "La note ne peut pas dépasser 2000 caractères"),
});

const supplementaryInfoSchema = z.object({
    category: z
        .enum(["materials", "container", "machinery", "structure", "other"])
        .optional(),
    // Materials
    materialType: z.string().optional(),
    weight: z.string().optional(),
    packaging: z.string().optional(),
    hazardous: z.boolean().optional(),
    stackable: z.boolean().optional(),
    // Container
    containerSize: z.string().optional(),
    containerType: z.string().optional(),
    loadingType: z.string().optional(),
    isEmpty: z.boolean().optional(),
    // Machine
    machineType: z.string().optional(),
    dimensions: z.string().optional(),
    requiresCrane: z.boolean().optional(),
    // Structure
    structureType: z.string().optional(),
    length: z.string().optional(),
    // Common
    specialRequirements: z.string().optional(),
    accessInfo: z.string().optional(),
    urgency: z.enum(["standard", "urgent", "very_urgent"]).optional(),
});

const createQuoteSchema = z.object({
    clientName: z.string().min(2, "Le nom du client est requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Téléphone requis"),
    itemType: z.string().min(2, "Type d'objet requis"),
    pickupLocation: z.string().min(5, "Adresse de départ requise"),
    dropoffLocation: z.string().min(5, "Adresse d'arrivée requise"),
    transportDate: z.union([z.string(), z.date()]),
    userNotes: z.string().optional(),
    source: z.enum(["form", "chat"]).default("form"),
    supplementaryInfo: supplementaryInfoSchema.optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert frontend status to Prisma enum
 */
function statusToEnum(status: string): QuoteStatus {
    switch (status) {
        case "En attente":
            return QuoteStatus.PENDING;
        case "Validé":
            return QuoteStatus.VALIDATED;
        case "Refusé":
            return QuoteStatus.REJECTED;
        default:
            return QuoteStatus.PENDING;
    }
}

/**
 * Convert Prisma enum to frontend status
 */
function enumToStatus(status: QuoteStatus): string {
    switch (status) {
        case QuoteStatus.PENDING:
            return "En attente";
        case QuoteStatus.VALIDATED:
            return "Validé";
        case QuoteStatus.REJECTED:
            return "Refusé";
        default:
            return "En attente";
    }
}

/**
 * Convert source string to Prisma enum
 */
function sourceToEnum(source: string): QuoteSource {
    return source.toUpperCase() === "CHAT"
        ? QuoteSource.CHAT
        : QuoteSource.FORM;
}

/**
 * Convert Prisma enum to frontend source
 */
function enumToSource(source: QuoteSource): string {
    return source === QuoteSource.CHAT ? "chat" : "form";
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a new quote
 */
export async function createQuoteAction(
    data: z.infer<typeof createQuoteSchema>
) {
    try {
        const validated = createQuoteSchema.parse(data);

        // Convert transportDate to Date if it's a string
        const transportDate =
            typeof validated.transportDate === "string"
                ? new Date(validated.transportDate)
                : validated.transportDate;

        // Create the quote in database
        const quote = await prisma.quote.create({
            data: {
                clientName: validated.clientName,
                email: validated.email,
                phone: validated.phone,
                itemType: validated.itemType,
                pickupLocation: validated.pickupLocation,
                dropoffLocation: validated.dropoffLocation,
                transportDate: transportDate,
                userNotes: validated.userNotes || null,
                source: sourceToEnum(validated.source),
                supplementaryInfo: validated.supplementaryInfo
                    ? (validated.supplementaryInfo as Prisma.InputJsonValue)
                    : Prisma.JsonNull,
            },
            include: {
                history: true,
            },
        });

        // Create history entry
        const sourceLabel =
            validated.source === "chat"
                ? "l'assistant virtuel"
                : "le formulaire web";
        await prisma.quoteHistory.create({
            data: {
                quoteId: quote.id,
                action: "Création",
                description: `Devis créé via ${sourceLabel}`,
                user: "Système",
            },
        });

        // Déclencher les tâches asynchrones via Upstash QStash (Non-bloquant)
        try {
            const payload = {
                clientName: quote.clientName,
                email: quote.email,
                phone: quote.phone,
                pickup: quote.pickupLocation,
                dropoff: quote.dropoffLocation,
                itemType: quote.itemType,
                date: quote.transportDate.toISOString().split("T")[0],
                quoteId: quote.id,
            };

            await emailQueue.enqueue({
                type: "admin_notification",
                ...payload,
            });

            await emailQueue.enqueue({
                type: "client_confirmation",
                ...payload,
            });

            await pdfQueue.enqueue({
                id: quote.id,
                clientName: quote.clientName,
                date: quote.date.toISOString(),
            });
        } catch (enqueueError: unknown) {
            console.warn(
                "⚠️ Warning: QStash enqueue non-blocking error:",
                enqueueError
            );
        }

        revalidatePath("/admin/quotes");
        revalidatePath("/admin/dashboard");

        return {
            success: true,
            quote: {
                id: quote.id,
                date: quote.date.toISOString(),
                client: quote.clientName,
                email: quote.email,
                phone: quote.phone,
                type: quote.itemType,
                pickup: quote.pickupLocation,
                dropoff: quote.dropoffLocation,
                transportDate: quote.transportDate.toISOString(),
                status: enumToStatus(quote.status),
                amount: quote.amount,
                userNotes: quote.userNotes || undefined,
                source: enumToSource(quote.source),
                supplementaryInfo: quote.supplementaryInfo
                    ? (quote.supplementaryInfo as Record<string, unknown>)
                    : undefined,
            },
        };
    } catch (error: unknown) {
        console.error("Create Quote Error:", error);
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            return { success: false, error: firstError.message };
        }
        const errorResponse = handleError(error);
        return { success: false, error: errorResponse.message };
    }
}

/**
 * Get all quotes with optional filters
 * Nécessite les privilèges administrateur
 */
export async function getQuotesAction(filters?: {
    status?: string;
    search?: string;
}) {
    try {
        await requireAdmin();
        const validatedFilters = quoteFiltersSchema.parse(filters);

        const where: Prisma.QuoteWhereInput = {};

        if (validatedFilters?.status && validatedFilters.status !== "all") {
            where.status = statusToEnum(validatedFilters.status);
        }

        if (validatedFilters?.search) {
            where.OR = [
                {
                    clientName: {
                        contains: validatedFilters.search,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: validatedFilters.search,
                        mode: "insensitive",
                    },
                },
                {
                    id: {
                        contains: validatedFilters.search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        const quotes = await prisma.quote.findMany({
            where,
            include: {
                history: {
                    orderBy: { timestamp: "desc" },
                },
            },
            orderBy: { date: "desc" },
        });

        return {
            success: true,
            quotes: quotes.map((quote: QuoteWithHistory) => ({
                id: quote.id,
                date: quote.date.toISOString().split("T")[0],
                client: quote.clientName,
                email: quote.email,
                phone: quote.phone,
                type: quote.itemType,
                pickup: quote.pickupLocation,
                dropoff: quote.dropoffLocation,
                transportDate: quote.transportDate.toISOString(),
                status: enumToStatus(quote.status),
                amount: quote.amount,
                userNotes: quote.userNotes || undefined,
                source: enumToSource(quote.source),
                supplementaryInfo: quote.supplementaryInfo
                    ? (quote.supplementaryInfo as Record<string, unknown>)
                    : undefined,
                history: quote.history.map((h: QuoteHistory) => ({
                    id: h.id,
                    action: h.action,
                    description: h.description || undefined,
                    timestamp: h.timestamp.toISOString(),
                    user: h.user,
                })),
            })),
        };
    } catch (error: unknown) {
        console.error("Get Quotes Error:", error);
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
                quotes: [],
            };
        }
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
            quotes: [],
        };
    }
}

/**
 * Get a single quote by ID
 * Nécessite les privilèges administrateur
 */
export async function getQuoteByIdAction(id: string) {
    try {
        await requireAdmin();
        const validId = quoteIdSchema.parse(id);

        const quote = await prisma.quote.findUnique({
            where: { id: validId },
            include: {
                history: {
                    orderBy: { timestamp: "desc" },
                },
            },
        });

        if (!quote) {
            return { success: false, error: "Devis introuvable" };
        }

        return {
            success: true,
            quote: {
                id: quote.id,
                date: quote.date.toISOString().split("T")[0],
                client: quote.clientName,
                email: quote.email,
                phone: quote.phone,
                type: quote.itemType,
                pickup: quote.pickupLocation,
                dropoff: quote.dropoffLocation,
                transportDate: quote.transportDate.toISOString(),
                status: enumToStatus(quote.status),
                amount: quote.amount,
                userNotes: quote.userNotes || undefined,
                source: enumToSource(quote.source),
                supplementaryInfo: quote.supplementaryInfo
                    ? (quote.supplementaryInfo as Record<string, unknown>)
                    : undefined,
                history: quote.history.map((h: QuoteHistory) => ({
                    id: h.id,
                    action: h.action,
                    description: h.description || undefined,
                    timestamp: h.timestamp.toISOString(),
                    user: h.user,
                })),
            },
        };
    } catch (error: unknown) {
        console.error("Get Quote By ID Error:", error);
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            };
        }
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
        };
    }
}

/**
 * Update quote status
 * Nécessite les privilèges administrateur
 */
export async function updateQuoteStatusAction(id: string, status: string) {
    try {
        await requireAdmin();
        const validated = updateQuoteStatusSchema.parse({ id, status });
        const enumStatus = statusToEnum(validated.status);

        const quote = await prisma.quote.update({
            where: { id: validated.id },
            data: { status: enumStatus },
        });

        // Add history entry
        await prisma.quoteHistory.create({
            data: {
                quoteId: validated.id,
                action: "Changement de statut",
                description: `Statut changé en : ${validated.status}`,
                user: "Admin",
            },
        });

        revalidatePath("/admin/quotes");
        revalidatePath(`/admin/quotes/${validated.id}`);
        revalidatePath("/admin/dashboard");

        return {
            success: true,
            quote: {
                id: quote.id,
                status: enumToStatus(quote.status),
            },
        };
    } catch (error: unknown) {
        console.error("Update Quote Status Error:", error);
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            };
        }
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
        };
    }
}

/**
 * Update quote details
 * Nécessite les privilèges administrateur
 */
export async function updateQuoteAction(
    id: string,
    data: Partial<{
        amount: string;
        userNotes: string;
        supplementaryInfo: Record<string, unknown>;
    }>
) {
    try {
        await requireAdmin();
        const validId = quoteIdSchema.parse(id);
        const validData = updateQuoteDetailsSchema.parse(data);

        const updateData: Prisma.QuoteUpdateInput = {};

        if (validData.amount !== undefined)
            updateData.amount = validData.amount;
        if (validData.userNotes !== undefined)
            updateData.userNotes = validData.userNotes;
        if (validData.supplementaryInfo !== undefined) {
            updateData.supplementaryInfo =
                validData.supplementaryInfo as Prisma.InputJsonValue;
        }

        const quote = await prisma.quote.update({
            where: { id: validId },
            data: updateData,
        });

        // Add history entry
        const fields = Object.keys(data).join(", ");
        await prisma.quoteHistory.create({
            data: {
                quoteId: validId,
                action: "Mise à jour",
                description: `Champs mis à jour : ${fields}`,
                user: "Admin",
            },
        });

        revalidatePath("/admin/quotes");
        revalidatePath(`/admin/quotes/${validId}`);

        return { success: true, quote };
    } catch (error: unknown) {
        console.error("Update Quote Error:", error);
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            };
        }
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
        };
    }
}

/**
 * Add a note to quote history
 * Nécessite les privilèges administrateur
 */
export async function addQuoteNoteAction(id: string, note: string) {
    try {
        await requireAdmin();
        const validated = addQuoteNoteSchema.parse({ id, note });

        await prisma.quoteHistory.create({
            data: {
                quoteId: validated.id,
                action: "Note Interne",
                description: validated.note,
                user: "Admin",
            },
        });

        revalidatePath("/admin/quotes");
        revalidatePath(`/admin/quotes/${validated.id}`);

        return { success: true };
    } catch (error: unknown) {
        console.error("Add Quote Note Error:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        const errorResponse = handleError(error);
        return { success: false, error: errorResponse.message };
    }
}

/**
 * Delete a quote
 * Nécessite les privilèges administrateur
 */
export async function deleteQuoteAction(id: string) {
    try {
        await requireAdmin();
        const validId = quoteIdSchema.parse(id);

        await prisma.quote.delete({
            where: { id: validId },
        });

        revalidatePath("/admin/quotes");
        revalidatePath("/admin/dashboard");

        return { success: true };
    } catch (error: unknown) {
        console.error("Delete Quote Error:", error);
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            };
        }
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
        };
    }
}
