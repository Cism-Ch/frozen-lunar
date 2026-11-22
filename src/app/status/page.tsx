import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { getSystemHealthReport } from "@/lib/health-check";
import { StatusDashboard } from "@/components/features/status/StatusDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Statut des Services & Uptime | HBC Logistique",
    description:
        "Consultez en temps réel la disponibilité et les temps de réponse des services et dépendances techniques de HBC Logistique.",
};

export default async function PublicStatusPage() {
    const initialReport = await getSystemHealthReport({
        bypassCache: false,
        triggerAlerts: true,
    });

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <SectionContainer className="bg-background pt-12 md:pt-16">
                    <div className="mx-auto max-w-5xl">
                        <StatusDashboard
                            mode="public"
                            initialReport={initialReport}
                        />
                    </div>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
