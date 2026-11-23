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
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
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
import {
    AnimatedCard,
    CountUp,
    FadeIn,
    ScrollReveal,
    motion,
} from "@/components/ui/motion";
import {
    formatFcfaRate,
    formatQuantityBadge,
    resolveVehicleImageUrl,
    VEHICLE_CATEGORY_META,
    type FleetVehicleCategory,
    type FleetVehicleItem,
} from "@/lib/fleet-catalog";
import {
    FleetLayoutToggle,
    FleetPaginationBar,
    useFleetGridLayout,
} from "@/components/features/fleet/FleetGridControls";

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
    const [selectedCategory, setSelectedCategory] = useState<
        "ALL" | FleetVehicleCategory
    >("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>(
        {}
    );
    const {
        activeColumns,
        viewportMaxCols,
        pageSize,
        gridClassName,
        setColumns,
    } = useFleetGridLayout();

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

    const totalPages = Math.max(
        1,
        Math.ceil(filteredVehicles.length / pageSize)
    );
    const safePage = Math.min(currentPage, totalPages);
    const paginatedVehicles = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredVehicles.slice(start, start + pageSize);
    }, [filteredVehicles, safePage, pageSize]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section — Aligné sur /services et /about */}
                <SectionContainer className="from-muted/50 to-background bg-gradient-to-b pt-20 pb-16 md:pt-32 md:pb-24">
                    <FadeIn
                        direction="up"
                        className="mx-auto max-w-3xl space-y-6 text-center"
                    >
                        <Badge variant="outline" className="mb-2 gap-1.5">
                            <ShieldCheck className="text-primary h-3.5 w-3.5" />
                            Notre Flotte • Côte d&apos;Ivoire
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Nos Véhicules &amp;{" "}
                            <motion.span
                                className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: 0.3,
                                    type: "spring",
                                    stiffness: 200,
                                }}
                            >
                                Engins Disponibles
                            </motion.span>
                        </h1>
                        <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
                            Du <strong>Bus 64 places</strong> au{" "}
                            <strong>Porte-char 70 Tonnes</strong>, consultez en
                            temps réel les véhicules disponibles dans notre parc
                            pour vos transports et chantiers partout en Côte
                            d&apos;Ivoire.
                        </p>
                    </FadeIn>

                    {/* Bandeau KPIs avec CountUp */}
                    <FadeIn direction="up" delay={0.25}>
                        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
                            <Card className="hover:border-primary/50 border-2 text-center transition-colors">
                                <CardContent className="p-6">
                                    <div className="text-primary text-3xl font-bold md:text-4xl">
                                        <CountUp
                                            to={stats.modelsCount}
                                            duration={1.5}
                                        />
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-sm font-medium">
                                        Modèles de véhicules
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="hover:border-primary/50 border-2 text-center transition-colors">
                                <CardContent className="p-6">
                                    <div className="text-3xl font-bold text-emerald-600 md:text-4xl dark:text-emerald-400">
                                        <CountUp
                                            to={stats.availableUnits}
                                            duration={1.8}
                                        />{" "}
                                        / {stats.totalUnits}
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-sm font-medium">
                                        Unités disponibles immédiatement
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="hover:border-primary/50 border-2 text-center transition-colors">
                                <CardContent className="p-6">
                                    <div className="text-primary flex items-center justify-center gap-1.5 text-xl font-bold md:text-2xl">
                                        <MapPin className="h-5 w-5 shrink-0" />
                                        <span>Abidjan &amp; Intérieur CI</span>
                                    </div>
                                    <p className="text-muted-foreground mt-2 text-sm font-medium">
                                        Couverture nationale Côte d&apos;Ivoire
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </FadeIn>
                </SectionContainer>

                {/* Section Catalogue & Grille des Véhicules */}
                <SectionContainer className="bg-background pt-6 md:pt-10">
                    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <Tabs
                            value={selectedCategory}
                            onValueChange={(val) => {
                                setSelectedCategory(
                                    val as "ALL" | FleetVehicleCategory
                                );
                                setCurrentPage(1);
                            }}
                            className="w-full lg:w-auto"
                        >
                            <TabsList className="no-scrollbar flex h-auto w-full flex-nowrap justify-start gap-1 overflow-x-auto p-1 sm:flex-wrap">
                                <TabsTrigger
                                    value="ALL"
                                    className="min-h-[40px] shrink-0"
                                >
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
                                        className="min-h-[40px] shrink-0"
                                    >
                                        {VEHICLE_CATEGORY_META[cat].shortLabel}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                            <div className="relative w-full sm:w-64">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Rechercher (Bus, Benne, 4x4...)"
                                    aria-label="Rechercher un véhicule dans la flotte"
                                    className="min-h-[44px] pl-9"
                                />
                            </div>
                            <FleetLayoutToggle
                                activeColumns={activeColumns}
                                viewportMaxCols={viewportMaxCols}
                                onSelect={(cols) => {
                                    setColumns(cols);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {filteredVehicles.length === 0 ? (
                        <Card className="border-2 p-12 text-center">
                            <p className="text-muted-foreground text-base">
                                Aucun véhicule ne correspond à votre recherche.
                                Essayez une autre catégorie ou contactez notre
                                équipe pour un affrètement sur mesure en Côte
                                d&apos;Ivoire.
                            </p>
                        </Card>
                    ) : (
                        <>
                        <div
                            key={`${selectedCategory}-${searchQuery}-${safePage}-${activeColumns}`}
                            className={gridClassName}
                        >
                            {paginatedVehicles.map((vehicle, index) => {
                                const catMeta =
                                    VEHICLE_CATEGORY_META[vehicle.category];
                                const CategoryIcon = getCategoryIcon(
                                    vehicle.category
                                );
                                const isAvailable =
                                    vehicle.availableQuantity > 0;
                                const imgUrl = resolveVehicleImageUrl(vehicle);
                                const imgFailed = failedImages[vehicle.id];

                                return (
                                    <motion.div
                                        key={vehicle.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: Math.min(index * 0.04, 0.24),
                                        }}
                                        className="h-full min-w-0"
                                    >
                                        <AnimatedCard
                                            hoverEffect="lift"
                                            className="h-full"
                                        >
                                            <Card className="group hover:border-primary/50 relative flex h-full flex-col overflow-hidden border-2 transition-all duration-300 hover:shadow-xl">
                                                {/* Image d'illustration du véhicule */}
                                                <div
                                                    className={`relative aspect-16/10 w-full overflow-hidden border-b bg-gradient-to-br ${catMeta.accentClass}`}
                                                >
                                                    {!imgFailed ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img
                                                            src={imgUrl}
                                                            alt={`${vehicle.name} — ${vehicle.capacityLabel}`}
                                                            loading="lazy"
                                                            onError={() =>
                                                                setFailedImages(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [vehicle.id]:
                                                                            true,
                                                                    })
                                                                )
                                                            }
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <CategoryIcon className="text-primary/40 h-20 w-20" />
                                                        </div>
                                                    )}

                                                    {/* Voile dégradé pour lisibilité des badges */}
                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />

                                                    {/* Badges Haut : Catégorie & Stock en direct */}
                                                    <div className="absolute top-3 right-3 left-3 flex items-start justify-between gap-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-background/90 text-foreground backdrop-blur-sm"
                                                        >
                                                            {catMeta.shortLabel}
                                                        </Badge>

                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                isAvailable
                                                                    ? "border-emerald-400/60 bg-emerald-950/85 font-semibold text-emerald-300 backdrop-blur-sm"
                                                                    : "border-amber-400/60 bg-amber-950/85 font-semibold text-amber-300 backdrop-blur-sm"
                                                            }
                                                        >
                                                            {formatQuantityBadge(
                                                                vehicle.availableQuantity
                                                            )}
                                                        </Badge>
                                                    </div>

                                                    {/* Bandeau Bas Image : Tarif Journalier FCFA */}
                                                    <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between text-white">
                                                        <div className="bg-primary/90 rounded-lg p-2 text-white shadow-sm backdrop-blur-sm">
                                                            <CategoryIcon className="h-5 w-5" />
                                                        </div>
                                                        <div className="rounded-lg bg-black/65 px-3 py-1.5 text-right backdrop-blur-sm">
                                                            <span className="block text-[10px] tracking-wider text-white/75 uppercase">
                                                                Tarif indicatif
                                                            </span>
                                                            <span className="text-sm font-bold text-white">
                                                                {formatFcfaRate(
                                                                    vehicle.dailyRateFcfa
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <CardHeader className="pb-3">
                                                    <CardTitle className="group-hover:text-primary text-xl font-bold transition-colors">
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

                                                    {vehicle.specs.length >
                                                        0 && (
                                                        <div className="space-y-1.5">
                                                            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                                                                Utilités &amp;
                                                                Usages :
                                                            </p>
                                                            <ul className="space-y-1.5 text-xs">
                                                                {vehicle.specs.map(
                                                                    (spec) => (
                                                                        <li
                                                                            key={
                                                                                spec
                                                                            }
                                                                            className="text-foreground/85 flex items-start gap-2"
                                                                        >
                                                                            <CheckCircle2 className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                                            <span>
                                                                                {
                                                                                    spec
                                                                                }
                                                                            </span>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
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
                                                        className="group/btn min-h-[44px] w-full gap-2 font-semibold"
                                                    >
                                                        <Link
                                                            href={`/devis?vehicle=${encodeURIComponent(vehicle.slug)}`}
                                                        >
                                                            {isAvailable
                                                                ? "Réserver ce véhicule"
                                                                : "Demander une disponibilité"}
                                                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                                        </Link>
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        </AnimatedCard>
                                    </motion.div>
                                );
                            })}
                        </div>
                        <FleetPaginationBar
                            currentPage={safePage}
                            totalPages={totalPages}
                            totalItems={filteredVehicles.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                        </>
                    )}
                </SectionContainer>

                {/* CTA Section — Aligné sur /services */}
                <SectionContainer className="bg-muted/30">
                    <ScrollReveal className="mx-auto max-w-2xl space-y-8 text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Besoin d&apos;un affrètement multi-véhicules ou
                            convoi spécialisé ?
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Notre cellule d&apos;exploitation à Abidjan mobilise
                            les camions, bennes, porte-chars et bus adaptés à
                            votre cahier des charges partout en Côte
                            d&apos;Ivoire.
                        </p>
                        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    size="lg"
                                    className="group h-14 px-8 text-lg font-semibold"
                                    asChild
                                >
                                    <Link href="/devis">
                                        Configurer un devis
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-8 text-lg font-semibold"
                                    asChild
                                >
                                    <Link href="/partenaires">
                                        Inscrire ma flotte partenaire
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>
                    </ScrollReveal>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
