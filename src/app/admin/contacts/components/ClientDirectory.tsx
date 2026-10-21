"use client";

import { useState, useMemo } from "react";
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
    X,
    CheckCircle2,
    Clock,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientDirectoryProps {
    initialClients: ClientDirectoryItem[];
}

export function ClientDirectory({ initialClients }: ClientDirectoryProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredClients = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return initialClients;
        return initialClients.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.phone.toLowerCase().includes(q)
        );
    }, [initialClients, searchTerm]);

    // Calculs statistiques consolidés (Dispositions optimales des métriques)
    const totalQuotesCount = useMemo(
        () => initialClients.reduce((acc, c) => acc + c.totalQuotes, 0),
        [initialClients]
    );

    const validatedQuotesCount = useMemo(
        () =>
            initialClients.filter((c) => c.lastStatus === QuoteStatus.VALIDATED)
                .length,
        [initialClients]
    );

    const pendingQuotesCount = useMemo(
        () =>
            initialClients.filter((c) => c.lastStatus === QuoteStatus.PENDING)
                .length,
        [initialClients]
    );

    const getQuoteStatusBadge = (status: QuoteStatus) => {
        switch (status) {
            case QuoteStatus.VALIDATED:
                return (
                    <Badge className="bg-emerald-600/90 text-xs font-medium text-white hover:bg-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400">
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
            {/* Grille de métriques KPI haute densité (Disposition responsive des chiffres) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {/* 1. Clients uniques */}
                <Card className="border-border p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                            Clients réels
                        </span>
                        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-foreground font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                            {initialClients.length}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            entreprises
                        </span>
                    </div>
                </Card>

                {/* 2. Total des devis cumulés */}
                <Card className="border-border p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                            Devis cumulés
                        </span>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <FileText className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-foreground font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                            {totalQuotesCount}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            demandes
                        </span>
                    </div>
                </Card>

                {/* 3. Devis validés */}
                <Card className="border-border p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                            Dernier devis validé
                        </span>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-bold tracking-tight text-emerald-600 sm:text-3xl dark:text-emerald-400">
                            {validatedQuotesCount}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            confirmés
                        </span>
                    </div>
                </Card>

                {/* 4. Devis en attente */}
                <Card className="border-border p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                            En cours d&apos;étude
                        </span>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-bold tracking-tight text-amber-600 sm:text-3xl dark:text-amber-400">
                            {pendingQuotesCount}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            à traiter
                        </span>
                    </div>
                </Card>
            </div>

            {/* Liste et Recherche */}
            <Card className="border-border border shadow-sm">
                <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <Users className="text-primary h-5 w-5" />
                                <span>Répertoire des Clients Réels</span>
                                <span className="bg-muted text-muted-foreground ml-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold">
                                    {filteredClients.length}
                                </span>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Base consolidée des donneurs d&apos;ordres ayant
                                au moins une demande de devis dans le système.
                            </CardDescription>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Rechercher nom, email, tél..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 pr-8 pl-9"
                                aria-label="Rechercher un client"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 p-1"
                                    aria-label="Effacer la recherche"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {filteredClients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                                <Users className="text-muted-foreground h-6 w-6" />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">
                                Aucun client trouvé
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {searchTerm
                                    ? "Aucun résultat ne correspond à votre filtre de recherche."
                                    : "Aucun devis enregistré pour le moment."}
                            </p>
                        </div>
                    ) : (
                        <div>
                            {/* Vue Mobile & Tablette (Cartes responsives adaptatives < 1024px) */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
                                {filteredClients.map((client) => (
                                    <div
                                        key={client.email}
                                        className="bg-card hover:border-primary/40 space-y-3 rounded-lg border p-4 shadow-2xs transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    aria-hidden="true"
                                                    className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                                                >
                                                    {client.name
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold">
                                                        {client.name}
                                                    </h4>
                                                    <div className="mt-1 flex items-center gap-1.5">
                                                        <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold">
                                                            {client.totalQuotes}{" "}
                                                            devis
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {getQuoteStatusBadge(
                                                client.lastStatus
                                            )}
                                        </div>

                                        <div className="text-muted-foreground space-y-1.5 border-t pt-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                                <a
                                                    href={`mailto:${client.email}`}
                                                    className="text-primary truncate hover:underline"
                                                    aria-label={`Envoyer un email à ${client.name}`}
                                                >
                                                    {client.email}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                                <a
                                                    href={`tel:${client.phone}`}
                                                    className="text-foreground font-mono hover:underline"
                                                    aria-label={`Appeler ${client.name}`}
                                                >
                                                    {client.phone}
                                                </a>
                                            </div>
                                            <div className="flex items-center justify-between pt-1 text-[11px]">
                                                <span>Dernière activité :</span>
                                                <span className="text-foreground font-medium">
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
                                                className="block w-full"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-10 w-full text-xs font-medium"
                                                >
                                                    Consulter les devis
                                                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Vue Desktop Large (Tableau avec overflow-x-auto et min-width garanti >= 1024px) */}
                            <div className="hidden overflow-x-auto rounded-md border lg:block">
                                <Table className="min-w-[850px]">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="w-[220px]">
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
                                                        <div
                                                            aria-hidden="true"
                                                            className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                                                        >
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
                                                                aria-label={`Envoyer un email à ${client.name}`}
                                                            >
                                                                {client.email}
                                                            </a>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            <a
                                                                href={`tel:${client.phone}`}
                                                                className="font-mono hover:underline"
                                                                aria-label={`Appeler ${client.name}`}
                                                            >
                                                                {client.phone}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="bg-primary/10 text-primary inline-flex min-w-[28px] items-center justify-center rounded-md px-2 py-0.5 font-mono text-xs font-bold">
                                                        {client.totalQuotes}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {getQuoteStatusBadge(
                                                        client.lastStatus
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {format(
                                                        new Date(
                                                            client.lastQuoteDate
                                                        ),
                                                        "dd MMM yyyy à HH:mm",
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
                                                            className="h-9 text-xs"
                                                            aria-label={`Voir les devis de ${client.name}`}
                                                        >
                                                            Consulter
                                                            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
