"use client";

import { Search, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCard, IconFloat } from "@/components/ui/motion";

const steps = [
    {
        number: "01",
        icon: Search,
        title: "Demandez",
        description: "Décrivez votre besoin de transport en quelques clics via notre formulaire simple et rapide.",
    },
    {
        number: "02",
        icon: Calendar,
        title: "Planifiez",
        description: "Choisissez la date et l'heure qui vous conviennent. Nous nous adaptons à votre emploi du temps.",
    },
    {
        number: "03",
        icon: CheckCircle,
        title: "Recevez",
        description: "Votre transport est pris en charge de A à Z. Suivez l'avancement en temps réel.",
    },
];

export function HowItWorks() {
    return (
        <SectionContainer className="bg-background">
            <ScrollReveal className="text-center space-y-4 mb-12 md:mb-16">
                <Badge variant="outline" className="mb-2">Comment ça marche</Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Un processus simple en 3 étapes
                </h2>
                <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground">
                    De la demande à la livraison, nous gérons tout pour vous
                </p>
            </ScrollReveal>

            <StaggerContainer className="grid gap-8 md:grid-cols-3" staggerSpeed="slow">
                {steps.map((step) => (
                    <StaggerItem key={step.number}>
                        <AnimatedCard hoverEffect="lift" className="h-full">
                            <Card
                                className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors duration-300 h-full"
                            >
                                <CardContent className="p-6 md:p-8">
                                    {/* Number Badge */}
                                    <div className="absolute -top-4 -right-4 text-8xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                                        {step.number}
                                    </div>

                                    {/* Icon */}
                                    <div className="relative mb-6">
                                        <IconFloat>
                                            <div className="inline-flex p-4 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-colors">
                                                <step.icon className="h-8 w-8 text-primary" />
                                            </div>
                                        </IconFloat>
                                    </div>

                                    {/* Content */}
                                    <div className="relative space-y-3">
                                        <h3 className="text-xl md:text-2xl font-bold">
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
