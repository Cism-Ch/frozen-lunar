import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Middleware Next.js pour la protection des routes et le rate limiting
 *
 * Fonctionnalités:
 * 1. Protection des routes /admin/* (sauf login et init)
 * 2. Rate limiting sur les routes /api/* (20 requêtes / 10 secondes)
 * 3. Exclusion des fichiers statiques et images
 *
 * Le middleware s'exécute en Edge Runtime pour de meilleures performances
 */

// Configuration du rate limiting (Configurable via variables d'environnement)
const RATE_LIMIT_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 20;
const RATE_LIMIT_WINDOW_SECONDS =
    Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 10;
const RATE_LIMIT_WINDOW = `${RATE_LIMIT_WINDOW_SECONDS} s` as const;

const isRedisConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Initialisation du Redis pour le Rate Limiting (Edge compatible)
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Configuration du Rate Limiter global : configurable par IP (défaut : 20 requêtes / 10s)
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(
        RATE_LIMIT_REQUESTS,
        `${RATE_LIMIT_WINDOW_SECONDS} s`
    ),
    analytics: true,
    prefix: "@upstash/ratelimit",
});

// Limiteur strict anti-brute force pour l'authentification (5 requêtes / 60s)
const authRatelimit = isRedisConfigured
    ? new Ratelimit({
          redis: redis,
          limiter: Ratelimit.slidingWindow(5, "60 s"),
          analytics: true,
          prefix: "@upstash/ratelimit_auth",
      })
    : null;

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Ignorer les fichiers statiques, images, etc. pour améliorer les performances
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)
    ) {
        return NextResponse.next();
    }

    // =========================================================================
    // PROTECTION DES ROUTES ADMIN
    // =========================================================================
    if (pathname.startsWith("/admin")) {
        // Permettre l'accès aux routes de login et d'initialisation
        // Ces routes sont nécessaires pour la configuration initiale et l'authentification
        if (pathname === "/admin/login" || pathname === "/admin/init") {
            return NextResponse.next();
        }

        // Vérifier la présence du cookie de session Better Auth
        // Le token est créé lors de la connexion et vérifié ici
        const sessionToken = request.cookies.get(
            "better-auth.session_token"
        )?.value;

        if (!sessionToken) {
            // Pas de session : rediriger vers la page de login
            // Le callbackUrl permet de revenir à la page demandée après connexion
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Session présente : la validation complète du rôle sera faite côté serveur
        // dans les pages protégées pour éviter les contournements
        return NextResponse.next();
    }

    // =========================================================================
    // RATE LIMITING SUR LES ROUTES API, AUTH & SERVER ACTIONS
    // =========================================================================
    const isServerAction =
        request.method === "POST" && request.headers.has("next-action");
    const isApiRoute = pathname.startsWith("/api");

    if (isApiRoute || isServerAction) {
        // En local sans configuration Redis, laisser passer les requêtes
        if (!isRedisConfigured) {
            return NextResponse.next();
        }

        // Extraction sécurisée de l'adresse IP du client
        const rawIp = request.headers.get("x-forwarded-for");
        const ip = rawIp ? rawIp.split(",")[0].trim() : "127.0.0.1";

        try {
            const isAuthEndpoint =
                pathname.startsWith("/api/auth") && request.method === "POST";
            const limiter =
                isAuthEndpoint && authRatelimit ? authRatelimit : ratelimit;
            const prefix = isAuthEndpoint
                ? "auth"
                : isServerAction
                  ? "action"
                  : "api";

            const { success, limit, reset, remaining } = await limiter.limit(
                `${prefix}_${ip}`
            );

            if (!success) {
                const retrySeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                return NextResponse.json(
                    {
                        error: isAuthEndpoint
                            ? "Trop de tentatives de connexion. Veuillez patienter avant de réessayer."
                            : "Trop de requêtes. Veuillez réessayer plus tard.",
                        limit: isAuthEndpoint
                            ? "5 requêtes par minute"
                            : `${RATE_LIMIT_REQUESTS} requêtes par ${RATE_LIMIT_WINDOW}`,
                        retryAfter: new Date(reset).toISOString(),
                    },
                    {
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString(),
                            "Retry-After": retrySeconds.toString(),
                        },
                    }
                );
            }

            const res = NextResponse.next();
            res.headers.set("X-RateLimit-Limit", limit.toString());
            res.headers.set("X-RateLimit-Remaining", remaining.toString());
            res.headers.set("X-RateLimit-Reset", reset.toString());
            return res;
        } catch (error: unknown) {
            // En cas d'indisponibilité temporaire de Redis, autoriser la requête pour ne pas bloquer les utilisateurs
            console.error("❌ Erreur Rate Limiting:", error);
            return NextResponse.next();
        }
    }

    // Laisser passer toutes les autres requêtes
    return NextResponse.next();
}

// Configuration du matcher pour optimiser les performances
// Le middleware ne s'exécute que sur les routes spécifiées
export const config = {
    matcher: [
        /*
         * Matcher toutes les routes sauf:
         * - _next/static (fichiers statiques)
         * - _next/image (optimisation d'images)
         * - favicon.ico (favicon)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
