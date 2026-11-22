"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import {
    getSystemHealthReport,
    HealthReport,
    isRedisConfigured,
} from "@/lib/health-check";
import { EMAIL_SENDER, isResendConfigured, resend } from "@/lib/email";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { AdminAlertEmail } from "@/components/emails/AdminAlertEmail";
import { logger } from "@/lib/logger";

const testAlertSchema = z.object({
    recipientEmail: z
        .string()
        .trim()
        .email("Adresse email destinataire invalide")
        .optional()
        .or(z.literal("")),
});

export interface AdminHealthSnapshot {
    report: HealthReport;
    diagnostics: {
        resendConfigured: boolean;
        emailSender: string;
        defaultAlertRecipient: string;
        redisConfigured: boolean;
        environment: string;
    };
}

/**
 * Récupère l'état complet des dépendances pour le panneau d'administration (avec option de forçage hors cache).
 */
export async function getAdminHealthReportAction(
    bypassCache = false
): Promise<{ data: AdminHealthSnapshot | null; error: string | null }> {
    try {
        await requireAdmin();

        const report = await getSystemHealthReport({
            bypassCache,
            triggerAlerts: true,
        });

        return {
            data: {
                report,
                diagnostics: {
                    resendConfigured: isResendConfigured(),
                    emailSender: EMAIL_SENDER,
                    defaultAlertRecipient:
                        process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
                        COMPANY_CONFIG.contact.email,
                    redisConfigured: isRedisConfigured(),
                    environment: process.env.NODE_ENV || "development",
                },
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("getAdminHealthReportAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de charger le rapport de supervision.",
        };
    }
}

/**
 * Envoie un email d'alerte de test via Resend pour vérifier la délivrabilité depuis l'interface admin.
 */
export async function sendTestAlertEmailAction(input?: {
    recipientEmail?: string;
}): Promise<{
    data: {
        id: string;
        recipient: string;
        sender: string;
        sentAt: string;
    } | null;
    error: string | null;
}> {
    try {
        const admin = await requireAdmin();

        const parsed = testAlertSchema.safeParse(input ?? {});
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Adresse email destinataire invalide.",
            };
        }

        if (!isResendConfigured()) {
            return {
                data: null,
                error: "Resend n'est pas configuré : vérifiez la variable d'environnement RESEND_KEY.",
            };
        }

        const recipient =
            parsed.data.recipientEmail ||
            process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
            admin.email ||
            COMPANY_CONFIG.contact.email;

        const sentAt = new Date().toISOString();

        const { data, error } = await resend.emails.send({
            from: EMAIL_SENDER,
            to: [recipient],
            subject: `[TEST SUPERVISION] Vérification Resend — ${COMPANY_CONFIG.shortName}`,
            react: AdminAlertEmail({
                title: "Test de délivrabilité des alertes Resend",
                severity: "info",
                source: `Console Admin (/admin/status) par ${admin.email}`,
                summary:
                    "Cet email confirme que le service Resend est correctement configuré et capable d'expédier les alertes d'indisponibilité de la plateforme.",
                details: `Expéditeur : ${EMAIL_SENDER} | Destinataire : ${recipient}`,
                timestamp: sentAt,
            }),
        });

        if (error) {
            logger.error("sendTestAlertEmailAction Resend error", error);
            return {
                data: null,
                error: `Resend a refusé l'envoi : ${error.message}`,
            };
        }

        return {
            data: {
                id: data?.id || "sent",
                recipient,
                sender: EMAIL_SENDER,
                sentAt,
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("sendTestAlertEmailAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Erreur lors de l'envoi de l'email de test.",
        };
    }
}
