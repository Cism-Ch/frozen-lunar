"use client";

import { useEffect, useState } from "react";
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
import { MoreHorizontal, Search, Filter, Download, Trash2, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
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
import { quoteStorage, Quote } from "@/lib/quote-storage";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { QuoteDetailsSheet } from "@/components/features/QuoteDetailsSheet";
import { FadeIn, AnimatedCard, motion } from "@/components/ui/motion";

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

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        setQuotes(quoteStorage.getAll());
    }, []);

    const handleStatusChange = (id: string, status: Quote["status"]) => {
        quoteStorage.updateStatus(id, status);
        setQuotes(quoteStorage.getAll());
        toast.success(`Statut mis à jour : ${status}`);
    };

    const handleDelete = (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) {
            quoteStorage.delete(id);
            setQuotes(quoteStorage.getAll());
            toast.success("Devis supprimé");
        }
    };

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch =
            quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || quote.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleQuoteClick = (quote: Quote) => {
        setSelectedQuote(quote);
        setDetailsOpen(true);
    };

    const refreshQuotes = () => {
        setQuotes(quoteStorage.getAll());
    };

    return (
        <div className="space-y-8">
            <FadeIn direction="down">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion des Devis</h1>
                        <p className="text-muted-foreground mt-1">
                            Consultez et gérez les demandes de devis clients.
                        </p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button variant="outline" className="w-full sm:w-auto">
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
                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                <CardTitle>Toutes les demandes</CardTitle>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher..."
                                            className="pl-8 w-full sm:w-[250px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Filtrer par statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les statuts</SelectItem>
                                            <SelectItem value="En attente">En attente</SelectItem>
                                            <SelectItem value="Validé">Validé</SelectItem>
                                            <SelectItem value="Refusé">Refusé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredQuotes.length === 0 ? (
                                <motion.div
                                    className="text-center py-12 text-muted-foreground"
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
                                                className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => handleQuoteClick(quote)}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ x: 4 }}
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div>
                                                        <p className="font-medium">{quote.client}</p>
                                                        <p className="text-xs text-muted-foreground">{quote.email}</p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            quote.status === "Validé" ? "default" :
                                                                quote.status === "Refusé" ? "destructive" : "secondary"
                                                        }
                                                        className={
                                                            quote.status === "Validé" ? "bg-green-500" :
                                                                quote.status === "En attente" ? "bg-orange-500/10 text-orange-600" : ""
                                                        }
                                                    >
                                                        {quote.status === "Validé" && <CheckCircle className="mr-1 h-3 w-3" />}
                                                        {quote.status === "Refusé" && <XCircle className="mr-1 h-3 w-3" />}
                                                        {quote.status === "En attente" && <Clock className="mr-1 h-3 w-3" />}
                                                        {quote.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline">{quote.type}</Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {safeFormatDate(quote.transportDate || quote.date)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {quote.pickup} → {quote.dropoff}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="rounded-md border overflow-x-auto hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Référence</TableHead>
                                                    <TableHead>Client</TableHead>
                                                    <TableHead>Détails Transport</TableHead>
                                                    <TableHead>Date Prévue</TableHead>
                                                    <TableHead>Statut</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredQuotes.map((quote, index) => (
                                                    <motion.tr
                                                        key={quote.id}
                                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                        onClick={(e) => {
                                                            if ((e.target as HTMLElement).closest('[data-radix-collection-item], [role="menuitem"], button')) return;
                                                            handleQuoteClick(quote);
                                                        }}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                                    >
                                                        <TableCell className="font-medium font-mono text-xs">
                                                            {quote.id.slice(0, 8)}...
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{quote.client}</span>
                                                                <span className="text-xs text-muted-foreground">{quote.email}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <Badge variant="outline" className="w-fit">
                                                                    {quote.type}
                                                                </Badge>
                                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <span className="truncate max-w-[100px]">{quote.pickup}</span>
                                                                    <span>→</span>
                                                                    <span className="truncate max-w-[100px]">{quote.dropoff}</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {safeFormatDate(quote.transportDate || quote.date)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    quote.status === "Validé" ? "default" :
                                                                        quote.status === "Refusé" ? "destructive" : "secondary"
                                                                }
                                                                className={
                                                                    quote.status === "Validé" ? "bg-green-500 hover:bg-green-600" :
                                                                        quote.status === "En attente" ? "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" : ""
                                                                }
                                                            >
                                                                {quote.status === "Validé" && <CheckCircle className="mr-1 h-3 w-3" />}
                                                                {quote.status === "Refusé" && <XCircle className="mr-1 h-3 w-3" />}
                                                                {quote.status === "En attente" && <Clock className="mr-1 h-3 w-3" />}
                                                                {quote.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Ouvrir menu</span>
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "Validé")}>
                                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                        Valider
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "Refusé")}>
                                                                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                                        Refuser
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "En attente")}>
                                                                        <Clock className="mr-2 h-4 w-4 text-orange-500" />
                                                                        Mettre en attente
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild>
                                                                        <a href={`/admin/quotes/${encodeURIComponent(quote.id)}`} className="cursor-pointer">
                                                                            <FileText className="mr-2 h-4 w-4" />
                                                                            Voir le dossier complet
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600 focus:text-red-600"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDelete(quote.id)
                                                                        }}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Supprimer
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </motion.tr>
                                                ))}
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
        </div>
    );
}
