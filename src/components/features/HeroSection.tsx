"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    AnimatePresence,
    CountUp,
    FadeIn,
    motion,
} from "@/components/ui/motion";

const DYNAMIC_SERVICES = [
    {
        headline: "Transport de marchandises & distribution",
        detail: "Livraisons urbaines, interurbaines et approvisionnements rapides sur toute la Côte d'Ivoire.",
    },
    {
        headline: "Fret lourd, engins BTP & convois",
        detail: "Porte-chars surbaissés, charpentes métalliques et machines industrielles jusqu'à 70 tonnes.",
    },
    {
        headline: "Containers maritimes 20' & 40'",
        detail: "Enlèvement direct au Port Autonome d'Abidjan et San-Pédro jusqu'à vos entrepôts.",
    },
    {
        headline: "Transport de personnel & Bus 64 places",
        detail: "Navettes d'entreprise, chantiers et déplacements collectifs confortables et ponctuels.",
    },
    {
        headline: "Matériaux de chantier & logistique clé en main",
        detail: "Bennes, camions-grues Hiab, pick-up 4x4 et solutions sur mesure pour particuliers et pros.",
    },
];

/**
 * Section Hero Éditoriale Adaptative (Clair #F2F5F7 / Sombre #0B1219 + #92A9BE) :
 * - Fond réseau logistique isométrique 3D fondu
 * - Mise en page éditoriale moderne inspirée de la référence BAU CARGO
 * - Texte dynamique rotatif couvrant tous les métiers HBC Logistique
 * - Bandeau signature contrasté avec KPIs en pied de Hero
 */
