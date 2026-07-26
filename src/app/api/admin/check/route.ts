import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/error-handler";

/**
 * GET /api/admin/check
 *
 * Vérifie si un compte administrateur existe dans le système
 * Cette route est utilisée par la page d'initialisation pour déterminer
 * si l'application a déjà été configurée avec un admin
 *
 * Retourne:
 * - 200: { hasAdmin: boolean } - Succès avec statut de l'admin
 * - 500: Erreur serveur avec détails
 */
export async function GET() {
    try {
        // Compter le nombre d'administrateurs dans la base de données
        const adminCount = await prisma.user.count({
            where: {
                role: "admin",
            },
        });

        return NextResponse.json({ hasAdmin: adminCount > 0 });
    } catch (error: unknown) {
        // Log l'erreur complète côté serveur pour le débogage
        console.error("❌ Erreur lors de la vérification admin:", error);

        // Utiliser le gestionnaire d'erreurs centralisé
        const errorResponse = handleError(error);
        return NextResponse.json(
            {
                ...errorResponse,
                hasAdmin: false,
            },
            { status: errorResponse.httpStatus }
        );
    }
}
