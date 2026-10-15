"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Check, ArrowRight } from "lucide-react";
import {
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    AnimatedCard,
    CountUp,
    motion,
} from "@/components/ui/motion";

const benefits = [
    "Visibilité maximale auprès de clients qualifiés",
    "Gestion simplifiée de vos demandes de transport",
    "Paiements sécurisés et rapides",
    "Support dédié pour développer votre activité",
];

export function ProfessionalsCTA() {
    return (
        <SectionContainer className="bg-secondary text-secondary-foreground relative overflow-hidden py-20 md:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2">
                {/* Left Content */}
                <ScrollReveal
                    direction="left"
                    className="space-y-6 text-center lg:text-left"
                >
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl md:text-5xl">
                            Vous êtes transporteur ?
                        </h2>
                        <p className="text-slate-200 max-w-[90%] text-lg leading-relaxed md:text-xl">
                            Rejoignez notre réseau et développez votre
                            clientèle. Inscription gratuite et sans engagement.
                        </p>
                    </div>

                    {/* Benefits List - Staggered */}
                    <StaggerContainer staggerSpeed="fast">
                        <ul className="inline-block space-y-3 text-left">
                            {benefits.map((benefit, index) => (
                                <StaggerItem key={index}>
                                    <li className="flex items-start gap-3">
                                        <motion.div
                                            className="mt-1 flex-shrink-0"
                                            whileHover={{
                                                scale: 1.2,
                                                rotate: 10,
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                            }}
                                        >
                                            <div className="bg-primary/20 flex h-6 w-6 items-center justify-center rounded-full text-primary">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        </motion.div>
                                        <span className="text-slate-100 font-medium leading-relaxed">
                                            {benefit}
                                        </span>
                                    </li>
                                </StaggerItem>
                            ))}
                        </ul>
                    </StaggerContainer>

                    {/* CTA Button */}
                    <motion.div
                        className="flex justify-center pt-4 lg:justify-start"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground group h-14 w-full px-8 text-lg font-semibold shadow-lg shadow-primary/25 sm:w-auto"
                            asChild
                        >
                            <Link href="/contact">
                                Rejoindre le réseau
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </motion.div>
                </ScrollReveal>

                {/* Right Content - Stats Card */}
                <ScrollReveal direction="right">
                    <AnimatedCard hoverEffect="subtle">
                        <Card className="bg-white/5 border-white/10 text-white backdrop-blur-md shadow-2xl">
                            <CardContent className="p-8 md:p-10">
                                <div className="space-y-8">
                                    <div className="space-y-2 text-center">
                                        <div className="text-white text-5xl font-bold md:text-6xl">
                                            <CountUp
                                                to={500}
                                                suffix="+"
                                                duration={2.5}
                                            />
                                        </div>
                                        <p className="text-slate-200 text-lg">
                                            Transporteurs partenaires
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1 text-center">
                                            <div className="text-primary text-3xl font-bold md:text-4xl">
                                                <CountUp
                                                    to={98}
                                                    suffix="%"
                                                    duration={2}
                                                />
                                            </div>
                                            <p className="text-slate-300 text-sm">
                                                Satisfaction client
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <div className="text-primary text-3xl font-bold md:text-4xl">
                                                24/7
                                            </div>
                                            <p className="text-slate-300 text-sm">
                                                Support disponible
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-slate-300 border-white/10 border-t pt-4 text-center text-sm italic">
                                        La plateforme de confiance pour tous vos
                                        services de transport
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </AnimatedCard>
                </ScrollReveal>
            </div>
        </SectionContainer>
    );
}
