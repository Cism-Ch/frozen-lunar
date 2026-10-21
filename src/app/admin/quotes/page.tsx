"use client";

import { useEffect, useState, useMemo } from "react";
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
import { QuoteDetailsSheet } from "@/components/features/QuoteDetailsSheet";
import { FadeIn, AnimatedCard, motion } from "@/components/ui/motion";
import { QuoteStatusBadge } from "@/components/features/admin/QuoteStatusBadge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getQuotesAction,
    deleteQuoteAction,
    updateQuoteStatusAction,
} from "@/app/actions/quote-management";

// Safe date formatting for dates that might be free-text (from chat)
function safeFormatDate(dateString: string | undefined): string {
    if (!dateString) return "Non spécifié";

    // Try to parse as ISO date
    const parsed = parseISO(dateString);
    if (isValid(parsed)) {
        return format(parsed, "dd MMM yyyy", { locale: fr });
    }

    // Try direct Date constructor
    const direct = new Date(dateString);
    if (isValid(direct)) {
        return format(direct, "dd MMM yyyy", { locale: fr });
    }

    // Return as-is (free text like "dans 2 semaines")
    return dateString;
}

import { useRealtimeQuotes } from "@/hooks/useRealtimeQuotes";

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    const loadQuotes = async () => {
        try {
            const result = await getQuotesAction({
                status: statusFilter,
                search: searchTerm,
            });
            if (result.success && result.quotes) {
                setQuotes(result.quotes as Quote[]);
            } else {
                toast.error(
                    result.error || "Erreur lors du chargement des devis"
                );
            }
        } catch (error: unknown) {
            console.error("Error loading quotes:", error);
            toast.error("Erreur lors du chargement des devis");
        } finally {
            setIsLoading(false);
        }
    };

    // Enable Realtime Updates avec rafraîchissement des données
    useRealtimeQuotes({
        onQuoteInserted: loadQuotes,
        onQuoteUpdated: loadQuotes,
        onQuoteDeleted: loadQuotes,
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadQuotes();
        // Note: searchTerm is intentionally excluded from dependencies
        // because search is performed client-side (see filteredQuotes below)
        // and we only want to reload from server when statusFilter changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const handleStatusChange = async (id: string, status: Quote["status"]) => {
        try {
            const result = await updateQuoteStatusAction(id, status);
            if (result.success) {
                await loadQuotes();
                toast.success(`Statut mis à jour : ${status}`);
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour");
            }
        } catch (error: unknown) {
            console.error("Error updating status:", error);
            toast.error("Erreur lors de la mise à jour du statut");
        }
    };

    const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = async () => {
        if (!quoteToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteQuoteAction(quoteToDelete);
            if (result.success) {
                await loadQuotes();
                toast.success("Devis supprimé avec succès");
                setQuoteToDelete(null);
            } else {
                toast.error(result.error || "Erreur lors de la suppression");
            }
        } catch (error: unknown) {
            console.error("Error deleting quote:", error);
            toast.error("Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredQuotes.length === 0) {
            toast.info("Aucun devis à exporter");
            return;
        }
        const headers = [
            "Référence",
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
            "Source",
        ];
        const rows = filteredQuotes.map((q) => [
            `"${q.id}"`,
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
            `"${q.source || "form"}"`,
        ]);
        const csvContent =
            "data:text/csv;charset=utf-8,\uFEFF" +
            [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `devis_hbc_logistique_${format(new Date(), "yyyy-MM-dd")}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${filteredQuotes.length} devis exportés en CSV`);
    };

    // Client-side filtering for search (server-side filtering is also available)
    const filteredQuotes = quotes.filter((quote) => {
        if (searchTerm) {
            const matchesSearch =
                quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.id.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        }
        return true;
    });

    // Compteurs rapides pour les filtres par statut
    const statusCounts = useMemo(() => {
        return {
            all: quotes.length,
            pending: quotes.filter(
                (q) =>
                    q.status === "En attente" ||
                    String(q.status).toUpperCase() === "PENDING"
            ).length,
            validated: quotes.filter(
                (q) =>
                    q.status === "Validé" ||
                    String(q.status).toUpperCase() === "VALIDATED"
            ).length,
            rejected: quotes.filter(
                (q) =>
                    q.status === "Refusé" ||
                    String(q.status).toUpperCase() === "REJECTED"
            ).length,
        };
    }, [quotes]);

    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleQuoteClick = (quote: Quote) => {
        setSelectedQuote(quote);
        setDetailsOpen(true);
    };

    const refreshQuotes = () => {
        void loadQuotes();
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <FadeIn direction="down">
                <div className="flex flex-col justify-between gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Gestion des Devis
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Consultez et gérez les demandes de devis clients.
                        </p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={handleExportCSV}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Exporter
                        </Button>
                    </motion.div>
                </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
                <AnimatedCard hoverEffect="subtle">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                <div>
                                    <CardTitle>Toutes les demandes</CardTitle>
                                    <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                                        Filtrage instantané et vue détaillée des
                                        cotations logistiques.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                                    <div className="relative w-full sm:w-[250px]">
                                        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                                        <Input
                                            placeholder="Rechercher (nom, email, réf)..."
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
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <Filter className="text-muted-foreground mr-2 h-4 w-4" />
                                            <SelectValue placeholder="Filtrer par statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Tous les statuts (
                                                {statusCounts.all})
                                            </SelectItem>
                                            <SelectItem value="En attente">
                                                En attente (
                                                {statusCounts.pending})
                                            </SelectItem>
                                            <SelectItem value="Validé">
                                                Validé ({statusCounts.validated}
                                                )
                                            </SelectItem>
                                            <SelectItem value="Refusé">
                                                Refusé ({statusCounts.rejected})
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Barre de filtres rapides tactiles (SaaS B2B 2026) */}
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                <Button
                                    variant={
                                        statusFilter === "all"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setStatusFilter("all")}
                                    className="h-8 text-xs font-medium"
                                >
                                    Tous
                                    <span className="bg-primary-foreground/20 ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                                        {statusCounts.all}
                                    </span>
                                </Button>
                                <Button
                                    variant={
                                        statusFilter === "En attente"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setStatusFilter("En attente")
                                    }
                                    className="h-8 text-xs font-medium"
                                >
                                    <span className="mr-1.5 h-2 w-2 rounded-full bg-amber-500" />
                                    En attente
                                    <span className="bg-muted text-foreground ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                                        {statusCounts.pending}
                                    </span>
                                </Button>
                                <Button
                                    variant={
                                        statusFilter === "Validé"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setStatusFilter("Validé")}
                                    className="h-8 text-xs font-medium"
                                >
                                    <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                                    Validés
                                    <span className="bg-muted text-foreground ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                                        {statusCounts.validated}
                                    </span>
                                </Button>
                                <Button
                                    variant={
                                        statusFilter === "Refusé"
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setStatusFilter("Refusé")}
                                    className="h-8 text-xs font-medium"
                                >
                                    <span className="mr-1.5 h-2 w-2 rounded-full bg-red-500" />
                                    Refusés
                                    <span className="bg-muted text-foreground ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                                        {statusCounts.rejected}
                                    </span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3 py-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="bg-card flex items-center justify-between gap-4 rounded-lg border p-4 shadow-2xs"
                                        >
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-28" />
                                                <Skeleton className="h-3 w-44" />
                                            </div>
                                            <Skeleton className="hidden h-4 w-28 md:block" />
                                            <Skeleton className="hidden h-4 w-32 md:block" />
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredQuotes.length === 0 ? (
                                <motion.div
                                    className="text-muted-foreground py-12 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    Aucune demande ne correspond à vos critères.
                                </motion.div>
                            ) : (
                                <>
                                    {/* Mobile Card View */}
                                    <div className="space-y-4 md:hidden">
                                        {filteredQuotes.map((quote, index) => (
                                            <motion.div
                                                key={quote.id}
                                                className="bg-card hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors"
                                                onClick={() =>
                                                    handleQuoteClick(quote)
                                                }
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                }}
                                                whileHover={{ x: 4 }}
                                            >
                                                <div className="mb-3 flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-medium">
                                                            {quote.client}
                                                        </p>
                                                        <p className="text-muted-foreground text-xs">
                                                            {quote.email}
                                                        </p>
                                                    </div>
                                                    <QuoteStatusBadge
                                                        status={quote.status}
                                                    />
                                                </div>
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {quote.type}
                                                    </Badge>
                                                    <span className="text-muted-foreground text-xs">
                                                        {safeFormatDate(
                                                            quote.transportDate ||
                                                                quote.date
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground truncate text-xs">
                                                    {quote.pickup} →{" "}
                                                    {quote.dropoff}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden overflow-x-auto rounded-md border md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Référence
                                                    </TableHead>
                                                    <TableHead>
                                                        Client
                                                    </TableHead>
                                                    <TableHead>
                                                        Détails Transport
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
                                                    (quote, index) => (
                                                        <motion.tr
                                                            key={quote.id}
                                                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                                                            onClick={(e) => {
                                                                if (
                                                                    (
                                                                        e.target as HTMLElement
                                                                    ).closest(
                                                                        '[data-radix-collection-item], [role="menuitem"], button'
                                                                    )
                                                                )
                                                                    return;
                                                                handleQuoteClick(
                                                                    quote
                                                                );
                                                            }}
                                                            initial={{
                                                                opacity: 0,
                                                                x: -10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    index *
                                                                    0.03,
                                                            }}
                                                            whileHover={{
                                                                backgroundColor:
                                                                    "rgba(0,0,0,0.02)",
                                                            }}
                                                        >
                                                            <TableCell className="font-mono text-xs font-medium">
                                                                {quote.id.slice(
                                                                    0,
                                                                    8
                                                                )}
                                                                ...
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">
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
                                                                        className="w-fit"
                                                                    >
                                                                        {
                                                                            quote.type
                                                                        }
                                                                    </Badge>
                                                                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                                                        <span className="max-w-[100px] truncate">
                                                                            {
                                                                                quote.pickup
                                                                            }
                                                                        </span>
                                                                        <span>
                                                                            →
                                                                        </span>
                                                                        <span className="max-w-[100px] truncate">
                                                                            {
                                                                                quote.dropoff
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm">
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
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0"
                                                                        >
                                                                            <span className="sr-only">
                                                                                Ouvrir
                                                                                menu
                                                                            </span>
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>
                                                                            Actions
                                                                        </DropdownMenuLabel>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleStatusChange(
                                                                                    quote.id,
                                                                                    "Validé"
                                                                                )
                                                                            }
                                                                        >
                                                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                            Valider
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleStatusChange(
                                                                                    quote.id,
                                                                                    "Refusé"
                                                                                )
                                                                            }
                                                                        >
                                                                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                                            Refuser
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleStatusChange(
                                                                                    quote.id,
                                                                                    "En attente"
                                                                                )
                                                                            }
                                                                        >
                                                                            <Clock className="mr-2 h-4 w-4 text-orange-500" />
                                                                            Mettre
                                                                            en
                                                                            attente
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <a
                                                                                href={`/admin/quotes/${encodeURIComponent(quote.id)}`}
                                                                                className="cursor-pointer"
                                                                            >
                                                                                <FileText className="mr-2 h-4 w-4" />
                                                                                Voir
                                                                                le
                                                                                dossier
                                                                                complet
                                                                            </a>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                setQuoteToDelete(
                                                                                    quote.id
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Supprimer
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </motion.tr>
                                                    )
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

            <QuoteDetailsSheet
                quote={selectedQuote}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                onUpdate={refreshQuotes}
            />

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
