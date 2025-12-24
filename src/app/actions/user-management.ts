"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Initialisation du client API Auth server-side
const authApi = auth.api;

// Schéma de validation pour la création d'utilisateur
const createUserSchema = z.object({
    email: z.string().email("Email invalide"),
    name: z.string().min(2, "Nom trop court"),
    password: z.string().min(8, "Mot de passe trop court (min 8 chars)"),
    role: z.enum(["admin", "developer", "moderator", "user"]).default("user"),
});

/**
 * Vérifie si l'utilisateur actuel est un Admin.
 */
async function requireAdmin() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Accès refusé. Rôle administrateur requis.");
    }
    return session.user;
}

export async function createUserAction(formData: FormData) {
    try {
        await requireAdmin();

        const data = {
            email: formData.get("email") as string,
            name: formData.get("name") as string,
            password: formData.get("password") as string,
            role: formData.get("role") as string,
        };

        const validated = createUserSchema.parse(data);

        // 1. Créer l'utilisateur via Better-Auth
        // Note: signUpEmail connecte automatiquement l'utilisateur.
        // Pour un panneau admin, c'est un effet de bord indésirable si on utilise l'instance client.
        // Mais via auth.api côté serveur, cela ne devrait pas affecter la session ADMIN actuelle 
        // tant qu'on ne forward pas le Set-Cookie header au client admin.
        const newUser = await authApi.signUpEmail({
            body: {
                email: validated.email,
                password: validated.password,
                name: validated.name,
            },
            // Important : Ne pas passer les headers pour éviter d'écraser la session admin actuelle
        });

        if (!newUser) {
            throw new Error("Erreur lors de la création de l'utilisateur Auth.");
        }

        // 2. Mettre à jour le rôle (car signUp ne le gère pas toujours par défaut dans le body)
        // On utilise l'email comme clé unique car l'ID vient d'être généré
        await prisma.user.update({
            where: { email: validated.email },
            data: { role: validated.role },
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Utilisateur créé avec succès" };

    } catch (error: unknown) {
        console.error("Create User Error:", error);
        // Gestion propre de l'erreur "User already exists" de Better-Auth
        if (error && typeof error === 'object' && 'body' in error) {
            const err = error as { body?: { message?: string } };
            if (err.body?.message) {
                return { success: false, error: err.body.message };
            }
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erreur inconnue" };
    }
}

export async function deleteUserAction(formData: FormData) {
    try {
        const admin = await requireAdmin();
        const userId = formData.get("userId") as string;

        if (!userId) throw new Error("ID utilisateur manquant");

        // Empêcher l'auto-suppression
        if (userId === admin.id) {
            throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
        }

        // Supprimer via Prisma (Cascading delete gérera les sessions/accounts si configuré, 
        // sinon Better-Auth a peut-être besoin d'un clean. Prisma 'onDelete: Cascade' est la norme.)
        await prisma.user.delete({
            where: { id: userId },
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Utilisateur supprimé" };

    } catch (error: unknown) {
        console.error("Delete User Error:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erreur lors de la suppression" };
    }
}
