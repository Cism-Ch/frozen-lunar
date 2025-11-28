import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/features/ServiceCard";
import { Box, Hammer, Home as HomeIcon, Truck, Warehouse } from "lucide-react";

export default function ServicesPage() {
    const services = [
        {
            title: "Transport de Matériaux",
            description: "Livraison rapide de matériaux de construction sur vos chantiers. Nous assurons le transport de briques, ciment, bois, et tout autre matériau nécessaire à votre construction.",
            icon: Box,
        },
        {
            title: "Transport de Containers",
            description: "Solutions adaptées pour le déplacement de containers maritimes et de stockage. Équipement spécialisé pour le chargement et déchargement sécurisé.",
            icon: Warehouse,
        },
        {
            title: "Transport de Charpentes",
            description: "Transport spécialisé pour charpentes bois et métalliques de grandes dimensions. Convoi exceptionnel si nécessaire.",
            icon: HomeIcon,
        },
        {
            title: "Transport de Machines",
            description: "Déplacement sécurisé de machines industrielles et engins de chantier. Nous prenons soin de votre matériel coûteux.",
            icon: Hammer,
        },
        {
            title: "Modules Préfabriqués",
            description: "Logistique complète pour l'acheminement de modules et bungalows de chantier. Installation sur site possible.",
            icon: Truck,
        },
    ];

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-12 md:py-24">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Nos Services de Transport
                    </h1>
                    <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                        Découvrez notre gamme complète de solutions logistiques adaptées à vos besoins.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <ServiceCard key={service.title} {...service} />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
