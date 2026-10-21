"use client";

import { useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Truck, Layers } from "lucide-react";
import { Quote } from "@/lib/quote-storage";
import { motion } from "@/components/ui/motion";

interface BusinessAnalyticsProps {
    quotes: Quote[];
}

export function BusinessAnalytics({ quotes }: BusinessAnalyticsProps) {
    const [activeDonutView, setActiveDonutView] = useState<
        "channel" | "status"
    >("channel");
    const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

    // Calculs analytiques mémorisés
    const analytics = useMemo(() => {
        const total = quotes.length;

        // 1. Répartition par statut
        const validated = quotes.filter(
            (q) =>
                String(q.status).toUpperCase() === "VALIDATED" ||
                q.status === "Validé"
        ).length;
        const pending = quotes.filter(
            (q) =>
                String(q.status).toUpperCase() === "PENDING" ||
                q.status === "En attente"
        ).length;
        const rejected = quotes.filter(
            (q) =>
                String(q.status).toUpperCase() === "REJECTED" ||
                q.status === "Refusé"
        ).length;
        const conversionRate =
            total > 0 ? Math.round((validated / total) * 100) : 0;

        // 2. Répartition par canal (FORM vs CHAT)
        const chatSource = quotes.filter(
            (q) => String(q.source).toUpperCase() === "CHAT"
        ).length;
        const formSource = total - chatSource;
        const formPercent =
            total > 0 ? Math.round((formSource / total) * 100) : 0;
        const chatPercent = total > 0 ? 100 - formPercent : 0;

        // 3. Répartition par type de marchandise
        const itemTypeCounts: Record<string, number> = {};
        quotes.forEach((q) => {
            const type = q.type || "Non spécifié";
            itemTypeCounts[type] = (itemTypeCounts[type] || 0) + 1;
        });

        const topItemTypes = Object.entries(itemTypeCounts)
            .map(([type, count]) => ({
                type,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // 4. Calcul du montant total estimé (€)
        let totalRevenue = 0;
        let validAmountCount = 0;

        quotes.forEach((q) => {
            if (q.amount && q.amount !== "À calculer") {
                const numericStr = q.amount.replace(/[^0-9]/g, "");
                const val = parseInt(numericStr, 10);
                if (!isNaN(val) && val > 0) {
                    totalRevenue += val;
                    validAmountCount++;
                }
            }
        });

        const averageDealSize =
            validAmountCount > 0
                ? Math.round(totalRevenue / validAmountCount)
                : 0;

        // 5. Top Villes Origine & Destination (pickup & dropoff)
        const locationCounts: Record<string, number> = {};
        quotes.forEach((q) => {
            if (q.pickup) {
                const city = q.pickup.split(",")[0].trim();
                locationCounts[city] = (locationCounts[city] || 0) + 1;
            }
            if (q.dropoff) {
                const city = q.dropoff.split(",")[0].trim();
                locationCounts[city] = (locationCounts[city] || 0) + 1;
            }
        });

        const topLocations = Object.entries(locationCounts)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            total,
            validated,
            pending,
            rejected,
            conversionRate,
            formSource,
            chatSource,
            formPercent,
            chatPercent,
            topItemTypes,
            totalRevenue,
            averageDealSize,
            topLocations,
        };
    }, [quotes]);

    // Données pour le Donut Chart Canal
    const channelSlices = useMemo(() => {
        const total = analytics.total || 1;
        const radius = 45;
        const circumference = 2 * Math.PI * radius;

        const formLength = (analytics.formSource / total) * circumference;
        const chatLength = (analytics.chatSource / total) * circumference;

        return [
            {
                id: "form",
                label: "Formulaire Web",
                count: analytics.formSource,
                percent: analytics.formPercent,
                color: "#3b82f6",
                strokeDasharray: `${formLength} ${circumference}`,
                strokeDashoffset: 0,
            },
            {
                id: "chat",
                label: "Assistant IA",
                count: analytics.chatSource,
                percent: analytics.chatPercent,
                color: "#8b5cf6",
                strokeDasharray: `${chatLength} ${circumference}`,
                strokeDashoffset: -formLength,
            },
        ];
    }, [analytics]);

    // Données pour le Donut Chart Statut
    const statusSlices = useMemo(() => {
        const total = analytics.total || 1;
        const radius = 45;
        const circumference = 2 * Math.PI * radius;

        const valLength = (analytics.validated / total) * circumference;
        const pendLength = (analytics.pending / total) * circumference;
        const rejLength = (analytics.rejected / total) * circumference;

        return [
            {
                id: "validated",
                label: "Validés",
                count: analytics.validated,
                percent: Math.round((analytics.validated / total) * 100),
                color: "#10b981",
                strokeDasharray: `${valLength} ${circumference}`,
                strokeDashoffset: 0,
            },
            {
                id: "pending",
                label: "En attente",
                count: analytics.pending,
                percent: Math.round((analytics.pending / total) * 100),
                color: "#f59e0b",
                strokeDasharray: `${pendLength} ${circumference}`,
                strokeDashoffset: -valLength,
            },
            {
                id: "rejected",
                label: "Refusés",
                count: analytics.rejected,
                percent: Math.round((analytics.rejected / total) * 100),
                color: "#ef4444",
                strokeDasharray: `${rejLength} ${circumference}`,
                strokeDashoffset: -(valLength + pendLength),
            },
        ];
    }, [analytics]);

    const currentSlices =
        activeDonutView === "channel" ? channelSlices : statusSlices;

    // Filtrage et nettoyage des hubs logistiques (exclusion des coordonnées GPS pures comme '5.3871')
    const sanitizedLocations = useMemo(() => {
        return analytics.topLocations.filter((loc) => {
            const isCoord = /^-?\d+(\.\d+)?$/.test(loc.city.trim());
            return !isCoord && loc.city.trim().length > 1;
        });
    }, [analytics.topLocations]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <BarChart3 className="text-primary h-5 w-5" />
                        Analyses Métier & Typologie du Fret
                    </h2>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                        Répartition des flux par canal d&apos;acquisition,
                        statut opérationnel et typologie des marchandises.
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className="border-primary/30 text-primary w-fit px-2.5 py-0.5 font-mono text-xs"
                >
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Base PostgreSQL Synchronisée
                </Badge>
            </div>

            {/* Grille 2 Colonnes Rigoureusement Équilibrées : Donut Chart & Répartition du Fret */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* 1. DONUT CHART SVG INTERACTIF & HUBS LOGISTIQUES */}
                <Card className="border-border/60 bg-card flex flex-col justify-between">
                    <div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-base font-bold">
                                    {activeDonutView === "channel"
                                        ? "Répartition par Canal d'Acquisition"
                                        : "Répartition par Statut de Traitement"}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Visualisation circulaire proportionnelle en
                                    temps réel.
                                </CardDescription>
                            </div>

                            <div className="bg-muted inline-flex rounded-lg p-0.5 text-xs">
                                <button
                                    type="button"
                                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                                        activeDonutView === "channel"
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    onClick={() =>
                                        setActiveDonutView("channel")
                                    }
                                >
                                    Canal
                                </button>
                                <button
                                    type="button"
                                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                                        activeDonutView === "status"
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    onClick={() => setActiveDonutView("status")}
                                >
                                    Statut
                                </button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-2">
                            <div className="flex flex-col items-center justify-around gap-6 sm:flex-row">
                                {/* Cercle Donut SVG */}
                                <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                                    <svg
                                        viewBox="0 0 120 120"
                                        className="h-full w-full -rotate-90 transform overflow-visible"
                                    >
                                        {/* Piste de fond */}
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="45"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeOpacity="0.08"
                                            strokeWidth="16"
                                        />

                                        {/* Segments animés */}
                                        {currentSlices.map((slice) => {
                                            const isHovered =
                                                hoveredSlice === slice.id;
                                            return (
                                                <circle
                                                    key={slice.id}
                                                    cx="60"
                                                    cy="60"
                                                    r="45"
                                                    fill="transparent"
                                                    stroke={slice.color}
                                                    strokeWidth={
                                                        isHovered ? 18 : 15
                                                    }
                                                    strokeDasharray={
                                                        slice.strokeDasharray
                                                    }
                                                    strokeDashoffset={
                                                        slice.strokeDashoffset
                                                    }
                                                    strokeLinecap="round"
                                                    className="cursor-pointer transition-all duration-300"
                                                    onMouseEnter={() =>
                                                        setHoveredSlice(
                                                            slice.id
                                                        )
                                                    }
                                                    onMouseLeave={() =>
                                                        setHoveredSlice(null)
                                                    }
                                                />
                                            );
                                        })}
                                    </svg>

                                    {/* Texte central du Donut */}
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="font-mono text-2xl font-bold tracking-tight">
                                            {analytics.total}
                                        </span>
                                        <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                                            Total Devis
                                        </span>
                                    </div>
                                </div>

                                {/* Légende interactive avec compteurs */}
                                <div className="w-full space-y-2 sm:w-auto">
                                    {currentSlices.map((slice) => (
                                        <div
                                            key={slice.id}
                                            className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg p-2 transition-colors ${
                                                hoveredSlice === slice.id
                                                    ? "bg-muted"
                                                    : "hover:bg-muted/50"
                                            }`}
                                            onMouseEnter={() =>
                                                setHoveredSlice(slice.id)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredSlice(null)
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-3 w-3 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            slice.color,
                                                    }}
                                                />
                                                <span className="text-foreground text-xs font-medium">
                                                    {slice.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono text-xs">
                                                <span className="font-bold">
                                                    {slice.count}
                                                </span>
                                                <span className="text-muted-foreground text-[11px]">
                                                    ({slice.percent}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </div>

                    {/* Section Hubs & Chantiers Logistiques intégrée */}
                    <div className="bg-muted/20 border-t px-6 py-3.5">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                                <Truck className="text-primary h-3.5 w-3.5" />
                                Chantiers & Hubs Logistiques Détectés
                            </span>
                            <span className="text-muted-foreground font-mono text-[10px]">
                                {sanitizedLocations.length} site
                                {sanitizedLocations.length > 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {sanitizedLocations.length === 0 ? (
                                <span className="text-muted-foreground text-xs italic">
                                    En attente d&apos;adresses d&apos;enlèvement
                                    et de livraison
                                </span>
                            ) : (
                                sanitizedLocations.slice(0, 5).map((loc) => (
                                    <Badge
                                        key={loc.city}
                                        variant="secondary"
                                        className="bg-background/80 hover:bg-background text-foreground border px-2 py-0.5 font-mono text-[11px] transition-colors"
                                    >
                                        {loc.city}{" "}
                                        <span className="text-muted-foreground ml-1">
                                            ({loc.count})
                                        </span>
                                    </Badge>
                                ))
                            )}
                        </div>
                    </div>
                </Card>

                {/* 2. RÉPARTITION PAR TYPE DE FRET */}
                <Card className="border-border/60 bg-card flex flex-col justify-between">
                    <div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layers className="text-primary h-5 w-5" />
                                    <CardTitle className="text-base font-bold">
                                        Répartition par Type de Fret
                                    </CardTitle>
                                </div>
                                <span className="text-muted-foreground font-mono text-xs">
                                    {analytics.topItemTypes.length} catégorie
                                    {analytics.topItemTypes.length > 1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>
                            <CardDescription className="text-xs">
                                Typologie des marchandises confiées par vos
                                clients.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {analytics.topItemTypes.length === 0 ? (
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    Aucune donnée de type de marchandise
                                    disponible.
                                </div>
                            ) : (
                                <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                                    {analytics.topItemTypes.map(
                                        (item, index) => (
                                            <div
                                                key={item.type}
                                                className="space-y-1"
                                            >
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-foreground max-w-[240px] truncate">
                                                        {item.type}
                                                    </span>
                                                    <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
                                                        {item.count} demande
                                                        {item.count > 1
                                                            ? "s"
                                                            : ""}{" "}
                                                        ({item.percentage}%)
                                                    </span>
                                                </div>
                                                <div className="bg-muted h-2 overflow-hidden rounded-full">
                                                    <motion.div
                                                        className="bg-primary h-full rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${item.percentage}%`,
                                                        }}
                                                        transition={{
                                                            delay: index * 0.05,
                                                            duration: 0.5,
                                                            ease: "easeOut",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </div>

                    <div className="bg-muted/20 text-muted-foreground flex items-center justify-between border-t px-6 py-3.5 text-xs">
                        <span>Transport lourd & convoi exceptionnel</span>
                        <span className="text-foreground font-mono font-medium">
                            {analytics.total} expédition
                            {analytics.total > 1 ? "s" : ""}
                        </span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
