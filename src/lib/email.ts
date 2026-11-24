import { Resend } from "resend";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { logger } from "@/lib/logger";
import { COMPANY_CONFIG } from "@/lib/company-config";

const rawApiKey = process.env.RESEND_KEY || process.env.AUTH_RESEND_KEY || "";
const trimmedApiKey = rawApiKey.trim();

/**
 * Indique si une clé API Resend opérationnelle (non factice) est configurée.
 */
export function isResendConfigured(): boolean {
    const key = (
        process.env.RESEND_KEY ||
        process.env.AUTH_RESEND_KEY ||
        ""
    ).trim();
    if (!key) return false;
    const lower = key.toLowerCase();
    return (
        !lower.includes("placeholder") &&
        !lower.includes("your_") &&
        !lower.includes("your-") &&
        key.length >= 10
    );
}

/**
 * Indique si le fallback Gmail SMTP (nodemailer + App Password Google) est configuré.
 */
export function isGmailFallbackConfigured(): boolean {
    const user = (process.env.GMAIL_USER || "").trim();
    const pass = (process.env.GMAIL_APP_PASSWORD || "").trim();
    if (!user || !pass) return false;
    const lowerUser = user.toLowerCase();
    const lowerPass = pass.toLowerCase();
    return (
        user.includes("@") &&
        pass.replace(/\s+/g, "").length >= 12 &&
        !lowerUser.includes("placeholder") &&
        !lowerUser.includes("your_") &&
        !lowerPass.includes("placeholder") &&
        !lowerPass.includes("your_")
    );
}

/**
 * Indique si au moins un canal d'envoi (Resend ou Gmail SMTP) est opérationnel.
 */
export function isAnyEmailProviderConfigured(): boolean {
    return isResendConfigured() || isGmailFallbackConfigured();
}

if (!isResendConfigured()) {
    if (process.env.NODE_ENV === "production" && !isGmailFallbackConfigured()) {
        logger.error(
            "❌ [CONFIGURATION SÉCURITÉ] RESEND_KEY et GMAIL_APP_PASSWORD sont manquants en production. Les envois d'emails transactionnels échoueront."
        );
    } else if (!isGmailFallbackConfigured()) {
        logger.warn("⚠️ [DEV] RESEND_KEY est absente en environnement local.");
    }
}

// Placeholder sécurisé évitant le crash à l'import Next.js lors du build
export const resend = new Resend(
    isResendConfigured() ? trimmedApiKey : "re_placeholder_missing_key"
);

/**
 * Expéditeur configurable via EMAIL_FROM (doit correspondre à un domaine vérifié dans Resend).
 */
export const EMAIL_SENDER =
    process.env.EMAIL_FROM?.trim() ||
    (process.env.NODE_ENV === "production"
        ? COMPANY_CONFIG.contact.email
        : "onboarding@resend.dev");

function formatSenderAddress(sender: string): string {
    const trimmed = sender.trim();
    if (trimmed.includes("<") && trimmed.includes(">")) {
        return trimmed;
    }
    return `HBC Logistique <${trimmed}>`;
}

export interface SendTransactionalEmailOptions {
    to: string | string[];
    subject: string;
    react?: ReactElement;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
}

export interface SendTransactionalEmailResult {
    data: { id?: string } | null;
    error: { message: string } | null;
    provider: "resend" | "gmail_smtp" | "none";
}

/**
 * Envoi transactionnel résilient en cascade :
 * 1) Resend (prioritaire — utilisé dès que le domaine personnalisé est vérifié ou vers votre propre email en mode test)
 * 2) Fallback Gmail SMTP (nodemailer + Mot de passe d'application) si Resend refuse (ex: restriction onboarding@resend.dev) ou est absent.
 */
export async function sendTransactionalEmail(
    options: SendTransactionalEmailOptions
): Promise<SendTransactionalEmailResult> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const sender = formatSenderAddress(options.from || EMAIL_SENDER);
    let resendErrorMessage: string | null = null;

    // Niveau 1 : Resend (prioritaire)
    if (isResendConfigured()) {
        try {
            const payload = options.react
                ? {
                      from: sender,
                      to: recipients,
                      subject: options.subject,
                      react: options.react,
                      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
                  }
                : {
                      from: sender,
                      to: recipients,
                      subject: options.subject,
                      html: options.html || options.text || "",
                      ...(options.text ? { text: options.text } : {}),
                      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
                  };

            const { data, error } = await resend.emails.send(payload);
            if (!error && data) {
                return {
                    data: { id: data.id },
                    error: null,
                    provider: "resend",
                };
            }
            resendErrorMessage = error?.message || "Resend delivery failed";
            logger.warn(
                "Resend a refusé l'envoi — tentative de basculement vers Gmail SMTP",
                {
                    resendError: resendErrorMessage,
                    recipients,
                }
            );
        } catch (err: unknown) {
            resendErrorMessage =
                err instanceof Error ? err.message : String(err);
            logger.warn(
                "Exception Resend — tentative de basculement vers Gmail SMTP",
                { error: resendErrorMessage }
            );
        }
    }

    // Niveau 2 : Fallback Gmail SMTP (nodemailer)
    if (isGmailFallbackConfigured()) {
        try {
            const gmailUser = (process.env.GMAIL_USER || "").trim();
            const gmailPass = (process.env.GMAIL_APP_PASSWORD || "")
                .replace(/\s+/g, "")
                .trim();

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: gmailUser,
                    pass: gmailPass,
                },
            });

            const htmlBody = options.html
                ? options.html
                : options.react
                  ? await render(options.react)
                  : undefined;

            const textBody =
                options.text ||
                (options.react
                    ? await render(options.react, { plainText: true })
                    : undefined);

            const info = await transporter.sendMail({
                from: `HBC Logistique <${gmailUser}>`,
                to: recipients.join(", "),
                subject: options.subject,
                html: htmlBody,
                text: textBody,
                ...(options.replyTo ? { replyTo: options.replyTo } : {}),
            });

            logger.info("📧 Email envoyé via Fallback Gmail SMTP", {
                messageId: info.messageId,
                recipients,
            });

            return {
                data: { id: info.messageId },
                error: null,
                provider: "gmail_smtp",
            };
        } catch (smtpErr: unknown) {
            const smtpMsg =
                smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
            logger.error("❌ Échec du fallback Gmail SMTP", {
                error: smtpMsg,
                resendError: resendErrorMessage,
            });
            return {
                data: null,
                error: {
                    message: resendErrorMessage
                        ? `Resend (${resendErrorMessage}) & Gmail SMTP (${smtpMsg})`
                        : `Gmail SMTP : ${smtpMsg}`,
                },
                provider: "none",
            };
        }
    }

    return {
        data: null,
        error: {
            message:
                resendErrorMessage ||
                "Aucun fournisseur email configuré (RESEND_KEY ou GMAIL_USER + GMAIL_APP_PASSWORD).",
        },
        provider: "none",
    };
}
