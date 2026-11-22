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

    return <StatusDashboard mode="public" initialReport={initialReport} />;
}
