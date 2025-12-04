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

interface LocationPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
}

export const LocationPicker = React.forwardRef<HTMLDivElement, LocationPickerProps>(
    ({ value, onChange, placeholder, icon, ...props }, ref) => {
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
                        await new Promise(resolve => setTimeout(resolve, 1000));

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
                toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
                setIsLoading(false);
            }
        };

        return (
            <div className="flex gap-2" ref={ref} {...props}>
                <div className="relative flex-1">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`h-14 text-lg bg-muted/20 border-muted-foreground/20 focus:ring-primary/20 ${icon ? 'pl-12' : ''}`}
                    />
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 shrink-0 border-muted-foreground/20 bg-muted/20 hover:bg-muted/30"
                    onClick={handleGeolocation}
                    title="Utiliser ma position"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                        <Navigation className="h-5 w-5 text-primary" />
                    )}
                </Button>

                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-14 w-14 shrink-0 border-muted-foreground/20 bg-muted/20 hover:bg-muted/30"
                            title="Choisir sur la carte"
                        >
                            <MapIcon className="h-5 w-5 text-primary" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Choisir une localisation</DialogTitle>
                            <DialogDescription>
                                Sélectionnez l'adresse exacte sur la carte.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden group">
                            {/* Placeholder for Google Maps */}
                            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=48.8566,2.3522&zoom=13&size=600x300&key=YOUR_API_KEY')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all" />

                            {/* Simulated Pin on Map */}
                            <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full h-10 w-10 text-red-500 drop-shadow-lg animate-bounce z-0" />

                            <div className="z-10 text-center p-4 bg-background/80 backdrop-blur rounded-lg shadow-lg">
                                <MapIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="font-medium">Google Maps Integration</p>
                                <p className="text-xs text-muted-foreground mt-1">Nécessite une clé API Google Maps valide.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsMapOpen(false)}>Annuler</Button>
                            <Button onClick={() => {
                                onChange("123 Avenue des Champs-Élysées, 75008 Paris"); // Mock selection
                                setIsMapOpen(false);
                                toast.success("Adresse sélectionnée sur la carte");
                            }}>
                                Confirmer cette position
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
);
LocationPicker.displayName = "LocationPicker";
