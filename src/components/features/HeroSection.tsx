"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Clock,
    MapPin,
    ShieldCheck,
    Star,
    Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountUp, FadeIn, motion } from "@/components/ui/motion";

/**
 * Section Hero Cover Premium :
 * - Glisse harmonieusement sous la barre de navigation flottante translucide (-mt-20 pt-28)
 * - Illustration dédiée de transport de fret lourd & marchandises en cover stylé
 * - Dégradé profond (#001F3D / #6081A0), lueurs ambiantes (#FF6600 / #FF7C24),
 *   éléments HUD translucides (glassmorphism) et filigrane technique HBC Logistique.
 */
export function HeroSection() {
    return (
        <section className="relative -mt-20 overflow-hidden bg-linear-to-br from-[#001F3D] via-[#072B4E] to-[#1A3B5C] pt-28 pb-20 text-white md:pt-36 md:pb-28">
            {/* 1. Filigrane technique & grille en arrière-plan */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(96,129,160,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(96,129,160,0.12)_1px,transparent_1px)] bg-size-[36px_36px] opacity-40"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 text-[14vw] font-black tracking-[0.2em] whitespace-nowrap text-white/[0.03] uppercase select-none"
            >
                HBC LOGISTIQUE
            </div>

            {/* 2. Lueurs ambiantes (Orange #FF7C24 & Bleu Acier #6081A0) */}
            <div
                aria-hidden="true"
                className="bg-primary-accent/25 pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full blur-[120px]"
            />
            <div
                aria-hidden="true"
                className="bg-secondary-steel/30 pointer-events-none absolute bottom-0 -left-24 h-[380px] w-[380px] rounded-full blur-[120px]"
            />

            <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
                    {/* Colonne Gauche : Contenu éditorial & CTA */}
                    <div className="space-y-7 lg:col-span-6">
                        <FadeIn direction="down" delay={0.1}>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Badge className="border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                                    <Star className="text-primary-accent fill-primary-accent mr-1.5 h-3.5 w-3.5" />
                                    +15 ans d&apos;expertise en Côte d&apos;Ivoire
                                </Badge>
                                <Badge className="border-primary-accent/35 bg-primary/20 text-primary-accent px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md">
                                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                                    Fret Lourd & Sécurisé
                                </Badge>
                            </div>
                        </FadeIn>

                        <div className="space-y-5">
                            <FadeIn direction="up" delay={0.2}>
                                <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                    Le transport de fret lourd{" "}
                                    <span className="from-primary via-primary-accent to-amber-300 bg-linear-to-r bg-clip-text text-transparent">
                                        maîtrisé de bout en bout
                                    </span>
                                </h1>
                            </FadeIn>

                            <FadeIn direction="up" delay={0.3}>
                                <p className="max-w-xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
                                    Containers maritimes, matériaux de chantier,
                                    charpentes métalliques et engins industriels
                                    partout en Côte d&apos;Ivoire. Cotation
                                    rapide, suivi transparent et flotte dédiée.
                                </p>
                            </FadeIn>
                        </div>

                        <FadeIn direction="up" delay={0.38}>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        size="lg"
                                        className="from-primary to-primary-accent hover:from-primary/90 hover:to-primary-accent/90 h-13 w-full rounded-xl bg-linear-to-r px-7 text-base font-bold text-white shadow-xl shadow-orange-500/30 sm:w-auto"
                                        asChild
                                    >
                                        <Link href="/devis">
                                            Demander un devis gratuit
                                            <ArrowRight className="ml-2 h-5 w-5" />
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
                                        className="h-13 w-full rounded-xl border-white/20 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-md hover:bg-white/20 hover:text-white sm:w-auto"
                                        asChild
                                    >
                                        <Link href="/flotte">
                                            Découvrir la flotte
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>
                        </FadeIn>

                        {/* Indicateurs Clés Glassmorphism */}
                        <FadeIn direction="up" delay={0.45}>
                            <div className="grid grid-cols-3 gap-3 border-t border-white/12 pt-6 sm:gap-4">
                                <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5 backdrop-blur-md">
                                    <div className="text-primary-accent text-2xl font-extrabold sm:text-3xl">
                                        <CountUp
                                            to={98}
                                            suffix="%"
                                            duration={1.8}
                                        />
                                    </div>
                                    <div className="mt-0.5 text-xs font-medium text-slate-300">
                                        Satisfaction client
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5 backdrop-blur-md">
                                    <div className="text-2xl font-extrabold text-white sm:text-3xl">
                                        24/7
                                    </div>
                                    <div className="mt-0.5 text-xs font-medium text-slate-300">
                                        Dispatch Abidjan
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5 backdrop-blur-md">
                                    <div className="text-primary-accent text-2xl font-extrabold sm:text-3xl">
                                        <CountUp
                                            to={500}
                                            suffix="+"
                                            duration={2}
                                        />
                                    </div>
                                    <div className="mt-0.5 text-xs font-medium text-slate-300">
                                        Missions livrées
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Colonne Droite : Illustration Fret Lourd en Cover Stylé */}
                    <div className="lg:col-span-6">
                        <FadeIn direction="right" delay={0.25}>
                            <div className="group relative">
                                {/* Halo lumineux derrière la carte cover */}
                                <div
                                    aria-hidden="true"
                                    className="from-primary/40 via-primary-accent/25 to-secondary-steel/40 absolute -inset-2 rounded-[2rem] bg-linear-to-tr opacity-75 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                                />

                                {/* Conteneur Cover Principal */}
                                <div className="relative aspect-[16/11] overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/95 shadow-2xl shadow-black/40">
                                    <Image
                                        src="/images/hero-freight.jpg"
                                        alt="Illustration de véhicules de transport de fret lourd et marchandises HBC Logistique Côte d'Ivoire"
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    />

                                    {/* Voile gradient subtil + lueur bas pour ancrer les badges glassmorphism */}
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#001F3D]/80 via-[#001F3D]/15 to-transparent"
                                    />

                                    {/* Filigrane discret en coin supérieur droit */}
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute top-4 right-4 rounded-full border border-[#001F3D]/15 bg-white/75 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-[#001F3D]/70 uppercase backdrop-blur-md"
                                    >
                                        5°18&apos;N • 4°00&apos;W ABIDJAN
                                    </div>

                                    {/* Badge flottant translucide haut gauche */}
                                    <motion.div
                                        className="absolute top-4 left-4 flex items-center gap-2 rounded-2xl border border-white/40 bg-[#001F3D]/70 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md"
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{
                                            duration: 4.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                        <Truck className="text-primary-accent h-4 w-4" />
                                        <span>Flotte Lourde 15T – 45T</span>
                                    </motion.div>

                                    {/* Barre HUD Glassmorphism en bas du cover */}
                                    <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-[#001F3D]/75 px-4 py-3 text-white shadow-xl backdrop-blur-xl">
                                        <div className="flex items-center gap-2.5">
                                            <div className="from-primary to-primary-accent flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold">
                                                    Port d&apos;Abidjan ↔
                                                    Intérieur CI
                                                </p>
                                                <p className="text-[11px] text-slate-300">
                                                    Yamoussoukro • Bouaké •
                                                    San-Pédro • Korhogo
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-amber-200">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>Devis en &lt; 2h</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
}
