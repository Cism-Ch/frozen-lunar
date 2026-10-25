"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, UserCog, Shield, ShieldAlert, Code } from "lucide-react";
import { deleteUserAction } from "@/app/actions/user-management";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
}

interface UserListProps {
    users: User[];
    currentUserId: string;
}

export function UserList({ users, currentUserId }: UserListProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const userToDelete = users.find((u) => u.id === confirmDeleteId);

    const handleDelete = async (userId: string) => {
        setIsDeleting(userId);
        const formData = new FormData();
        formData.append("userId", userId);

        const result = await deleteUserAction(formData);

        if (result.success) {
            toast.success(result.message);
            setConfirmDeleteId(null);
        } else {
            toast.error(result.error);
        }
        setIsDeleting(null);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return (
                    <Badge className="bg-red-500 hover:bg-red-600">
                        <ShieldAlert className="mr-1 h-3 w-3" /> Admin
                    </Badge>
                );
            case "developer":
                return (
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                        <Code className="mr-1 h-3 w-3" /> Dev
                    </Badge>
                );
            case "moderator":
                return (
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                        <Shield className="mr-1 h-3 w-3" /> Modo
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary">
                        <UserCog className="mr-1 h-3 w-3" /> User
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Vue Mobile (Cartes tactiles fluides) */}
            <div className="space-y-3 md:hidden">
                {users.length === 0 ? (
                    <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
                        Aucun utilisateur enregistré.
                    </div>
                ) : (
                    users.map((user) => (
                        <div
                            key={user.id}
                            className="bg-card text-card-foreground space-y-3 rounded-xl border p-4 shadow-xs"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-base font-semibold">
                                        {user.name}
                                    </p>
                                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="shrink-0">
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>
                            <div className="border-border/60 text-muted-foreground flex items-center justify-between border-t pt-2.5 text-xs">
                                <span>
                                    Ajouté le{" "}
                                    {format(
                                        new Date(user.createdAt),
                                        "dd MMM yyyy",
                                        { locale: fr }
                                    )}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-11 min-h-[44px] min-w-[44px] gap-1.5 px-3 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                                    disabled={
                                        user.id === currentUserId ||
                                        isDeleting === user.id
                                    }
                                    onClick={() => setConfirmDeleteId(user.id)}
                                    aria-label={`Supprimer ${user.name}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Supprimer</span>
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Vue Desktop (Tableau fluide avec scroll horizontal de sécurité) */}
            <div className="hidden overflow-x-auto rounded-lg border md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Date d&apos;ajout</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {user.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {user.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(
                                        new Date(user.createdAt),
                                        "dd MMM yyyy",
                                        { locale: fr }
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                                        disabled={
                                            user.id === currentUserId ||
                                            isDeleting === user.id
                                        }
                                        onClick={() =>
                                            setConfirmDeleteId(user.id)
                                        }
                                        aria-label={`Supprimer ${user.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Modale de Confirmation Accessible (WCAG 2026) */}
            <ConfirmDialog
                open={!!confirmDeleteId}
                onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                title="Supprimer l'utilisateur"
                description={`Êtes-vous sûr de vouloir supprimer ${userToDelete?.name ?? "cet utilisateur"} (${userToDelete?.email ?? ""}) ? Cette action est irréversible et révoquera immédiatement tous ses accès au back-office.`}
                confirmLabel="Supprimer définitivement"
                cancelLabel="Annuler"
                variant="destructive"
                isLoading={!!confirmDeleteId && isDeleting === confirmDeleteId}
                onConfirm={() => {
                    if (confirmDeleteId) {
                        return handleDelete(confirmDeleteId);
                    }
                }}
            />
        </div>
    );
}
