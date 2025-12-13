"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { MessageSquare } from "lucide-react";

export function StepNotes() {
    const { control } = useFormContext();

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="font-medium">Notes supplémentaires</h3>
                    <p className="text-sm text-muted-foreground">Facultatif - mais utile pour nous</p>
                </div>
            </div>

            <FormField
                control={control}
                name="userNotes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-medium">
                            Informations complémentaires
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Ex: Accès difficile, besoin d'une grue, horaires spéciaux, marchandise fragile..."
                                className="min-h-[120px] bg-muted/20 resize-none"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Décrivez toute contrainte ou information qui pourrait nous aider à mieux estimer votre transport.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mt-6">
                <p className="text-sm text-muted-foreground">
                    💡 <strong>Conseil:</strong> Plus vous nous donnez de détails, plus notre estimation sera précise.
                    N&apos;hésitez pas à mentionner les contraintes d&apos;accès, les équipements nécessaires, ou les horaires préférés.
                </p>
            </div>
        </div>
    );
}
