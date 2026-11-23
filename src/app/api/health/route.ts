import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { getSystemHealthReport, isRedisConfigured } from "@/lib/health-check";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_WINDOW_SECONDS = 60;

// Repli mémoire si Redis est indisponible pour protéger l'endpoint contre les abus
const memoryRateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0]?.trim() || "unknown";
    }
    return request.headers.get("x-real-ip")?.trim() || "unknown";
}

async function isRateLimited(ip: string): Promise<boolean> {
    const key = `ratelimit:health:${ip}`;

    if (isRedisConfigured()) {
        try {
            const count = await redis.incr(key);
            if (count === 1) {
                await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
            }
            return count > RATE_LIMIT_MAX_REQUESTS;
        } catch {
            // Repli mémoire si Redis ne répond pas
        }
    }

    const now = Date.now();
    const current = memoryRateLimit.get(key);
    if (!current || current.resetAt <= now) {
        memoryRateLimit.set(key, {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000,
        });
        return false;
    }

    current.count += 1;
    return current.count > RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Endpoint de supervision d'état des dépendances (`/api/health`).
 * - Strictement réservé aux administrateurs authentifiés (`role === "admin"`).
 * - Protégé par rate-limiting IP (30 req/min) et cache Redis 30s.
 * - N'expose aucun secret, clé API ou détail technique sensible.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Authentification requise." },
                { status: 401, headers: { "Cache-Control": "no-store" } }
            );
        }

        if (session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Accès réservé aux administrateurs." },
                { status: 403, headers: { "Cache-Control": "no-store" } }
            );
        }

        const ip = getClientIp(request);
        if (await isRateLimited(ip)) {
            return NextResponse.json(
                {
                    error: "Trop de requêtes de supervision. Veuillez réessayer dans une minute.",
                },
                {
                    status: 429,
                    headers: { "Cache-Control": "no-store" },
                }
            );
        }

        const bypassCache =
            request.nextUrl.searchParams.get("refresh") === "1";

        const report = await getSystemHealthReport({
            bypassCache,
            triggerAlerts: true,
        });

        const httpStatus = report.overallStatus === "outage" ? 503 : 200;

        return NextResponse.json(report, {
            status: httpStatus,
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        });
    } catch (error: unknown) {
        logger.error("GET /api/health failed", error);
        return NextResponse.json(
            {
                overallStatus: "outage",
                checkedAt: new Date().toISOString(),
                cached: false,
                error: "Erreur lors de la vérification des dépendances.",
            },
            {
                status: 503,
                headers: { "Cache-Control": "no-store" },
            }
        );
    }
}
