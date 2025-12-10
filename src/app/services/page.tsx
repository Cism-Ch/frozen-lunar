"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/features/ServiceCard";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { services } from "@/config/marketing";
import { ArrowRight } from "lucide-react";
import { FadeIn, ScrollReveal, StaggerContainer, StaggerItem, motion } from "@/components/ui/motion";

export default function ServicesPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="pt-20 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-muted/50 to-background">
                    <FadeIn direction="up" className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="mb-2">Nos Services</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Nos Services de{" "}
                            <motion.span
                                className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            >
                                Transport
                            </motion.span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                            Découvrez notre gamme complète de solutions logistiques adaptées à tous vos besoins professionnels.
                        </p>
                    </FadeIn>
                </SectionContainer>

                {/* Services Grid */}
                <SectionContainer className="bg-background">
                    <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" staggerSpeed="normal">
                        {services.map((service, index) => (
                            <StaggerItem key={service.title}>
                                <ServiceCard
                                    {...service}
                                    badge={index === 0 ? "Populaire" : index === 1 ? "Nouveau" : undefined}
                                />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </SectionContainer>

                {/* CTA Section */}
                <SectionContainer className="bg-muted/30">
                    <ScrollReveal className="text-center space-y-8 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Besoin d&apos;un service personnalisé ?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Notre équipe est à votre disposition pour étudier vos besoins spécifiques et vous proposer une solution sur mesure.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button size="lg" className="text-lg px-8 h-14 font-semibold group" asChild>
                                    <a href="/devis">
                                        Demander un devis
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button size="lg" variant="outline" className="text-lg px-8 h-14 font-semibold" asChild>
                                    <a href="/contact">Nous contacter</a>
                                </Button>
                            </motion.div>
                        </div>
                    </ScrollReveal>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
