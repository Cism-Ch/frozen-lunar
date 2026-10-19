"use server";

import prisma from "@/lib/prisma";
import crypto from "crypto";
import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";
import { resend, EMAIL_SENDER } from "@/lib/email";
import { PasswordResetEmail } from "@/components/emails/PasswordResetEmail";
import {
    requestPasswordResetSchema,
    verifyResetTokenSchema,
    resetPasswordWithTokenSchema,
    formatZodError,
} from "@/lib/validation";
import { z } from "zod";

/**
 * Type pour masquer un email à l'affichage (ex: a***n@domain.com)
 */
function maskEmail(email: string): string {
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const [local, domain] = parts;
    if (local.length <= 2) {
        return `${local.charAt(0)}*@${domain}`;
    }
    return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
}

export interface RequestResetResult {
    success: boolean;
    message: string;
    role?: string;
}

export interface VerifyTokenResult {
    valid: boolean;
    role: string;
    name: string;
    maskedEmail: string;
}

export interface ResetPasswordResult {
    success: boolean;
    role: string;
    message: string;
}

/**
 * Action Serveur Universelle : Demande de réinitialisation de mot de passe par email
 * Compatible avec les comptes Administrateurs et Utilisateurs
 */
export async function requestPasswordResetAction(
    input: unknown
): Promise<{ data: RequestResetResult | null; error: string | null }> {
    try {
        const validated = requestPasswordResetSchema.parse(input);
        const email = validated.email.toLowerCase().trim();

        // Recherche de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Anti-énumération : si l'utilisateur n'existe pas, on simule une réponse de succès
        if (!user) {
            return {
                data: {
                    success: true,
                    message:
                        "Si cette adresse est associée à un compte, un lien de réinitialisation a été envoyé par email.",
                },
                error: null,
            };
        }

        // Génération d'un jeton cryptographique aléatoire de 32 octets (64 caractères hexadécimaux)
        const token = crypto.randomBytes(32).toString("hex");
        const identifier = `reset-password:${token}`;
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

        // Nettoyer les anciens tokens de réinitialisation pour cet utilisateur
        await prisma.verification.deleteMany({
            where: {
                value: user.id,
                identifier: {
                    startsWith: "reset-password:",
                },
            },
        });

        // Enregistrer le nouveau jeton en base
        await prisma.verification.create({
            data: {
                identifier,
                value: user.id,
                expiresAt,
            },
        });

        // Construction du lien universel
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
        const userRole = user.role || "user";

        // Expédition du courriel
        try {
            if (process.env.RESEND_KEY || process.env.AUTH_RESEND_KEY) {
                await resend.emails.send({
                    from: `HBC Logistique <${EMAIL_SENDER}>`,
                    to: user.email,
                    subject:
                        userRole === "admin"
                            ? "Sécurité HBC Logistique : Réinitialisation de mot de passe Administrateur"
                            : "HBC Logistique : Réinitialisation de votre mot de passe",
                    react: PasswordResetEmail({
                        name: user.name || "Utilisateur",
                        resetUrl,
                        role: userRole,
                        expiresInMinutes: 60,
                    }),
                });
                console.log(
                    `📧 [RESET PASSWORD] Courriel de réinitialisation envoyé à ${user.email} (rôle: ${userRole})`
                );
            } else {
                console.warn(
                    `⚠️ [DEV RESET PASSWORD] RESEND_KEY non configurée. Lien direct pour ${user.email} (${userRole}) : ${resetUrl}`
                );
            }
        } catch (emailError: unknown) {
            console.error(
                "❌ [RESET PASSWORD] Erreur d'envoi du mail Resend:",
                emailError
            );
        }

        return {
            data: {
                success: true,
                message:
                    "Si cette adresse est associée à un compte, un lien de réinitialisation a été envoyé par email.",
                role: userRole,
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("❌ Erreur requestPasswordResetAction:", error);
        if (error instanceof z.ZodError) {
            return { data: null, error: formatZodError(error) };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Une erreur est survenue lors de la demande de réinitialisation.",
        };
    }
}

/**
 * Action Serveur Universelle : Vérification sécurisée du jeton de réinitialisation
 * Actualise l'état de la page dans son statut "Modification autorisée"
 */
export async function verifyResetTokenAction(
    input: unknown
): Promise<{ data: VerifyTokenResult | null; error: string | null }> {
    try {
        const validated = verifyResetTokenSchema.parse(input);
        const identifier = `reset-password:${validated.token}`;

        // Recherche du jeton
        const verification = await prisma.verification.findFirst({
            where: { identifier },
        });

        if (!verification) {
            return {
                data: null,
                error: "Ce lien de réinitialisation est invalide ou a déjà été utilisé.",
            };
        }

        // Vérification de l'expiration
        if (verification.expiresAt < new Date()) {
            await prisma.verification.delete({
                where: { id: verification.id },
            });
            return {
                data: null,
                error: "Ce lien de réinitialisation a expiré. Veuillez effectuer une nouvelle demande.",
            };
        }

        // Récupération de l'utilisateur associé
        const user = await prisma.user.findUnique({
            where: { id: verification.value },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return {
                data: null,
                error: "Le compte associé à ce lien n'a pas été trouvé.",
            };
        }

        return {
            data: {
                valid: true,
                role: user.role || "user",
                name: user.name,
                maskedEmail: maskEmail(user.email),
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("❌ Erreur verifyResetTokenAction:", error);
        if (error instanceof z.ZodError) {
            return { data: null, error: formatZodError(error) };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Échec de la vérification du lien de réinitialisation.",
        };
    }
}

/**
 * Action Serveur Universelle : Exécution de la mise à jour du mot de passe
 * Consomme le jeton, met à jour le mot de passe haché et révoque les sessions actives
 */
export async function resetPasswordWithTokenAction(
    input: unknown
): Promise<{ data: ResetPasswordResult | null; error: string | null }> {
    try {
        const validated = resetPasswordWithTokenSchema.parse(input);
        const identifier = `reset-password:${validated.token}`;

        // Recherche et validation du jeton
        const verification = await prisma.verification.findFirst({
            where: { identifier },
        });

        if (!verification) {
            return {
                data: null,
                error: "Ce lien de réinitialisation est invalide ou a déjà été utilisé.",
            };
        }

        if (verification.expiresAt < new Date()) {
            await prisma.verification.delete({
                where: { id: verification.id },
            });
            return {
                data: null,
                error: "Ce lien de réinitialisation a expiré. Veuillez refaire une demande.",
            };
        }

        // Récupération de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { id: verification.value },
        });

        if (!user) {
            return {
                data: null,
                error: "Le compte utilisateur est introuvable.",
            };
        }

        const userRole = user.role || "user";

        // Exigence renforcée pour les comptes administrateurs
        if (userRole === "admin" && validated.password.length < 12) {
            return {
                data: null,
                error: "Pour un compte Administrateur, le mot de passe doit comporter au moins 12 caractères.",
            };
        }

        // Hachage du mot de passe via l'algorithme officiel Better-Auth (scrypt)
        const hashedPassword = await hashPassword(validated.password);

        // Mise à jour ou création de l'enregistrement Account
        const existingAccount = await prisma.account.findFirst({
            where: {
                userId: user.id,
                providerId: "credential",
            },
        });

        if (existingAccount) {
            await prisma.account.update({
                where: { id: existingAccount.id },
                data: {
                    password: hashedPassword,
                    updatedAt: new Date(),
                },
            });
        } else {
            await prisma.account.create({
                data: {
                    userId: user.id,
                    providerId: "credential",
                    password: hashedPassword,
                    accountId: user.id,
                },
            });
        }

        // Révocation de toutes les sessions actives (Sécurité critique)
        await prisma.session.deleteMany({
            where: { userId: user.id },
        });

        // Consommation du jeton (usage unique)
        await prisma.verification.delete({
            where: { id: verification.id },
        });

        // Revalidation du cache Next.js
        revalidatePath("/admin");
        revalidatePath("/auth");

        return {
            data: {
                success: true,
                role: userRole,
                message: "Votre mot de passe a été réinitialisé avec succès.",
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("❌ Erreur resetPasswordWithTokenAction:", error);
        if (error instanceof z.ZodError) {
            return { data: null, error: formatZodError(error) };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Une erreur est survenue lors de la modification du mot de passe.",
        };
    }
}
