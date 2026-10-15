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
import {
    Boxes,
    Package,
    Building2,
    Cog,
    Layers,
    Sparkles,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEM_OPTIONS = [
    {
        value: "materiaux",
        label: "Matériaux de construction",
        shortLabel: "Matériaux",
        icon: Boxes,
    },
    {
        value: "containers",
        label: "Containers",
        shortLabel: "Containers",
        icon: Package,
    },
    {
        value: "charpentes",
        label: "Charpentes",
        shortLabel: "Charpentes",
        icon: Building2,
    },
    {
        value: "machines",
        label: "Machines industrielles",
        shortLabel: "Machines",
        icon: Cog,
    },
    {
        value: "modules",
        label: "Modules préfabriqués",
        shortLabel: "Modules",
        icon: Layers,
    },
    {
        value: "autre",
        label: "Autre demande spécifique",
        shortLabel: "Autre",
        icon: Sparkles,
    },
] as const;

export function StepItemType() {
    const { control } = useFormContext();

    return (
        <div className="animate-in fade-in slide-in-from-right-8 space-y-6 duration-500">
            <FormField
                control={control}
                name="itemType"
                render={({ field }) => (
                    <div className="space-y-4">
                        <FormItem>
                            <FormLabel className="text-lg font-medium">
                                Type de marchandise
                            </FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                            >
                                <FormControl>
                                    <SelectTrigger className="bg-muted/20 border-muted-foreground/20 focus:ring-primary/20 h-14 text-base sm:text-lg">
                                        <SelectValue placeholder="Sélectionnez un type..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ITEM_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>

                        <div>
                            <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wider">
                                Ou sélection rapide
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {ITEM_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const isSelected =
                                        field.value === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                field.onChange(opt.value)
                                            }
                                            aria-pressed={isSelected}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                isSelected
                                                    ? "border-primary bg-primary/10 text-primary shadow-sm font-semibold ring-1 ring-primary/30"
                                                    : "border-border/60 bg-card/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
                                            )}
                                        >
                                            {isSelected && (
                                                <div className="bg-primary text-primary-foreground absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full">
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                </div>
                                            )}
                                            <Icon className={cn("h-6 w-6 transition-transform", isSelected && "scale-110 text-primary")} />
                                            <span className="text-xs sm:text-sm">
                                                {opt.shortLabel}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
