import { Resend } from "resend";

// Fallback to other common variable names if RESEND_API_KEY is missing
const apiKey = process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY;

if (!apiKey) {
    console.warn("⚠️ Resend environment variable is missing (RESEND_API_KEY).");
}

export const resend = new Resend(apiKey || "re_123456789"); // Default to dummy key to prevent crash if missing

export const EMAIL_SENDER = process.env.NODE_ENV === "production"
    ? "contact@hbc-logistique.fr"
    : "onboarding@resend.dev";
