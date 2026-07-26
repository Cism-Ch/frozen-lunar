"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { FileText, TrendingUp, Users, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Quote } from "@/lib/quote-storage";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { QuoteDetailsSheet } from "@/components/features/QuoteDetailsSheet";
import {
    FadeIn,
    StaggerContainer,
    StaggerItem,
    AnimatedCard,
    CountUp,
    motion,
} from "@/components/ui/motion";
import { getQuotesAction } from "@/app/actions/quote-management";
import { useRealtimeQuotes } from "@/hooks/useRealtimeQuotes";

export default function DashboardPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);

    const loadQuotes = async () => {
        const result = await getQuotesAction();
        if (result.success && result.quotes) {
            setQuotes(result.quotes as Quote[]);
        }
    };

    useEffect(() => {
        loadQuotes();
    }, []);

    // Souscription Supabase Realtime avec rafraîchissement automatique
    useRealtimeQuotes({
        onQuoteInserted: loadQuotes,
        onQuoteUpdated: loadQuotes,
        onQuoteDeleted: loadQuotes,
    });

    const validatedQuotes = quotes.filter((q) => q.status === "Validé");
    const pendingQuotes = quotes.filter((q) => q.status === "En attente");

    const stats = [
        {
            title: "Total Devis",
            value: quotes.length,
            change: "+12% ce mois",
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "En Attente",
            value: pendingQuotes.length,
            change: "Nécessite action",
            icon: Clock,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            title: "Validés",
            value: validatedQuotes.length,
            change: `${quotes.length > 0 ? Math.round((validatedQuotes.length / quotes.length) * 100) : 0}% de conversion`,
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Clients",
            value: new Set(quotes.map((q) => q.email)).size,
            change: "+5 nouveaux",
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
    ];

    const recentQuotes = quotes.slice(0, 5);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleQuoteClick = (quote: Quote) => {
        setSelectedQuote(quote);
        setDetailsOpen(true);
    };

    const refreshQuotes = async () => {
        const result = await getQuotesAction();
        if (result.success && result.quotes) {
            setQuotes(result.quotes as Quote[]);
        }
    };

    return (
        <div className="space-y-8">
            <FadeIn direction="down">
                <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Tableau de bord
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Vue d&apos;ensemble de votre activité et des
                            demandes récentes.
                        </p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/quotes">
                                Voir tous les devis
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </FadeIn>

            {/* Stats Grid */}
            <StaggerContainer
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                staggerSpeed="fast"
            >
                {stats.map((stat) => (
                    <StaggerItem key={stat.title}>
                        <AnimatedCard hoverEffect="lift">
                            <Card className="transition-shadow hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-muted-foreground text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <motion.div
                                        className={`rounded-full p-2 ${stat.bg}`}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                        }}
                                    >
                                        <stat.icon
                                            className={`h-4 w-4 ${stat.color}`}
                                        />
                                    </motion.div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        <CountUp
                                            to={stat.value}
                                            duration={1.5}
                                        />
                                    </div>
                                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                        {stat.change}
                                    </p>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart Placeholder */}
                <FadeIn
                    direction="left"
                    delay={0.2}
                    className="col-span-full lg:col-span-4"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Activité Mensuelle</CardTitle>
                            <CardDescription>
                                Nombre de demandes de devis par jour sur les 30
                                derniers jours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="flex h-[300px] items-end justify-between gap-2 px-4 pt-10 pb-4">
                                {[
                                    35, 45, 25, 60, 45, 70, 50, 65, 40, 55, 80,
                                    60,
                                ].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="bg-primary/10 hover:bg-primary/20 group relative w-full cursor-pointer rounded-t-sm transition-colors"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{
                                            delay: i * 0.05,
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 15,
                                        }}
                                        whileHover={{ scaleY: 1.05 }}
                                    >
                                        <div className="bg-popover text-popover-foreground absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-xs opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                                            {h} demandes
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* Recent Quotes */}
                <FadeIn
                    direction="right"
                    delay={0.3}
                    className="col-span-full lg:col-span-3"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Devis Récents</CardTitle>
                            <CardDescription>
                                Les 5 dernières demandes reçues.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">
                                            Date
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentQuotes.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-muted-foreground py-8 text-center"
                                            >
                                                Aucun devis pour le moment
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentQuotes.map((quote, index) => (
                                            <motion.tr
                                                key={quote.id}
                                                className="hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() =>
                                                    handleQuoteClick(quote)
                                                }
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                }}
                                                whileHover={{ x: 4 }}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {quote.client}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {quote.type}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            quote.status ===
                                                            "Validé"
                                                                ? "default"
                                                                : quote.status ===
                                                                    "Refusé"
                                                                  ? "destructive"
                                                                  : "secondary"
                                                        }
                                                        className={
                                                            quote.status ===
                                                            "Validé"
                                                                ? "bg-green-500 hover:bg-green-600"
                                                                : ""
                                                        }
                                                    >
                                                        {quote.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-right text-xs">
                                                    {format(
                                                        new Date(quote.date),
                                                        "dd MMM",
                                                        { locale: fr }
                                                    )}
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>

            <QuoteDetailsSheet
                quote={selectedQuote}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                onUpdate={refreshQuotes}
            />
        </div>
    );
}
