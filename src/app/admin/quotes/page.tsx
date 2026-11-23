"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Search,
    Filter,
    Download,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    X,
    Coins,
    Bot,
    Eye,
    Sparkles,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote } from "@/lib/quote-storage";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { QuoteDetailsModal } from "@/components/features/admin/QuoteDetailsModal";
import { FadeIn, AnimatedCard, motion } from "@/components/ui/motion";
import { QuoteStatusBadge } from "@/components/features/admin/QuoteStatusBadge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getQuotesAction,
    deleteQuoteAction,
    updateQuoteStatusAction,
} from "@/app/actions/quote-management";
import { useRealtimeQuotes } from "@/hooks/useRealtimeQuotes";
import { formatQuoteReference } from "@/lib/tracking-code";
import { logger } from "@/lib/logger";

function safeFormatDate(dateString: string | undefined): string {
    if (!dateString) return "Non spécifié";
    const parsed = parseISO(dateString);
    if (isValid(parsed)) return format(parsed, "dd MMM yyyy", { locale: fr });
    const direct = new Date(dateString);
    if (isValid(direct)) return format(direct, "dd MMM yyyy", { locale: fr });
    return dateString;
}

function parseNumericAmount(amount: string | undefined): number {
    if (!amount) return 0;
    const digits = amount.replace(/[^0-9]/g, "");
    return digits ? parseInt(digits, 10) : 0;
}

