import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * POST /api/seed
 *
 * Route pour initialiser des utilisateurs de test dans le système
 * ATTENTION: Cette route est désactivée en production pour des raisons de sécurité
 *
 * Crée automatiquement:
 * - 1 administrateur
 * - 2 développeurs
 * - 1 modérateur
 *
 * Tous avec des mots de passe forts pré-définis
 *
 * Retourne:
 * - 200: Liste des utilisateurs créés/existants
 * - 403: Bloqué en production
 * - 500: Erreur lors de la création
 */

// Utilisateurs de test avec mots de passe sécurisés
const TEST_USERS = [
    {
        role: "admin",
        name: "Super Admin",
        email: "admin@hbc-logistique.fr",
        password: "AdminStrongPass2025!",
    },
    {
        role: "developer",
        name: "Dev One",
        email: "dev-00@hbc-logistique.fr",
        password: "Dev00SecurePass!",
    },
    {
        role: "developer",
        name: "Dev Two",
        email: "dev-01@hbc-logistique.fr",
        password: "Dev01SecurePass!",
    },
    {
        role: "moderator",
        name: "Moderator",
        email: "mod@hbc-logistique.fr",
        password: "ModSecurePass!",
    },
];

export async function POST() {
    // Protection: bloquer cette route en production
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            {
                error: "Cette route est désactivée en production pour des raisons de sécurité",
            },
            { status: 403 }
        );
    }

    const results = [];

    try {
        // Créer chaque utilisateur de test
        for (const user of TEST_USERS) {
            try {
                // Vérifier si l'utilisateur existe déjà
                const existing = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (existing) {
                    results.push({
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        status: "Existe déjà",
                    });
                    continue;
                }

                // Créer l'utilisateur via Better Auth
                // Better Auth gère automatiquement le hachage du mot de passe
                await auth.api.signUpEmail({
                    body: {
                        email: user.email,
                        password: user.password,
                        name: user.name,
                    },
                });

                // Mettre à jour le rôle de l'utilisateur
                // signUpEmail crée toujours avec le rôle "user" par défaut
                await prisma.user.update({
                    where: { email: user.email },
                    data: { role: user.role },
                });

                results.push({
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: "Créé avec succès",
                });
            } catch (error: unknown) {
                console.error(`❌ Échec de création de ${user.email}:`, error);
                results.push({
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: "Échec",
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }
        }

        return NextResponse.json({
            message: "Processus de seed terminé",
            summary: results,
            stats: {
                total: TEST_USERS.length,
                created: results.filter((r) => r.status === "Créé avec succès")
                    .length,
                existing: results.filter((r) => r.status === "Existe déjà")
                    .length,
                failed: results.filter((r) => r.status === "Échec").length,
            },
        });
    } catch (error: unknown) {
        console.error("❌ Erreur globale lors du seed:", error);

        if (error instanceof Error) {
            // Erreur de configuration DB
            if (error.message.includes("DATABASE_URL")) {
                return NextResponse.json(
                    {
                        error: "Configuration de base de données manquante",
                        details: "DATABASE_URL non configurée",
                        summary: results,
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                {
                    error: "Erreur lors du seed",
                    details: error.message,
                    summary: results,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: "Erreur inconnue lors du seed",
                summary: results,
            },
            { status: 500 }
        );
    }
}
