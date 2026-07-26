"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/features/ServiceCard";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { services } from "@/config/marketing";
import { ArrowRight } from "lucide-react";
import {
    FadeIn,
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    motion,
} from "@/components/ui/motion";

export default function ServicesPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="from-muted/50 to-background bg-gradient-to-b pt-20 pb-16 md:pt-32 md:pb-24">
                    <FadeIn
                        direction="up"
                        className="mx-auto max-w-3xl space-y-6 text-center"
                    >
                        <Badge variant="outline" className="mb-2">
                            Nos Services
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Nos Services de{" "}
                            <motion.span
                                className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: 0.3,
                                    type: "spring",
                                    stiffness: 200,
                                }}
                            >
                                Transport
                            </motion.span>
                        </h1>
                        <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
                            Découvrez notre gamme complète de solutions
                            logistiques adaptées à tous vos besoins
                            professionnels.
                        </p>
                    </FadeIn>
                </SectionContainer>

                {/* Services Grid */}
                <SectionContainer className="bg-background">
                    <StaggerContainer
                        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                        staggerSpeed="normal"
                    >
                        {services.map((service, index) => (
                            <StaggerItem key={service.title}>
                                <ServiceCard
                                    {...service}
                                    badge={
                                        index === 0
                                            ? "Populaire"
                                            : index === 1
                                              ? "Nouveau"
                                              : undefined
                                    }
                                />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </SectionContainer>

                {/* CTA Section */}
                <SectionContainer className="bg-muted/30">
                    <ScrollReveal className="mx-auto max-w-2xl space-y-8 text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Besoin d&apos;un service personnalisé ?
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Notre équipe est à votre disposition pour étudier
                            vos besoins spécifiques et vous proposer une
                            solution sur mesure.
                        </p>
                        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    size="lg"
                                    className="group h-14 px-8 text-lg font-semibold"
                                    asChild
                                >
                                    <a href="/devis">
                                        Demander un devis
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </a>
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-8 text-lg font-semibold"
                                    asChild
                                >
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
