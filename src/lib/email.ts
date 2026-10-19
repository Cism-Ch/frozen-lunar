import { Resend } from "resend";

// Use the correct environment variable name
const apiKey = process.env.RESEND_KEY || process.env.AUTH_RESEND_KEY;

if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
        console.error(
            "❌ [CONFIGURATION SÉCURITÉ] RESEND_KEY est manquante en production. Les envois de mails transactionnels échoueront."
        );
    } else {
        console.warn("⚠️ [DEV] RESEND_KEY est absente en environnement local.");
    }
}

// Placeholder sécurisé évitant le crash à l'import Next.js lors du build
export const resend = new Resend(apiKey || "re_placeholder_missing_key");

export const EMAIL_SENDER =
    process.env.NODE_ENV === "production"
        ? "contact@hbc-logistique.fr"
        : "onboarding@resend.dev";
