import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

/**
 * Configuration de Better Auth avec Prisma adapter
 *
 * Better Auth gère:
 * - L'authentification email/mot de passe
 * - Les sessions avec cookies sécurisés
 * - Le hachage automatique des mots de passe
 * - Les champs personnalisés (role)
 *
 * Voir: https://better-auth.com pour la documentation complète
 */
// Validation stricte du secret d'authentification
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!authSecret) {
    if (process.env.NODE_ENV === "production") {
        throw new Error(
            "❌ [FATAL SECURITY] BETTER_AUTH_SECRET est manquant en production. Impossible d'initialiser Better-Auth sans clé secrète robuste."
        );
    }
    console.warn(
        "⚠️ [SECURITY WARNING] BETTER_AUTH_SECRET n'est pas défini en local. Utilisation d'une clé temporaire réservée au développement."
    );
}

export const auth = betterAuth({
    secret: authSecret || "dev-only-local-secret-key-frozen-lunar-min-32-chars",
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    // Configuration de l'adaptateur de base de données
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    // Activation de l'authentification par email/mot de passe
    emailAndPassword: {
        enabled: true,
    },

    // Configuration des champs personnalisés pour l'utilisateur
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user", // Valeur par défaut pour les nouveaux utilisateurs
            },
        },
    },

    // Configuration de la gestion des sessions
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // Cache de 5 minutes pour réduire les requêtes DB
        },
    },
});
