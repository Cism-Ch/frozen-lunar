"use client";

import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCard, motion } from "@/components/ui/motion";

const testimonials = [
  {
    name: "Jean Dupont",
    company: "Construction Moderne SA",
    role: "Directeur de Projet",
    content: "Service impeccable ! HBC Logistique a transporté nos matériaux de construction avec un professionnalisme exemplaire. Livraison ponctuelle et équipe très compétente.",
    rating: 5,
  },
  {
    name: "Marie Laurent",
    company: "Architecte Indépendante",
    role: "Architecte",
    content: "Je recommande vivement HBC pour le transport de modules préfabriqués. Leur attention aux détails et leur souci de la sécurité sont remarquables.",
    rating: 5,
  },
  {
    name: "Pierre Martin",
    company: "Industrie Mécanique Pro",
    role: "Responsable Logistique",
    content: "Transport de machines industrielles effectué sans aucun problème. Prix compétitif et service client réactif. Une entreprise de confiance !",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <SectionContainer className="bg-muted/30">
      <ScrollReveal className="text-center space-y-4 mb-16">
        <Badge variant="outline" className="mb-2">Témoignages</Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Ce que disent nos clients
        </h2>
        <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground">
          La satisfaction de nos clients est notre priorité absolue
        </p>
      </ScrollReveal>

      <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" staggerSpeed="slow">
        {testimonials.map((testimonial, index) => (
          <StaggerItem key={index}>
            <AnimatedCard hoverEffect="lift" className="h-full">
              <Card
                className="border-2 hover:border-primary/50 transition-colors duration-300 group relative overflow-hidden h-full"
              >
                {/* Quote Icon Background */}
                <motion.div
                  className="absolute top-4 right-4 opacity-5"
                  initial={{ opacity: 0.05, rotate: 0 }}
                  whileHover={{ opacity: 0.1, rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Quote className="h-24 w-24 text-primary" />
                </motion.div>

                <CardContent className="p-8 relative">
                  {/* Stars - Sequential Reveal */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.1 * i,
                          type: "spring",
                          stiffness: 500,
                          damping: 15
                        }}
                        viewport={{ once: true }}
                      >
                        <Star className="h-5 w-5 fill-primary text-primary" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">
                    &quot;{testimonial.content}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <motion.div
                      className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <span className="text-lg font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </motion.div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.company}
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
