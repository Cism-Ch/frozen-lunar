"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminFleetClient } from "@/components/features/fleet/AdminFleetClient";
import { getAdminFleetAction } from "@/app/actions/fleet-actions";
import type { FleetVehicleItem } from "@/lib/fleet-catalog";

export default function AdminFleetPage() {
    const [vehicles, setVehicles] = useState<FleetVehicleItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        async function load() {
            const res = await getAdminFleetAction();
            if (!active) return;
            if (res.error || !res.data) {
                setError(res.error || "Impossible de charger la flotte.");
            } else {
                setVehicles(res.data);
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
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-44 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !vehicles) {
        return (
            <Card className="border-destructive/40">
                <CardContent className="text-destructive p-6 text-sm">
                    {error || "Données de flotte indisponibles."}
                </CardContent>
            </Card>
        );
    }

    return <AdminFleetClient initialVehicles={vehicles} />;
}
