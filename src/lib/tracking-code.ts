import crypto from "crypto";

const SAFE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

/**
 * Génère un code de suivi métier horodaté, lisible et non ambigu au format
 * `HBC-YYYY-HHMMSS-XXXXXX` (heure UTC / Côte d'Ivoire GMT+0 + 6 caractères
 * alphanumériques sans 0/O/1/I/L — ex: `HBC-2026-143025-4K8M2P`).
 */
export function generateTrackingCode(date = new Date()): string {
    const year = date.getUTCFullYear();
    const hms = `${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}`;
    let suffix = "";
    for (let i = 0; i < 6; i++) {
        suffix += SAFE_ALPHABET[crypto.randomInt(0, SAFE_ALPHABET.length)];
    }
    return `HBC-${year}-${hms}-${suffix}`;
}

/**
 * Retourne le code de suivi lisible d'un devis (`HBC-YYYY-HHMMSS-XXXXXX`) avec repli propre
 * pour les anciens dossiers créés avant l'introduction du champ `trackingCode`.
 */
export function formatQuoteReference(quote: {
    id: string;
    trackingCode?: string | null;
}): string {
    if (quote.trackingCode?.trim()) {
        return quote.trackingCode.trim();
    }
    return `HBC-${quote.id.slice(-6).toUpperCase()}`;
}
