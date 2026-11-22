import type { Metadata } from "next";
import { PartnerApplicationWizard } from "@/components/features/partners/PartnerApplicationWizard";

export const metadata: Metadata = {
    title: "Devenir Partenaire Transporteur Afrique | HBC Logistique",
    description:
        "Rejoignez le réseau de transporteurs et loueurs d'engins partenaires HBC Logistique en Côte d'Ivoire et dans l'espace UEMOA / CEDEAO.",
};

export default function PartnersPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
            <PartnerApplicationWizard />
        </div>
    );
}
