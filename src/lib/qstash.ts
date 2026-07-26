import { Client } from "@upstash/qstash";

const qstashToken = process.env.QSTASH_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!qstashToken) {
    console.warn(
        "⚠️ Upstash QStash environment variable is missing (QSTASH_TOKEN). Workflow fallback mode enabled."
    );
}

export const qstash = qstashToken
    ? new Client({ token: qstashToken })
    : null;

export interface EmailWorkflowPayload {
    type: "admin_notification" | "client_confirmation";
    clientName: string;
    email: string;
    phone: string;
    pickup: string;
    dropoff: string;
    itemType: string;
    date: string;
    quoteId: string;
}

export interface PdfWorkflowPayload {
    id: string;
    clientName: string;
    items?: { description: string; quantity: number; price: number }[];
    total?: number;
    date?: string;
}

/**
 * Queue d'envoi d'emails asynchrones via Upstash QStash.
 */
export const emailQueue = {
    enqueue: async (payload: EmailWorkflowPayload) => {
        if (!qstash) {
            console.log("ℹ️ QStash non configuré. Envoi différé simulé en dev.");
            return { messageId: "dev-mock-id" };
        }

        try {
            return await qstash.publishJSON({
                url: `${appUrl}/api/workflow/email`,
                body: payload,
                retries: 3,
            });
        } catch (error: unknown) {
            console.error("❌ QStash Publish Email Error:", error);
            return null;
        }
    },
};

/**
 * Queue de génération et stockage de PDF asynchrones via Upstash QStash.
 */
export const pdfQueue = {
    enqueue: async (payload: PdfWorkflowPayload) => {
        if (!qstash) {
            console.log(
                "ℹ️ QStash non configuré. Génération PDF différée simulée en dev."
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
            console.error("❌ QStash Publish PDF Error:", error);
            return null;
        }
    },
};
