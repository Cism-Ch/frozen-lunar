"use client";

import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    PieChart,
    BarChart3,
    TrendingUp,
    Bot,
    Globe,
    Euro,
    Truck,
    Layers,
} from "lucide-react";
import { Quote } from "@/lib/quote-storage";
import { motion } from "@/components/ui/motion";

interface BusinessAnalyticsProps {
    quotes: Quote[];
}

export function BusinessAnalytics({ quotes }: BusinessAnalyticsProps) {
    // Calculs analytiques mémorisés
    const analytics = useMemo(() => {
        const total = quotes.length;

        // 1. Répartition par statut
        const validated = quotes.filter(
            (q) => String(q.status).toUpperCase() === "VALIDATED" || q.status === "Validé"
        ).length;
        const pending = quotes.filter(
            (q) => String(q.status).toUpperCase() === "PENDING" || q.status === "En attente"
        ).length;
        const rejected = quotes.filter(
            (q) => String(q.status).toUpperCase() === "REJECTED" || q.status === "Refusé"
        ).length;
        const conversionRate = total > 0 ? Math.round((validated / total) * 100) : 0;

        // 2. Répartition par canal (FORM vs CHAT)
        const chatSource = quotes.filter(
            (q) => String(q.source).toUpperCase() === "CHAT"
        ).length;
        const formSource = total - chatSource;

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

        const averageDealSize = validAmountCount > 0 ? Math.round(totalRevenue / validAmountCount) : 0;

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
            .slice(0, 4);

        return {
            total,
            validated,
            pending,
            rejected,
            conversionRate,
            formSource,
            chatSource,
            topItemTypes,
            totalRevenue,
            averageDealSize,
            topLocations,
        };
    }, [quotes]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <BarChart3 className="text-primary h-6 w-6" />
                        Analytics Métier & Business Intelligence
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Indicateurs de performance en temps réel calculés directement depuis votre base de données.
                    </p>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary px-3 py-1 font-mono text-xs">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Données Souveraines RGPD
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Volume Financier Estimé */}
                <Card className="border-primary/20 bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Volume Financier Estimé
                        </CardTitle>
                        <div className="bg-primary/10 text-primary rounded-full p-2">
                            <Euro className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics.totalRevenue.toLocaleString("fr-FR")} €
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Panier moyen : <span className="text-foreground font-semibold">{analytics.averageDealSize.toLocaleString("fr-FR")} €</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Taux de Conversion Métier */}
                <Card className="border-primary/20 bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Taux de Conversion
                        </CardTitle>
                        <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                            <PieChart className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {analytics.conversionRate} %
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {analytics.validated} validés sur {analytics.total} devis reçus
                        </p>
                    </CardContent>
                </Card>

                {/* Canal Formulaire vs Chat IA */}
                <Card className="border-primary/20 bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Origine des Demandes
                        </CardTitle>
                        <div className="rounded-full bg-purple-500/10 p-2 text-purple-500">
                            <Bot className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="flex items-center gap-1 font-medium">
                                <Globe className="h-3 w-3 text-blue-500" /> Formulaire Web ({analytics.formSource})
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                                <Bot className="h-3 w-3 text-purple-500" /> Chat IA ({analytics.chatSource})
                            </span>
                        </div>
                        <div className="bg-muted flex h-2.5 overflow-hidden rounded-full">
                            <div
                                style={{
                                    width: `${analytics.total > 0 ? (analytics.formSource / analytics.total) * 100 : 50}%`,
                                }}
                                className="bg-blue-500 transition-all duration-500"
                            />
                            <div
                                style={{
                                    width: `${analytics.total > 0 ? (analytics.chatSource / analytics.total) * 100 : 50}%`,
                                }}
                                className="bg-purple-500 transition-all duration-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Hubs Logistiques */}
                <Card className="border-primary/20 bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Hubs Logistiques
                        </CardTitle>
                        <div className="rounded-full bg-orange-500/10 p-2 text-orange-500">
                            <Truck className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1">
                            {analytics.topLocations.length === 0 ? (
                                <span className="text-muted-foreground text-xs">Aucune ville enregistrée</span>
                            ) : (
                                analytics.topLocations.map((loc) => (
                                    <Badge key={loc.city} variant="secondary" className="text-[11px]">
                                        {loc.city} ({loc.count})
                                    </Badge>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Répartition par Type de Fret */}
            <Card className="border-primary/20 bg-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Layers className="text-primary h-5 w-5" />
                        <CardTitle className="text-lg font-bold">Répartition par Type de Marchandise & Fret</CardTitle>
                    </div>
                    <CardDescription>
                        Analyse comparative des catégories de transports sollicités par les clients BTP et industriels.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {analytics.topItemTypes.length === 0 ? (
                        <div className="text-muted-foreground py-6 text-center text-sm">
                            Aucune donnée de type de marchandise disponible.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {analytics.topItemTypes.map((item, index) => (
                                <div key={item.type} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-foreground">{item.type}</span>
                                        <span className="text-muted-foreground font-mono">
                                            {item.count} demande{item.count > 1 ? "s" : ""} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="bg-muted h-3 overflow-hidden rounded-full">
                                        <motion.div
                                            className="bg-primary h-full rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percentage}%` }}
                                            transition={{ delay: index * 0.1, duration: 0.8 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
