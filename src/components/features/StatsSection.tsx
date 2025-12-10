"use client";

import { SectionContainer } from "@/components/layout/SectionContainer";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Package, Award } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCard, CountUp, IconFloat } from "@/components/ui/motion";

const stats = [
  {
    icon: TrendingUp,
    value: 15,
    suffix: "+",
    label: "Années d'expérience",
    description: "Au service de vos projets",
  },
  {
    icon: Users,
    value: 500,
    suffix: "+",
    label: "Clients satisfaits",
    description: "Qui nous font confiance",
  },
  {
    icon: Package,
    value: 10,
    suffix: "K+",
    label: "Transports réalisés",
    description: "En toute sécurité",
  },
  {
    icon: Award,
    value: 98,
    suffix: "%",
    label: "Taux de satisfaction",
    description: "Clients recommandent",
  },
];

export function StatsSection() {
  return (
    <SectionContainer className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
      <ScrollReveal className="text-center space-y-4 mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Des chiffres qui parlent
        </h2>
        <p className="max-w-[700px] mx-auto text-lg md:text-xl text-primary-foreground/90">
          Notre expérience et notre engagement se reflètent dans nos résultats
        </p>
      </ScrollReveal>

      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerSpeed="normal">
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <AnimatedCard hoverEffect="subtle">
              <Card
                className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur hover:bg-primary-foreground/15 transition-all duration-300 group"
              >
                <CardContent className="p-8 text-center space-y-4">
                  {/* Icon */}
                  <IconFloat>
                    <div className="inline-flex p-4 rounded-2xl bg-primary-foreground/20 group-hover:bg-primary-foreground/30 transition-colors">
                      <stat.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </IconFloat>

                  {/* Value - Animated Counter */}
                  <div className="text-5xl md:text-6xl font-bold">
                    <CountUp
                      to={stat.value}
                      suffix={stat.suffix}
                      duration={2.5}
                    />
                  </div>

                  {/* Label */}
                  <div className="space-y-1">
                    <div className="text-lg font-semibold">
                      {stat.label}
                    </div>
                    <div className="text-sm text-primary-foreground/70">
                      {stat.description}
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
