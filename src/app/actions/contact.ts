"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import type { ContactMessage } from "@prisma/client";
import {
    contactFormSchema,
    type ContactStatus,
    type ContactFormInput,
    type ContactActionResult,
    type ContactMessageItem,
    type ClientDirectoryItem,
} from "@/types/contact";

export type {
    ContactStatus,
    ContactFormInput,
    ContactActionResult,
    ContactMessageItem,
    ClientDirectoryItem,
};

/**
 * Server Action publique : Enregistrement d'un message de contact en base de données.
 * Suit strictement la convention de retour { data, error }.
 */
export async function sendContactMessageAction(
    input: unknown
): Promise<ContactActionResult> {
    try {
        const validated = contactFormSchema.parse(input);

        // Persistance réelle dans la base de données PostgreSQL
        const createdMessage = await prisma.contactMessage.create({
            data: {
                firstName: validated.firstName,
                lastName: validated.lastName,
                email: validated.email.toLowerCase().trim(),
                phone: validated.phone.trim(),
                message: validated.message,
                status: "UNREAD",
            },
        });

        // Revalidation du cache pour la boîte de réception admin
        revalidatePath("/admin/contacts");

        return {
            data: {
                success: true,
                message:
                    "Votre message a bien été envoyé. Notre équipe vous répondra sous 24h ouvrées.",
                id: createdMessage.id,
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("sendContactMessageAction Error:", error);
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0]?.message || "Données invalides";
            return { data: null, error: firstError };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Une erreur inattendue est survenue lors de l'envoi du message.",
        };
    }
}

/**
 * Server Action Admin : Récupération des messages de contact depuis PostgreSQL
 */
export async function getContactMessagesAction(filters?: {
    status?: "ALL" | ContactStatus;
    search?: string;
}): Promise<{ data: ContactMessageItem[] | null; error: string | null }> {
    try {
        await requireAdmin();

        const statusFilter =
            filters?.status && filters.status !== "ALL"
                ? filters.status
                : undefined;

        const searchTerm = filters?.search?.trim()?.toLowerCase();

        const messages = await prisma.contactMessage.findMany({
            where: {
                ...(statusFilter ? { status: statusFilter } : {}),
                ...(searchTerm
                    ? {
                          OR: [
                              {
                                  firstName: {
                                      contains: searchTerm,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  lastName: {
                                      contains: searchTerm,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  email: {
                                      contains: searchTerm,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  phone: {
                                      contains: searchTerm,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  message: {
                                      contains: searchTerm,
                                      mode: "insensitive",
                                  },
                              },
                          ],
                      }
                    : {}),
            },
            orderBy: { createdAt: "desc" },
        });

        const formatted: ContactMessageItem[] = messages.map(
            (m: ContactMessage) => ({
                id: m.id,
                firstName: m.firstName,
                lastName: m.lastName,
                email: m.email,
                phone: m.phone,
                message: m.message,
                status: m.status,
                createdAt: m.createdAt.toISOString(),
            })
        );

        return { data: formatted, error: null };
    } catch (error: unknown) {
        console.error("getContactMessagesAction Error:", error);
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Impossible de charger les messages de contact.",
        };
    }
}

/**
 * Server Action Admin : Mise à jour du statut d'un message (Lu, Non lu, Archivé)
 */
export async function updateContactMessageStatusAction(
    id: string,
    status: ContactStatus
): Promise<{ data: { success: boolean } | null; error: string | null }> {
    try {
        await requireAdmin();

        if (!id) {
            return { data: null, error: "Identifiant du message requis." };
        }

        await prisma.contactMessage.update({
            where: { id },
            data: { status },
        });

        revalidatePath("/admin/contacts");
        return { data: { success: true }, error: null };
    } catch (error: unknown) {
        console.error("updateContactMessageStatusAction Error:", error);
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Échec de la mise à jour du statut du message.",
        };
    }
}

/**
 * Server Action Admin : Suppression d'un message de contact
 */
export async function deleteContactMessageAction(
    id: string
): Promise<{ data: { success: boolean } | null; error: string | null }> {
    try {
        await requireAdmin();

        if (!id) {
            return { data: null, error: "Identifiant du message requis." };
        }

        await prisma.contactMessage.delete({
            where: { id },
        });

        revalidatePath("/admin/contacts");
        return { data: { success: true }, error: null };
    } catch (error: unknown) {
        console.error("deleteContactMessageAction Error:", error);
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Échec de la suppression du message.",
        };
    }
}

/**
 * Server Action Admin : Répertoire clients réel agrégé depuis les devis en base PostgreSQL
 */
export async function getClientsDirectoryAction(
    search?: string
): Promise<{ data: ClientDirectoryItem[] | null; error: string | null }> {
    try {
        await requireAdmin();

        const quotes = await prisma.quote.findMany({
            select: {
                id: true,
                clientName: true,
                email: true,
                phone: true,
                date: true,
                status: true,
                amount: true,
            },
            orderBy: { date: "desc" },
        });

        const clientMap = new Map<string, ClientDirectoryItem>();

        for (const q of quotes) {
            const key = q.email.toLowerCase().trim();
            const existing = clientMap.get(key);

            if (existing) {
                existing.totalQuotes += 1;
                if (new Date(q.date) > new Date(existing.lastQuoteDate)) {
                    existing.lastQuoteDate = q.date.toISOString();
                    existing.lastQuoteId = q.id;
                    existing.lastStatus = q.status;
                }
            } else {
                clientMap.set(key, {
                    name: q.clientName,
                    email: q.email,
                    phone: q.phone,
                    totalQuotes: 1,
                    lastQuoteDate: q.date.toISOString(),
                    lastQuoteId: q.id,
                    lastStatus: q.status,
                });
            }
        }

        let result = Array.from(clientMap.values());

        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter(
                (c: ClientDirectoryItem) =>
                    c.name.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.phone.toLowerCase().includes(q)
            );
        }

        return { data: result, error: null };
    } catch (error: unknown) {
        console.error("getClientsDirectoryAction Error:", error);
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Impossible de récupérer le répertoire des clients.",
        };
    }
}
