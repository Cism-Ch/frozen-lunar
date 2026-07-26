"use client";

import { SectionContainer } from "@/components/layout/SectionContainer";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Package, Award } from "lucide-react";
import {
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    AnimatedCard,
    CountUp,
    IconFloat,
} from "@/components/ui/motion";

const stats = [
    {
        icon: TrendingUp,
        value: 15,
        suffix: "+",
        label: "Années d'expérience",
        description: "Au service de vos projets",
    },
    {
        icon: Users,
        value: 500,
        suffix: "+",
        label: "Clients satisfaits",
        description: "Qui nous font confiance",
    },
    {
        icon: Package,
        value: 10,
        suffix: "K+",
        label: "Transports réalisés",
        description: "En toute sécurité",
    },
    {
        icon: Award,
        value: 98,
        suffix: "%",
        label: "Taux de satisfaction",
        description: "Clients recommandent",
    },
];

export function StatsSection() {
    return (
        <SectionContainer className="from-primary via-primary to-primary/90 text-primary-foreground bg-gradient-to-br">
            <ScrollReveal className="mb-16 space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Des chiffres qui parlent
                </h2>
                <p className="text-primary-foreground/90 mx-auto max-w-[700px] text-lg md:text-xl">
                    Notre expérience et notre engagement se reflètent dans nos
                    résultats
                </p>
            </ScrollReveal>

            <StaggerContainer
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                staggerSpeed="normal"
            >
                {stats.map((stat) => (
                    <StaggerItem key={stat.label}>
                        <AnimatedCard hoverEffect="subtle">
                            <Card className="bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/15 group backdrop-blur transition-all duration-300">
                                <CardContent className="space-y-4 p-8 text-center">
                                    {/* Icon */}
                                    <IconFloat>
                                        <div className="bg-primary-foreground/20 group-hover:bg-primary-foreground/30 inline-flex rounded-2xl p-4 transition-colors">
                                            <stat.icon className="text-primary-foreground h-8 w-8" />
                                        </div>
                                    </IconFloat>

                                    {/* Value - Animated Counter */}
                                    <div className="text-5xl font-bold md:text-6xl">
                                        <CountUp
                                            to={stat.value}
                                            suffix={stat.suffix}
                                            duration={2.5}
                                        />
                                    </div>

                                    {/* Label */}
                                    <div className="space-y-1">
                                        <div className="text-lg font-semibold">
                                            {stat.label}
                                        </div>
                                        <div className="text-primary-foreground/70 text-sm">
                                            {stat.description}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </SectionContainer>
    );
}
