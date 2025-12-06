"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

export function StepContact() {
    const { control } = useFormContext();

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="grid gap-4">
                <FormField
                    control={control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Nom complet</FormLabel>
                            <FormControl>
                                <Input placeholder="Votre nom" className="h-12 bg-muted/20" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="votre@email.com" className="h-12 bg-muted/20" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Téléphone</FormLabel>
                            <FormControl>
                                <Input placeholder="06 12 34 56 78" className="h-12 bg-muted/20" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
