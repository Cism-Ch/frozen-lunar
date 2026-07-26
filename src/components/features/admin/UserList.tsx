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

    const handleDelete = async (userId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
            return;

        setIsDeleting(userId);
        const formData = new FormData();
        formData.append("userId", userId);

        const result = await deleteUserAction(formData);

        if (result.success) {
            toast.success(result.message);
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
        <div className="overflow-hidden rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Date d&apos;ajout</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                    disabled={
                                        user.id === currentUserId ||
                                        isDeleting === user.id
                                    }
                                    onClick={() => handleDelete(user.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
