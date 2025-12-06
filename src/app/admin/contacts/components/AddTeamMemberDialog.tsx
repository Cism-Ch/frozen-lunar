"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, ShieldAlert, Code } from "lucide-react";

interface AddTeamMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddTeamMemberDialog({ isOpen, onClose }: AddTeamMemberDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Invitation envoyée avec succès");
            onClose();
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un membre</DialogTitle>
                    <DialogDescription>
                        Envoyez une invitation pour rejoindre l'équipe administrative.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input id="name" placeholder="Ex: Jean Dupont" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Adresse email</Label>
                        <Input id="email" type="email" placeholder="jean@hbclogistique.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Rôle</Label>
                        <Select required>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="h-4 w-4 text-purple-600" />
                                        <span>Administrateur</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="moderator">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        <span>Modérateur</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="developer">
                                    <div className="flex items-center gap-2">
                                        <Code className="h-4 w-4 text-orange-600" />
                                        <span>Développeur</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[0.8rem] text-muted-foreground mt-1">
                            * Le développeur aura accès aux journaux techniques.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Envoi..." : "Envoyer l'invitation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
