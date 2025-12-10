"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Shield, ShieldAlert, User, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TeamMemberProfile } from "./TeamMemberProfile";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { useState } from "react";
import { Plus } from "lucide-react";

// ... existing imports

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: "Admin" | "Modérateur" | "Développeur";
    status: "Actif" | "Inactif";
    lastActive: string;
    avatar: string;
}

const MOCK_TEAM: TeamMember[] = [
    // ... existing mock data
    {
        id: "1",
        name: "Admin Principal",
        email: "admin@hbclogistique.com",
        role: "Admin",
        status: "Actif",
        lastActive: "En ligne",
        avatar: "/avatars/01.png"
    },
    {
        id: "2",
        name: "Marc Dupont",
        email: "marc.d@hbclogistique.com",
        role: "Modérateur",
        status: "Actif",
        lastActive: "Il y a 2h",
        avatar: "/avatars/02.png"
    },
    {
        id: "3",
        name: "Sophie Martin",
        email: "sophie.m@hbclogistique.com",
        role: "Modérateur",
        status: "Inactif",
        lastActive: "Il y a 2 jours",
        avatar: "/avatars/03.png"
    },
    {
        id: "4",
        name: "Dev Team",
        email: "dev@hbclogistique.com",
        role: "Développeur",
        status: "Actif",
        lastActive: "En maintenance",
        avatar: "/avatars/04.png"
    }
];

export function TeamList() {
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <CardTitle className="flex items-center justify-center sm:justify-start gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Équipe Administrative
                    </CardTitle>
                    <CardDescription>
                        Gérez les accès et les rôles des membres de l'équipe.
                    </CardDescription>
                </div>
                <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" /> Ajouter
                </Button>
            </CardHeader>
            <CardContent>
                <>
                    {/* Mobile Card View */}
                    <div className="space-y-4 md:hidden">
                        {MOCK_TEAM.map((member) => (
                            <div
                                key={member.id}
                                className="p-4 border rounded-lg bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setSelectedMember(member)}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{member.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                    </div>
                                    <Badge variant={member.status === "Actif" ? "default" : "secondary"}>
                                        {member.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        {member.role === "Admin" ? (
                                            <ShieldAlert className="h-4 w-4 text-purple-600" />
                                        ) : member.role === "Développeur" ? (
                                            <Code className="h-4 w-4 text-orange-600" />
                                        ) : (
                                            <Shield className="h-4 w-4 text-blue-600" />
                                        )}
                                        <span>{member.role}</span>
                                    </div>
                                    <span className="text-muted-foreground text-xs">{member.lastActive}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Membre</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Dernière activité</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_TEAM.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{member.name}</span>
                                                <span className="text-xs text-muted-foreground">{member.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {member.role === "Admin" ? (
                                                    <ShieldAlert className="h-4 w-4 text-purple-600" />
                                                ) : member.role === "Développeur" ? (
                                                    <Code className="h-4 w-4 text-orange-600" />
                                                ) : (
                                                    <Shield className="h-4 w-4 text-blue-600" />
                                                )}
                                                {member.role}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={member.status === "Actif" ? "default" : "secondary"}>
                                                {member.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {member.lastActive}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setSelectedMember(member)}>
                                                        Voir le profil
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>Modifier les droits</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                        Suspendre l'accès
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
            </CardContent>

            <TeamMemberProfile
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                member={selectedMember}
            />
        </Card>
    );
}
