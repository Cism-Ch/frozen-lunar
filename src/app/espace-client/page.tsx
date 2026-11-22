import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ClientSpaceDashboard } from "@/components/features/client/ClientSpaceDashboard";

export const metadata: Metadata = {
    title: "Espace Client & Entreprise | HBC Logistique",
    description:
        "Suivez vos devis de transport, téléchargez vos PDF, recommandez en 1 clic et échangez en direct avec notre assistant IA et nos validateurs humains.",
};

export default function ClientSpacePage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <SectionContainer className="bg-background pt-12 md:pt-16">
                    <ClientSpaceDashboard />
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
