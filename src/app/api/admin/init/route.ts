import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
            return NextResponse.json(
                { error: "Un administrateur existe déjà" },
                { status: 403 }
            );
        }

        // Parser et valider le corps de la requête
        const body = await request.json();
        const { name, email, password } = body;

        // Validation des champs requis
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Tous les champs sont requis (name, email, password)" },
                { status: 400 }
            );
        }

        // Validation du format email (basique)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Format d'email invalide" },
                { status: 400 }
            );
        }

        // Validation de la longueur du mot de passe
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Le mot de passe doit contenir au moins 8 caractères" },
                { status: 400 }
            );
        }

        // Créer l'utilisateur via Better Auth
        // Better Auth gère le hachage du mot de passe et la création de la session
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
        });

        // Vérifier que la création a réussi
        if (!result) {
            throw new Error("Échec de la création du compte via Better Auth");
        }

        // Mettre à jour le rôle de l'utilisateur créé pour le définir comme admin
        // Better Auth crée des utilisateurs avec le rôle "user" par défaut
        await prisma.user.update({
            where: { email },
            data: { role: "admin" },
        });

        return NextResponse.json({
            success: true,
            message: "Compte administrateur créé avec succès",
        });
    } catch (error: unknown) {
        // Log l'erreur complète pour le débogage côté serveur
        console.error("❌ Erreur lors de l'initialisation admin:", error);
        
        // Gestion spécifique des erreurs courantes
        if (error instanceof Error) {
            // Erreur de connexion à la base de données
            if (error.message.includes("DATABASE_URL")) {
                return NextResponse.json(
                    { 
                        error: "Configuration de la base de données manquante",
                        details: "Veuillez configurer DATABASE_URL dans le fichier .env"
                    },
                    { status: 500 }
                );
            }
            
            // Erreur Prisma (connexion, contrainte unique, etc.)
            if (error.message.includes("Prisma")) {
                return NextResponse.json(
                    { 
                        error: "Erreur de base de données",
                        details: "Vérifiez que la base de données est accessible et que les migrations sont appliquées"
                    },
                    { status: 500 }
                );
            }

            // Erreur Better Auth
            if (error.message.includes("Better Auth") || error.message.includes("signUpEmail")) {
                return NextResponse.json(
                    { 
                        error: "Erreur du système d'authentification",
                        details: error.message
                    },
                    { status: 500 }
                );
            }

            // Autres erreurs avec message
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
        
        // Erreur inconnue
        return NextResponse.json(
            { error: "Erreur lors de la création du compte administrateur" },
            { status: 500 }
        );
    }
}
