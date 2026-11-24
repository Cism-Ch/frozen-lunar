import { headers } from "next/headers";
import { redis, resolveUpstashRedisConfig } from "@/lib/redis";
import { logger } from "@/lib/logger";

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
}

/**
 * Extrait l'adresse IP client depuis les en-têtes proxy (Vercel / Reverse Proxy).
 */
export async function getClientIpAddress(): Promise<string> {
    try {
        const hdrs = await headers();
        const forwarded = hdrs.get("x-forwarded-for");
        if (forwarded) {
            return forwarded.split(",")[0]?.trim() || "unknown";
        }
        return hdrs.get("x-real-ip")?.trim() || "unknown";
    } catch {
        return "unknown";
    }
}

/**
 * Limiteur de débit léger basé sur Upstash Redis (fail-open en dev si Redis n'est pas configuré).
 */
export async function checkRateLimit(options: {
    scope: string;
    identifier?: string;
    limit: number;
    windowSeconds: number;
}): Promise<RateLimitResult> {
    const config = resolveUpstashRedisConfig();
    if (!config.isConfigured) {
        return {
            allowed: true,
            remaining: options.limit,
            retryAfterSeconds: 0,
        };
    }

    const id = options.identifier || (await getClientIpAddress());
    const key = `rl:${options.scope}:${id}`;

    try {
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, options.windowSeconds);
        }

        if (count > options.limit) {
            return {
                allowed: false,
                remaining: 0,
                retryAfterSeconds: options.windowSeconds,
            };
        }

        return {
            allowed: true,
            remaining: Math.max(0, options.limit - count),
            retryAfterSeconds: 0,
        };
    } catch (error: unknown) {
        logger.warn("Rate-limit Redis indisponible (fail-open)", {
            scope: options.scope,
            error: error instanceof Error ? error.message : String(error),
        });
        return {
            allowed: true,
            remaining: options.limit,
            retryAfterSeconds: 0,
        };
    }
}
