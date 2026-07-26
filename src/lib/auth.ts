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
export const auth = betterAuth({
    secret:
        process.env.BETTER_AUTH_SECRET ||
        "frozen-lunar-default-secret-change-in-prod-key",
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
