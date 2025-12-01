import { SectionContainer } from "@/components/layout/SectionContainer";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Package, Award } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "15+",
    label: "Années d'expérience",
    description: "Au service de vos projets",
  },
  {
    icon: Users,
    value: "500+",
    label: "Clients satisfaits",
    description: "Qui nous font confiance",
  },
  {
    icon: Package,
    value: "10K+",
    label: "Transports réalisés",
    description: "En toute sécurité",
  },
  {
    icon: Award,
    value: "98%",
    label: "Taux de satisfaction",
    description: "Clients recommandent",
  },
];

export function StatsSection() {
  return (
    <SectionContainer className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Des chiffres qui parlent
        </h2>
        <p className="max-w-[700px] mx-auto text-lg md:text-xl text-primary-foreground/90">
          Notre expérience et notre engagement se reflètent dans nos résultats
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur hover:bg-primary-foreground/15 transition-all duration-300 group"
          >
            <CardContent className="p-8 text-center space-y-4">
              {/* Icon */}
              <div className="inline-flex p-4 rounded-2xl bg-primary-foreground/20 group-hover:bg-primary-foreground/30 transition-colors">
                <stat.icon className="h-8 w-8 text-primary-foreground" />
              </div>

              {/* Value */}
              <div className="text-5xl md:text-6xl font-bold">
                {stat.value}
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
        ))}
      </div>
    </SectionContainer>
  );
}
