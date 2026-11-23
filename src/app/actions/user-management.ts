"use server";

import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createUserSchemaSimple } from "@/lib/validation";
import { handleError } from "@/lib/error-handler";
import { ERROR_CODES } from "@/lib/error-codes";
import { logger } from "@/lib/logger";

/**
 * Actions serveur pour la gestion des utilisateurs
 * Toutes ces actions nécessitent un rôle administrateur
 */

// Initialisation du client API Auth server-side
const authApi = auth.api;

/**
 * Crée un nouvel utilisateur avec Better Auth
 *
 * @param formData FormData contenant email, name, password, role
 * @returns { success: boolean, message?: string, error?: string, code?: string }
 */
export async function createUserAction(formData: FormData) {
    try {
        // Vérifier que l'utilisateur actuel est admin
        await requireAdmin();

        // Extraire les données du formulaire
        const data = {
            email: formData.get("email") as string | null,
            name: formData.get("name") as string | null,
            password: formData.get("password") as string | null,
            role: formData.get("role") as string | null,
        };

        // Valider les données avec Zod
        // Note: Utilise createUserSchemaSimple (8 caractères) au lieu de createUserSchema (12 caractères)
        // pour maintenir la compatibilité avec les utilisateurs existants et permettre
        // une migration progressive vers des mots de passe plus forts
        const validated = createUserSchemaSimple.parse(data);

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        });

        if (existingUser) {
            return {
                success: false,
                error: ERROR_CODES.UNIQUE_CONSTRAINT.message,
                code: ERROR_CODES.UNIQUE_CONSTRAINT.code,
            };
        }

        // Créer l'utilisateur via Better Auth
        // Note: signUpEmail côté serveur ne doit pas affecter la session admin actuelle
        const newUser = await authApi.signUpEmail({
            body: {
                email: validated.email,
                password: validated.password,
                name: validated.name,
            },
            // Important : Ne pas passer les headers pour éviter d'écraser la session admin
        });

        if (!newUser) {
            throw new Error(
                "Erreur lors de la création de l'utilisateur via Better Auth"
            );
        }

        // Mettre à jour le rôle de l'utilisateur
        // signUpEmail crée toujours des utilisateurs avec le rôle "user" par défaut
        await prisma.user.update({
            where: { email: validated.email },
            data: { role: validated.role },
        });

        // Revalider le cache de la page des utilisateurs
        revalidatePath("/admin/users");

        return {
            success: true,
            message: `Utilisateur ${validated.name} créé avec succès`,
        };
    } catch (error: unknown) {
        logger.error("❌ Erreur lors de la création d'utilisateur", error);

        // Gestion des erreurs de validation Zod
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            return {
                success: false,
                error: firstError.message,
                code: ERROR_CODES.INVALID_FORMAT.code,
            };
        }

        // Utiliser le gestionnaire d'erreurs centralisé
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
            code: errorResponse.code,
        };
    }
}

/**
 * Supprime un utilisateur par son ID
 * Empêche l'auto-suppression de l'admin connecté
 *
 * @param formData FormData contenant userId
 * @returns { success: boolean, message?: string, error?: string, code?: string }
 */
export async function deleteUserAction(formData: FormData) {
    try {
        // Vérifier que l'utilisateur actuel est admin
        const admin = await requireAdmin();

        const userId = formData.get("userId") as string;

        // Validation du paramètre
        if (!userId) {
            return {
                success: false,
                error: ERROR_CODES.REQUIRED_FIELD.message,
                code: ERROR_CODES.REQUIRED_FIELD.code,
            };
        }

        // Empêcher l'auto-suppression
        if (userId === admin.id) {
            return {
                success: false,
                error: "Vous ne pouvez pas supprimer votre propre compte",
                code: ERROR_CODES.INSUFFICIENT_PERMISSIONS.code,
            };
        }

        // Vérifier que l'utilisateur existe
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userToDelete) {
            return {
                success: false,
                error: ERROR_CODES.RECORD_NOT_FOUND.message,
                code: ERROR_CODES.RECORD_NOT_FOUND.code,
            };
        }

        // Supprimer l'utilisateur
        // La cascade delete (onDelete: Cascade) supprime automatiquement
        // les sessions et comptes associés
        await prisma.user.delete({
            where: { id: userId },
        });

        // Revalider le cache de la page des utilisateurs
        revalidatePath("/admin/users");

        return {
            success: true,
            message: `Utilisateur ${userToDelete.name} supprimé avec succès`,
        };
    } catch (error: unknown) {
        logger.error("❌ Erreur lors de la suppression d'utilisateur", error);

        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
            code: errorResponse.code,
        };
    }
}

const updateUserRoleSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(["admin", "moderator", "developer", "user"]),
});

/**
 * Met à jour le rôle d'un utilisateur (protège l'admin connecté et empêche de supprimer le dernier admin).
 */
export async function updateUserRoleAction(input: unknown): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const currentAdmin = await requireAdmin();
        const parsed = updateUserRoleSchema.safeParse(input);
        if (!parsed.success) {
            return { success: false, error: "Paramètres de rôle invalides." };
        }

        const { userId, role } = parsed.data;
        if (userId === currentAdmin.id) {
            return {
                success: false,
                error: "Vous ne pouvez pas modifier votre propre rôle administrateur.",
            };
        }

        const target = await prisma.user.findUnique({ where: { id: userId } });
        if (!target) {
            return { success: false, error: "Utilisateur introuvable." };
        }

        if (target.role === "admin" && role !== "admin") {
            const adminCount = await prisma.user.count({
                where: { role: "admin" },
            });
            if (adminCount <= 1) {
                return {
                    success: false,
                    error: "Impossible de rétrograder le dernier administrateur du système.",
                };
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role },
        });

        revalidatePath("/admin/users");
        return {
            success: true,
            message: `Rôle de ${target.name} mis à jour (${role}).`,
        };
    } catch (error: unknown) {
        logger.error("updateUserRoleAction error", error);
        return { success: false, error: handleError(error).message };
    }
}

/**
 * Révoque toutes les sessions actives d'un utilisateur (déconnexion forcée multi-appareils).
 */
export async function revokeUserSessionsAction(userId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const currentAdmin = await requireAdmin();
        if (!userId || userId === currentAdmin.id) {
            return {
                success: false,
                error: "Impossible de révoquer vos propres sessions depuis cette action.",
            };
        }

        const res = await prisma.session.deleteMany({
            where: { userId },
        });

        revalidatePath("/admin/users");
        return {
            success: true,
            message: `${res.count} session(s) active(s) révoquée(s).`,
        };
    } catch (error: unknown) {
        logger.error("revokeUserSessionsAction error", error);
        return { success: false, error: handleError(error).message };
    }
}

/**
 * Valide ou invalide manuellement le statut de vérification d'email d'un compte.
 */
export async function toggleUserEmailVerifiedAction(
    userId: string,
    verified: boolean
): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await requireAdmin();
        if (!userId) {
            return { success: false, error: "Identifiant utilisateur requis." };
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: verified },
            select: { name: true },
        });

        revalidatePath("/admin/users");
        return {
            success: true,
            message: verified
                ? `Email de ${updated.name} marqué comme vérifié.`
                : `Vérification email de ${updated.name} retirée.`,
        };
    } catch (error: unknown) {
        logger.error("toggleUserEmailVerifiedAction error", error);
        return { success: false, error: handleError(error).message };
    }
}
