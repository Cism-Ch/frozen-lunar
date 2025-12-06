"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, ShieldAlert, Check, Clock, Calendar, Mail } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Reuse the interface from TeamList or define a shared one. 
// For now, I'll redefine compatible props to avoid complex refactoring in this step.
export interface TeamMemberProfileProps {
    isOpen: boolean;
    onClose: () => void;
    member: {
        id: string;
        name: string;
        email: string;
        role: "Admin" | "Modérateur" | "Développeur";
        status: "Actif" | "Inactif";
        lastActive: string;
        avatar: string;
        // Extended props that might come from a real API later
        joinedDate?: string;
        permissions?: string[];
    } | null;
}

export function TeamMemberProfile({ isOpen, onClose, member }: TeamMemberProfileProps) {
    if (!member) return null;

    // Mock permissions if not present
    const getPermissions = (role: string) => {
        switch (role) {
            case "Admin": return ["Gestion complète", "Gestion des utilisateurs", "Paramètres système", "Export comptable"];
            case "Développeur": return ["Accès logs", "Maintenance système", "Vue debug", "API Management"];
            default: return ["Gestion des devis", "Communication client", "Lecture seule tableau de bord"];
        }
    };

    const permissions = member.permissions || getPermissions(member.role);

    // Mock specific join date
    const joinedDate = member.joinedDate || new Date(2023, 10, 15).toISOString();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xl">{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl">{member.name}</DialogTitle>
                            <DialogDescription className="flex items-center gap-2">
                                <Mail className="h-4 w-4" /> {member.email}
                            </DialogDescription>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={member.role === "Admin" ? "default" : member.role === "Développeur" ? "outline" : "secondary"} className="gap-1">
                                    {member.role === "Admin" ? <ShieldAlert className="h-3 w-3" /> : member.role === "Développeur" ? <Check className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                    {member.role}
                                </Badge>
                                <Badge variant="outline" className={member.status === "Actif" ? "text-green-600 border-green-200 bg-green-50" : "text-gray-500"}>
                                    {member.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Membre depuis
                            </span>
                            <span className="font-medium">
                                {format(new Date(joinedDate), "dd MMMM yyyy", { locale: fr })}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Dernière activité
                            </span>
                            <span className="font-medium">{member.lastActive}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Permissions */}
                    <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Permissions & Accès
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {permissions.map((perm, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    {perm}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Recent History (Mock) */}
                    <div className="space-y-3">
                        <h4 className="font-medium">Activités Récentes</h4>
                        <ScrollArea className="h-[120px] rounded-md border p-4">
                            <div className="space-y-4">
                                <div className="flex gap-4 text-sm relative">
                                    <div className="absolute left-0 top-1 bottom-1 w-px bg-border" />

                                    <div className="relative pl-4 space-y-4">
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                                            <p className="font-medium text-foreground">Connexion au dashboard</p>
                                            <p className="text-xs text-muted-foreground">Aujourd'hui, 09:41</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-300 ring-4 ring-white" />
                                            <p className="font-medium text-foreground">Modification Devis #DEV-8821</p>
                                            <p className="text-xs text-muted-foreground">Hier, 14:30</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-300 ring-4 ring-white" />
                                            <p className="font-medium text-foreground">Export comptable mensuel</p>
                                            <p className="text-xs text-muted-foreground">01/12/2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
