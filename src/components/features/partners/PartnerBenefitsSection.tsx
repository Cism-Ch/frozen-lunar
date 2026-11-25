"use client";

import { useMemo, useState } from "react";
import {
    BadgeCheck,
    Banknote,
    Briefcase,
    Calculator,
    Handshake,
    Route,
    ShieldCheck,
    Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimulatorCategory {
    id: string;
    label: string;
    avgMissionNetFcfa: number;
    hint: string;
}

const SIMULATOR_CATEGORIES: SimulatorCategory[] = [
    {
        id: "HEAVY_HAUL",
        label: "Porte-char / Engins lourds",
        avgMissionNetFcfa: 380_000,
        hint: "Convois BTP, pelles, bulldozers & engins industriels",
    },
    {
        id: "CONTAINERS",
        label: "Porte-conteneur / Plateau",
        avgMissionNetFcfa: 260_000,
        hint: "Enlèvements Port d'Abidjan, San-Pédro & corridors",
    },
    {
        id: "MATERIALS",
        label: "Camion Benne / Matériaux",
        avgMissionNetFcfa: 165_000,
        hint: "Sable, gravier, ciment et approvisionnements chantiers",
    },
    {
        id: "PASSENGER",
        label: "Bus / Navette Personnel",
        avgMissionNetFcfa: 140_000,
        hint: "Navettes d'entreprises, chantiers & déplacements collectifs",
    },
    {
        id: "UTILITY",
        label: "Utilitaire / Pick-up 4x4",
        avgMissionNetFcfa: 85_000,
        hint: "Courses express urbaines et liaisons inter-sites",
    },
];

const ROTATION_OPTIONS = [4, 8, 12, 16] as const;

const BENEFITS = [
    {
        icon: Banknote,
        title: "0 FCFA d'inscription",
        description:
            "Adhésion 100 % gratuite. Vous ne payez aucun abonnement fixe : vous gagnez uniquement sur les missions effectuées.",
    },
    {
        icon: Briefcase,
        title: "Missions B2B pré-qualifiées",
        description:
            "Accédez aux chantiers industriels, conteneurs portuaires et contrats entreprises sans frais de prospection commerciale.",
    },
    {
        icon: ShieldCheck,
        title: "Paiement sécurisé & transparent",
        description:
            "Tarif net convenu avant chaque départ (ou 85–90 % du montant HT) avec règlement encadré par HBC Logistique.",
    },
    {
        icon: Route,
        title: "Zéro trajet à vide",
        description:
            "Rentabilisez vos jours creux et vos retours sur les corridors Abidjan, Yamoussoukro, Bouaké et San-Pédro.",
    },
];

/**
 * Bandeau de proposition de valeur partenaire + simulateur indicatif de revenus mensuels FCFA.
 */
export function PartnerBenefitsSection() {
    const [selectedCatId, setSelectedCatId] = useState<string>("CONTAINERS");
    const [vehicleCount, setVehicleCount] = useState<number>(2);
    const [missionsPerMonth, setMissionsPerMonth] = useState<number>(8);

    const activeCategory =
        SIMULATOR_CATEGORIES.find((c) => c.id === selectedCatId) ||
        SIMULATOR_CATEGORIES[1];

    const estimatedMonthlyNet = useMemo(
        () =>
            activeCategory.avgMissionNetFcfa * vehicleCount * missionsPerMonth,
        [activeCategory, vehicleCount, missionsPerMonth]
    );

    const estimatedYearlyNet = estimatedMonthlyNet * 12;

    return (
        <section className="mx-auto mb-12 max-w-5xl space-y-8">
            {/* En-tête éditorial */}
            <div className="space-y-3 text-center">
                <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/8 text-primary mx-auto gap-1.5 px-3 py-1 text-xs font-semibold"
                >
                    <Handshake className="h-3.5 w-3.5" />
                    Réseau Partenaires Transporteurs • Côte d&apos;Ivoire
                </Badge>
                <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
                    Rentabilisez votre flotte avec{" "}
                    <span className="from-primary to-primary-accent bg-linear-to-r bg-clip-text text-transparent">
                        HBC Logistique
                    </span>
                </h1>
                <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
                    Particulier propriétaire d&apos;un véhicule ou société de
                    transport : recevez des ordres de mission qualifiés,
                    sécurisez vos paiements et éliminez les trajets à vide.
                </p>
            </div>

            {/* 4 Bénéfices Concrets */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {BENEFITS.map((item) => (
                    <Card
                        key={item.title}
                        className="border-border/70 bg-card/80 shadow-xs transition-all hover:border-primary/40"
                    >
                        <CardContent className="space-y-2.5 p-5">
                            <div className="bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-xl">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <h2 className="text-sm font-bold">{item.title}</h2>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                {item.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Simulateur Interactif de Revenus Partenaire */}
            <Card className="border-primary/25 from-card via-card to-primary/5 overflow-hidden bg-linear-to-br shadow-md">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base sm:text-lg">
                        <span className="flex items-center gap-2">
                            <Calculator className="text-primary h-5 w-5" />
                            Simulateur indicatif de revenus partenaires
                        </span>
                        <Badge
                            variant="secondary"
                            className="gap-1 text-xs font-semibold"
                        >
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                            85 % à 90 % net reversé au partenaire
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-12 lg:items-center sm:p-6">
                    {/* Contrôles gauche */}
                    <div className="space-y-5 lg:col-span-7">
                        {/* Type d'engin */}
                        <div className="space-y-2">
                            <p className="text-xs font-bold tracking-wider uppercase">
                                1. Catégorie de véhicule
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {SIMULATOR_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCatId(cat.id)}
                                        className={`min-h-[40px] rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                                            selectedCatId === cat.id
                                                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                                                : "border-border bg-background hover:border-primary/50"
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {activeCategory.hint} (~
                                {activeCategory.avgMissionNetFcfa.toLocaleString(
                                    "fr-FR"
                                )}{" "}
                                FCFA net / mission)
                            </p>
                        </div>

                        {/* Nombre de véhicules & rotations */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold uppercase">
                                    <span className="flex items-center gap-1.5">
                                        <Truck className="text-primary h-3.5 w-3.5" />
                                        2. Véhicules inscrits
                                    </span>
                                    <span className="text-primary font-mono text-sm">
                                        {vehicleCount}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={vehicleCount}
                                    onChange={(e) =>
                                        setVehicleCount(Number(e.target.value))
                                    }
                                    aria-label="Nombre de véhicules inscrits"
                                    className="accent-primary h-2 w-full cursor-pointer rounded-lg"
                                />
                                <div className="text-muted-foreground flex justify-between text-[11px]">
                                    <span>1 véhicule</span>
                                    <span>5 véhicules</span>
                                    <span>10 véhicules</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold tracking-wider uppercase">
                                    3. Missions / mois / véhicule
                                </p>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {ROTATION_OPTIONS.map((rot) => (
                                        <button
                                            key={rot}
                                            type="button"
                                            onClick={() =>
                                                setMissionsPerMonth(rot)
                                            }
                                            className={`min-h-[40px] rounded-lg border font-mono text-xs font-bold transition-all ${
                                                missionsPerMonth === rot
                                                    ? "border-primary bg-primary/15 text-primary"
                                                    : "border-border bg-background hover:border-primary/40"
                                            }`}
                                        >
                                            {rot}×
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Résultat droite */}
                    <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg lg:col-span-5 dark:border dark:border-[#92A9BE]/25 dark:bg-[#0B1219]">
                        <p className="text-[11px] font-bold tracking-widest text-[#92A9BE] uppercase">
                            Revenu net partenaire estimé
                        </p>
                        <p className="text-primary-accent mt-2 font-mono text-2xl font-extrabold tracking-tight sm:text-3xl">
                            {estimatedMonthlyNet.toLocaleString("fr-FR")} FCFA
                            <span className="text-sm font-medium text-slate-300">
                                {" "}
                                / mois
                            </span>
                        </p>
                        <p className="mt-1 font-mono text-xs text-slate-300">
                            Soit ~{estimatedYearlyNet.toLocaleString("fr-FR")}{" "}
                            FCFA / an ({vehicleCount * missionsPerMonth}{" "}
                            missions/mois)
                        </p>
                        <div className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-slate-300">
                            Estimation indicative basée sur les barèmes moyens
                            constatés en Côte d&apos;Ivoire. Le tarif net exact
                            est validé avec vous avant chaque départ.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
