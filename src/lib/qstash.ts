import { Client } from "@upstash/qstash";
import { logger } from "@/lib/logger";

const qstashToken = process.env.QSTASH_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function isLoopbackUrl(url: string): boolean {
    return (
        url.includes("://localhost") ||
        url.includes("://127.0.0.1") ||
        url.includes("://[::1]")
    );
}

if (!qstashToken) {
    logger.warn(
        "⚠️ Upstash QStash environment variable is missing (QSTASH_TOKEN). Workflow fallback mode enabled."
    );
}

export const qstash = qstashToken ? new Client({ token: qstashToken }) : null;

export type QuoteEmailWorkflowPayload = {
    type: "admin_notification" | "client_confirmation";
    clientName: string;
    email: string;
    phone: string;
    pickup: string;
    dropoff: string;
    itemType: string;
    date: string;
    quoteId: string;
};

export type AdminAlertEmailPayload = {
    type: "admin_alert";
    title: string;
    severity: "info" | "warning" | "critical";
    source: string;
    summary: string;
    details?: string;
    timestamp?: string;
    recipientEmail?: string;
};

export type QuoteStatusEmailPayload = {
    type: "quote_status_update";
    clientName: string;
    email: string;
    quoteId: string;
    status: "VALIDATED" | "REJECTED";
    amount?: string;
    pickup: string;
    dropoff: string;
    note?: string;
};

export type EmailWorkflowPayload =
    | QuoteEmailWorkflowPayload
    | AdminAlertEmailPayload
    | QuoteStatusEmailPayload;

export interface PdfWorkflowPayload {
    id: string;
    clientName: string;
    items?: { description: string; quantity: number; price: number }[];
    total?: number;
    date?: string;
}

/**
 * Queue d'envoi d'emails asynchrones via Upstash QStash.
 * En environnement local (loopback), évite l'erreur QStash et journalise proprement.
 */
export const emailQueue = {
    enqueue: async (payload: EmailWorkflowPayload) => {
        if (!qstash || isLoopbackUrl(appUrl)) {
            logger.info(
                "ℹ️ QStash ignoré (clé absente ou URL locale loopback). Email différé non envoyé en local.",
                { type: payload.type }
            );
            return { messageId: "dev-mock-id" };
        }

        try {
            return await qstash.publishJSON({
                url: `${appUrl}/api/workflow/email`,
                body: payload,
                retries: 3,
            });
        } catch (error: unknown) {
            logger.error("❌ QStash Publish Email Error", error);
            return null;
        }
    },
};

/**
 * Queue de génération et stockage de PDF asynchrones via Upstash QStash.
 */
export const pdfQueue = {
    enqueue: async (payload: PdfWorkflowPayload) => {
        if (!qstash || isLoopbackUrl(appUrl)) {
            logger.info(
                "ℹ️ QStash ignoré (clé absente ou URL locale loopback). Génération PDF différée ignorée en local.",
                { id: payload.id }
            );
            return { messageId: "dev-mock-id" };
        }

        try {
            return await qstash.publishJSON({
                url: `${appUrl}/api/workflow/pdf`,
                body: payload,
                retries: 3,
            });
        } catch (error: unknown) {
            logger.error("❌ QStash Publish PDF Error", error);
            return null;
        }
    },
};
