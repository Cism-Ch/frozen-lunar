"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    Download,
    MapPin,
    Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderChat } from "@/components/features/client/OrderChat";
import { getClientQuoteDetailAction } from "@/app/actions/client-space-actions";
import { generateQuotePDF } from "@/lib/pdf-generator";
import { safeFormatDate } from "@/lib/date-utils";

type QuoteDetailData = NonNullable<
    Awaited<ReturnType<typeof getClientQuoteDetailAction>>["data"]
>;

export default function ClientQuoteDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [quote, setQuote] = useState<QuoteDetailData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        async function load() {
            const res = await getClientQuoteDetailAction(id);
            if (!active) return;
            if (res.error || !res.data) {
                setError(res.error || "Dossier introuvable ou accès non autorisé.");
            } else {
                setQuote(res.data);
            }
            setLoading(false);
        }
        void load();
        return () => {
            active = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto max-w-6xl space-y-6 px-4 py-10">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-96 w-full rounded-xl" />
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !quote) {
        return (
            <div className="container mx-auto max-w-3xl space-y-4 px-4 py-12">
                <Card className="border-destructive/40">
                    <CardContent className="text-destructive space-y-4 p-6 text-sm">
                        <p>{error || "Accès refusé."}</p>
                        <Button asChild variant="outline">
                            <Link href="/espace-client">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour à mon Espace Client
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleDownloadPdf = () => {
        generateQuotePDF({
            id: quote.id,
            date: quote.date,
            client: quote.clientName,
            email: quote.email,
            phone: quote.phone,
            type: quote.vehicleName
                ? `${quote.itemType} (${quote.vehicleQuantity}× ${quote.vehicleName})`
                : quote.itemType,
            pickup: quote.pickupLocation,
            dropoff: quote.dropoffLocation,
            transportDate: quote.transportDate,
            status: quote.statusLabel as "En attente" | "Validé" | "Refusé",
            amount: quote.amount,
            userNotes: quote.userNotes || undefined,
            source: "form",
            history: [],
        });
        toast.success("PDF téléchargé");
    };

    return (
        <div className="container mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="icon">
                        <Link
                            href="/espace-client"
                            aria-label="Retour à l'Espace Client"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Dossier #{quote.id.slice(0, 8)}
                        </h1>
                        <p className="text-muted-foreground text-xs">
                            Créé le {safeFormatDate(quote.date)}
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={handleDownloadPdf}
                    className="min-h-[44px] gap-2"
                >
                    <Download className="h-4 w-4" />
                    Télécharger le devis PDF
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Colonne Gauche : Détails & Historique */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Truck className="text-primary h-5 w-5" />
                                    {quote.itemType}
                                </CardTitle>
                                <Badge variant="outline">
                                    {quote.statusLabel}
                                </Badge>
                            </div>
                            <CardDescription>
                                Montant estimé / validé :{" "}
                                <strong className="text-foreground">
                                    {quote.amount}
                                </strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {quote.vehicleName && (
                                <p>
                                    <strong>Véhicule demandé :</strong>{" "}
                                    {quote.vehicleQuantity}× {quote.vehicleName}
                                </p>
                            )}
                            <p className="flex items-center gap-2">
                                <MapPin className="text-primary h-4 w-4 shrink-0" />
                                <span>
                                    <strong>Départ :</strong>{" "}
                                    {quote.pickupLocation}
                                </span>
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin className="text-primary h-4 w-4 shrink-0" />
                                <span>
                                    <strong>Arrivée :</strong>{" "}
                                    {quote.dropoffLocation}
                                </span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Calendar className="text-primary h-4 w-4 shrink-0" />
                                <span>
                                    <strong>Date de transport :</strong>{" "}
                                    {safeFormatDate(quote.transportDate)}
                                </span>
                            </p>
                            {quote.userNotes && (
                                <p className="text-muted-foreground border-t pt-2 text-xs">
                                    <strong>Notes :</strong> {quote.userNotes}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Journal de suivi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-xs">
                                {quote.history.map((h) => (
                                    <li
                                        key={h.id}
                                        className="flex items-start justify-between gap-2 border-b pb-2 last:border-0"
                                    >
                                        <div>
                                            <span className="font-semibold">
                                                {h.action}
                                            </span>
                                            {h.description && (
                                                <p className="text-muted-foreground">
                                                    {h.description}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-muted-foreground shrink-0">
                                            {safeFormatDate(h.timestamp)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne Droite : Chat Hybride IA + Validateur Humain */}
                <div>
                    <OrderChat quoteId={quote.id} viewerRole="client" />
                </div>
            </div>
        </div>
    );
}
