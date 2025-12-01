import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

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
      <div className="text-center space-y-4 mb-16">
        <Badge variant="outline" className="mb-2">Témoignages</Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Ce que disent nos clients
        </h2>
        <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground">
          La satisfaction de nos clients est notre priorité absolue
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            {/* Quote Icon Background */}
            <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Quote className="h-24 w-24 text-primary" />
            </div>

            <CardContent className="p-8 relative">
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
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
        ))}
      </div>
    </SectionContainer>
  );
}
