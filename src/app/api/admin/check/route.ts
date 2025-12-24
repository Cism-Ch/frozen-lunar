import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        
        // Gestion des erreurs avec messages explicites
        if (error instanceof Error) {
            // Erreur de configuration de la base de données
            if (error.message.includes("DATABASE_URL")) {
                return NextResponse.json(
                    { 
                        error: "Configuration de la base de données manquante",
                        details: "DATABASE_URL n'est pas configurée dans .env",
                        hasAdmin: false 
                    },
                    { status: 500 }
                );
            }
            
            // Erreur de connexion Prisma
            if (error.message.includes("Can't reach database server")) {
                return NextResponse.json(
                    { 
                        error: "Impossible de se connecter à la base de données",
                        details: "Vérifiez que PostgreSQL est démarré et accessible",
                        hasAdmin: false 
                    },
                    { status: 500 }
                );
            }

            // Erreur de migration
            if (error.message.includes("migration") || error.message.includes("schema")) {
                return NextResponse.json(
                    { 
                        error: "Schéma de base de données invalide",
                        details: "Exécutez 'npx prisma migrate dev' pour appliquer les migrations",
                        hasAdmin: false 
                    },
                    { status: 500 }
                );
            }

            // Autres erreurs Prisma ou connexion
            return NextResponse.json(
                { 
                    error: "Erreur de base de données",
                    details: error.message,
                    hasAdmin: false 
                },
                { status: 500 }
            );
        }
        
        // Erreur inconnue
        return NextResponse.json(
            { 
                error: "Erreur lors de la vérification de l'admin",
                hasAdmin: false 
            },
            { status: 500 }
        );
    }
}
