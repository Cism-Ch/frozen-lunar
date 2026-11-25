"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import type { ContactMessage } from "@prisma/client";
import {
    contactFormSchema,
    type ContactStatus,
    type ContactActionResult,
    type ContactMessageItem,
    type ClientDirectoryItem,
} from "@/types/contact";
import { logger } from "@/lib/logger";
import { COMPANY_CONFIG } from "@/lib/company-config";
import {
    EMAIL_SENDER,
    isAnyEmailProviderConfigured,
    sendTransactionalEmail,
} from "@/lib/email";

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function sanitizeHeaderLine(value: string): string {
    return value.replace(/[\r\n]+/g, " ").trim();
}

function buildContactEmailHtml(params: {
    title: string;
    intro: string;
    fullName: string;
    email: string;
    phone: string;
    message: string;
    footerNote: string;
}): string {
    const safeTitle = escapeHtml(params.title);
    const safeIntro = escapeHtml(params.intro);
    const safeName = escapeHtml(params.fullName);
    const safeEmail = escapeHtml(params.email);
    const safePhone = escapeHtml(params.phone);
    const safeMessage = escapeHtml(params.message).replace(/\n/g, "<br />");
    const safeFooter = escapeHtml(params.footerNote);

    return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:24px;background:#F2F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F172A;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;">
    <div style="background:#001F3D;padding:24px 28px;border-bottom:4px solid #FF7C24;">
      <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#92A9BE;font-weight:700;">${escapeHtml(COMPANY_CONFIG.shortName)}</div>
      <h1 style="margin:8px 0 0;font-size:20px;line-height:1.3;color:#FFFFFF;">${safeTitle}</h1>
    </div>
    <div style="padding:24px 28px;">
      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">${safeIntro}</p>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:14px 16px;margin-bottom:18px;font-size:13px;line-height:1.6;">
        <div><strong>Nom :</strong> ${safeName}</div>
        <div><strong>Email :</strong> ${safeEmail}</div>
        <div><strong>Téléphone :</strong> ${safePhone}</div>
      </div>
      <div style="border-left:3px solid #FF7C24;padding:10px 14px;background:#FFF7ED;border-radius:0 8px 8px 0;font-size:14px;line-height:1.6;color:#1E293B;">
        ${safeMessage}
      </div>
      <p style="margin:22px 0 0;font-size:12px;line-height:1.5;color:#64748B;">${safeFooter}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Server Action publique : Enregistrement d'un message de contact en base de données.
 * Suit strictement la convention de retour { data, error }.
 */
export async function sendContactMessageAction(
    input: unknown
): Promise<ContactActionResult> {
    try {
        const rl = await checkRateLimit({
            scope: "contact-form",
            limit: 5,
            windowSeconds: 600,
        });
        if (!rl.allowed) {
            return {
                data: null,
                error: "Trop de messages envoyés récemment. Veuillez patienter quelques minutes.",
            };
        }

        const validated = contactFormSchema.parse(input);

        // Persistance réelle dans la base de données PostgreSQL
        const normalizedEmail = validated.email.toLowerCase().trim();
        const normalizedPhone = validated.phone.trim();
        const fullName = `${validated.firstName.trim()} ${validated.lastName.trim()}`;

        const createdMessage = await prisma.contactMessage.create({
            data: {
                firstName: validated.firstName.trim(),
                lastName: validated.lastName.trim(),
                email: normalizedEmail,
                phone: normalizedPhone,
                message: validated.message.trim(),
                status: "UNREAD",
            },
        });

        // Envoi réel des emails (Alerte Admin + Accusé de réception Visiteur) via Resend -> Fallback Gmail SMTP
        if (isAnyEmailProviderConfigured()) {
            const adminEmail =
                process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
                COMPANY_CONFIG.contact.email;
            const safeSubjectName = sanitizeHeaderLine(fullName);

            const adminText = [
                `Nouveau message reçu depuis le formulaire /contact :`,
                `- Nom : ${fullName}`,
                `- Email : ${normalizedEmail}`,
                `- Téléphone : ${normalizedPhone}`,
                "",
                `Message :`,
                validated.message.trim(),
            ].join("\n");

            const visitorText = [
                `Bonjour ${fullName},`,
                "",
                `Nous avons bien reçu votre message et nous vous remercions d'avoir contacté ${COMPANY_CONFIG.shortName}.`,
                `Notre équipe vous répondra sous 24h ouvrées.`,
                "",
                `Récapitulatif de votre message :`,
                validated.message.trim(),
                "",
                `Besoin urgent ? Appelez-nous au ${COMPANY_CONFIG.contact.phoneDisplay}.`,
            ].join("\n");

            const emailResults = await Promise.allSettled([
                sendTransactionalEmail({
                    from: EMAIL_SENDER,
                    to: [adminEmail],
                    replyTo: normalizedEmail,
                    subject: `[CONTACT] Nouveau message de ${safeSubjectName}`,
                    html: buildContactEmailHtml({
                        title: "Nouveau message client (/contact)",
                        intro: "Un visiteur vient d'envoyer un message depuis la page Contact. Vous pouvez lui répondre directement depuis votre boîte mail.",
                        fullName,
                        email: normalizedEmail,
                        phone: normalizedPhone,
                        message: validated.message.trim(),
                        footerNote: `Message enregistré dans la console admin (/admin/contacts) • ID ${createdMessage.id}`,
                    }),
                    text: adminText,
                }),
                sendTransactionalEmail({
                    from: EMAIL_SENDER,
                    to: [normalizedEmail],
                    subject: `Accusé de réception — ${COMPANY_CONFIG.shortName}`,
                    html: buildContactEmailHtml({
                        title: "Votre message a bien été reçu",
                        intro: `Bonjour ${fullName}, merci pour votre prise de contact. Notre équipe étudie votre demande et vous répondra sous 24h ouvrées.`,
                        fullName,
                        email: normalizedEmail,
                        phone: normalizedPhone,
                        message: validated.message.trim(),
                        footerNote: `${COMPANY_CONFIG.legalName} • Tél : ${COMPANY_CONFIG.contact.phoneDisplay} • ${COMPANY_CONFIG.contact.email}`,
                    }),
                    text: visitorText,
                }),
            ]);

            emailResults.forEach((res, idx) => {
                const target = idx === 0 ? "admin" : "visitor";
                if (res.status === "rejected") {
                    logger.error(`Contact ${target} email exception`, {
                        error:
                            res.reason instanceof Error
                                ? res.reason.message
                                : String(res.reason),
                    });
                } else if (res.value.error) {
                    logger.warn(`Contact ${target} email delivery failed`, {
                        error: res.value.error.message,
                        provider: res.value.provider,
                    });
                } else {
                    logger.info(`Contact ${target} email delivered`, {
                        provider: res.value.provider,
                        messageId: createdMessage.id,
                    });
                }
            });
        } else {
            logger.warn(
                "Contact message saved in DB but no email provider is configured (RESEND_KEY / GMAIL_APP_PASSWORD)."
            );
        }

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
        logger.error("sendContactMessageAction Error", error);
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
            take: 250,
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
        logger.error("getContactMessagesAction Error", error);
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
        logger.error("updateContactMessageStatusAction Error", error);
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
        logger.error("deleteContactMessageAction Error", error);
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
 * Server Action Admin : Mise à jour par lot (bulk) du statut de plusieurs messages
 */
export async function bulkUpdateContactMessagesStatusAction(
    ids: string[],
    status: ContactStatus
): Promise<{ data: { count: number } | null; error: string | null }> {
    try {
        await requireAdmin();

        if (!ids || ids.length === 0) {
            return { data: null, error: "Aucun message sélectionné." };
        }

        const result = await prisma.contactMessage.updateMany({
            where: { id: { in: ids } },
            data: { status },
        });

        revalidatePath("/admin/contacts");
        return { data: { count: result.count }, error: null };
    } catch (error: unknown) {
        logger.error("bulkUpdateContactMessagesStatusAction Error", error);
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Échec de la mise à jour groupée des statuts.",
        };
    }
}

/**
 * Server Action Admin : Suppression par lot (bulk) de plusieurs messages
 */
export async function bulkDeleteContactMessagesAction(
    ids: string[]
): Promise<{ data: { count: number } | null; error: string | null }> {
    try {
        await requireAdmin();

        if (!ids || ids.length === 0) {
            return { data: null, error: "Aucun message sélectionné." };
        }

        const result = await prisma.contactMessage.deleteMany({
            where: { id: { in: ids } },
        });

        revalidatePath("/admin/contacts");
        return { data: { count: result.count }, error: null };
    } catch (error: unknown) {
        logger.error("bulkDeleteContactMessagesAction Error", error);
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Échec de la suppression groupée des messages.",
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

        const trimmedSearch = search?.trim();
        const quotes = await prisma.quote.findMany({
            where: trimmedSearch
                ? {
                      OR: [
                          {
                              clientName: {
                                  contains: trimmedSearch,
                                  mode: "insensitive",
                              },
                          },
                          {
                              email: {
                                  contains: trimmedSearch,
                                  mode: "insensitive",
                              },
                          },
                          {
                              phone: {
                                  contains: trimmedSearch,
                                  mode: "insensitive",
                              },
                          },
                      ],
                  }
                : undefined,
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
            take: 500,
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
        logger.error("getClientsDirectoryAction Error", error);
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Impossible de récupérer le répertoire des clients.",
        };
    }
}
