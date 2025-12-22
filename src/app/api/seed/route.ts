import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const TEST_USERS = [
    { role: "admin", name: "Super Admin", email: "admin@hbc-logistique.fr", password: "AdminStrongPass2025!" },
    { role: "developer", name: "Dev One", email: "dev-00@hbc-logistique.fr", password: "Dev00SecurePass!" },
    { role: "developer", name: "Dev Two", email: "dev-01@hbc-logistique.fr", password: "Dev01SecurePass!" },
    { role: "moderator", name: "Moderator", email: "mod@hbc-logistique.fr", password: "ModSecurePass!" },
];

export async function POST(req: NextRequest) {
    // Basic protection: only allow in development
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
    }

    const results = [];

    for (const user of TEST_USERS) {
        const existing = await prisma.user.findUnique({
            where: { email: user.email }
        });

        if (existing) {
            results.push({ email: user.email, status: "Already exists" });
            continue;
        }

        try {
            await auth.api.signUpEmail({
                body: {
                    email: user.email,
                    password: user.password,
                    name: user.name,
                }
            });

            // Manually update role since signUpEmail might not support custom fields directly in the body 
            // depending on configuration, or we do it explicitly here for safety.
            await prisma.user.update({
                where: { email: user.email },
                data: { role: user.role }
            });

            results.push({ email: user.email, status: "Created" });
        } catch (error) {
            console.error(`Failed to create ${user.email}`, error);
            results.push({ email: user.email, status: "Failed", error: String(error) });
        }
    }

    return NextResponse.json({ summary: results });
}
