import crypto from "crypto";

const SAFE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Génère un code de suivi métier lisible et non ambigu au format `HBC-YYYY-XXXX`
 * (ex: `HBC-2026-4K8M`), en évitant les caractères ambigus (0/O, 1/I/L).
 */
export function generateTrackingCode(date = new Date()): string {
    const year = date.getFullYear();
    let suffix = "";
    for (let i = 0; i < 4; i++) {
        suffix += SAFE_ALPHABET[crypto.randomInt(0, SAFE_ALPHABET.length)];
    }
    return `HBC-${year}-${suffix}`;
}

/**
 * Retourne le code de suivi lisible d'un devis (`HBC-2026-XXXX`) avec repli propre
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
