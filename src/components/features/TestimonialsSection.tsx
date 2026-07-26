"use client";

import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import {
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    AnimatedCard,
    motion,
} from "@/components/ui/motion";

const testimonials = [
    {
        name: "Jean Dupont",
        company: "Construction Moderne SA",
        role: "Directeur de Projet",
        content:
            "Service impeccable ! HBC Logistique a transporté nos matériaux de construction avec un professionnalisme exemplaire. Livraison ponctuelle et équipe très compétente.",
        rating: 5,
    },
    {
        name: "Marie Laurent",
        company: "Architecte Indépendante",
        role: "Architecte",
        content:
            "Je recommande vivement HBC pour le transport de modules préfabriqués. Leur attention aux détails et leur souci de la sécurité sont remarquables.",
        rating: 5,
    },
    {
        name: "Pierre Martin",
        company: "Industrie Mécanique Pro",
        role: "Responsable Logistique",
        content:
            "Transport de machines industrielles effectué sans aucun problème. Prix compétitif et service client réactif. Une entreprise de confiance !",
        rating: 5,
    },
];

export function TestimonialsSection() {
    return (
        <SectionContainer className="bg-muted/30">
            <ScrollReveal className="mb-16 space-y-4 text-center">
                <Badge variant="outline" className="mb-2">
                    Témoignages
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Ce que disent nos clients
                </h2>
                <p className="text-muted-foreground mx-auto max-w-[700px] text-lg md:text-xl">
                    La satisfaction de nos clients est notre priorité absolue
                </p>
            </ScrollReveal>

            <StaggerContainer
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                staggerSpeed="slow"
            >
                {testimonials.map((testimonial, index) => (
                    <StaggerItem key={index}>
                        <AnimatedCard hoverEffect="lift" className="h-full">
                            <Card className="hover:border-primary/50 group relative h-full overflow-hidden border-2 transition-colors duration-300">
                                {/* Quote Icon Background */}
                                <motion.div
                                    className="absolute top-4 right-4 opacity-5"
                                    initial={{ opacity: 0.05, rotate: 0 }}
                                    whileHover={{
                                        opacity: 0.1,
                                        rotate: 5,
                                        scale: 1.1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Quote className="text-primary h-24 w-24" />
                                </motion.div>

                                <CardContent className="relative p-8">
                                    {/* Stars - Sequential Reveal */}
                                    <div className="mb-4 flex items-center gap-1">
                                        {[...Array(testimonial.rating)].map(
                                            (_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0,
                                                    }}
                                                    whileInView={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    transition={{
                                                        delay: 0.1 * i,
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 15,
                                                    }}
                                                    viewport={{ once: true }}
                                                >
                                                    <Star className="fill-primary text-primary h-5 w-5" />
                                                </motion.div>
                                            )
                                        )}
                                    </div>

                                    {/* Content */}
                                    <p className="text-muted-foreground mb-6 leading-relaxed italic">
                                        &quot;{testimonial.content}&quot;
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-4 border-t pt-4">
                                        <motion.div
                                            className="from-primary/20 to-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br"
                                            whileHover={{ scale: 1.1 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                            }}
                                        >
                                            <span className="text-primary text-lg font-bold">
                                                {testimonial.name.charAt(0)}
                                            </span>
                                        </motion.div>
                                        <div>
                                            <p className="text-foreground font-semibold">
                                                {testimonial.name}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {testimonial.role} •{" "}
                                                {testimonial.company}
                                            </p>
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
