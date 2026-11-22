"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Check, Minus, Plus, Sparkles, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    formatFcfaRate,
    formatQuantityBadge,
    VEHICLE_CATEGORY_META,
    type FleetVehicleItem,
} from "@/lib/fleet-catalog";

interface StepVehicleProps {
    vehicles: FleetVehicleItem[];
    isLoading: boolean;
}

export function StepVehicle({ vehicles, isLoading }: StepVehicleProps) {
    const { watch, setValue } = useFormContext();
    const itemType = (watch("itemType") as string) || "";
    const selectedVehicleId = (watch("vehicleId") as string) || "";
    const vehicleQuantity = (watch("vehicleQuantity") as number) || 1;

    const sortedVehicles = useMemo(() => {
        return [...vehicles].sort((a, b) => {
            const aRec = itemType && a.recommendedFor.includes(itemType) ? 1 : 0;
            const bRec = itemType && b.recommendedFor.includes(itemType) ? 1 : 0;
            if (aRec !== bRec) return bRec - aRec;
            if (a.availableQuantity > 0 && b.availableQuantity === 0) return -1;
            if (a.availableQuantity === 0 && b.availableQuantity > 0) return 1;
            return a.sortOrder - b.sortOrder;
        });
    }, [vehicles, itemType]);

    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

    const handleSelect = (vehicle: FleetVehicleItem) => {
        if (vehicle.availableQuantity <= 0) return;
        if (selectedVehicleId === vehicle.id) {
            setValue("vehicleId", "");
            setValue("vehicleQuantity", 1);
            return;
        }
        setValue("vehicleId", vehicle.id);
        setValue("vehicleQuantity", 1);
    };

    const handleClearSelection = () => {
        setValue("vehicleId", "");
        setValue("vehicleQuantity", 1);
    };

    const handleQuantityChange = (delta: number) => {
        if (!selectedVehicle) return;
        const maxQty = Math.max(1, selectedVehicle.availableQuantity);
        const next = Math.max(1, Math.min(maxQty, vehicleQuantity + delta));
        setValue("vehicleQuantity", next);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-28 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-8 space-y-5 duration-500">
            {/* Option par défaut : laisser HBC choisir */}
            <button
                type="button"
                onClick={handleClearSelection}
                className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all",
                    !selectedVehicleId
                        ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                        : "border-border hover:border-primary/40"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary rounded-lg p-2">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">
                            Laisser HBC Logistique recommander le véhicule optimal
                        </p>
                        <p className="text-muted-foreground text-xs">
                            Idéal si vous souhaitez que nos dispatchers choisissent
                            l&apos;engin adapté à votre chargement.
                        </p>
                    </div>
                </div>
                {!selectedVehicleId && (
                    <Check className="text-primary h-5 w-5 shrink-0" />
                )}
            </button>

            {/* Liste des véhicules disponibles */}
            <div className="grid max-h-[340px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {sortedVehicles.map((vehicle) => {
                    const isSelected = selectedVehicleId === vehicle.id;
                    const isAvailable = vehicle.availableQuantity > 0;
                    const isRecommended =
                        Boolean(itemType) &&
                        vehicle.recommendedFor.includes(itemType);

                    return (
                        <button
                            key={vehicle.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleSelect(vehicle)}
                            className={cn(
                                "relative flex flex-col justify-between gap-2.5 rounded-xl border p-3.5 text-left transition-all",
                                !isAvailable &&
                                    "bg-muted/40 cursor-not-allowed opacity-60",
                                isAvailable &&
                                    !isSelected &&
                                    "border-border hover:border-primary/50 hover:bg-muted/20",
                                isSelected &&
                                    "border-primary bg-primary/5 ring-primary/20 ring-2"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Truck className="text-primary h-4 w-4 shrink-0" />
                                    <span className="text-sm leading-tight font-semibold">
                                        {vehicle.name}
                                    </span>
                                </div>
                                {isSelected && (
                                    <Check className="text-primary h-4 w-4 shrink-0" />
                                )}
                            </div>

                            <p className="text-muted-foreground text-xs">
                                {vehicle.capacityLabel}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                                <Badge
                                    variant="outline"
                                    className={
                                        isAvailable
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-700 dark:text-emerald-300"
                                            : "border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300"
                                    }
                                >
                                    {formatQuantityBadge(
                                        vehicle.availableQuantity
                                    )}
                                </Badge>

                                <div className="flex items-center gap-1.5">
                                    {isRecommended && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px]"
                                        >
                                            Recommandé
                                        </Badge>
                                    )}
                                    <span className="text-muted-foreground text-[11px] font-medium">
                                        {VEHICLE_CATEGORY_META[vehicle.category].shortLabel}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Sélecteur de quantité si un véhicule est choisi */}
            {selectedVehicle && (
                <div className="bg-muted/30 flex flex-col items-start justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold">
                            Véhicule sélectionné : {selectedVehicle.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            Tarif indicatif :{" "}
                            {formatFcfaRate(selectedVehicle.dailyRateFcfa)} •
                            Stock max : {selectedVehicle.availableQuantity}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Quantité :</span>
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={vehicleQuantity <= 1}
                            aria-label="Réduire la quantité de véhicules"
                            className="h-9 w-9"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center font-mono text-sm font-bold">
                            {String(vehicleQuantity).padStart(2, "0")}
                        </span>
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => handleQuantityChange(1)}
                            disabled={
                                vehicleQuantity >=
                                selectedVehicle.availableQuantity
                            }
                            aria-label="Augmenter la quantité de véhicules"
                            className="h-9 w-9"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
