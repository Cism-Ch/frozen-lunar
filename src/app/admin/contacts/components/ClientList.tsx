"use client";

import { useEffect, useState } from "react";
import { quoteStorage, Quote } from "@/lib/quote-storage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    const [clients, setClients] = useState<ClientContact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const quotes = quoteStorage.getAll();
        const clientMap = new Map<string, ClientContact>();

        quotes.forEach(quote => {
            // Use email as unique identifier
            const existing = clientMap.get(quote.email);

            if (existing) {
                // Update if quote is more recent
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
                    totalQuotes: 1
                });
            }
        });

        setClients(Array.from(clientMap.values()));
    }, []);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <CardTitle className="flex items-center justify-center sm:justify-start gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Clients & Prospects
                        </CardTitle>
                        <CardDescription>
                            Carnet d'adresses généré automatiquement depuis les devis.
                        </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                    <div className="text-center py-8 text-muted-foreground">
                        Aucun client trouvé.
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="space-y-4 md:hidden">
                            {filteredClients.map((client) => (
                                <div key={client.email} className="p-4 border rounded-lg bg-card">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                                {client.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{client.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                                        </div>
                                        <span className="inline-flex items-center justify-center rounded-full bg-secondary w-7 h-7 text-xs font-medium shrink-0">
                                            {client.totalQuotes}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" /> {client.phone}
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/quotes?search=${encodeURIComponent(client.email)}`}>
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
                                        <TableHead className="text-right">Devis Total</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClients.map((client) => (
                                        <TableRow key={client.email}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                            {client.name.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {client.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Mail className="h-3 w-3" /> {client.email}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Phone className="h-3 w-3" /> {client.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{client.lastQuoteDate}</TableCell>
                                            <TableCell className="text-right">
                                                <span className="inline-flex items-center justify-center rounded-full bg-secondary w-6 h-6 text-xs font-medium">
                                                    {client.totalQuotes}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/quotes?search=${encodeURIComponent(client.email)}`}>
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
