"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Bus,
    CheckCircle2,
    Container,
    HardHat,
    MapPin,
    Search,
    ShieldCheck,
    Truck,
    Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, usePrefersReducedMotion } from "@/components/ui/motion";
import { fadeInUp, staggerContainer, transitions } from "@/lib/animations";
import {
    formatFcfaRate,
    formatQuantityBadge,
    VEHICLE_CATEGORY_META,
    type FleetVehicleCategory,
    type FleetVehicleItem,
} from "@/lib/fleet-catalog";

interface FleetPortfolioClientProps {
    vehicles: FleetVehicleItem[];
}

function getCategoryIcon(category: FleetVehicleCategory) {
    switch (category) {
        case "PASSENGER":
            return Bus;
        case "CONTAINERS":
            return Container;
        case "MATERIALS":
            return HardHat;
        case "HEAVY_HAUL":
            return Wrench;
        case "UTILITY":
        default:
            return Truck;
    }
}

export function FleetPortfolioClient({ vehicles }: FleetPortfolioClientProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [selectedCategory, setSelectedCategory] = useState<
        "ALL" | FleetVehicleCategory
    >("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const stats = useMemo(() => {
        const totalUnits = vehicles.reduce(
            (sum, v) => sum + v.totalQuantity,
            0
        );
        const availableUnits = vehicles.reduce(
            (sum, v) => sum + v.availableQuantity,
            0
        );
        return {
            modelsCount: vehicles.length,
            totalUnits,
            availableUnits,
        };
    }, [vehicles]);

    const filteredVehicles = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return vehicles.filter((v) => {
            if (
                selectedCategory !== "ALL" &&
                v.category !== selectedCategory
            ) {
                return false;
            }
            if (!q) return true;
            return (
                v.name.toLowerCase().includes(q) ||
                v.capacityLabel.toLowerCase().includes(q) ||
                v.description.toLowerCase().includes(q) ||
                v.specs.some((s) => s.toLowerCase().includes(q))
            );
        });
    }, [vehicles, selectedCategory, searchQuery]);

    return (
        <div className="space-y-10">
            {/* Hero Portfolio */}
            <section className="from-primary/10 via-background to-muted/40 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 sm:p-10 lg:p-12">
                <div className="max-w-3xl space-y-4">
                    <Badge
                        variant="outline"
                        className="bg-background/80 gap-1.5 px-3 py-1 text-xs"
                    >
                        <ShieldCheck className="text-primary h-3.5 w-3.5" />
                        Flotte Certifiée OHADA • Côte d&apos;Ivoire &amp; CEDEAO
                    </Badge>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        Notre Flotte de Véhicules &amp; Engins
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                        Du <strong>Bus 64 places</strong> au{" "}
                        <strong>Porte-char 70 Tonnes</strong>, découvrez nos
                        véhicules entretenus, géolocalisés par GPS et
                        disponibles en temps réel pour vos opérations à Abidjan,
                        San-Pédro et sur les corridors ouest-africains.
                    </p>
                </div>

                {/* Bandeau KPIs Flotte */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-background/80 rounded-2xl border p-4 backdrop-blur">
                        <p className="text-muted-foreground text-xs font-medium uppercase">
                            Modèles de véhicules
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {stats.modelsCount} catégories
                        </p>
                    </div>
                    <div className="bg-background/80 rounded-2xl border p-4 backdrop-blur">
                        <p className="text-muted-foreground text-xs font-medium uppercase">
                            Disponibilité immédiate
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {String(stats.availableUnits).padStart(2, "0")}{" "}
                            unités prêtes
                        </p>
                    </div>
                    <div className="bg-background/80 rounded-2xl border p-4 backdrop-blur">
                        <p className="text-muted-foreground text-xs font-medium uppercase">
                            Zone d&apos;intervention
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-lg font-bold">
                            <MapPin className="text-primary h-4 w-4" />
                            CI • Mali • Burkina • Ghana
                        </p>
                    </div>
                </div>
            </section>

            {/* Filtres & Recherche */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <Tabs
                    value={selectedCategory}
                    onValueChange={(val) =>
                        setSelectedCategory(val as "ALL" | FleetVehicleCategory)
                    }
                    className="w-full lg:w-auto"
                >
                    <TabsList className="flex h-auto flex-wrap justify-start gap-1 p-1">
                        <TabsTrigger value="ALL" className="min-h-[40px]">
                            Toute la flotte ({vehicles.length})
                        </TabsTrigger>
                        {(
                            Object.keys(
                                VEHICLE_CATEGORY_META
                            ) as FleetVehicleCategory[]
                        ).map((cat) => (
                            <TabsTrigger
                                key={cat}
                                value={cat}
                                className="min-h-[40px]"
                            >
                                {VEHICLE_CATEGORY_META[cat].shortLabel}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="relative w-full lg:w-72">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher (Bus, Benne, 4x4...)"
                        aria-label="Rechercher un véhicule dans la flotte"
                        className="min-h-[44px] pl-9"
                    />
                </div>
            </div>

            {/* Grille Portfolio */}
            {filteredVehicles.length === 0 ? (
                <Card className="p-10 text-center">
                    <p className="text-muted-foreground text-sm">
                        Aucun véhicule ne correspond à votre recherche. Essayez
                        une autre catégorie ou contactez notre équipe pour une
                        affrètement sur mesure.
                    </p>
                </Card>
            ) : (
                <motion.div
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    initial={prefersReducedMotion ? false : "hidden"}
                    animate="visible"
                    variants={staggerContainer}
                >
                    {filteredVehicles.map((vehicle) => {
                        const catMeta = VEHICLE_CATEGORY_META[vehicle.category];
                        const CategoryIcon = getCategoryIcon(vehicle.category);
                        const isAvailable = vehicle.availableQuantity > 0;

                        return (
                            <motion.div
                                key={vehicle.id}
                                variants={fadeInUp}
                                transition={transitions.smooth}
                                className="h-full"
                            >
                                <Card className="group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
                                    {/* En-tête visuel stylisé */}
                                    <div
                                        className={`relative flex flex-col justify-between border-b bg-gradient-to-br p-5 ${catMeta.accentClass}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="bg-background/90 text-xs font-medium"
                                            >
                                                {catMeta.shortLabel}
                                            </Badge>

                                            <Badge
                                                variant="outline"
                                                className={
                                                    isAvailable
                                                        ? "border-emerald-500/40 bg-emerald-500/15 font-semibold text-emerald-700 dark:text-emerald-300"
                                                        : "border-amber-500/40 bg-amber-500/15 font-semibold text-amber-700 dark:text-amber-300"
                                                }
                                            >
                                                {formatQuantityBadge(
                                                    vehicle.availableQuantity
                                                )}
                                            </Badge>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="bg-background/90 text-primary rounded-2xl border p-3.5 shadow-sm transition-transform group-hover:scale-105">
                                                <CategoryIcon className="h-7 w-7" />
                                            </div>
                                            <div className="text-right">
                                                <span className="text-muted-foreground block text-[11px] uppercase">
                                                    Tarif indicatif
                                                </span>
                                                <span className="text-foreground text-sm font-bold">
                                                    {formatFcfaRate(
                                                        vehicle.dailyRateFcfa
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg leading-snug">
                                            {vehicle.name}
                                        </CardTitle>
                                        <CardDescription className="text-primary font-medium">
                                            {vehicle.capacityLabel}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-1 space-y-4">
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {vehicle.description}
                                        </p>

                                        {vehicle.specs.length > 0 && (
                                            <ul className="space-y-1.5 text-xs">
                                                {vehicle.specs.map((spec) => (
                                                    <li
                                                        key={spec}
                                                        className="text-foreground/85 flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 className="text-primary h-3.5 w-3.5 shrink-0" />
                                                        <span>{spec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>

                                    <CardFooter className="border-t pt-4">
                                        <Button
                                            asChild
                                            variant={
                                                isAvailable
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="min-h-[44px] w-full gap-2"
                                        >
                                            <Link
                                                href={`/?vehicle=${encodeURIComponent(vehicle.slug)}#devis`}
                                            >
                                                {isAvailable
                                                    ? "Réserver dans un devis"
                                                    : "Demander une disponibilité"}
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
