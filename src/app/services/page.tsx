"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/features/ServiceCard";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { services } from "@/config/marketing";
import { ArrowRight } from "lucide-react";

export default function ServicesPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="pt-20 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-muted/50 to-background">
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="mb-2">Nos Services</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Nos Services de{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                                Transport
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                            Découvrez notre gamme complète de solutions logistiques adaptées à tous vos besoins professionnels.
                        </p>
                    </div>
                </SectionContainer>

                {/* Services Grid */}
                <SectionContainer className="bg-background">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((service, index) => (
                            <ServiceCard
                                key={service.title}
                                {...service}
                                badge={index === 0 ? "Populaire" : index === 1 ? "Nouveau" : undefined}
                            />
                        ))}
                    </div>
                </SectionContainer>

                {/* CTA Section */}
                <SectionContainer className="bg-muted/30">
                    <div className="text-center space-y-8 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Besoin d'un service personnalisé ?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Notre équipe est à votre disposition pour étudier vos besoins spécifiques et vous proposer une solution sur mesure.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button size="lg" className="text-lg px-8 h-14 font-semibold group" asChild>
                                <a href="/devis">
                                    Demander un devis
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 h-14 font-semibold" asChild>
                                <a href="/contact">Nous contacter</a>
                            </Button>
                        </div>
                    </div>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
