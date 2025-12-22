import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserList } from "@/components/features/admin/UserList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddUserDialog } from "@/components/features/admin/AddUserDialog";

export default async function AdminUsersPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        redirect("/admin/dashboard");
    }

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
                    <p className="text-muted-foreground mt-1">
                        Administrateurs, modérateurs et développeurs ayant accès au dashboard.
                    </p>
                </div>
                <AddUserDialog />
            </div>

            <UserList users={users} currentUserId={session.user.id} />
        </div>
    );
}
