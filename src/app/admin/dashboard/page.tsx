"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { FileText, TrendingUp, Clock, CheckCircle, Euro } from "lucide-react";
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
import { DemoModeControl } from "@/components/features/admin/DemoModeControl";
import { BusinessAnalytics } from "@/components/features/admin/BusinessAnalytics";
import { ActivityChart } from "@/components/features/admin/ActivityChart";

export default function DashboardPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);

    const loadQuotes = async () => {
        const result = await getQuotesAction();
        if (result.success && result.quotes) {
            setQuotes(result.quotes as Quote[]);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadQuotes();
    }, []);

    // Souscription Supabase Realtime avec rafraîchissement automatique
    useRealtimeQuotes({
        onQuoteInserted: loadQuotes,
        onQuoteUpdated: loadQuotes,
        onQuoteDeleted: loadQuotes,
    });

    // Calculs financiers et opérationnels consolidés
    const {
        validatedQuotes,
        pendingQuotes,
        totalRevenue,
        averageDealSize,
        formCount,
        chatCount,
        conversionRate,
    } = useMemo(() => {
        const validated = quotes.filter(
            (q) =>
                q.status === "Validé" ||
                String(q.status).toUpperCase() === "VALIDATED"
        );
        const pending = quotes.filter(
            (q) =>
                q.status === "En attente" ||
                String(q.status).toUpperCase() === "PENDING"
        );

        let revenue = 0;
        let validAmountCount = 0;
        let chat = 0;
        let form = 0;

        quotes.forEach((q) => {
            if (q.amount && q.amount !== "À calculer") {
                const numericStr = q.amount.replace(/[^0-9]/g, "");
                const val = parseInt(numericStr, 10);
                if (!isNaN(val) && val > 0) {
                    revenue += val;
                    validAmountCount++;
                }
            }
            if (String(q.source).toUpperCase() === "CHAT") {
                chat++;
            } else {
                form++;
            }
        });

        const rate =
            quotes.length > 0
                ? Math.round((validated.length / quotes.length) * 100)
                : 0;
        const avgDeal =
            validAmountCount > 0 ? Math.round(revenue / validAmountCount) : 0;

        return {
            validatedQuotes: validated,
            pendingQuotes: pending,
            totalRevenue: revenue,
            averageDealSize: avgDeal,
            formCount: form,
            chatCount: chat,
            conversionRate: rate,
        };
    }, [quotes]);

    const stats = [
        {
            title: "Volume Financier Estimé",
            value: totalRevenue,
            isCurrency: true,
            isPercent: false,
            change: `Panier moyen : ${averageDealSize.toLocaleString("fr-FR")} €`,
            icon: Euro,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Total Demandes",
            value: quotes.length,
            isCurrency: false,
            isPercent: false,
            change: `${formCount} formulaire${formCount > 1 ? "s" : ""} • ${chatCount} IA chat`,
            icon: FileText,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
        },
        {
            title: "Dossiers En Attente",
            value: pendingQuotes.length,
            isCurrency: false,
            isPercent: false,
            change: "Nécessite action prioritaire",
            icon: Clock,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            title: "Taux de Conversion",
            value: conversionRate,
            isCurrency: false,
            isPercent: true,
            change: `${validatedQuotes.length} validé${validatedQuotes.length > 1 ? "s" : ""} sur ${quotes.length} devis`,
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
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

            {/* Mode Démo & Injection de Données Test */}
            <DemoModeControl />

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
                                    <div className="font-mono text-2xl font-bold">
                                        <CountUp
                                            to={stat.value}
                                            duration={1.5}
                                            suffix={
                                                stat.isCurrency
                                                    ? " €"
                                                    : stat.isPercent
                                                      ? " %"
                                                      : ""
                                            }
                                        />
                                    </div>
                                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                                        <TrendingUp className="h-3 w-3 shrink-0 text-green-500" />
                                        <span className="truncate">
                                            {stat.change}
                                        </span>
                                    </p>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            {/* Suivi Opérationnel : Chronologie d'Activité & Devis Récents */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Real Interactive Activity Chart */}
                <FadeIn
                    direction="left"
                    delay={0.15}
                    className="col-span-full lg:col-span-4"
                >
                    <ActivityChart quotes={quotes} />
                </FadeIn>

                {/* Recent Quotes */}
                <FadeIn
                    direction="right"
                    delay={0.2}
                    className="col-span-full lg:col-span-3"
                >
                    <Card className="flex h-full flex-col justify-between">
                        <div>
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
                                                    initial={{
                                                        opacity: 0,
                                                        x: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: index * 0.1,
                                                    }}
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="max-w-[140px] truncate sm:max-w-[180px]">
                                                                {quote.client}
                                                            </span>
                                                            <span className="text-muted-foreground max-w-[140px] truncate text-xs sm:max-w-[180px]">
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
                                                            new Date(
                                                                quote.date
                                                            ),
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
                        </div>
                        <div className="bg-muted/10 border-t p-3 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-muted-foreground hover:text-foreground w-full text-xs"
                            >
                                <Link href="/admin/quotes">
                                    Consulter l&apos;intégralité des devis (
                                    {quotes.length}) →
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </FadeIn>
            </div>

            {/* Business Intelligence & Analytics Métier */}
            <FadeIn delay={0.25}>
                <BusinessAnalytics quotes={quotes} />
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
