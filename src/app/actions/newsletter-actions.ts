"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NewsletterStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { COMPANY_CONFIG } from "@/lib/company-config";
import {
    EMAIL_SENDER,
    isAnyEmailProviderConfigured,
    sendTransactionalEmail,
} from "@/lib/email";
import { logger } from "@/lib/logger";

const subscribeSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Veuillez saisir une adresse email valide.")
        .max(180, "Adresse email trop longue."),
    source: z.string().trim().max(40).optional(),
});

const campaignSchema = z.object({
    subject: z
        .string()
        .trim()
        .min(4, "L'objet doit contenir au moins 4 caractères.")
        .max(160, "L'objet ne peut pas dépasser 160 caractères."),
    body: z
        .string()
        .trim()
        .min(20, "Le contenu de la newsletter est trop court.")
        .max(8000, "Le contenu ne peut pas dépasser 8000 caractères."),
});

const subscriberIdSchema = z
    .string()
    .trim()
    .min(1, "Identifiant abonné requis.")
    .max(100);

export interface NewsletterSubscriberDTO {
    id: string;
    email: string;
    status: "ACTIVE" | "UNSUBSCRIBED";
    source: string;
    subscribedAt: string;
    unsubscribedAt: string | null;
}

function escapeHtml(raw: string): string {
    return raw
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function sanitizeHeader(raw: string): string {
    return raw.replace(/[\r\n]+/g, " ").trim();
}

function resolveAppBaseUrl(): string {
    const raw =
        process.env.NEXT_PUBLIC_APP_URL?.trim() ||
        process.env.BETTER_AUTH_URL?.trim() ||
        "https://hbc-logistique.com";
    return raw.replace(/\/+$/, "");
}

function buildNewsletterHtml(params: {
    heading: string;
    paragraphs: string[];
    unsubscribeUrl: string;
}): string {
    const safeHeading = escapeHtml(params.heading);
    const bodyHtml = params.paragraphs
        .map(
            (p) =>
                `<p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:#334155;">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`
        )
        .join("");

    return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:24px;background:#F2F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F172A;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;">
    <div style="background:#001F3D;padding:24px 28px;border-bottom:4px solid #FF7C24;">
      <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#92A9BE;font-weight:700;">${escapeHtml(COMPANY_CONFIG.shortName)} • NEWSLETTER</div>
      <h1 style="margin:8px 0 0;font-size:20px;line-height:1.3;color:#FFFFFF;">${safeHeading}</h1>
    </div>
    <div style="padding:26px 28px;">
      ${bodyHtml}
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:12px;line-height:1.6;color:#64748B;">
        <div>${escapeHtml(COMPANY_CONFIG.legalName)} — ${escapeHtml(COMPANY_CONFIG.address.city)}, ${escapeHtml(COMPANY_CONFIG.address.country)}</div>
        <div style="margin-top:6px;">
          Vous ne souhaitez plus recevoir nos actualités ?
          <a href="${escapeHtml(params.unsubscribeUrl)}" style="color:#FF7C24;text-decoration:underline;">Se désinscrire en 1 clic</a>.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Inscrit un visiteur à la newsletter HBC Logistique (validé Zod, rate-limité, idempotent,
 * avec email de bienvenue et lien de désinscription en 1 clic).
 */
export async function subscribeNewsletterAction(input: {
    email: string;
    source?: string;
}): Promise<{
    data: {
        subscribed: boolean;
        alreadySubscribed: boolean;
        message: string;
    } | null;
    error: string | null;
}> {
    try {
        const rl = await checkRateLimit({
            scope: "newsletter-subscribe",
            limit: 6,
            windowSeconds: 600,
        });
        if (!rl.allowed) {
            return {
                data: null,
                error: "Trop de tentatives récentes. Veuillez patienter quelques minutes.",
            };
        }

        const parsed = subscribeSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Veuillez saisir une adresse email valide.",
            };
        }

        const email = parsed.data.email.toLowerCase();
        const source = parsed.data.source || "footer";

        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (existing && existing.status === NewsletterStatus.ACTIVE) {
            return {
                data: {
                    subscribed: true,
                    alreadySubscribed: true,
                    message:
                        "Vous êtes déjà inscrit(e) à la newsletter HBC Logistique.",
                },
                error: null,
            };
        }

        const token = crypto.randomBytes(24).toString("hex");
        const subscriber = existing
            ? await prisma.newsletterSubscriber.update({
                  where: { id: existing.id },
                  data: {
                      status: NewsletterStatus.ACTIVE,
                      unsubscribeToken: token,
                      unsubscribedAt: null,
                      subscribedAt: new Date(),
                      source,
                  },
              })
            : await prisma.newsletterSubscriber.create({
                  data: {
                      email,
                      source,
                      status: NewsletterStatus.ACTIVE,
                      unsubscribeToken: token,
                  },
              });

        // Email de bienvenue (cascade Resend -> Gmail SMTP)
        if (isAnyEmailProviderConfigured()) {
            const unsubscribeUrl = `${resolveAppBaseUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;
            const welcomeParagraphs = [
                "Bienvenue dans la communauté HBC Logistique !",
                "Vous recevrez en avant-première nos disponibilités de flotte (porte-chars, porte-conteneurs, camions bennes), nos offres sur les corridors ivoiriens et nos actualités transport.",
                `Besoin d'un transport dès maintenant ? Demandez un devis en ligne ou appelez-nous au ${COMPANY_CONFIG.contact.phoneDisplay}.`,
            ];

            const sendRes = await sendTransactionalEmail({
                from: EMAIL_SENDER,
                to: [email],
                subject: `Bienvenue dans la newsletter — ${COMPANY_CONFIG.shortName}`,
                html: buildNewsletterHtml({
                    heading: "Inscription confirmée à notre newsletter",
                    paragraphs: welcomeParagraphs,
                    unsubscribeUrl,
                }),
                text: `${welcomeParagraphs.join("\n\n")}\n\nSe désinscrire : ${unsubscribeUrl}`,
            });

            if (sendRes.error) {
                logger.warn("Newsletter welcome email warning", {
                    email,
                    error: sendRes.error.message,
                });
            }
        }

        revalidatePath("/admin/contacts");

        return {
            data: {
                subscribed: true,
                alreadySubscribed: false,
                message:
                    "Merci ! Votre inscription à la newsletter HBC Logistique est confirmée.",
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("subscribeNewsletterAction error", error);
        return {
            data: null,
            error: "Impossible de finaliser votre inscription pour le moment.",
        };
    }
}

/**
 * Liste les abonnés newsletter pour la console admin (`/admin/contacts`).
 */
export async function getNewsletterSubscribersAction(): Promise<{
    data: NewsletterSubscriberDTO[] | null;
    error: string | null;
}> {
    try {
        await requireAdmin();

        const rows = await prisma.newsletterSubscriber.findMany({
            orderBy: { subscribedAt: "desc" },
            take: 500,
        });

        return {
            data: rows.map((r) => ({
                id: r.id,
                email: r.email,
                status:
                    r.status === NewsletterStatus.UNSUBSCRIBED
                        ? "UNSUBSCRIBED"
                        : "ACTIVE",
                source: r.source,
                subscribedAt: r.subscribedAt.toISOString(),
                unsubscribedAt: r.unsubscribedAt
                    ? r.unsubscribedAt.toISOString()
                    : null,
            })),
            error: null,
        };
    } catch (error: unknown) {
        logger.error("getNewsletterSubscribersAction error", error);
        return {
            data: null,
            error: "Impossible de charger la liste des abonnés newsletter.",
        };
    }
}

/**
 * Supprime un abonné de la base newsletter (Admin uniquement).
 */
export async function deleteNewsletterSubscriberAction(
    id: string
): Promise<{ data: { deleted: boolean } | null; error: string | null }> {
    try {
        await requireAdmin();
        const parsedId = subscriberIdSchema.safeParse(id);
        if (!parsedId.success) {
            return { data: null, error: "Identifiant abonné invalide." };
        }

        await prisma.newsletterSubscriber.delete({
            where: { id: parsedId.data },
        });
        revalidatePath("/admin/contacts");
        return { data: { deleted: true }, error: null };
    } catch (error: unknown) {
        logger.error("deleteNewsletterSubscriberAction error", error);
        return {
            data: null,
            error: "Impossible de supprimer cet abonné.",
        };
    }
}

/**
 * Envoie une campagne newsletter à tous les abonnés `ACTIVE` (Admin uniquement).
 */
export async function sendNewsletterCampaignAction(input: {
    subject: string;
    body: string;
}): Promise<{
    data: { sentCount: number; failedCount: number; totalActive: number } | null;
    error: string | null;
}> {
    try {
        const admin = await requireAdmin();

        const rl = await checkRateLimit({
            scope: `newsletter-campaign:${admin.id}`,
            limit: 5,
            windowSeconds: 3600,
        });
        if (!rl.allowed) {
            return {
                data: null,
                error: "Limite d'envois de campagnes atteinte pour cette heure.",
            };
        }

        const parsed = campaignSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Objet ou contenu de campagne invalide.",
            };
        }

        if (!isAnyEmailProviderConfigured()) {
            return {
                data: null,
                error: "Aucun fournisseur email (Resend ou Gmail SMTP) n'est configuré.",
            };
        }

        const activeSubscribers = await prisma.newsletterSubscriber.findMany({
            where: { status: NewsletterStatus.ACTIVE },
            orderBy: { subscribedAt: "desc" },
            take: 500,
        });

        if (activeSubscribers.length === 0) {
            return {
                data: null,
                error: "Aucun abonné actif à qui envoyer cette campagne.",
            };
        }

        const safeSubject = sanitizeHeader(parsed.data.subject);
        const paragraphs = parsed.data.body
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean);
        const baseUrl = resolveAppBaseUrl();

        let sentCount = 0;
        let failedCount = 0;

        // Envoi par petits lots de 5 pour respecter les quotas Resend / Gmail SMTP
        const BATCH_SIZE = 5;
        for (let i = 0; i < activeSubscribers.length; i += BATCH_SIZE) {
            const batch = activeSubscribers.slice(i, i + BATCH_SIZE);
            const results = await Promise.allSettled(
                batch.map((sub) => {
                    const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(sub.unsubscribeToken)}`;
                    return sendTransactionalEmail({
                        from: EMAIL_SENDER,
                        to: [sub.email],
                        subject: safeSubject,
                        html: buildNewsletterHtml({
                            heading: safeSubject,
                            paragraphs,
                            unsubscribeUrl,
                        }),
                        text: `${parsed.data.body}\n\nSe désinscrire : ${unsubscribeUrl}`,
                    });
                })
            );

            for (const res of results) {
                if (res.status === "fulfilled" && !res.value.error) {
                    sentCount += 1;
                } else {
                    failedCount += 1;
                }
            }
        }

        logger.info("Newsletter campaign completed", {
            admin: admin.email,
            sentCount,
            failedCount,
            totalActive: activeSubscribers.length,
        });

        return {
            data: {
                sentCount,
                failedCount,
                totalActive: activeSubscribers.length,
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("sendNewsletterCampaignAction error", error);
        return {
            data: null,
            error: "Erreur lors de l'envoi de la campagne newsletter.",
        };
    }
}
