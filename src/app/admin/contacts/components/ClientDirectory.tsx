"use client";

import { useState } from "react";
import type { ClientDirectoryItem } from "@/types/contact";
import { QuoteStatus } from "@prisma/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Users,
    Search,
    Mail,
    Phone,
    FileText,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientDirectoryProps {
    initialClients: ClientDirectoryItem[];
}

export function ClientDirectory({ initialClients }: ClientDirectoryProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredClients = initialClients.filter((c) => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return true;
        return (
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q)
        );
    });

    const totalQuotesCount = initialClients.reduce(
        (acc, c) => acc + c.totalQuotes,
        0
    );

    const getQuoteStatusBadge = (status: QuoteStatus) => {
        switch (status) {
            case QuoteStatus.VALIDATED:
                return (
                    <Badge className="bg-emerald-600 text-xs text-white hover:bg-emerald-700">
                        Validé
                    </Badge>
                );
            case QuoteStatus.REJECTED:
                return (
                    <Badge variant="destructive" className="text-xs">
                        Refusé
                    </Badge>
                );
            case QuoteStatus.PENDING:
            default:
                return (
                    <Badge
                        variant="outline"
                        className="border-amber-500/30 text-xs text-amber-600 dark:text-amber-400"
                    >
                        En attente
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistiques clés du carnet clients */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="border-border flex items-center gap-4 border p-4 shadow-sm">
                    <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs font-medium">
                            Clients uniques recensés
                        </p>
                        <p className="text-2xl font-bold tracking-tight">
                            {initialClients.length}
                        </p>
                    </div>
                </Card>

                <Card className="border-border flex items-center gap-4 border p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs font-medium">
                            Devis cumulés en base de données
                        </p>
                        <p className="text-2xl font-bold tracking-tight">
                            {totalQuotesCount}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Liste & recherche */}
            <Card className="border-border border shadow-sm">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Users className="text-primary h-5 w-5" />
                            Répertoire Clients Réel
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Données réelles agrégées automatiquement depuis la
                            table PostgreSQL des devis.
                        </CardDescription>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Rechercher nom, email, téléphone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 pl-9"
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    {filteredClients.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                            <Users className="text-muted-foreground/40 mb-3 h-12 w-12" />
                            <p className="text-base font-medium">
                                Aucun client trouvé
                            </p>
                            <p className="mt-1 text-xs">
                                {searchTerm
                                    ? "Aucun résultat ne correspond à votre recherche."
                                    : "Les clients apparaîtront automatiquement dès l'enregistrement des devis."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Vue Mobile (Cards) */}
                            <div className="space-y-3 md:hidden">
                                {filteredClients.map((client) => (
                                    <div
                                        key={client.email}
                                        className="bg-card space-y-3 rounded-lg border p-4 shadow-xs"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {client.name}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {client.email}
                                                </p>
                                            </div>
                                            <span className="bg-muted inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold">
                                                {client.totalQuotes} devis
                                            </span>
                                        </div>

                                        <div className="text-muted-foreground space-y-1 border-t pt-2 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span>Téléphone :</span>
                                                <a
                                                    href={`tel:${client.phone}`}
                                                    className="text-foreground font-medium hover:underline"
                                                >
                                                    {client.phone}
                                                </a>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Dernier statut :</span>
                                                {getQuoteStatusBadge(
                                                    client.lastStatus
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Dernière activité :</span>
                                                <span>
                                                    {format(
                                                        new Date(
                                                            client.lastQuoteDate
                                                        ),
                                                        "dd MMM yyyy",
                                                        {
                                                            locale: fr,
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Link
                                                href={`/admin/quotes?search=${encodeURIComponent(client.email)}`}
                                                className="w-full"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-xs"
                                                >
                                                    Voir les devis (
                                                    {client.totalQuotes})
                                                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Vue Desktop (Tableau structuré) */}
                            <div className="hidden overflow-hidden rounded-md border md:block">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="w-[200px]">
                                                Client
                                            </TableHead>
                                            <TableHead className="w-[220px]">
                                                Coordonnées
                                            </TableHead>
                                            <TableHead className="w-[120px] text-center">
                                                Volume Devis
                                            </TableHead>
                                            <TableHead className="w-[140px]">
                                                Dernier statut
                                            </TableHead>
                                            <TableHead className="w-[160px]">
                                                Dernière demande
                                            </TableHead>
                                            <TableHead className="w-[140px] text-right">
                                                Historique
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredClients.map((client) => (
                                            <TableRow
                                                key={client.email}
                                                className="hover:bg-muted/50 transition-colors"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold">
                                                            {client.name
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="text-sm font-medium">
                                                            {client.name}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-muted-foreground space-y-0.5 text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            <a
                                                                href={`mailto:${client.email}`}
                                                                className="text-primary truncate hover:underline"
                                                            >
                                                                {client.email}
                                                            </a>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            <a
                                                                href={`tel:${client.phone}`}
                                                                className="hover:underline"
                                                            >
                                                                {client.phone}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                                        {client.totalQuotes}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {getQuoteStatusBadge(
                                                        client.lastStatus
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                                    {format(
                                                        new Date(
                                                            client.lastQuoteDate
                                                        ),
                                                        "dd MMM yyyy, HH:mm",
                                                        {
                                                            locale: fr,
                                                        }
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={`/admin/quotes?search=${encodeURIComponent(client.email)}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-xs"
                                                        >
                                                            Détails devis
                                                            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
