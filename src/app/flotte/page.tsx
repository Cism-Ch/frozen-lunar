import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getPublicFleetAction } from "@/app/actions/fleet-actions";
import { FleetPortfolioClient } from "@/components/features/fleet/FleetPortfolioClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Notre Flotte de Véhicules & Engins | HBC Logistique",
    description:
        "Découvrez notre flotte disponible en Côte d'Ivoire et Afrique de l'Ouest : Bus 64 places, Porte-char 40-70T, Porte-conteneurs 20'/40', Bennes 6x4/8x4, Camion-grue Hiab et Pick-up 4x4.",
};

export default async function FleetPage() {
    const { data: vehicles } = await getPublicFleetAction();

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <FleetPortfolioClient vehicles={vehicles} />
            </main>
            <Footer />
        </div>
    );
}
