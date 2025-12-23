"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { QuoteStatus, QuoteSource, Prisma } from "@prisma/client";

/**
 * Server Actions for Quote Management
 * Handles all quote CRUD operations and integrates with Prisma database
 */

// ============================================
// VALIDATION SCHEMAS
// ============================================

const supplementaryInfoSchema = z.object({
  category: z.enum(["materials", "container", "machinery", "structure", "other"]).optional(),
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
  }
}

/**
 * Convert source string to Prisma enum
 */
function sourceToEnum(source: string): QuoteSource {
  return source.toUpperCase() === "CHAT" ? QuoteSource.CHAT : QuoteSource.FORM;
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
export async function createQuoteAction(data: z.infer<typeof createQuoteSchema>) {
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
    const sourceLabel = validated.source === "chat" ? "l'assistant virtuel" : "le formulaire web";
    await prisma.quoteHistory.create({
      data: {
        quoteId: quote.id,
        action: "Création",
        description: `Devis créé via ${sourceLabel}`,
        user: "Système",
      },
    });

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
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erreur lors de la création du devis" };
  }
}

/**
 * Get all quotes with optional filters
 */
export async function getQuotesAction(filters?: {
  status?: string;
  search?: string;
}) {
  try {
    const where: Prisma.QuoteWhereInput = {};

    if (filters?.status && filters.status !== "all") {
      where.status = statusToEnum(filters.status);
    }

    if (filters?.search) {
      where.OR = [
        { clientName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { id: { contains: filters.search, mode: "insensitive" } },
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
      quotes: quotes.map((quote) => ({
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
        history: quote.history.map((h) => ({
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
    if (error instanceof Error) {
      return { success: false, error: error.message, quotes: [] };
    }
    return { success: false, error: "Erreur lors de la récupération des devis", quotes: [] };
  }
}

/**
 * Get a single quote by ID
 */
export async function getQuoteByIdAction(id: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
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
        history: quote.history.map((h) => ({
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
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erreur lors de la récupération du devis" };
  }
}

/**
 * Update quote status
 */
export async function updateQuoteStatusAction(id: string, status: string) {
  try {
    const enumStatus = statusToEnum(status);

    const quote = await prisma.quote.update({
      where: { id },
      data: { status: enumStatus },
    });

    // Add history entry
    await prisma.quoteHistory.create({
      data: {
        quoteId: id,
        action: "Changement de statut",
        description: `Statut changé en : ${status}`,
        user: "Admin",
      },
    });

    revalidatePath("/admin/quotes");
    revalidatePath(`/admin/quotes/${id}`);
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
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}

/**
 * Update quote details
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
    const updateData: Prisma.QuoteUpdateInput = {};

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.userNotes !== undefined) updateData.userNotes = data.userNotes;
    if (data.supplementaryInfo !== undefined) {
      updateData.supplementaryInfo = data.supplementaryInfo as Prisma.InputJsonValue;
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
    });

    // Add history entry
    const fields = Object.keys(data).join(", ");
    await prisma.quoteHistory.create({
      data: {
        quoteId: id,
        action: "Mise à jour",
        description: `Champs mis à jour : ${fields}`,
        user: "Admin",
      },
    });

    revalidatePath("/admin/quotes");
    revalidatePath(`/admin/quotes/${id}`);

    return { success: true, quote };
  } catch (error: unknown) {
    console.error("Update Quote Error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erreur lors de la mise à jour du devis" };
  }
}

/**
 * Add a note to quote history
 */
export async function addQuoteNoteAction(id: string, note: string) {
  try {
    await prisma.quoteHistory.create({
      data: {
        quoteId: id,
        action: "Note Interne",
        description: note,
        user: "Admin",
      },
    });

    revalidatePath("/admin/quotes");
    revalidatePath(`/admin/quotes/${id}`);

    return { success: true };
  } catch (error: unknown) {
    console.error("Add Quote Note Error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erreur lors de l'ajout de la note" };
  }
}

/**
 * Delete a quote
 */
export async function deleteQuoteAction(id: string) {
  try {
    await prisma.quote.delete({
      where: { id },
    });

    revalidatePath("/admin/quotes");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete Quote Error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erreur lors de la suppression du devis" };
  }
}
