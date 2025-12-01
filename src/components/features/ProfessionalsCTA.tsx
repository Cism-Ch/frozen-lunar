import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Check, ArrowRight } from "lucide-react";

const benefits = [
    "Visibilité maximale auprès de clients qualifiés",
    "Gestion simplifiée de vos demandes de transport",
    "Paiements sécurisés et rapides",
    "Support dédié pour développer votre activité",
];

export function ProfessionalsCTA() {
    return (
        <SectionContainer className="bg-primary text-primary-foreground">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
                {/* Left Content */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Vous êtes transporteur ?
                        </h2>
                        <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
                            Rejoignez notre réseau et développez votre clientèle.
                            Inscription gratuite et sans engagement.
                        </p>
                    </div>

                    {/* Benefits List */}
                    <ul className="space-y-3">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20">
                                        <Check className="h-4 w-4" />
                                    </div>
                                </div>
                                <span className="text-primary-foreground/90 leading-relaxed">
                                    {benefit}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <div className="pt-4">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="text-lg px-8 h-14 font-semibold group"
                            asChild
                        >
                            <a href="/contact">
                                Rejoindre le réseau
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Right Content - Stats Card */}
                <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur">
                    <CardContent className="p-8 md:p-10">
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <div className="text-5xl md:text-6xl font-bold">
                                    500+
                                </div>
                                <p className="text-primary-foreground/80 text-lg">
                                    Transporteurs partenaires
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center space-y-1">
                                    <div className="text-3xl md:text-4xl font-bold">
                                        98%
                                    </div>
                                    <p className="text-sm text-primary-foreground/70">
                                        Satisfaction client
                                    </p>
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="text-3xl md:text-4xl font-bold">
                                        24/7
                                    </div>
                                    <p className="text-sm text-primary-foreground/70">
                                        Support disponible
                                    </p>
                                </div>
                            </div>

                            <p className="text-center text-sm text-primary-foreground/70 italic pt-4 border-t border-primary-foreground/20">
                                La plateforme de confiance pour tous vos services de transport
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SectionContainer>
    );
}
