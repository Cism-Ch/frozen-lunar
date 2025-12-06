"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LocationPicker } from "../../LocationPicker"; // Adjust import path
import { useFormContext } from "react-hook-form";
import { ReactNode } from "react";

interface StepLocationProps {
    name: string;
    label: string;
    placeholder: string;
    icon: ReactNode;
}

export function StepLocation({ name, label, placeholder, icon }: StepLocationProps) {
    const { control } = useFormContext();

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-lg font-medium">{label}</FormLabel>
                        <FormControl>
                            <LocationPicker
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={placeholder}
                                icon={icon}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
