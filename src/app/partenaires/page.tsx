import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { PartnerApplicationWizard } from "@/components/features/partners/PartnerApplicationWizard";

export const metadata: Metadata = {
    title: "Devenir Partenaire Transporteur Afrique | HBC Logistique",
    description:
        "Rejoignez le réseau de transporteurs et loueurs d'engins partenaires HBC Logistique en Côte d'Ivoire et dans l'espace UEMOA / CEDEAO.",
};

export default function PartnersPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <SectionContainer className="bg-background pt-12 md:pt-16">
                    <PartnerApplicationWizard />
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
