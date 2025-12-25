import { z } from "zod";

/**
 * Schémas de validation centralisés avec Zod
 * Utilisés pour valider les données utilisateur de manière cohérente
 */

/**
 * Validation d'email robuste
 * Conforme aux standards RFC et gère les cas particuliers
 */
export const emailSchema = z
    .string({
        required_error: "L'adresse email est requise",
        invalid_type_error: "L'adresse email doit être une chaîne de caractères"
    })
    .min(1, "L'adresse email ne peut pas être vide")
    .email("Format d'email invalide")
    .toLowerCase()
    .trim();

/**
 * Validation de mot de passe renforcée
 * - Minimum 12 caractères (recommandation OWASP 2024)
 * - Au moins une majuscule
 * - Au moins une minuscule
 * - Au moins un chiffre
 * - Au moins un caractère spécial
 */
export const passwordSchema = z
    .string({
        required_error: "Le mot de passe est requis",
        invalid_type_error: "Le mot de passe doit être une chaîne de caractères"
    })
    .min(12, "Le mot de passe doit contenir au moins 12 caractères")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^a-zA-Z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial");

/**
 * Validation de mot de passe simple (pour compatibilité avec code existant)
 * À utiliser uniquement pour les migrations progressives
 */
export const simplePasswordSchema = z
    .string({
        required_error: "Le mot de passe est requis",
        invalid_type_error: "Le mot de passe doit être une chaîne de caractères"
    })
    .min(8, "Le mot de passe doit contenir au moins 8 caractères");

/**
 * Validation du nom d'utilisateur
 */
export const nameSchema = z
    .string({
        required_error: "Le nom est requis",
        invalid_type_error: "Le nom doit être une chaîne de caractères"
    })
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim();

/**
 * Validation du rôle utilisateur
 */
export const roleSchema = z.enum(["admin", "moderator", "developer", "user"], {
    errorMap: () => ({ message: "Rôle invalide. Doit être: admin, moderator, developer ou user" })
});

/**
 * Schéma complet pour la création d'utilisateur (avec mot de passe renforcé)
 */
export const createUserSchema = z.object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema,
    role: roleSchema.default("user"),
});

/**
 * Schéma pour la création d'utilisateur (avec mot de passe simple - rétrocompatibilité)
 */
export const createUserSchemaSimple = z.object({
    email: emailSchema,
    name: nameSchema,
    password: simplePasswordSchema,
    role: roleSchema.default("user"),
});

/**
 * Schéma pour l'initialisation admin
 */
export const adminInitSchema = z.object({
    email: emailSchema,
    name: nameSchema,
    password: simplePasswordSchema, // Utilise le schéma simple pour ne pas bloquer l'init
});

/**
 * Schéma pour la connexion
 */
export const signInSchema = z.object({
    email: emailSchema,
    password: z.string({
        required_error: "Le mot de passe est requis"
    }).min(1, "Le mot de passe ne peut pas être vide"),
});

/**
 * Type inference pour TypeScript
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateUserInputSimple = z.infer<typeof createUserSchemaSimple>;
export type AdminInitInput = z.infer<typeof adminInitSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Helper pour valider et formater les erreurs Zod
 */
export function formatZodError(error: z.ZodError): string {
    const firstError = error.issues[0];
    return firstError.message;
}

/**
 * Helper pour valider des données et retourner un résultat typé
 */
export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string } {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: formatZodError(error) };
        }
        return { success: false, error: "Erreur de validation inconnue" };
    }
}
