const ALLOWED_ATTACHMENT_PREFIXES = [
    "attachments/",
    "quotes-uploads/",
    "quotes/",
    "partners-kyc/",
];

/**
 * Extrait une clé S3 autorisée depuis une clé brute, un chemin proxy `/api/attachments/...`
 * ou une URL S3/Tigris complète, et retourne l'URL proxy authentifiée.
 */
export function resolveAttachmentProxyUrl(
    rawValue: string,
    download = false
): string | null {
    const trimmed = rawValue.trim();
    if (!trimmed || trimmed.includes("..") || trimmed.includes("\\")) {
        return null;
    }

    let key = trimmed;

    if (key.startsWith("/api/attachments/")) {
        key = key.slice("/api/attachments/".length).split("?")[0];
    } else if (key.startsWith("http://") || key.startsWith("https://")) {
        try {
            const parsed = new URL(key);
            const cleanPath = decodeURIComponent(
                parsed.pathname.replace(/^\/+/, "")
            );
            const matchedPrefix = ALLOWED_ATTACHMENT_PREFIXES.find((prefix) =>
                cleanPath.includes(prefix)
            );
            if (!matchedPrefix) return null;
            key = cleanPath.slice(cleanPath.indexOf(matchedPrefix));
        } catch {
            return null;
        }
    } else {
        key = key.replace(/^\/+/, "");
    }

    if (
        key.includes("..") ||
        key.includes("\\") ||
        !ALLOWED_ATTACHMENT_PREFIXES.some((prefix) => key.startsWith(prefix))
    ) {
        return null;
    }

    const encodedPath = key
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

    return `/api/attachments/${encodedPath}${download ? "?download=1" : ""}`;
}
