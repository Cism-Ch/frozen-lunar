import type { Metadata } from "next";
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
        <section className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
            <StatusDashboard mode="public" initialReport={initialReport} />
        </section>
    );
}
