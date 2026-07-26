"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

export function StepItemType() {
    const { control } = useFormContext();

    return (
        <div className="animate-in fade-in slide-in-from-right-8 space-y-4 duration-500">
            <FormField
                control={control}
                name="itemType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-lg font-medium">
                            Type de marchandise
                        </FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger className="bg-muted/20 border-muted-foreground/20 focus:ring-primary/20 h-14 text-lg">
                                    <SelectValue placeholder="Sélectionnez un type..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="materiaux">
                                    Matériaux de construction
                                </SelectItem>
                                <SelectItem value="containers">
                                    Containers
                                </SelectItem>
                                <SelectItem value="charpentes">
                                    Charpentes
                                </SelectItem>
                                <SelectItem value="machines">
                                    Machines industrielles
                                </SelectItem>
                                <SelectItem value="modules">
                                    Modules préfabriqués
                                </SelectItem>
                                <SelectItem value="autre">
                                    Autre demande spécifique
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="mt-6 grid grid-cols-2 gap-4">
                {["Matériaux", "Containers", "Machines", "Autre"].map(
                    (item) => (
                        <div
                            key={item}
                            className="bg-muted/10 text-muted-foreground rounded-lg border p-4 text-center text-sm"
                        >
                            {item}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
