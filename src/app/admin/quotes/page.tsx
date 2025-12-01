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
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { quoteStorage, Quote } from "@/lib/quote-storage";

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);

    useEffect(() => {
        // Load quotes from localStorage
        setQuotes(quoteStorage.getAll());
    }, []);

    const handleStatusChange = (id: string, status: Quote["status"]) => {
        quoteStorage.updateStatus(id, status);
        setQuotes(quoteStorage.getAll());
    };

    const handleDelete = (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) {
            quoteStorage.delete(id);
            setQuotes(quoteStorage.getAll());
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Demandes de Devis</h1>
                <div className="text-sm text-muted-foreground">
                    {quotes.length} demande{quotes.length > 1 ? "s" : ""}
                </div>
            </div>

            {quotes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Aucune demande de devis pour le moment.
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Trajet</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotes.map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-medium">{quote.id}</TableCell>
                                    <TableCell>{quote.date}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{quote.client}</div>
                                            <div className="text-sm text-muted-foreground">{quote.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{quote.type}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="truncate max-w-[200px]">{quote.pickup}</div>
                                            <div className="text-muted-foreground truncate max-w-[200px]">→ {quote.dropoff}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                quote.status === "Validé"
                                                    ? "default"
                                                    : quote.status === "Refusé"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
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
                                                <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "En attente")}>
                                                    En attente
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "Validé")}>
                                                    Validé
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(quote.id, "Refusé")}>
                                                    Refusé
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(quote.id)}
                                                >
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
