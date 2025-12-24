import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        // Check if any admin already exists
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

        const body = await request.json();
        const { name, email, password } = body;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Tous les champs sont requis" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Le mot de passe doit contenir au moins 8 caractères" },
                { status: 400 }
            );
        }

        // Create admin user via Better Auth API
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
        });

        if (!result) {
            throw new Error("Échec de la création du compte");
        }

        // Update user role to admin
        await prisma.user.update({
            where: { email },
            data: { role: "admin" },
        });

        return NextResponse.json({
            success: true,
            message: "Compte administrateur créé avec succès",
        });
    } catch (error: unknown) {
        console.error("Admin init error:", error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
        
        return NextResponse.json(
            { error: "Erreur lors de la création du compte administrateur" },
            { status: 500 }
        );
    }
}
