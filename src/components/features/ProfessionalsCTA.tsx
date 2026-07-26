"use client";

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
        <SectionContainer className="bg-primary text-primary-foreground">
            <div className="grid items-center gap-12 lg:grid-cols-2">
                {/* Left Content */}
                <ScrollReveal
                    direction="left"
                    className="space-y-6 text-center lg:text-left"
                >
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
                            Vous êtes transporteur ?
                        </h2>
                        <p className="text-primary-foreground/90 max-w-[90%] text-lg leading-relaxed md:text-xl">
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
                                            <div className="bg-primary-foreground/20 flex h-6 w-6 items-center justify-center rounded-full">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        </motion.div>
                                        <span className="text-primary-foreground/90 leading-relaxed">
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
                            variant="secondary"
                            className="group h-14 w-full px-8 text-lg font-semibold sm:w-auto"
                            asChild
                        >
                            <a href="/contact">
                                Rejoindre le réseau
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>
                        </Button>
                    </motion.div>
                </ScrollReveal>

                {/* Right Content - Stats Card */}
                <ScrollReveal direction="right">
                    <AnimatedCard hoverEffect="subtle">
                        <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur">
                            <CardContent className="p-8 md:p-10">
                                <div className="space-y-8">
                                    <div className="space-y-2 text-center">
                                        <div className="text-5xl font-bold md:text-6xl">
                                            <CountUp
                                                to={500}
                                                suffix="+"
                                                duration={2.5}
                                            />
                                        </div>
                                        <p className="text-primary-foreground/80 text-lg">
                                            Transporteurs partenaires
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1 text-center">
                                            <div className="text-3xl font-bold md:text-4xl">
                                                <CountUp
                                                    to={98}
                                                    suffix="%"
                                                    duration={2}
                                                />
                                            </div>
                                            <p className="text-primary-foreground/70 text-sm">
                                                Satisfaction client
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <div className="text-3xl font-bold md:text-4xl">
                                                24/7
                                            </div>
                                            <p className="text-primary-foreground/70 text-sm">
                                                Support disponible
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-primary-foreground/70 border-primary-foreground/20 border-t pt-4 text-center text-sm italic">
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
