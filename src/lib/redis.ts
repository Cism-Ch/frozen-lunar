import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

export interface ResolvedUpstashConfig {
    url: string | null;
    token: string | null;
    isConfigured: boolean;
    normalizedFromTcp: boolean;
}

/**
 * Résout et normalise la configuration Upstash Redis REST.
 * Si une URL TCP (`rediss://default:<token>@<host>:6379`) a été fournie par erreur dans
 * `UPSTASH_REDIS_REST_URL`, elle est automatiquement convertie vers l'endpoint REST `https://<host>`.
 */
export function resolveUpstashRedisConfig(
    rawUrlInput = process.env.UPSTASH_REDIS_REST_URL,
    rawTokenInput = process.env.UPSTASH_REDIS_REST_TOKEN
): ResolvedUpstashConfig {
    const rawUrl = (rawUrlInput || "").trim();
    const rawToken = (rawTokenInput || "").trim();

    if (!rawUrl) {
        return {
            url: null,
            token: null,
            isConfigured: false,
            normalizedFromTcp: false,
        };
    }

    if (rawUrl.startsWith("https://")) {
        const isConfigured = rawToken.length > 0;
        return {
            url: rawUrl,
            token: rawToken || null,
            isConfigured,
            normalizedFromTcp: false,
        };
    }

    if (rawUrl.startsWith("rediss://") || rawUrl.startsWith("redis://")) {
        try {
            const parsed = new URL(rawUrl);
            const restUrl = `https://${parsed.hostname}`;
            const token = rawToken || decodeURIComponent(parsed.password || "");
            return {
                url: restUrl,
                token: token || null,
                isConfigured: Boolean(parsed.hostname && token),
                normalizedFromTcp: true,
            };
        } catch {
            return {
                url: null,
                token: null,
                isConfigured: false,
                normalizedFromTcp: false,
            };
        }
    }

    return {
        url: null,
        token: null,
        isConfigured: false,
        normalizedFromTcp: false,
    };
}

const resolvedConfig = resolveUpstashRedisConfig();

export const hasValidUpstashRedisRestConfig = resolvedConfig.isConfigured;

if (
    !hasValidUpstashRedisRestConfig &&
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "test"
) {
    logger.info(
        "ℹ️ Upstash Redis REST non configuré en local (repli mémoire actif)."
    );
}

export const redis = new Redis({
    url: resolvedConfig.url || "https://placeholder-disabled.upstash.io",
    token: resolvedConfig.token || "placeholder-disabled-token",
});
