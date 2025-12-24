"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Actions serveur pour la gestion des utilisateurs
 * Toutes ces actions nécessitent un rôle administrateur
 */

// Initialisation du client API Auth server-side
const authApi = auth.api;

// Schéma de validation Zod pour la création d'utilisateur
const createUserSchema = z.object({
    email: z.string().email("Email invalide"),
    name: z.string().min(2, "Nom trop court (minimum 2 caractères)"),
    password: z.string().min(8, "Mot de passe trop court (minimum 8 caractères)"),
    role: z.enum(["admin", "developer", "moderator", "user"]).default("user"),
});

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
 * @returns { success: boolean, message?: string, error?: string }
 */
export async function createUserAction(formData: FormData) {
    try {
        // Vérifier que l'utilisateur actuel est admin
        await requireAdmin();

        // Extraire les données du formulaire
        const data = {
            email: formData.get("email") as string,
            name: formData.get("name") as string,
            password: formData.get("password") as string,
            role: formData.get("role") as string,
        };

        // Valider les données avec Zod
        const validated = createUserSchema.parse(data);

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email }
        });

        if (existingUser) {
            return { 
                success: false, 
                error: "Un utilisateur avec cet email existe déjà" 
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
            const firstError = error.errors[0];
            return { 
                success: false, 
                error: firstError.message 
            };
        }

        // Gestion des erreurs Better Auth
        if (error && typeof error === 'object' && 'body' in error) {
            const err = error as { body?: { message?: string } };
            if (err.body?.message) {
                return { success: false, error: err.body.message };
            }
        }

        // Gestion des autres erreurs
        if (error instanceof Error) {
            // Erreur de connexion DB
            if (error.message.includes("DATABASE_URL") || error.message.includes("Prisma")) {
                return { 
                    success: false, 
                    error: "Erreur de connexion à la base de données" 
                };
            }

            return { success: false, error: error.message };
        }

        return { 
            success: false, 
            error: "Erreur inconnue lors de la création de l'utilisateur" 
        };
    }
}

/**
 * Supprime un utilisateur par son ID
 * Empêche l'auto-suppression de l'admin connecté
 * 
 * @param formData FormData contenant userId
 * @returns { success: boolean, message?: string, error?: string }
 */
export async function deleteUserAction(formData: FormData) {
    try {
        // Vérifier que l'utilisateur actuel est admin
        const admin = await requireAdmin();
        
        const userId = formData.get("userId") as string;

        // Validation du paramètre
        if (!userId) {
            throw new Error("ID utilisateur manquant");
        }

        // Empêcher l'auto-suppression
        if (userId === admin.id) {
            throw new Error("Vous ne pouvez pas supprimer votre propre compte");
        }

        // Vérifier que l'utilisateur existe
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userToDelete) {
            return { 
                success: false, 
                error: "Utilisateur introuvable" 
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
        
        if (error instanceof Error) {
            // Erreur de connexion DB
            if (error.message.includes("DATABASE_URL") || error.message.includes("Prisma")) {
                return { 
                    success: false, 
                    error: "Erreur de connexion à la base de données" 
                };
            }

            return { success: false, error: error.message };
        }

        return { 
            success: false, 
            error: "Erreur lors de la suppression de l'utilisateur" 
        };
    }
}
