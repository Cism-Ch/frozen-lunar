"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
import { Truck, ArrowRight, Star } from "lucide-react";
import {
    FadeIn,
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    CountUp,
    motion,
} from "@/components/ui/motion";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>

                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className="space-y-8">
                            {/* Trust Badges */}
                            <FadeIn direction="down" delay={0.1}>
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1.5 text-xs font-medium whitespace-nowrap sm:text-sm"
                                    >
                                        <Star className="fill-primary text-primary mr-1.5 h-3.5 w-3.5" />
                                        +15 ans d&apos;expérience
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="px-3 py-1.5 text-xs font-medium whitespace-nowrap sm:text-sm"
                                    >
                                        <Star className="fill-primary text-primary mr-1.5 h-3.5 w-3.5" />
                                        500+ clients satisfaits
                                    </Badge>
                                </div>
                            </FadeIn>

                            <div className="space-y-6">
                                <FadeIn direction="up" delay={0.2}>
                                    <h1 className="text-foreground text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
                                        Trouvez le transport{" "}
                                        <motion.span
                                            className="from-primary to-primary/60 inline-block bg-linear-to-r bg-clip-text text-transparent"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.4,
                                                type: "spring",
                                                stiffness: 100,
                                            }}
                                        >
                                            qu&apos;il vous faut
                                        </motion.span>
                                    </h1>
                                </FadeIn>
                                <FadeIn direction="up" delay={0.3}>
                                    <p className="text-muted-foreground max-w-[600px] text-lg leading-relaxed md:text-xl">
                                        Réservez en quelques clics les meilleurs
                                        services de transport pour tous vos
                                        projets. Simple, rapide et fiable.
                                    </p>
                                </FadeIn>
                            </div>

                            <FadeIn direction="up" delay={0.4}>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 20,
                                        }}
                                    >
                                        <Button
                                            size="lg"
                                            className="group h-14 w-full px-8 text-lg font-semibold sm:w-auto"
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
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 20,
                                        }}
                                    >
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="h-14 w-full px-8 text-lg font-semibold sm:w-auto"
                                            asChild
                                        >
                                            <a href="#services">Nos Services</a>
                                        </Button>
                                    </motion.div>
                                </div>
                            </FadeIn>

                            {/* Quick Stats */}
                            <FadeIn direction="up" delay={0.5}>
                                <div className="grid grid-cols-3 gap-2 border-t pt-8 sm:gap-6">
                                    <div>
                                        <div className="text-primary text-2xl font-bold sm:text-3xl">
                                            <CountUp
                                                to={98}
                                                suffix="%"
                                                duration={2}
                                            />
                                        </div>
                                        <div className="text-muted-foreground text-xs sm:text-sm">
                                            Satisfaction
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-primary text-2xl font-bold sm:text-3xl">
                                            24/7
                                        </div>
                                        <div className="text-muted-foreground text-xs sm:text-sm">
                                            Disponible
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-primary text-2xl font-bold sm:text-3xl">
                                            <CountUp
                                                to={100}
                                                suffix="%"
                                                duration={2.2}
                                            />
                                        </div>
                                        <div className="text-muted-foreground text-xs sm:text-sm">
                                            Sécurisé
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>

                        <FadeIn direction="right" delay={0.3}>
                            <div className="bg-muted group relative aspect-video overflow-hidden rounded-2xl border shadow-2xl lg:order-last">
                                {/* Hero Image Placeholder with stylized background */}
                                <div className="from-primary/5 via-background to-secondary/5 absolute inset-0 flex items-center justify-center bg-linear-to-br transition-transform duration-700 group-hover:scale-105">
                                    <motion.div
                                        className="relative"
                                        animate={{
                                            y: [0, -10, 0],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <div className="bg-primary/20 absolute -inset-4 animate-pulse rounded-full blur-xl"></div>
                                        <Truck className="text-primary/40 relative h-32 w-32" />
                                    </motion.div>
                                </div>
                                {/* Decorative elements */}
                                <motion.div
                                    className="bg-primary/5 absolute top-4 right-4 h-20 w-20 rounded-full blur-2xl"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                    }}
                                />
                                <motion.div
                                    className="bg-secondary/5 absolute bottom-4 left-4 h-32 w-32 rounded-full blur-3xl"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.5, 0.7, 0.5],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        delay: 1,
                                    }}
                                />
                            </div>
                        </FadeIn>
                    </div>
                </SectionContainer>

                {/* How It Works Section */}
                <HowItWorks />

                {/* Services Section */}
                <SectionContainer id="services" className="bg-muted/30">
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
                <SectionContainer className="from-primary via-primary to-primary/90 text-primary-foreground bg-linear-to-br py-24 md:py-32">
                    <ScrollReveal>
                        <div className="mx-auto max-w-3xl space-y-8 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                Prêt à simplifier votre logistique ?
                            </h2>
                            <p className="text-primary-foreground/90 text-lg leading-relaxed md:text-xl">
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
                                        variant="secondary"
                                        className="h-14 px-8 text-lg font-semibold"
                                        asChild
                                    >
                                        <a href="/devis">Demander un devis</a>
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
                                        className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary h-14 border-2 bg-transparent px-8 text-lg font-semibold"
                                        asChild
                                    >
                                        <a href="/contact">Contactez-nous</a>
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
