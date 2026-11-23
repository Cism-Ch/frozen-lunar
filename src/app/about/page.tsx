"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FeatureCard } from "@/components/features/FeatureCard";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { features } from "@/config/marketing";
import { Target, Users, Award, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    AnimatedCard,
    IconFloat,
    CountUp,
    motion,
} from "@/components/ui/motion";

export default function AboutPage() {
    const values = [
        {
            icon: Target,
            title: "Notre Mission",
            description:
                "Simplifier vos projets logistiques avec des solutions fiables et sécurisées adaptées à vos besoins spécifiques.",
        },
        {
            icon: Users,
            title: "Notre Équipe",
            description:
                "Des professionnels qualifiés et expérimentés, dédiés à la réussite de vos projets de transport.",
        },
        {
            icon: Award,
            title: "Notre Engagement",
            description:
                "Excellence du service, respect des délais et sécurité maximale pour tous vos biens transportés.",
        },
    ];

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="relative overflow-hidden bg-[#F2F5F7] pt-20 pb-16 md:pt-28 md:pb-24 dark:bg-[#0B1219]">
                    <div
                        aria-hidden="true"
                        className="bg-primary-accent/15 pointer-events-none absolute -top-20 right-10 h-64 w-64 rounded-full blur-[100px]"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#6081A0]/15 blur-[100px] dark:bg-[#92A9BE]/20"
                    />
                    <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
                        <ScrollReveal
                            direction="left"
                            className="space-y-6 text-center lg:text-left"
                        >
                            <Badge
                                variant="outline"
                                className="mx-auto mb-2 lg:mx-0"
                            >
                                À Propos
                            </Badge>
                            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
                                Votre partenaire{" "}
                                <motion.span
                                    className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                >
                                    logistique
                                </motion.span>
                            </h1>
                            <p className="text-muted-foreground mx-auto max-w-[90%] text-lg leading-relaxed md:text-xl lg:mx-0">
                                HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE est
                                votre partenaire de confiance pour tous vos
                                besoins de transport et de logistique.
                            </p>
                            <p className="text-muted-foreground mx-auto max-w-[90%] text-lg leading-relaxed lg:mx-0">
                                Fondée sur des valeurs de sécurité et
                                d&apos;efficacité, notre mission est de
                                simplifier vos projets avec des solutions
                                adaptées et un service irréprochable.
                            </p>
                            <motion.div
                                className="flex justify-center pt-4 lg:justify-start"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    size="lg"
                                    className="group h-14 w-full px-8 text-lg font-semibold sm:w-auto"
                                    asChild
                                >
                                    <Link href="/devis">
                                        Demander un devis
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </ScrollReveal>

                        <ScrollReveal direction="right">
                            <div className="group relative">
                                <div
                                    aria-hidden="true"
                                    className="from-primary/25 via-primary-accent/15 to-[#6081A0]/25 dark:to-[#92A9BE]/30 absolute -inset-2 rounded-[2rem] bg-linear-to-tr opacity-80 blur-2xl"
                                />
                                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-900/10 bg-[#F2F5F7] shadow-2xl dark:border-[#92A9BE]/25 dark:bg-[#111C27]">
                                    <Image
                                        src="/images/about-isometric.jpg"
                                        alt="Illustration isométrique du hub logistique et multi-transport HBC Logistique"
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-transparent" />
                                    <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between rounded-2xl border border-white/40 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-md backdrop-blur-md dark:border-[#92A9BE]/30 dark:bg-[#0B1219]/80 dark:text-white">
                                        <span>Hub Multi-Services • Côte d&apos;Ivoire</span>
                                        <span className="text-primary font-mono font-bold">
                                            24/7
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </SectionContainer>

                {/* Values Section */}
                <SectionContainer className="bg-background">
                    <ScrollReveal className="mb-16 space-y-4 text-center">
                        <Badge variant="outline" className="mb-2">
                            Nos Valeurs
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Ce qui nous anime
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-[700px] text-lg text-balance md:text-xl">
                            &quot;Votre sécurité, Notre priorité&quot;
                            n&apos;est pas seulement un slogan, c&apos;est notre
                            engagement quotidien.
                        </p>
                    </ScrollReveal>
                    <StaggerContainer
                        className="grid gap-8 md:grid-cols-3"
                        staggerSpeed="normal"
                    >
                        {values.map((value) => (
                            <StaggerItem key={value.title} className="h-full">
                                <AnimatedCard
                                    hoverEffect="lift"
                                    className="h-full"
                                >
                                    <Card className="hover:border-primary/50 flex h-full flex-col border-2 transition-all duration-300 hover:shadow-lg">
                                        <CardContent className="flex flex-1 flex-col space-y-4 p-8 text-center">
                                            <IconFloat>
                                                <div className="from-primary/10 to-primary/20 inline-flex rounded-2xl bg-gradient-to-br p-4">
                                                    <value.icon className="text-primary h-10 w-10" />
                                                </div>
                                            </IconFloat>
                                            <h3 className="text-2xl font-bold">
                                                {value.title}
                                            </h3>
                                            <p className="text-muted-foreground flex-1 leading-relaxed">
                                                {value.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </AnimatedCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </SectionContainer>

                {/* Features Section */}
                <SectionContainer className="bg-muted/30">
                    <ScrollReveal className="mb-16 space-y-4 text-center">
                        <Badge variant="outline" className="mb-2">
                            Nos Atouts
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Pourquoi nous choisir ?
                        </h2>
                    </ScrollReveal>
                    <StaggerContainer
                        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                        staggerSpeed="fast"
                    >
                        {features.map((feature) => (
                            <StaggerItem key={feature.title} className="h-full">
                                <FeatureCard {...feature} />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </SectionContainer>

                {/* Stats Section */}
                <SectionContainer className="bg-secondary text-secondary-foreground border-border/20 border-y">
                    <StaggerContainer
                        className="grid gap-8 text-center md:grid-cols-3"
                        staggerSpeed="fast"
                    >
                        <StaggerItem>
                            <div className="space-y-2">
                                <div className="text-primary text-5xl font-bold md:text-6xl">
                                    <CountUp to={15} suffix="+" duration={2} />
                                </div>
                                <p className="text-secondary-foreground/80 text-lg">
                                    Années d&apos;expérience
                                </p>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="space-y-2">
                                <div className="text-primary text-5xl font-bold md:text-6xl">
                                    <CountUp
                                        to={500}
                                        suffix="+"
                                        duration={2.5}
                                    />
                                </div>
                                <p className="text-secondary-foreground/80 text-lg">
                                    Clients satisfaits
                                </p>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="space-y-2">
                                <div className="text-primary text-5xl font-bold md:text-6xl">
                                    <CountUp to={98} suffix="%" duration={2} />
                                </div>
                                <p className="text-secondary-foreground/80 text-lg">
                                    Taux de satisfaction
                                </p>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
