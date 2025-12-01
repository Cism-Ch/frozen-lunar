"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Users, DollarSign } from "lucide-react";
import { quoteStorage, Quote } from "@/lib/quote-storage";

export default function DashboardPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);

    useEffect(() => {
        setQuotes(quoteStorage.getAll());
    }, []);

    const validatedQuotes = quotes.filter(q => q.status === "Validé");
    const pendingQuotes = quotes.filter(q => q.status === "En attente");

    const stats = [
        {
            title: "Total Devis",
            value: quotes.length.toString(),
            change: `${pendingQuotes.length} en attente`,
            icon: FileText,
        },
        {
            title: "Devis Validés",
            value: validatedQuotes.length.toString(),
            change: `${quotes.length > 0 ? Math.round((validatedQuotes.length / quotes.length) * 100) : 0}% du total`,
            icon: DollarSign,
        },
        {
            title: "Clients Uniques",
            value: new Set(quotes.map(q => q.email)).size.toString(),
            change: "Basé sur les emails",
            icon: Users,
        },
        {
            title: "Taux de Validation",
            value: `${quotes.length > 0 ? Math.round((validatedQuotes.length / quotes.length) * 100) : 0}%`,
            change: `${validatedQuotes.length} sur ${quotes.length}`,
            icon: TrendingUp,
        },
    ];

    // Get the 3 most recent quotes
    const recentQuotes = quotes.slice(0, 3);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Aperçu</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Graphique des revenus (à implémenter)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Devis Récents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentQuotes.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Aucun devis pour le moment
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {recentQuotes.map((quote) => (
                                    <div key={quote.id} className="flex items-center">
                                        <div className="ml-4 space-y-1 flex-1">
                                            <p className="text-sm font-medium leading-none">{quote.client}</p>
                                            <p className="text-sm text-muted-foreground">{quote.email}</p>
                                        </div>
                                        <div className="ml-auto text-sm font-medium">
                                            {quote.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
