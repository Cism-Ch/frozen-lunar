"use client";

import { useMemo, useState } from "react";
import { quoteStorage } from "@/lib/quote-storage";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Mail, Phone, Search, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ClientContact {
    name: string;
    email: string;
    phone: string;
    lastQuoteDate: string;
    totalQuotes: number;
}

export function ClientList() {
    const [searchTerm, setSearchTerm] = useState("");
    const isMounted = useHasMounted();

    const clients = useMemo(() => {
        if (!isMounted) return [];
        const quotes = quoteStorage.getAll();
        const clientMap = new Map<string, ClientContact>();

        quotes.forEach((quote) => {
            const existing = clientMap.get(quote.email);

            if (existing) {
                if (new Date(quote.date) > new Date(existing.lastQuoteDate)) {
                    existing.lastQuoteDate = quote.date;
                }
                existing.totalQuotes += 1;
            } else {
                clientMap.set(quote.email, {
                    name: quote.client,
                    email: quote.email,
                    phone: quote.phone,
                    lastQuoteDate: quote.date,
                    totalQuotes: 1,
                });
            }
        });

        return Array.from(clientMap.values());
    }, [isMounted]);

    const filteredClients = clients.filter(
        (client) =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="text-center sm:text-left">
                        <CardTitle className="flex items-center justify-center gap-2 sm:justify-start">
                            <Users className="text-primary h-5 w-5" />
                            Clients & Prospects
                        </CardTitle>
                        <CardDescription>
                            Carnet d&apos;adresses généré automatiquement depuis
                            les devis.
                        </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredClients.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">
                        Aucun client trouvé.
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="space-y-4 md:hidden">
                            {filteredClients.map((client) => (
                                <div
                                    key={client.email}
                                    className="bg-card rounded-lg border p-4"
                                >
                                    <div className="mb-3 flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                                {client.name
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {client.name}
                                            </p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {client.email}
                                            </p>
                                        </div>
                                        <span className="bg-secondary inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                            {client.totalQuotes}
                                        </span>
                                    </div>
                                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />{" "}
                                            {client.phone}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/admin/quotes?search=${encodeURIComponent(client.email)}`}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Dernier Devis</TableHead>
                                        <TableHead className="text-right">
                                            Devis Total
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClients.map((client) => (
                                        <TableRow key={client.email}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                            {client.name
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {client.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <div className="text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />{" "}
                                                        {client.email}
                                                    </div>
                                                    <div className="text-muted-foreground flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />{" "}
                                                        {client.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {client.lastQuoteDate}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="bg-secondary inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
                                                    {client.totalQuotes}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/quotes?search=${encodeURIComponent(client.email)}`}
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                </Button>
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
    );
}
