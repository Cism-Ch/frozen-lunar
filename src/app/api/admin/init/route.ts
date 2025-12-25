import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { adminInitSchema } from "@/lib/validation";
import { handleError } from "@/lib/error-handler";
import { ERROR_CODES, createErrorResponse } from "@/lib/error-codes";
import { z } from "zod";

/**
 * POST /api/admin/init
 * 
 * Route d'initialisation du premier compte administrateur
 * Cette route ne peut être appelée qu'une seule fois (quand aucun admin n'existe)
 * 
 * Body attendu:
 * - name: string (nom complet de l'administrateur)
 * - email: string (adresse email valide)
 * - password: string (minimum 8 caractères)
 * 
 * Retourne:
 * - 200: Succès avec message de confirmation
 * - 400: Données invalides
 * - 403: Un administrateur existe déjà
 * - 500: Erreur serveur (base de données ou Better Auth)
 */
export async function POST(request: NextRequest) {
    try {
        // Vérifier si un administrateur existe déjà
        // Cette vérification empêche la création de multiples comptes admin via cette route
        const adminCount = await prisma.user.count({
            where: {
                role: "admin",
            },
        });

        if (adminCount > 0) {
            const errorResponse = createErrorResponse(ERROR_CODES.ADMIN_ALREADY_EXISTS);
            return NextResponse.json(
                errorResponse,
                { status: errorResponse.httpStatus }
            );
        }

        // Parser et valider le corps de la requête
        let body: unknown;
        try {
            body = await request.json();
        } catch (parseError: unknown) {
            console.error("❌ Erreur de parsing JSON dans /api/admin/init:", parseError);
            const errorResponse = createErrorResponse(
                ERROR_CODES.INVALID_FORMAT,
                "Corps de requête JSON invalide"
            );
            return NextResponse.json(
                errorResponse,
                { status: errorResponse.httpStatus }
            );
        }
        
        // Valider avec Zod
        const validated = adminInitSchema.parse(body);

        // Créer l'utilisateur via Better Auth
        // Better Auth gère le hachage du mot de passe et la création de la session
        const result = await auth.api.signUpEmail({
            body: {
                email: validated.email,
                password: validated.password,
                name: validated.name,
            },
        });

        // Vérifier que la création a réussi
        if (!result) {
            throw new Error("Échec de la création du compte via Better Auth");
        }

        // Mettre à jour le rôle de l'utilisateur créé pour le définir comme admin
        // Better Auth crée des utilisateurs avec le rôle "user" par défaut
        await prisma.user.update({
            where: { email: validated.email },
            data: { role: "admin" },
        });

        return NextResponse.json({
            success: true,
            message: "Compte administrateur créé avec succès",
        });
    } catch (error: unknown) {
        // Log l'erreur complète pour le débogage côté serveur
        console.error("❌ Erreur lors de l'initialisation admin:", error);
        
        // Gestion des erreurs de validation Zod
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            const errorResponse = createErrorResponse(
                ERROR_CODES.INVALID_FORMAT,
                firstError.message
            );
            return NextResponse.json(
                errorResponse,
                { status: errorResponse.httpStatus }
            );
        }

        // Utiliser le gestionnaire d'erreurs centralisé
        const errorResponse = handleError(error);
        return NextResponse.json(
            errorResponse,
            { status: errorResponse.httpStatus }
        );
    }
}
