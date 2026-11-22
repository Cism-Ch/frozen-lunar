import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { COMPANY_CONFIG } from "@/lib/company-config";

const rawApiKey = process.env.RESEND_KEY || process.env.AUTH_RESEND_KEY || "";
const trimmedApiKey = rawApiKey.trim();

/**
 * Indique si une clé API Resend opérationnelle (non factice) est configurée.
 */
export function isResendConfigured(): boolean {
    if (!trimmedApiKey) return false;
    const lower = trimmedApiKey.toLowerCase();
    return (
        !lower.includes("placeholder") &&
        !lower.includes("your_") &&
        !lower.includes("your-") &&
        trimmedApiKey.length >= 10
    );
}

if (!isResendConfigured()) {
    if (process.env.NODE_ENV === "production") {
        logger.error(
            "❌ [CONFIGURATION SÉCURITÉ] RESEND_KEY est manquante ou invalide en production. Les envois d'emails transactionnels échoueront."
        );
    } else {
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
