"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createUserSchemaSimple } from "@/lib/validation";
import { handleError } from "@/lib/error-handler";
import { ERROR_CODES } from "@/lib/error-codes";

/**
 * Actions serveur pour la gestion des utilisateurs
 * Toutes ces actions nécessitent un rôle administrateur
 */

// Initialisation du client API Auth server-side
const authApi = auth.api;

/**
 * Vérifie si l'utilisateur actuel est un administrateur
 * Lance une erreur si l'utilisateur n'est pas authentifié ou n'a pas le rôle admin
 * 
 * @returns L'utilisateur admin authentifié
 * @throws Error si l'utilisateur n'est pas admin
 */
async function requireAdmin() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Non authentifié. Veuillez vous connecter.");
    }

    if (session.user.role !== "admin") {
        throw new Error("Accès refusé. Rôle administrateur requis.");
    }

    return session.user;
}

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
            where: { email: validated.email }
        });

        if (existingUser) {
            return { 
                success: false, 
                error: ERROR_CODES.UNIQUE_CONSTRAINT.message,
                code: ERROR_CODES.UNIQUE_CONSTRAINT.code
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
            throw new Error("Erreur lors de la création de l'utilisateur via Better Auth");
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
            message: `Utilisateur ${validated.name} créé avec succès` 
        };

    } catch (error: unknown) {
        console.error("❌ Erreur lors de la création d'utilisateur:", error);
        
        // Gestion des erreurs de validation Zod
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            return { 
                success: false, 
                error: firstError.message,
                code: ERROR_CODES.INVALID_FORMAT.code
            };
        }

        // Utiliser le gestionnaire d'erreurs centralisé
        const errorResponse = handleError(error);
        return { 
            success: false, 
            error: errorResponse.message,
            code: errorResponse.code
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
                code: ERROR_CODES.REQUIRED_FIELD.code
            };
        }

        // Empêcher l'auto-suppression
        if (userId === admin.id) {
            return {
                success: false,
                error: "Vous ne pouvez pas supprimer votre propre compte",
                code: ERROR_CODES.INSUFFICIENT_PERMISSIONS.code
            };
        }

        // Vérifier que l'utilisateur existe
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userToDelete) {
            return { 
                success: false, 
                error: ERROR_CODES.RECORD_NOT_FOUND.message,
                code: ERROR_CODES.RECORD_NOT_FOUND.code
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
            message: `Utilisateur ${userToDelete.name} supprimé avec succès` 
        };

    } catch (error: unknown) {
        console.error("❌ Erreur lors de la suppression d'utilisateur:", error);
        
        // Utiliser le gestionnaire d'erreurs centralisé
        const errorResponse = handleError(error);
        return { 
            success: false, 
            error: errorResponse.message,
            code: errorResponse.code
        };
    }
}
