"use client";

import { Search, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import {
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    AnimatedCard,
    IconFloat,
} from "@/components/ui/motion";

const steps = [
    {
        number: "01",
        icon: Search,
        title: "Demandez",
        description:
            "Décrivez votre besoin de transport en quelques clics via notre formulaire simple et rapide.",
    },
    {
        number: "02",
        icon: Calendar,
        title: "Planifiez",
        description:
            "Choisissez la date et l'heure qui vous conviennent. Nous nous adaptons à votre emploi du temps.",
    },
    {
        number: "03",
        icon: CheckCircle,
        title: "Recevez",
        description:
            "Votre transport est pris en charge de A à Z. Suivez l'avancement en temps réel.",
    },
];

export function HowItWorks() {
    return (
        <SectionContainer className="bg-background">
            <ScrollReveal className="mb-12 space-y-4 text-center md:mb-16">
                <Badge variant="outline" className="mb-2">
                    Comment ça marche
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Un processus simple en 3 étapes
                </h2>
                <p className="text-muted-foreground mx-auto max-w-[700px] text-lg md:text-xl">
                    De la demande à la livraison, nous gérons tout pour vous
                </p>
            </ScrollReveal>

            <StaggerContainer
                className="grid gap-8 md:grid-cols-3"
                staggerSpeed="slow"
            >
                {steps.map((step) => (
                    <StaggerItem key={step.number}>
                        <AnimatedCard hoverEffect="lift" className="h-full">
                            <Card className="hover:border-primary/50 relative h-full overflow-hidden border-2 transition-colors duration-300">
                                <CardContent className="p-6 md:p-8">
                                    {/* Number Badge */}
                                    <div className="text-primary/5 group-hover:text-primary/10 absolute -top-4 -right-4 text-8xl font-bold transition-colors">
                                        {step.number}
                                    </div>

                                    {/* Icon */}
                                    <div className="relative mb-6">
                                        <IconFloat>
                                            <div className="bg-primary/10 hover:bg-primary/20 inline-flex rounded-2xl p-4 transition-colors">
                                                <step.icon className="text-primary h-8 w-8" />
                                            </div>
                                        </IconFloat>
                                    </div>

                                    {/* Content */}
                                    <div className="relative space-y-3">
                                        <h3 className="text-xl font-bold md:text-2xl">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {step.description}
                                        </p>
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
