import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Truck, ShieldCheck, Clock, Box } from "lucide-react";

export default function AboutPage() {
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
            <main className="flex-1 container py-12 md:py-24">
                <div className="grid gap-12 lg:grid-cols-2 items-center mb-16">
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            À Propos de HBC Logistique
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE est votre partenaire de confiance pour tous vos besoins de transport et de logistique.
                            Fondée sur des valeurs de sécurité et d'efficacité, notre mission est de simplifier vos projets.
                        </p>
                        <p className="text-lg text-muted-foreground">
                            "Votre sécurité, Notre priorité" n'est pas seulement un slogan, c'est notre engagement quotidien.
                        </p>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-muted shadow-xl border">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Truck className="h-24 w-24 text-primary/40" />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-center">Pourquoi nous choisir ?</h2>
                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <li key={feature.title} className="flex flex-col items-center text-center gap-2 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <feature.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    );
}
