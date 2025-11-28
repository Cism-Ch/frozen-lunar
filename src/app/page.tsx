import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/features/ServiceCard";
import { StatsSection } from "@/components/features/StatsSection";
import { TestimonialsSection } from "@/components/features/TestimonialsSection";
import { FAQSection } from "@/components/features/FAQSection";
import { WhatsAppButton } from "@/components/features/WhatsAppButton";
import { Box, Hammer, Home as HomeIcon, Truck, Warehouse, ShieldCheck, Clock, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const services = [
    {
      title: "Transport de Matériaux",
      description: "Livraison rapide de matériaux de construction sur vos chantiers.",
      icon: Box,
    },
    {
      title: "Transport de Containers",
      description: "Solutions adaptées pour le déplacement de containers maritimes et de stockage.",
      icon: Warehouse,
    },
    {
      title: "Transport de Charpentes",
      description: "Transport spécialisé pour charpentes bois et métalliques de grandes dimensions.",
      icon: HomeIcon,
    },
    {
      title: "Transport de Machines",
      description: "Déplacement sécurisé de machines industrielles et engins de chantier.",
      icon: Hammer,
    },
    {
      title: "Modules Préfabriqués",
      description: "Logistique complète pour l'acheminement de modules et bungalows.",
      icon: Truck,
    },
  ];

  const features = [
    {
      title: "Camion Adapté",
      description: "Une flotte moderne pour tous types de chargements.",
      icon: Truck,
    },
    {
      title: "Chargement Expert",
      description: "Personnel qualifié pour un chargement optimal.",
      icon: Box,
    },
    {
      title: "Sécurité Maximale",
      description: "Assurance et protocoles stricts pour vos biens.",
      icon: ShieldCheck,
    },
    {
      title: "Livraison Ponctuelle",
      description: "Respect des délais et suivi en temps réel.",
      icon: Clock,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-background py-16 md:py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-8">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight">
                  Votre sécurité <br />
                  <span className="text-primary">Notre priorité</span>
                </h1>
                <p className="max-w-[600px] text-lg md:text-xl text-foreground-muted leading-relaxed">
                  HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE.
                  <br />
                  Nous organisons tout pour vous : camion, chargement, sécurité, livraison.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="text-lg px-8" asChild>
                    <a href="/devis">Demander un devis</a>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <a href="#services">Nos Services</a>
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted shadow-xl border lg:order-last">
                {/* Hero Image Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <Truck className="h-32 w-32 text-primary/20" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 bg-background-subtle">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                Nos Services de Transport
              </h2>
              <p className="max-w-[700px] mx-auto text-lg md:text-xl text-foreground-muted">
                Des solutions complètes pour tous vos besoins logistiques et immobiliers.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.title} {...service} />
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="why-us" className="py-16 md:py-24 bg-background-muted">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                Pourquoi choisir HBC Logistique ?
              </h2>
              <p className="max-w-[700px] mx-auto text-lg md:text-xl text-foreground-muted">
                Nous ne nous contentons pas de transporter, nous prenons soin de votre projet de A à Z.
                Notre expertise garantit une tranquillité d'esprit totale.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center gap-4 p-8 rounded-lg border hover:border-strong bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="p-3 rounded-full bg-primary/10">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">{feature.title}</h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <StatsSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <section className="py-16 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Prêt à simplifier votre logistique ?
              </h2>
              <p className="max-w-[600px] mx-auto text-primary-foreground/90 text-lg md:text-xl">
                Obtenez votre devis gratuit en quelques secondes ou contactez-nous pour une solution sur mesure.
              </p>
              <Button size="lg" variant="secondary" className="text-lg px-8 font-semibold">
                Contactez-nous
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
