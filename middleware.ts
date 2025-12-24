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

// Configuration du rate limiting
const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_WINDOW = "10 s";

// Initialisation du Redis pour le Rate Limiting (Edge compatible)
// Si les variables d'environnement ne sont pas définies, le rate limiting sera désactivé
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Configuration du Rate Limiter : 20 requêtes / 10 secondes par IP
// Cette limite protège contre les abus tout en permettant une utilisation normale
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW),
    analytics: true,
    prefix: "@upstash/ratelimit",
});

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
        const sessionToken = request.cookies.get("better-auth.session_token")?.value;
        
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
    // RATE LIMITING SUR LES ROUTES API
    // =========================================================================
    if (pathname.startsWith("/api")) {
        // Identifier l'utilisateur par son IP (x-forwarded-for en production)
        const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

        try {
            // Appliquer le rate limiting
            const { success, limit, reset, remaining } = await ratelimit.limit(
                `mw_${ip}`
            );

            const res = success
                ? NextResponse.next()
                : NextResponse.json(
                    { 
                        error: "Trop de requêtes. Veuillez réessayer plus tard.",
                        limit: `${RATE_LIMIT_REQUESTS} requêtes par ${RATE_LIMIT_WINDOW}`,
                        retryAfter: new Date(reset).toISOString()
                    },
                    { status: 429 }
                );

            // Ajouter les headers de Rate Limit pour informer le client
            res.headers.set("X-RateLimit-Limit", limit.toString());
            res.headers.set("X-RateLimit-Remaining", remaining.toString());
            res.headers.set("X-RateLimit-Reset", reset.toString());

            return res;
        } catch (error: unknown) {
            // En cas d'erreur Redis (ex: service indisponible), autoriser la requête
            // mais logger l'erreur pour investigation
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
