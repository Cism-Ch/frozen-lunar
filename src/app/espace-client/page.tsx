import type { Metadata } from "next";
import { ClientSpaceDashboard } from "@/components/features/client/ClientSpaceDashboard";

export const metadata: Metadata = {
    title: "Espace Client & Entreprise | HBC Logistique",
    description:
        "Suivez vos devis de transport, téléchargez vos PDF, recommandez en 1 clic et échangez en direct avec notre assistant IA et nos validateurs humains.",
};

export default function ClientSpacePage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
            <ClientSpaceDashboard />
        </div>
    );
}
