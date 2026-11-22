"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDashboard } from "@/components/features/status/StatusDashboard";
import {
    getAdminHealthReportAction,
    type AdminHealthSnapshot,
} from "@/app/actions/health-actions";

export default function AdminStatusPage() {
    const [snapshot, setSnapshot] = useState<AdminHealthSnapshot | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        async function load() {
            const res = await getAdminHealthReportAction(false);
            if (!active) return;
            if (res.error || !res.data) {
                setError(
                    res.error ||
                        "Impossible de charger le tableau de supervision."
                );
            } else {
                setSnapshot(res.data);
            }
            setLoading(false);
        }
        void load();
        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !snapshot) {
        return (
            <Card className="border-destructive/40">
                <CardContent className="text-destructive p-6 text-sm">
                    {error || "Données de supervision indisponibles."}
                </CardContent>
            </Card>
        );
    }

    return (
        <StatusDashboard
            mode="admin"
            initialReport={snapshot.report}
            initialDiagnostics={snapshot.diagnostics}
        />
    );
}
