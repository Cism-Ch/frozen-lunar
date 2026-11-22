import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

const rawRedisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim() || "";
const rawRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "";

export const hasValidUpstashRedisRestConfig =
    rawRedisUrl.startsWith("https://") && rawRedisToken.length > 0;

if (
    !hasValidUpstashRedisRestConfig &&
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "test"
) {
    logger.info(
        "ℹ️ Upstash Redis REST non configuré en local (repli mémoire actif)."
    );
}

// Placeholder sécurisé évitant un crash UrlError à l'import si une URL TCP rediss:// est renseignée par erreur
export const redis = new Redis({
    url: hasValidUpstashRedisRestConfig
        ? rawRedisUrl
        : "https://placeholder-disabled.upstash.io",
    token: hasValidUpstashRedisRestConfig
        ? rawRedisToken
        : "placeholder-disabled-token",
});
