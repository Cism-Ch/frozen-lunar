"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPartnersClient } from "@/components/features/partners/AdminPartnersClient";
import {
    getAdminPartnerApplicationsAction,
    type PartnerApplicationItem,
} from "@/app/actions/partner-actions";

export default function AdminPartnersPage() {
    const [applications, setApplications] = useState<
        PartnerApplicationItem[] | null
    >(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        async function load() {
            const res = await getAdminPartnerApplicationsAction();
            if (!active) return;
            if (res.error || !res.data) {
                setError(
                    res.error ||
                        "Impossible de charger les dossiers partenaires."
                );
            } else {
                setApplications(res.data);
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
            <div className="space-y-4">
                <Skeleton className="h-10 w-72" />
                {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-48 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (error || !applications) {
        return (
            <Card className="border-destructive/40">
                <CardContent className="text-destructive p-6 text-sm">
                    {error || "Dossiers partenaires indisponibles."}
                </CardContent>
            </Card>
        );
    }

    return <AdminPartnersClient initialApplications={applications} />;
}