function isPricedAmount(amount: string | undefined): boolean {
    if (!amount) return false;
    const lower = amount.trim().toLowerCase();
    return lower !== "" && lower !== "en attente" && lower !== "à calculer";
}

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    // Synchronisation live de la modale via ID (jamais de snapshot figé)
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Modales de confirmation centrées
    const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [statusTarget, setStatusTarget] = useState<{
        id: string;
        ref: string;
        status: Quote["status"];
    } | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const loadQuotes = async () => {
        try {
            const result = await getQuotesAction({
                status: statusFilter,
                search: "",
            });
            if (result.success && result.quotes) {
                setQuotes(result.quotes as Quote[]);
            } else {
                toast.error(
                    result.error || "Erreur lors du chargement des devis"
                );
            }
        } catch (error: unknown) {
            logger.error("Error loading quotes", error);
            toast.error("Erreur lors du chargement des devis");
        } finally {
            setIsLoading(false);
        }
    };

    useRealtimeQuotes({
        onQuoteInserted: loadQuotes,
        onQuoteUpdated: loadQuotes,
        onQuoteDeleted: loadQuotes,
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadQuotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const selectedQuote = useMemo(
        () => quotes.find((q) => q.id === selectedQuoteId) ?? null,
        [quotes, selectedQuoteId]
    );

    const confirmStatusChange = async () => {
        if (!statusTarget) return;
        setIsUpdatingStatus(true);
        try {
            const result = await updateQuoteStatusAction(
                statusTarget.id,
                statusTarget.status
            );
            if (result.success) {
                await loadQuotes();
                toast.success(
                    `Dossier ${statusTarget.ref} mis à jour : ${statusTarget.status}`
                );
                setStatusTarget(null);
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour");
            }
        } catch (error: unknown) {
            logger.error("Error updating status", error);
            toast.error("Erreur lors de la mise à jour du statut");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const confirmDelete = async () => {
        if (!quoteToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteQuoteAction(quoteToDelete);
            if (result.success) {
                if (selectedQuoteId === quoteToDelete) {
                    setDetailsOpen(false);
                    setSelectedQuoteId(null);
                }
                await loadQuotes();
                toast.success("Devis supprimé avec succès");
                setQuoteToDelete(null);
            } else {
                toast.error(result.error || "Erreur lors de la suppression");
            }
        } catch (error: unknown) {
            logger.error("Error deleting quote", error);
            toast.error("Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredQuotes = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();
        if (!needle) return quotes;
        return quotes.filter((quote) => {
            const ref = formatQuoteReference({
                trackingCode: quote.trackingCode,
                id: quote.id,
            }).toLowerCase();
            return (
                ref.includes(needle) ||
                quote.id.toLowerCase().includes(needle) ||
                quote.client.toLowerCase().includes(needle) ||
                quote.email.toLowerCase().includes(needle) ||
                quote.pickup.toLowerCase().includes(needle) ||
                quote.dropoff.toLowerCase().includes(needle) ||
                quote.type.toLowerCase().includes(needle)
            );
        });
    }, [quotes, searchTerm]);

    const kpis = useMemo(() => {
        const pending = quotes.filter((q) => q.status === "En attente").length;
        const validated = quotes.filter((q) => q.status === "Validé").length;
        const rejected = quotes.filter((q) => q.status === "Refusé").length;
        const cancelled = quotes.filter((q) => q.status === "Annulé").length;
        const pricedVolume = quotes
            .filter((q) => q.status !== "Annulé" && q.status !== "Refusé")
            .reduce((acc, q) => acc + parseNumericAmount(q.amount), 0);

        return {
            all: quotes.length,
            pending,
            validated,
            rejected,
            cancelled,
            pricedVolume,
        };
    }, [quotes]);

    const handleExportCSV = () => {
        if (filteredQuotes.length === 0) {
            toast.info("Aucun devis à exporter");
            return;
        }
        const headers = [
            "Code Suivi",
            "Client",
            "Email",
            "Téléphone",
            "Type",
            "Départ",
            "Arrivée",
            "Date Transport",
            "Date Création",
            "Statut",
            "Montant",
            "Motif Annulation",
            "Source",
        ];
        const rows = filteredQuotes.map((q) => [
            `"${formatQuoteReference({ trackingCode: q.trackingCode, id: q.id })}"`,
            `"${(q.client || "").replace(/"/g, '""')}"`,
            `"${(q.email || "").replace(/"/g, '""')}"`,
            `"${(q.phone || "").replace(/"/g, '""')}"`,
            `"${(q.type || "").replace(/"/g, '""')}"`,
            `"${(q.pickup || "").replace(/"/g, '""')}"`,
            `"${(q.dropoff || "").replace(/"/g, '""')}"`,
            `"${q.transportDate || ""}"`,
            `"${q.date || ""}"`,
            `"${q.status || ""}"`,
            `"${(q.amount || "").replace(/"/g, '""')}"`,
            `"${(q.cancellationReason || "").replace(/"/g, '""')}"`,
            `"${q.source || "form"}"`,
        ]);
        const csvContent =
            "data:text/csv;charset=utf-8,\uFEFF" +
            [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute(
            "download",
            `devis_hbc_logistique_${format(new Date(), "yyyy-MM-dd")}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${filteredQuotes.length} devis exportés en CSV`);
    };

    const openQuoteModal = (quote: Quote) => {
        setSelectedQuoteId(quote.id);
        setDetailsOpen(true);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* En-tête */}
            <FadeIn direction="down">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                            Centre de Gestion des Devis
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Pilotez vos cotations, consultez les dossiers en
                            modale détaillée et chiffrez avec l&apos;agent IA.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            asChild
                        >
                            <Link href="/admin/assistant">
                                <Sparkles className="text-primary h-4 w-4" />
                                Copilote IA
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleExportCSV}
                        >
                            <Download className="h-4 w-4" />
                            Exporter CSV
                        </Button>
                    </div>
                </div>
            </FadeIn>

            {/* Bandeau KPI */}
            <FadeIn direction="up" delay={0.05}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <Card className="border-border/70">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-xs font-medium">
                                Total Dossiers
                            </p>
                            <p className="mt-1 text-2xl font-extrabold">
                                {kpis.all}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-amber-500/25 bg-amber-500/5">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                En attente
                            </p>
                            <p className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                {kpis.pending}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-500/25 bg-emerald-500/5">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                Validés
                            </p>
                            <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {kpis.validated}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-rose-500/25 bg-rose-500/5">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-rose-700 dark:text-rose-400">
                                Annulés / Refusés
                            </p>
                            <p className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                {kpis.cancelled + kpis.rejected}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/25 bg-primary/5 col-span-2 sm:col-span-2 lg:col-span-1">
                        <CardContent className="p-4">
                            <p className="text-primary flex items-center gap-1 text-xs font-semibold">
                                <Coins className="h-3.5 w-3.5" />
                                Pipeline chiffré
                            </p>
                            <p className="mt-1 truncate font-mono text-lg font-extrabold sm:text-xl">
                                {kpis.pricedVolume > 0
                                    ? `${kpis.pricedVolume.toLocaleString("fr-FR")} F`
                                    : "0 FCFA"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </FadeIn>

            {/* Tableau & Filtres */}
            <FadeIn direction="up" delay={0.1}>
                <AnimatedCard hoverEffect="subtle">
                    <Card>
                        <CardHeader className="space-y-4">
                            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                                <div>
                                    <CardTitle>Demandes de Cotation</CardTitle>
                                    <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                                        Cliquez sur un dossier pour ouvrir sa
                                        modale détaillée ou accédez directement
                                        à son espace de chiffrage.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <div className="relative w-full sm:w-[270px]">
                                        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                                        <Input
                                            placeholder="Code HBC, client, ville..."
                                            className="w-full pr-8 pl-8"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSearchTerm("")
                                                }
                                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 p-0.5"
                                                aria-label="Effacer la recherche"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <Select
                                        value={statusFilter}
                                        onValueChange={setStatusFilter}
                                    >
                                        <SelectTrigger className="w-full sm:w-[190px]">
                                            <Filter className="text-muted-foreground mr-2 h-4 w-4" />
                                            <SelectValue placeholder="Statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Tous ({kpis.all})
                                            </SelectItem>
                                            <SelectItem value="En attente">
                                                En attente ({kpis.pending})
                                            </SelectItem>
                                            <SelectItem value="Validé">
                                                Validé ({kpis.validated})
                                            </SelectItem>
                                            <SelectItem value="Refusé">
                                                Refusé ({kpis.rejected})
                                            </SelectItem>
                                            <SelectItem value="Annulé">
                                                Annulé ({kpis.cancelled})
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Filtres rapides */}
                            <div className="flex flex-wrap items-center gap-2">
                                {[
                                    {
                                        value: "all",
                                        label: "Tous",
                                        count: kpis.all,
                                        dot: "",
                                    },
                                    {
                                        value: "En attente",
                                        label: "En attente",
                                        count: kpis.pending,
                                        dot: "bg-amber-500",
                                    },
                                    {
                                        value: "Validé",
                                        label: "Validés",
                                        count: kpis.validated,
                                        dot: "bg-emerald-500",
                                    },
                                    {
                                        value: "Refusé",
                                        label: "Refusés",
                                        count: kpis.rejected,
                                        dot: "bg-red-500",
                                    },
                                    {
                                        value: "Annulé",
                                        label: "Annulés",
                                        count: kpis.cancelled,
                                        dot: "bg-slate-400",
                                    },
                                ].map((pill) => (
                                    <Button
                                        key={pill.value}
                                        variant={
                                            statusFilter === pill.value
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setStatusFilter(pill.value)
                                        }
                                        className="h-8 text-xs font-medium"
                                    >
                                        {pill.dot && (
                                            <span
                                                className={`mr-1.5 h-2 w-2 rounded-full ${pill.dot}`}
                                            />
                                        )}
                                        {pill.label}
                                        <span className="bg-muted/60 text-foreground ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                                            {pill.count}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </CardHeader>

                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3 py-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="bg-card flex items-center justify-between gap-4 rounded-xl border p-4"
                                        >
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-28" />
                                                <Skeleton className="h-3 w-44" />
                                            </div>
                                            <Skeleton className="hidden h-4 w-32 md:block" />
                                            <Skeleton className="hidden h-4 w-28 md:block" />
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredQuotes.length === 0 ? (
                                <div className="text-muted-foreground py-12 text-center text-sm">
                                    Aucune demande ne correspond à vos critères.
                                </div>
                            ) : (
                                <>
                                    {/* Vue Cartes Mobile */}
                                    <div className="space-y-3 md:hidden">
                                        {filteredQuotes.map((quote) => {
                                            const ref = formatQuoteReference({
                                                trackingCode: quote.trackingCode,
                                                id: quote.id,
                                            });
                                            return (
                                                <div
                                                    key={quote.id}
                                                    onClick={() =>
                                                        openQuoteModal(quote)
                                                    }
                                                    className="bg-card hover:bg-muted/40 cursor-pointer space-y-2.5 rounded-xl border p-4 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <span className="text-primary font-mono text-xs font-bold">
                                                                {ref}
                                                            </span>
                                                            <p className="font-semibold">
                                                                {quote.client}
                                                            </p>
                                                            <p className="text-muted-foreground text-xs">
                                                                {quote.email}
                                                            </p>
                                                        </div>
                                                        <QuoteStatusBadge
                                                            status={
                                                                quote.status
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                        <Badge variant="outline">
                                                            {quote.type}
                                                        </Badge>
                                                        <span className="font-mono font-bold">
                                                            {isPricedAmount(
                                                                quote.amount
                                                            )
                                                                ? quote.amount
                                                                : "À chiffrer"}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground truncate text-xs">
                                                        {quote.pickup} →{" "}
                                                        {quote.dropoff}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Vue Tableau Desktop */}
                                    <div className="hidden overflow-x-auto rounded-xl border md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/35">
                                                    <TableHead>
                                                        Référence
                                                    </TableHead>
                                                    <TableHead>
                                                        Client
                                                    </TableHead>
                                                    <TableHead>
                                                        Fret &amp; Itinéraire
                                                    </TableHead>
                                                    <TableHead>
                                                        Chiffrage
                                                    </TableHead>
                                                    <TableHead>
                                                        Date Prévue
                                                    </TableHead>
                                                    <TableHead>
                                                        Statut
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredQuotes.map(
                                                    (quote, index) => {
                                                        const ref =
                                                            formatQuoteReference({
                                                                trackingCode:
                                                                    quote.trackingCode,
                                                                id: quote.id,
                                                            });
                                                        const priced =
                                                            isPricedAmount(
                                                                quote.amount
                                                            );

                                                        return (
                                                            <motion.tr
                                                                key={quote.id}
                                                                className="hover:bg-muted/45 cursor-pointer transition-colors"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    if (
                                                                        (
                                                                            e.target as HTMLElement
                                                                        ).closest(
                                                                            '[data-radix-collection-item], [role="menuitem"], button, a'
                                                                        )
                                                                    )
                                                                        return;
                                                                    openQuoteModal(
                                                                        quote
                                                                    );
                                                                }}
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 6,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                transition={{
                                                                    delay: Math.min(
                                                                        index *
                                                                            0.02,
                                                                        0.2
                                                                    ),
                                                                }}
                                                            >
                                                                <TableCell className="whitespace-nowrap">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-primary font-mono text-xs font-bold">
                                                                            {
                                                                                ref
                                                                            }
                                                                        </span>
                                                                        <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                                                                            {quote.source ===
                                                                            "chat" ? (
                                                                                <>
                                                                                    <Bot className="h-3 w-3" />{" "}
                                                                                    IA
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <FileText className="h-3 w-3" />{" "}
                                                                                    Web
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-semibold">
                                                                            {
                                                                                quote.client
                                                                            }
                                                                        </span>
                                                                        <span className="text-muted-foreground text-xs">
                                                                            {
                                                                                quote.email
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-1">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="w-fit max-w-[210px] truncate text-xs"
                                                                        >
                                                                            {
                                                                                quote.type
                                                                            }
                                                                        </Badge>
                                                                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                                                            <span className="max-w-[110px] truncate">
                                                                                {
                                                                                    quote.pickup
                                                                                }
                                                                            </span>
                                                                            <span>
                                                                                →
                                                                            </span>
                                                                            <span className="max-w-[110px] truncate">
                                                                                {
                                                                                    quote.dropoff
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="whitespace-nowrap">
                                                                    {priced ? (
                                                                        <span className="font-mono text-xs font-bold">
                                                                            {
                                                                                quote.amount
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="border-amber-500/40 bg-amber-500/10 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
                                                                        >
                                                                            À
                                                                            chiffrer
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-xs whitespace-nowrap sm:text-sm">
                                                                    {safeFormatDate(
                                                                        quote.transportDate ||
                                                                            quote.date
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <QuoteStatusBadge
                                                                        status={
                                                                            quote.status
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8"
                                                                            title="Aperçu rapide en modale"
                                                                            onClick={() =>
                                                                                openQuoteModal(
                                                                                    quote
                                                                                )
                                                                            }
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger
                                                                                asChild
                                                                            >
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    className="h-8 w-8 p-0"
                                                                                >
                                                                                    <span className="sr-only">
                                                                                        Actions
                                                                                    </span>
                                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuLabel>
                                                                                    Dossier{" "}
                                                                                    {
                                                                                        ref
                                                                                    }
                                                                                </DropdownMenuLabel>
                                                                                <DropdownMenuItem
                                                                                    asChild
                                                                                >
                                                                                    <Link
                                                                                        href={`/admin/quotes/${encodeURIComponent(quote.id)}`}
                                                                                        className="cursor-pointer font-medium"
                                                                                    >
                                                                                        <FileText className="text-primary mr-2 h-4 w-4" />
                                                                                        Espace
                                                                                        de
                                                                                        travail
                                                                                        &amp;
                                                                                        Chiffrage
                                                                                        IA
                                                                                    </Link>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem
                                                                                    onClick={() =>
                                                                                        setStatusTarget(
                                                                                            {
                                                                                                id: quote.id,
                                                                                                ref,
                                                                                                status: "Validé",
                                                                                            }
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                                                                                    Valider
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onClick={() =>
                                                                                        setStatusTarget(
                                                                                            {
                                                                                                id: quote.id,
                                                                                                ref,
                                                                                                status: "Refusé",
                                                                                            }
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <XCircle className="mr-2 h-4 w-4 text-rose-500" />
                                                                                    Refuser
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onClick={() =>
                                                                                        setStatusTarget(
                                                                                            {
                                                                                                id: quote.id,
                                                                                                ref,
                                                                                                status: "En attente",
                                                                                            }
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                                                                    Mettre
                                                                                    en
                                                                                    attente
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem
                                                                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                                                                    onClick={() =>
                                                                                        setQuoteToDelete(
                                                                                            quote.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                                    Supprimer
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>
                                                                </TableCell>
                                                            </motion.tr>
                                                        );
                                                    }
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </AnimatedCard>
            </FadeIn>

            {/* Grande Modale Centrée Responsive (remplace QuoteDetailsSheet) */}
            <QuoteDetailsModal
                quote={selectedQuote}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                onUpdate={() => void loadQuotes()}
            />

            {/* Confirmation Changement de Statut */}
            <ConfirmDialog
                open={statusTarget !== null}
                onOpenChange={(open) => !open && setStatusTarget(null)}
                title={`Passer le dossier ${statusTarget?.ref ?? ""} en "${statusTarget?.status ?? ""}" ?`}
                description="Le statut sera immédiatement enregistré et tracé dans le journal d'audit du dossier."
                confirmLabel="Confirmer"
                cancelLabel="Annuler"
                variant={
                    statusTarget?.status === "Refusé"
                        ? "destructive"
                        : "default"
                }
                isLoading={isUpdatingStatus}
                onConfirm={confirmStatusChange}
            />

            {/* Confirmation Suppression */}
            <ConfirmDialog
                open={quoteToDelete !== null}
                onOpenChange={(open) => !open && setQuoteToDelete(null)}
                title="Supprimer définitivement ce devis ?"
                description="Cette action est irréversible. Le devis ainsi que l'ensemble de son historique seront supprimés de la base de données."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                variant="destructive"
                isLoading={isDeleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
