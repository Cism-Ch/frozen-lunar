"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback, useId } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
    MapPin,
    Navigation,
    Map as MapIcon,
    Loader2,
    Search,
    AlertCircle,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    DEFAULT_MAP_CENTER,
    reverseGeocode,
    searchAddresses,
    type LocationSuggestion,
} from "@/lib/geocoding";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

const InteractiveLocationMap = dynamic(
    () =>
        import("@/components/features/InteractiveLocationMap").then(
            (mod) => mod.InteractiveLocationMap
        ),
    {
        ssr: false,
        loading: () => (
            <div className="border-border/60 relative flex h-[280px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border sm:h-[360px]">
                <Skeleton className="absolute inset-0 h-full w-full" />
                <div className="bg-background/80 relative z-10 flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-sm backdrop-blur">
                    <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    <span>Chargement de la carte OpenStreetMap...</span>
                </div>
            </div>
        ),
    }
);

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
    const listboxId = useId();
    const [isGeoLoading, setIsGeoLoading] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    // États d'autocomplétion (loading, error, empty, data)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const skipNextSearchRef = useRef(false);

    // États de la carte interactive OpenStreetMap
    const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number }>({
        lat: DEFAULT_MAP_CENTER.lat,
        lon: DEFAULT_MAP_CENTER.lon,
    });
    const [mapPreviewAddress, setMapPreviewAddress] = useState<string>("");
    const [isResolvingMapAddress, setIsResolvingMapAddress] = useState(false);
    const mapAbortRef = useRef<AbortController | null>(null);

    // Recherche d'adresses avec debounce (300ms) via Photon (OpenStreetMap)
    useEffect(() => {
        if (skipNextSearchRef.current) {
            skipNextSearchRef.current = false;
            return;
        }

        const trimmed = value.trim();
        if (trimmed.length < 3) {
            setSuggestions([]);
            setSearchError(null);
            setIsSearching(false);
            setIsPopoverOpen(false);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setIsSearching(true);
            setSearchError(null);
            setIsPopoverOpen(true);

            const result = await searchAddresses(trimmed, controller.signal);
            if (controller.signal.aborted) return;

            if (result.success) {
                setSuggestions(result.data);
                setActiveIndex(result.data.length > 0 ? 0 : -1);
            } else {
                setSuggestions([]);
                setSearchError(result.error);
            }
            setIsSearching(false);
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [value]);

    // Résolution d'adresse en temps réel lors d'un clic ou glisser-déposer sur la carte
    const resolveMapPosition = useCallback(
        async (coords: { lat: number; lon: number }) => {
            setMapCoords(coords);
            mapAbortRef.current?.abort();
            const controller = new AbortController();
            mapAbortRef.current = controller;

            setIsResolvingMapAddress(true);
            const result = await reverseGeocode(
                coords.lat,
                coords.lon,
                controller.signal
            );
            if (controller.signal.aborted) return;

            if (result.success) {
                setMapPreviewAddress(result.data.label);
            } else {
                setMapPreviewAddress(
                    `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`
                );
            }
            setIsResolvingMapAddress(false);
        },
        []
    );

    // Nettoyer la requête en cours à la fermeture du composant
    useEffect(() => {
        return () => {
            mapAbortRef.current?.abort();
        };
    }, []);

    const handleSelectSuggestion = (item: LocationSuggestion) => {
        skipNextSearchRef.current = true;
        onChange(item.label);
        setMapCoords({ lat: item.lat, lon: item.lon });
        setMapPreviewAddress(item.label);
        setSuggestions([]);
        setIsPopoverOpen(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isPopoverOpen || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : suggestions.length - 1
            );
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            const selected = suggestions[activeIndex];
            if (selected) {
                handleSelectSuggestion(selected);
            }
        } else if (e.key === "Escape") {
            setIsPopoverOpen(false);
        }
    };

    const handleGeolocation = () => {
        if (!("geolocation" in navigator)) {
            toast.error(
                "La géolocalisation n'est pas supportée par votre navigateur."
            );
            return;
        }

        setIsGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setMapCoords({ lat: latitude, lon: longitude });

                const result = await reverseGeocode(latitude, longitude);
                const resolvedLabel = result.success
                    ? result.data.label
                    : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

                skipNextSearchRef.current = true;
                onChange(resolvedLabel);
                setMapPreviewAddress(resolvedLabel);
                setIsPopoverOpen(false);
                setIsGeoLoading(false);
                toast.success("Position GPS détectée !");
            },
            (error) => {
                logger.error("Erreur de géolocalisation", error);
                toast.error(
                    "Impossible de récupérer votre position. Vérifiez les permissions GPS."
                );
                setIsGeoLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    };

    const handleOpenMapModal = () => {
        setIsPopoverOpen(false);
        setIsMapOpen(true);
        if (!mapPreviewAddress) {
            void resolveMapPosition(mapCoords);
        }
    };

    const handleConfirmMapSelection = () => {
        const finalAddress =
            mapPreviewAddress.trim() ||
            `${mapCoords.lat.toFixed(5)}, ${mapCoords.lon.toFixed(5)}`;
        skipNextSearchRef.current = true;
        onChange(finalAddress);
        setIsMapOpen(false);
        toast.success("Adresse sélectionnée sur la carte");
    };

    return (
        <div
            className={cn(
                "flex flex-col gap-2 sm:flex-row sm:items-center",
                props.className
            )}
            ref={ref}
            {...props}
        >
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverAnchor asChild>
                    <div className="relative flex-1">
                        {icon && (
                            <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 sm:left-4">
                                {icon}
                            </div>
                        )}
                        <Input
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => {
                                if (
                                    value.trim().length >= 3 &&
                                    (suggestions.length > 0 ||
                                        isSearching ||
                                        searchError)
                                ) {
                                    setIsPopoverOpen(true);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            role="combobox"
                            aria-expanded={isPopoverOpen}
                            aria-controls={listboxId}
                            aria-autocomplete="list"
                            aria-activedescendant={
                                activeIndex >= 0 && suggestions[activeIndex]
                                    ? `${listboxId}-option-${activeIndex}`
                                    : undefined
                            }
                            autoComplete="off"
                            className={cn(
                                "bg-muted/20 border-muted-foreground/20 focus:ring-primary/20 h-12 pr-10 text-sm sm:h-14 sm:text-base",
                                icon ? "pl-10 sm:pl-12" : "pl-3.5 sm:pl-4"
                            )}
                        />
                        {value && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    onChange("");
                                    setSuggestions([]);
                                    setIsPopoverOpen(false);
                                }}
                                aria-label="Effacer l'adresse"
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 h-8 w-8 -translate-y-1/2"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </PopoverAnchor>

                <PopoverContent
                    align="start"
                    sideOffset={6}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-1.5"
                >
                    <AnimatePresence mode="wait">
                        {isSearching ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-2 p-2"
                                aria-live="polite"
                            >
                                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Recherche d&apos;adresses...</span>
                                </div>
                                <Skeleton className="h-9 w-full rounded-md" />
                                <Skeleton className="h-9 w-4/5 rounded-md" />
                            </motion.div>
                        ) : searchError ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-destructive flex items-start gap-2.5 p-3 text-xs"
                                role="alert"
                            >
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{searchError}</span>
                            </motion.div>
                        ) : suggestions.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-muted-foreground flex flex-col items-center gap-1.5 p-4 text-center text-xs"
                            >
                                <Search className="h-4 w-4 opacity-60" />
                                <p>Aucune adresse trouvée pour cette saisie.</p>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={handleOpenMapModal}
                                >
                                    Choisir directement sur la carte
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                            >
                                <ScrollArea
                                    id={listboxId}
                                    role="listbox"
                                    aria-label="Suggestions d'adresses"
                                    className="max-h-64"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        {suggestions.map((item, idx) => {
                                            const isActive =
                                                idx === activeIndex;
                                            return (
                                                <Button
                                                    key={item.id}
                                                    id={`${listboxId}-option-${idx}`}
                                                    type="button"
                                                    variant="ghost"
                                                    role="option"
                                                    aria-selected={isActive}
                                                    onClick={() =>
                                                        handleSelectSuggestion(
                                                            item
                                                        )
                                                    }
                                                    onMouseEnter={() =>
                                                        setActiveIndex(idx)
                                                    }
                                                    className={cn(
                                                        "h-auto min-h-[44px] w-full justify-start gap-2.5 px-2.5 py-2 text-left font-normal whitespace-normal",
                                                        isActive &&
                                                            "bg-accent text-accent-foreground"
                                                    )}
                                                >
                                                    <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0 self-start" />
                                                    <span className="flex flex-col">
                                                        <span className="text-sm leading-snug font-medium">
                                                            {item.primaryText}
                                                        </span>
                                                        {item.secondaryText && (
                                                            <span className="text-muted-foreground text-xs leading-tight">
                                                                {
                                                                    item.secondaryText
                                                                }
                                                            </span>
                                                        )}
                                                    </span>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </PopoverContent>
            </Popover>

            {/* Actions tactiles sur mobile (boutons >= 44px avec labels explicites) */}
            <div className="flex items-center gap-2 sm:hidden">
                <Button
                    type="button"
                    variant="outline"
                    className="border-muted-foreground/20 bg-muted/20 hover:bg-muted/30 min-h-[44px] flex-1 gap-2 text-xs font-medium"
                    onClick={handleGeolocation}
                    disabled={isGeoLoading}
                    aria-label="Utiliser ma position GPS actuelle"
                >
                    {isGeoLoading ? (
                        <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    ) : (
                        <Navigation className="text-primary h-4 w-4" />
                    )}
                    <span>Position GPS</span>
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="border-muted-foreground/20 bg-muted/20 hover:bg-muted/30 min-h-[44px] flex-1 gap-2 text-xs font-medium"
                    onClick={handleOpenMapModal}
                    aria-label="Choisir une adresse sur la carte interactive"
                >
                    <MapIcon className="text-primary h-4 w-4" />
                    <span>Sur la carte</span>
                </Button>
            </div>

            {/* Actions sur desktop (boutons carrés 56px côte à côte avec l'input) */}
            <div className="hidden sm:flex sm:items-center sm:gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Utiliser ma position actuelle"
                    className="border-muted-foreground/20 bg-muted/20 hover:bg-muted/30 h-14 w-14 shrink-0"
                    onClick={handleGeolocation}
                    disabled={isGeoLoading}
                    title="Utiliser ma position GPS"
                >
                    {isGeoLoading ? (
                        <Loader2 className="text-primary h-5 w-5 animate-spin" />
                    ) : (
                        <Navigation className="text-primary h-5 w-5" />
                    )}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Choisir une adresse sur la carte"
                    className="border-muted-foreground/20 bg-muted/20 hover:bg-muted/30 h-14 w-14 shrink-0"
                    onClick={handleOpenMapModal}
                    title="Choisir sur la carte interactive"
                >
                    <MapIcon className="text-primary h-5 w-5" />
                </Button>
            </div>

            {/* Modale shadcn de sélection sur carte OpenStreetMap (Leaflet) */}
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto p-4 sm:max-w-[640px] sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Choisir une localisation</DialogTitle>
                        <DialogDescription>
                            Cliquez sur la carte ou déplacez le marqueur pour
                            sélectionner l&apos;adresse exacte.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        {isMapOpen && (
                            <InteractiveLocationMap
                                position={mapCoords}
                                onSelectPosition={(coords) => {
                                    void resolveMapPosition(coords);
                                }}
                            />
                        )}

                        <motion.div
                            layout
                            className="bg-muted/30 border-border/60 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex min-w-0 items-start gap-2.5">
                                <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    {isResolvingMapAddress ? (
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-28" />
                                        </div>
                                    ) : (
                                        <>
                                            <p className="truncate text-sm font-medium">
                                                {mapPreviewAddress ||
                                                    "Cliquez sur la carte pour choisir"}
                                            </p>
                                            <Badge
                                                variant="secondary"
                                                className="mt-1 font-mono text-[11px]"
                                            >
                                                {mapCoords.lat.toFixed(5)},{" "}
                                                {mapCoords.lon.toFixed(5)}
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="min-h-[44px] shrink-0 gap-1.5 sm:min-h-[36px]"
                                onClick={handleGeolocation}
                                disabled={isGeoLoading}
                            >
                                {isGeoLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Navigation className="h-3.5 w-3.5" />
                                )}
                                <span>Ma position</span>
                            </Button>
                        </motion.div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-[44px] w-full sm:w-auto"
                            onClick={() => setIsMapOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            className="min-h-[44px] w-full sm:w-auto"
                            disabled={isResolvingMapAddress}
                            onClick={handleConfirmMapSelection}
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
