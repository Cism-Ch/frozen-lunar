import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/check
 * Vérifie si un compte administrateur existe dans le système (protégé par rate-limiting).
 */
export async function GET() {
    try {
        const rl = await checkRateLimit({
            scope: "api-admin-check",
            limit: 20,
            windowSeconds: 300,
        });
        if (!rl.allowed) {
            return NextResponse.json(
                {
                    hasAdmin: false,
                    error: "Trop de requêtes. Veuillez patienter quelques minutes.",
                },
                {
                    status: 429,
                    headers: { "Cache-Control": "no-store, max-age=0" },
                }
            );
        }

        const adminCount = await prisma.user.count({
            where: {
                role: "admin",
            },
        });

        return NextResponse.json(
            { hasAdmin: adminCount > 0 },
            { headers: { "Cache-Control": "no-store, max-age=0" } }
        );
    } catch (error: unknown) {
        logger.error("Erreur lors de la vérification admin", error);
        return NextResponse.json(
            {
                hasAdmin: false,
                error: "Service temporairement indisponible.",
            },
            {
                status: 503,
                headers: { "Cache-Control": "no-store, max-age=0" },
            }
        );
    }
}
