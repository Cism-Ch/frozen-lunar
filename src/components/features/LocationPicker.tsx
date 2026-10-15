"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Map as MapIcon, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface LocationPickerProps extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange"
> {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
}

export const LocationPicker = React.forwardRef<
    HTMLDivElement,
    LocationPickerProps
>(({ value, onChange, placeholder, icon, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const handleGeolocation = () => {
        setIsLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // In a real app, we would use a Geocoding API here to convert coords to address
                    // For demo purposes, we'll simulate it or just show coordinates
                    const { latitude, longitude } = position.coords;

                    // Simulating API call delay
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    // Mock address for demo
                    const mockAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Position actuelle)`;
                    onChange(mockAddress);
                    setIsLoading(false);
                    toast.success("Position trouvée !");
                },
                (error) => {
                    console.error(error);
                    toast.error("Impossible de récupérer votre position.");
                    setIsLoading(false);
                }
            );
        } else {
            toast.error(
                "La géolocalisation n'est pas supportée par votre navigateur."
            );
            setIsLoading(false);
        }
    };

    return (
        <div className="flex gap-2" ref={ref} {...props}>
            <div className="relative flex-1">
                {icon && (
                    <div className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2">
                        {icon}
                    </div>
                )}
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`bg-muted/20 border-muted-foreground/20 focus:ring-primary/20 h-14 text-lg ${icon ? "pl-12" : ""}`}
                />
            </div>

            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Utiliser ma position actuelle"
                className="border-muted-foreground/20 bg-muted/20 hover:bg-muted/30 h-14 w-14 shrink-0"
                onClick={handleGeolocation}
                title="Utiliser ma position"
            >
                {isLoading ? (
                    <Loader2 className="text-primary h-5 w-5 animate-spin" />
                ) : (
                    <Navigation className="text-primary h-5 w-5" />
                )}
            </Button>

            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Choisir une adresse sur la carte"
                        className="border-muted-foreground/20 bg-muted/20 hover:bg-muted/30 h-14 w-14 shrink-0"
                        title="Choisir sur la carte"
                    >
                        <MapIcon className="text-primary h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Choisir une localisation</DialogTitle>
                        <DialogDescription>
                            Sélectionnez l&apos;adresse exacte sur la carte.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted/30 border-border/60 relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border">
                        {/* Stylized vector map grid background */}
                        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
                        <svg
                            className="text-border/80 absolute inset-0 h-full w-full stroke-current"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                        >
                            <path
                                d="M0 60 Q 150 90, 300 40 T 600 80"
                                strokeWidth="3"
                                strokeDasharray="6 4"
                            />
                            <path
                                d="M100 0 Q 120 150, 180 300"
                                strokeWidth="2"
                            />
                            <path
                                d="M450 0 Q 420 120, 500 300"
                                strokeWidth="2"
                            />
                            <path
                                d="M0 180 C 200 210, 400 150, 600 200"
                                strokeWidth="4"
                                className="text-primary/30"
                            />
                        </svg>

                        {/* Simulated Pin on Map */}
                        <div className="relative z-10 flex flex-col items-center gap-1">
                            <MapPin className="text-primary h-10 w-10 animate-bounce drop-shadow-md" />
                            <div className="bg-background/90 rounded-full border px-3 py-1 text-xs font-semibold shadow-md backdrop-blur">
                                Position sélectionnée
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsMapOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={() => {
                                onChange(
                                    "123 Avenue des Champs-Élysées, 75008 Paris"
                                ); // Mock selection
                                setIsMapOpen(false);
                                toast.success(
                                    "Adresse sélectionnée sur la carte"
                                );
                            }}
                        >
                            Confirmer cette position
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
});
LocationPicker.displayName = "LocationPicker";
