import { Client } from "@upstash/qstash";

if (!process.env.QSTASH_TOKEN) {
    console.warn("⚠️ Upstash QStash environment variable is missing.");
}

export const qstash = new Client({
    token: process.env.QSTASH_TOKEN!,
});

/**
 * Client spécifique pour la queue d'envoi d'emails.
 * Permet d'envoyer des messages asynchrones à l'endpoint /api/workflow/email
 */
export const emailQueue = {
    enqueue: async (payload: unknown) => {
        return await qstash.publishJSON({
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/email`,
            body: payload,
        });
    }
};
