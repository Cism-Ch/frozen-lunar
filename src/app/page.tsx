"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/features/HeroSection";
import { ServiceCard } from "@/components/features/ServiceCard";
import { FeatureCard } from "@/components/features/FeatureCard";
import { HowItWorks } from "@/components/features/HowItWorks";
import { ProfessionalsCTA } from "@/components/features/ProfessionalsCTA";
import { StatsSection } from "@/components/features/StatsSection";
import { TestimonialsSection } from "@/components/features/TestimonialsSection";
import { FAQSection } from "@/components/features/FAQSection";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { services, features } from "@/config/marketing";
import {
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    motion,
} from "@/components/ui/motion";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Cover Section */}
                <HeroSection />

                {/* How It Works Section */}
                <HowItWorks />

                {/* Services Section */}
                <SectionContainer
                    id="services"
                    className="relative overflow-hidden bg-[#F2F5F7]/70 dark:bg-[#0F1822]/70"
                >
                    <div
                        aria-hidden="true"
                        className="bg-primary-accent/10 pointer-events-none absolute -top-24 right-10 h-72 w-72 rounded-full blur-[110px]"
                    />
                    <ScrollReveal className="mb-16 space-y-4 text-center">
                        <Badge variant="outline" className="mb-2">
                            Nos Services
                        </Badge>
                        <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Tout ce dont votre projet a besoin
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-[700px] text-lg md:text-xl">
                            Des solutions complètes pour tous vos besoins
                            logistiques et immobiliers.
                        </p>
                    </ScrollReveal>
                    <StaggerContainer
                        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                        staggerSpeed="normal"
                    >
                        {services.map((service, index) => (
                            <StaggerItem key={service.title}>
                                <ServiceCard
                                    {...service}
                                    badge={
                                        index === 0 ? "Populaire" : undefined
                                    }
                                />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </SectionContainer>

                {/* Why Choose Us Section */}
                <SectionContainer id="why-us" className="bg-background">
                    <ScrollReveal className="mb-16 space-y-4 text-center">
                        <Badge variant="outline" className="mb-2">
                            Nos Avantages
                        </Badge>
                        <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Pourquoi choisir HBC Logistique ?
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-[700px] text-lg md:text-xl">
                            Des services de qualité avec des garanties
                            exceptionnelles pour votre sérénité
                        </p>
                    </ScrollReveal>
                    <StaggerContainer
                        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                        staggerSpeed="fast"
                    >
                        {features.map((feature) => (
                            <StaggerItem key={feature.title}>
                                <FeatureCard {...feature} />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </SectionContainer>

                {/* Statistics Section */}
                <StatsSection />

                {/* Testimonials Section */}
                <TestimonialsSection />

                {/* Professionals CTA Section */}
                <ProfessionalsCTA />

                {/* FAQ Section */}
                <FAQSection />

                {/* CTA Section */}
                <SectionContainer className="bg-secondary text-secondary-foreground relative overflow-hidden py-24 md:py-32">
                    <ScrollReveal>
                        <div className="mx-auto max-w-3xl space-y-8 text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                                Prêt à simplifier votre logistique ?
                            </h2>
                            <p className="text-lg leading-relaxed text-slate-200 md:text-xl">
                                Obtenez votre devis gratuit en quelques secondes
                                ou contactez-nous pour une solution sur mesure.
                            </p>
                            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 20,
                                    }}
                                >
                                    <Button
                                        size="lg"
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 h-14 px-8 text-lg font-semibold shadow-lg"
                                        asChild
                                    >
                                        <Link href="/devis">
                                            Demander un devis
                                        </Link>
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 20,
                                    }}
                                >
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-14 border-2 border-white/30 bg-transparent px-8 text-lg font-semibold text-white hover:bg-white/10 hover:text-white"
                                        asChild
                                    >
                                        <Link href="/contact">
                                            Contactez-nous
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </ScrollReveal>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
