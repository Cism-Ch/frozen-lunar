import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // Check if any admin user exists
        const adminCount = await prisma.user.count({
            where: {
                role: "admin",
            },
        });

        return NextResponse.json({ hasAdmin: adminCount > 0 });
    } catch (error: unknown) {
        console.error("Admin check error:", error);
        return NextResponse.json(
            { error: "Erreur lors de la vérification", hasAdmin: false },
            { status: 500 }
        );
    }
}
