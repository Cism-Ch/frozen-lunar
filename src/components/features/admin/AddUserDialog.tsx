"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createUserAction } from "@/app/actions/user-management";
import { toast } from "sonner";

export function AddUserDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await createUserAction(formData);

        if (result.success) {
            toast.success(result.message);
            setOpen(false);
            (e.target as HTMLFormElement).reset();
        } else {
            toast.error(result.error);
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un utilisateur
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[440px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Ajouter un utilisateur</DialogTitle>
                        <DialogDescription>
                            Créez un nouvel accès au dashboard. Le mot de passe
                            devra être communiqué à l&apos;utilisateur.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4 sm:space-y-0">
                            <Label
                                htmlFor="name"
                                className="text-left text-sm font-medium sm:text-right"
                            >
                                Nom
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                className="col-span-3"
                                placeholder="Jean Dupont"
                                required
                                minLength={2}
                            />
                        </div>
                        <div className="space-y-1.5 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4 sm:space-y-0">
                            <Label
                                htmlFor="email"
                                className="text-left text-sm font-medium sm:text-right"
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                className="col-span-3"
                                placeholder="nom@hbclogistique.com"
                                required
                            />
                        </div>
                        <div className="space-y-1.5 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4 sm:space-y-0">
                            <Label
                                htmlFor="role"
                                className="text-left text-sm font-medium sm:text-right"
                            >
                                Rôle
                            </Label>
                            <Select name="role" defaultValue="user">
                                <SelectTrigger className="col-span-3 w-full">
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">
                                        Utilisateur
                                    </SelectItem>
                                    <SelectItem value="moderator">
                                        Modérateur
                                    </SelectItem>
                                    <SelectItem value="developer">
                                        Développeur
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        Administrateur
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4 sm:space-y-0">
                            <Label
                                htmlFor="password"
                                className="text-left text-sm font-medium sm:text-right"
                            >
                                Mot de passe
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                wrapperClassName="col-span-3"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="h-10 w-full sm:w-auto"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-10 w-full sm:w-auto"
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Créer le compte
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