export function HeroSection() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % DYNAMIC_SERVICES.length);
        }, 4200);
        return () => clearInterval(timer);
    }, []);

    const currentService = DYNAMIC_SERVICES[activeIndex];

    return (
        <section className="relative -mt-20 overflow-hidden bg-[#F2F5F7] pt-28 pb-16 text-slate-900 transition-colors duration-300 md:pt-34 md:pb-24 dark:bg-[#0B1219] dark:text-slate-50">
            {/* 1. Background Isométrique 3D fondu (adapté Clair & Sombre) */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <Image
                    src="/images/hero-isometric-bg.jpg"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center opacity-55 mix-blend-multiply transition-opacity duration-500 dark:opacity-35 dark:mix-blend-screen dark:invert dark:hue-rotate-180"
                />
                {/* Fondu progressif haut & bas pour lisibilité éditoriale */}
                <div className="absolute inset-0 bg-linear-to-b from-[#F2F5F7]/65 via-[#F2F5F7]/20 to-[#F2F5F7] dark:from-[#0B1219]/75 dark:via-[#0B1219]/35 dark:to-[#0B1219]" />
            </div>

            {/* 2. Lueurs ambiantes subtiles (Orange #FF7C24 + Bleu Acier #92A9BE en sombre) */}
            <div
                aria-hidden="true"
                className="bg-primary-accent/18 dark:bg-primary-accent/15 pointer-events-none absolute -top-24 right-0 h-[380px] w-[380px] rounded-full blur-[120px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-10 -left-20 h-[360px] w-[360px] rounded-full bg-[#6081A0]/15 blur-[120px] dark:bg-[#92A9BE]/20"
            />

            <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
                {/* 3. En-tête Éditorial Massif (style BAU CARGO) */}
                <FadeIn direction="down" delay={0.05}>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className="border-slate-900/15 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-md dark:border-[#92A9BE]/30 dark:bg-[#92A9BE]/10 dark:text-[#92A9BE]"
                        >
                            <Sparkles className="text-primary mr-1.5 h-3.5 w-3.5" />
                            Logistique &amp; Mobilité Multi-Services • Côte
                            d&apos;Ivoire
                        </Badge>
                    </div>
                </FadeIn>

                <FadeIn direction="up" delay={0.1}>
                    <h1 className="text-5xl leading-[0.95] font-extrabold tracking-tighter text-slate-950 uppercase sm:text-7xl md:text-8xl lg:text-[6.25rem] dark:text-white">
                        hbc{" "}
                        <span className="from-primary via-primary-accent to-amber-500 bg-linear-to-r bg-clip-text text-transparent">
                            logistique
                        </span>
                    </h1>
                </FadeIn>

                {/* 4. Grille 2 Colonnes : Texte Dynamique + Pilules CTA à gauche / Visuel à droite */}
                <div className="mt-8 grid items-center gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-12">
                    <div className="space-y-6 lg:col-span-5">
                        {/* Zone de Texte Dynamique Rotatif */}
                        <div className="min-h-[124px] sm:min-h-[112px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.35 }}
                                    className="space-y-2.5"
                                >
                                    <h2 className="text-2xl leading-tight font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                        {currentService.headline}
                                    </h2>
                                    <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-[#92A9BE]">
                                        {currentService.detail}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Indicateurs de cycle dynamique cliquables */}
                        <div
                            className="flex items-center gap-1.5"
                            role="tablist"
                            aria-label="Métiers HBC Logistique"
                        >
                            {DYNAMIC_SERVICES.map((svc, idx) => (
                                <button
                                    key={svc.headline}
                                    type="button"
                                    onClick={() => setActiveIndex(idx)}
                                    aria-label={svc.headline}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        idx === activeIndex
                                            ? "bg-primary w-8"
                                            : "w-2 bg-slate-300 hover:bg-slate-400 dark:bg-[#92A9BE]/30 dark:hover:bg-[#92A9BE]/60"
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Boutons Pilules style BAU CARGO avec pastille flèche circulaire */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <Link
                                href="/devis"
                                className="group from-primary to-primary-accent inline-flex h-12 items-center gap-3 rounded-full bg-linear-to-r pr-2 pl-6 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Calculer mon devis</span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-950 transition-transform group-hover:rotate-12">
                                    <ArrowUpRight className="h-4 w-4" />
                                </span>
                            </Link>

                            <Link
                                href="/services"
                                className="group inline-flex h-12 items-center gap-3 rounded-full border border-slate-900/15 bg-white/80 pr-2 pl-6 text-sm font-bold text-slate-900 backdrop-blur-md transition-all hover:border-slate-900/35 hover:bg-white dark:border-[#92A9BE]/35 dark:bg-[#92A9BE]/10 dark:text-white dark:hover:bg-[#92A9BE]/20"
                            >
                                <span>Tous nos services</span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/8 text-slate-900 transition-transform group-hover:rotate-12 dark:bg-[#92A9BE]/20 dark:text-[#92A9BE]">
                                    <ArrowUpRight className="h-4 w-4" />
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Colonne Droite : Visuel Logistique Épuré & Glass Badges */}
                    <div className="lg:col-span-7">
                        <FadeIn direction="right" delay={0.2}>
                            <div className="group relative">
                                <div
                                    aria-hidden="true"
                                    className="from-primary/25 via-primary-accent/15 to-[#6081A0]/25 dark:to-[#92A9BE]/25 absolute -inset-2 rounded-[2rem] bg-linear-to-tr opacity-80 blur-2xl"
                                />
                                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-2xl shadow-slate-900/10 dark:border-[#92A9BE]/25 dark:bg-[#111C27] dark:shadow-black/50">
                                    <Image
                                        src="/images/hero-freight.jpg"
                                        alt="Flotte et solutions de transport HBC Logistique Côte d'Ivoire"
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 58vw"
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/35 via-transparent to-transparent" />

                                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-full border border-white/60 bg-white/85 px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-md dark:border-[#92A9BE]/30 dark:bg-[#0B1219]/80 dark:text-white">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                        <Truck className="text-primary h-3.5 w-3.5" />
                                        <span>Flotte disponible 24/7</span>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>

                {/* 5. Bandeau Signature Contrasté en Pied de Hero (style référence 2) */}
                <FadeIn direction="up" delay={0.3}>
                    <div className="mt-10 rounded-3xl bg-slate-950 px-6 py-6 text-white shadow-xl sm:px-8 sm:py-7 dark:border dark:border-[#92A9BE]/25 dark:bg-[#121F2D]">
                        <div className="grid items-center gap-6 lg:grid-cols-12">
                            <div className="space-y-1 lg:col-span-4">
                                <span className="text-xs font-semibold tracking-wider text-[#92A9BE] uppercase">
                                    Votre sécurité, notre priorité
                                </span>
                                <h3 className="text-lg font-bold tracking-tight sm:text-xl">
                                    Logistique fiable &amp; transparente clé en
                                    main
                                </h3>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-4 lg:col-span-5 lg:border-x lg:border-y-0 lg:px-6 lg:py-0">
                                <div>
                                    <div className="text-primary-accent text-2xl font-extrabold sm:text-3xl">
                                        <CountUp
                                            to={98}
                                            suffix="%"
                                            duration={1.8}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-300 dark:text-[#92A9BE]">
                                        Satisfaction
                                    </p>
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-white sm:text-3xl">
                                        24/7
                                    </div>
                                    <p className="text-[11px] text-slate-300 dark:text-[#92A9BE]">
                                        Dispatch CI
                                    </p>
                                </div>
                                <div>
                                    <div className="text-primary-accent text-2xl font-extrabold sm:text-3xl">
                                        <CountUp
                                            to={500}
                                            suffix="+"
                                            duration={2}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-300 dark:text-[#92A9BE]">
                                        Missions
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 lg:col-span-3 lg:justify-end">
                                <div className="flex items-center gap-2 text-xs text-slate-300 lg:hidden">
                                    <ShieldCheck className="text-primary-accent h-4 w-4" />
                                    <span>Charte Qualité CI</span>
                                </div>
                                <Link
                                    href="/flotte"
                                    className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-white/20 bg-white/10 pr-2 pl-5 text-xs font-bold text-white transition-all hover:bg-white/20 sm:text-sm"
                                >
                                    <span>Voir la flotte</span>
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-950 transition-transform group-hover:rotate-12">
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
