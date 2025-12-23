import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialisation du Redis pour le Rate Limiting (Edge compatible)
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Configuration du Rate Limiter : 10 requêtes / 10 secondes par IP
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit",
});

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Ignorer les fichiers statiques, images, etc.
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)
    ) {
        return NextResponse.next();
    }

    // Protection des routes admin
    if (pathname.startsWith("/admin")) {
        // Permettre l'accès aux routes de login et d'initialisation
        if (pathname === "/admin/login" || pathname === "/admin/init") {
            return NextResponse.next();
        }

        // Vérifier la session via le cookie better-auth
        const sessionToken = request.cookies.get("better-auth.session_token")?.value;
        
        if (!sessionToken) {
            // Pas de session, rediriger vers login
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // La validation complète du rôle sera faite côté serveur dans les pages
        return NextResponse.next();
    }

    // Identifier l'utilisateur par IP
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Appliquer le Rate Limiting uniquement sur les API et Server Actions
    if (pathname.startsWith("/api")) {
        const { success, limit, reset, remaining } = await ratelimit.limit(
            `mw_${ip}`
        );

        const res = success
            ? NextResponse.next()
            : NextResponse.json(
                { error: "Too Many Requests" },
                { status: 429 }
            );

        // Ajouter les headers de Rate Limit
        res.headers.set("X-RateLimit-Limit", limit.toString());
        res.headers.set("X-RateLimit-Remaining", remaining.toString());
        res.headers.set("X-RateLimit-Reset", reset.toString());

        if (!success) return res;
        return res;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
