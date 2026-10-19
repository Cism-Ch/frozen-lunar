import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { resend, EMAIL_SENDER } from "@/lib/email";
import { PasswordResetEmail } from "@/components/emails/PasswordResetEmail";

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

    // Activation de l'authentification par email/mot de passe avec flux de réinitialisation
    emailAndPassword: {
        enabled: true,
        resetPasswordTokenExpiresIn: 60 * 60, // 1 heure (3600 secondes)
        revokeSessionsOnPasswordReset: true, // Invalidation automatique des sessions actives
        sendResetPassword: async ({ user, token }) => {
            const appUrl =
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
            const userRole = (user as { role?: string }).role || "user";

            try {
                if (process.env.RESEND_KEY || process.env.AUTH_RESEND_KEY) {
                    await resend.emails.send({
                        from: `HBC Logistique <${EMAIL_SENDER}>`,
                        to: user.email,
                        subject:
                            userRole === "admin"
                                ? "Sécurité HBC Logistique : Réinitialisation de votre mot de passe Administrateur"
                                : "HBC Logistique : Réinitialisation de votre mot de passe",
                        react: PasswordResetEmail({
                            name: user.name || "Utilisateur",
                            resetUrl,
                            role: userRole,
                            expiresInMinutes: 60,
                        }),
                    });
                    console.log(
                        `📧 [RESET PASSWORD] Email envoyé avec succès à ${user.email} (rôle: ${userRole})`
                    );
                } else {
                    console.warn(
                        `⚠️ [DEV RESET PASSWORD] Clé Resend absente. Lien généré pour ${user.email} (${userRole}) : ${resetUrl}`
                    );
                }
            } catch (mailError: unknown) {
                console.error(
                    "❌ [RESET PASSWORD] Erreur lors de l'envoi de l'email:",
                    mailError
                );
            }
        },
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
