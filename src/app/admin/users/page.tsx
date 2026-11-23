import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserList, type ManagedUserItem } from "@/components/features/admin/UserList";
import { AddUserDialog } from "@/components/features/admin/AddUserDialog";

export default async function AdminUsersPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        redirect("/admin/dashboard");
    }

    const rawUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            companyProfile: {
                select: {
                    accountType: true,
                    companyName: true,
                    phone: true,
                    rccmNumber: true,
                },
            },
            _count: {
                select: {
                    quotes: true,
                    sessions: true,
                },
            },
        },
    });

    const users: ManagedUserItem[] = rawUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt.toISOString(),
        accountType:
            u.companyProfile?.accountType === "COMPANY"
                ? "COMPANY"
                : u.companyProfile?.accountType === "INDIVIDUAL"
                  ? "INDIVIDUAL"
                  : null,
        companyName: u.companyProfile?.companyName ?? null,
        phone: u.companyProfile?.phone ?? null,
        quotesCount: u._count.quotes,
        activeSessionsCount: u._count.sessions,
    }));

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Équipe Administrative &amp; Comptes Clients
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Gestion séparée de l&apos;équipe interne (rôles &amp;
                        accès) et des comptes clients inscrits (particuliers et
                        entreprises).
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <AddUserDialog />
                </div>
            </div>

            <UserList users={users} currentUserId={session.user.id} />
        </div>
    );
}
