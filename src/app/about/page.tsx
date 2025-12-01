import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FeatureCard } from "@/components/features/FeatureCard";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { features } from "@/config/marketing";
import { Truck, Target, Users, Award, ArrowRight } from "lucide-react";

export default function AboutPage() {
    const values = [
        {
            icon: Target,
            title: "Notre Mission",
            description: "Simplifier vos projets logistiques avec des solutions fiables et sécurisées adaptées à vos besoins spécifiques.",
        },
        {
            icon: Users,
            title: "Notre Équipe",
            description: "Des professionnels qualifiés et expérimentés, dédiés à la réussite de vos projets de transport.",
        },
        {
            icon: Award,
            title: "Notre Engagement",
            description: "Excellence du service, respect des délais et sécurité maximale pour tous vos biens transportés.",
        },
    ];

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="pt-20 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-muted/50 to-background">
                    <div className="grid gap-12 lg:grid-cols-2 items-center">
                        <div className="space-y-6">
                            <Badge variant="outline" className="mb-2">À Propos</Badge>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                                Votre partenaire{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                                    logistique
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                                HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE est votre partenaire de confiance pour tous vos besoins de transport et de logistique.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Fondée sur des valeurs de sécurité et d'efficacité, notre mission est de simplifier vos projets avec des solutions adaptées et un service irréprochable.
                            </p>
                            <div className="pt-4">
                                <Button size="lg" className="text-lg px-8 h-14 font-semibold group" asChild>
                                    <a href="/devis">
                                        Demander un devis
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted shadow-2xl border group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                    <Truck className="relative h-32 w-32 text-primary/40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionContainer>

                {/* Values Section */}
                <SectionContainer className="bg-background">
                    <div className="text-center space-y-4 mb-16">
                        <Badge variant="outline" className="mb-2">Nos Valeurs</Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Ce qui nous anime
                        </h2>
                        <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground">
                            "Votre sécurité, Notre priorité" n'est pas seulement un slogan, c'est notre engagement quotidien.
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {values.map((value) => (
                            <Card key={value.title} className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20">
                                        <value.icon className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold">{value.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {value.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </SectionContainer>

                {/* Features Section */}
                <SectionContainer className="bg-muted/30">
                    <div className="text-center space-y-4 mb-16">
                        <Badge variant="outline" className="mb-2">Nos Atouts</Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Pourquoi nous choisir ?
                        </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))}
                    </div>
                </SectionContainer>

                {/* Stats Section */}
                <SectionContainer className="bg-primary text-primary-foreground">
                    <div className="grid gap-8 md:grid-cols-3 text-center">
                        <div className="space-y-2">
                            <div className="text-5xl md:text-6xl font-bold">15+</div>
                            <p className="text-lg text-primary-foreground/90">Années d'expérience</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-5xl md:text-6xl font-bold">500+</div>
                            <p className="text-lg text-primary-foreground/90">Clients satisfaits</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-5xl md:text-6xl font-bold">98%</div>
                            <p className="text-lg text-primary-foreground/90">Taux de satisfaction</p>
                        </div>
                    </div>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
