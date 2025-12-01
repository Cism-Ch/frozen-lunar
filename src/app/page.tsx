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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <SectionContainer className="pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden relative">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 mr-1.5 fill-primary text-primary" />
                  +15 ans d'expérience
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 mr-1.5 fill-primary text-primary" />
                  500+ clients satisfaits
                </Badge>
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight">
                  Trouvez le transport{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                    qu'il vous faut
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                  Réservez en quelques clics les meilleurs services de transport pour tous vos projets.
                  Simple, rapide et fiable.
                </p>
              </div>

              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button size="lg" className="text-lg px-8 h-14 font-semibold group" asChild>
                  <a href="/devis">
                    Demander un devis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 font-semibold" asChild>
                  <a href="#services">Nos Services</a>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div>
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Disponible</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Sécurisé</div>
                </div>
              </div>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted shadow-2xl border lg:order-last group">
              {/* Hero Image Placeholder with stylized background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <Truck className="relative h-32 w-32 text-primary/40" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 h-20 w-20 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-4 h-32 w-32 bg-secondary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </SectionContainer>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Services Section */}
        <SectionContainer id="services" className="bg-muted/30">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="mb-2">Nos Services</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
              Tout ce dont votre projet a besoin
            </h2>
            <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground">
              Des solutions complètes pour tous vos besoins logistiques et immobiliers.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                {...service}
                badge={index === 0 ? "Populaire" : undefined}
              />
            ))}
          </div>
        </SectionContainer>

        {/* Why Choose Us Section */}
        <SectionContainer id="why-us" className="bg-background">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="mb-2">Nos Avantages</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
              Pourquoi choisir HBC Logistique ?
            </h2>
            <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground">
              Des services de qualité avec des garanties exceptionnelles pour votre sérénité
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
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
        <SectionContainer className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-24 md:py-32">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Prêt à simplifier votre logistique ?
            </h2>
            <p className="text-primary-foreground/90 text-lg md:text-xl leading-relaxed">
              Obtenez votre devis gratuit en quelques secondes ou contactez-nous pour une solution sur mesure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" className="text-lg px-8 h-14 font-semibold" asChild>
                <a href="/devis">Demander un devis</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold"
                asChild
              >
                <a href="/contact">Contactez-nous</a>
              </Button>
            </div>
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </div>
  );
}
