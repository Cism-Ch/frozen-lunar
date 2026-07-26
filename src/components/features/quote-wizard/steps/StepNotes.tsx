"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { MessageSquare } from "lucide-react";

export function StepNotes() {
    const { control } = useFormContext();

    return (
        <div className="animate-in fade-in slide-in-from-right-8 space-y-4 duration-500">
            <div className="mb-4 flex items-center gap-3">
                <div className="bg-muted rounded-lg p-2">
                    <MessageSquare className="text-muted-foreground h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-medium">Notes supplémentaires</h3>
                    <p className="text-muted-foreground text-sm">
                        Facultatif - mais utile pour nous
                    </p>
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
                                className="bg-muted/20 min-h-[120px] resize-none"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Décrivez toute contrainte ou information qui
                            pourrait nous aider à mieux estimer votre transport.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="bg-primary/5 border-primary/20 mt-6 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                    💡 <strong>Conseil:</strong> Plus vous nous donnez de
                    détails, plus notre estimation sera précise. N&apos;hésitez
                    pas à mentionner les contraintes d&apos;accès, les
                    équipements nécessaires, ou les horaires préférés.
                </p>
            </div>
        </div>
    );
}
