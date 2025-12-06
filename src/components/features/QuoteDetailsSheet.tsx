"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Quote, quoteStorage } from "@/lib/quote-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPin, Truck, Mail, Phone, User, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useState } from "react";

interface QuoteDetailsSheetProps {
    quote: Quote | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

export function QuoteDetailsSheet({ quote, open, onOpenChange, onUpdate }: QuoteDetailsSheetProps) {
    if (!quote) return null;

    const handleStatusUpdate = (status: Quote["status"]) => {
        quoteStorage.updateStatus(quote.id, status);
        toast.success(`Devis ${status.toLowerCase()} avec succès`);
        onUpdate();

        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto p-0 gap-0">
                <SheetHeader className="p-6 bg-muted/10 border-b space-y-4 pr-12">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                                <Truck className="h-6 w-6 text-primary" />
                                Détails du Devis
                            </SheetTitle>
                            <Badge
                                variant="outline"
                                className={
                                    quote.status === "Validé" ? "bg-green-500/10 text-green-600 border-green-200/50 hover:bg-green-500/20" :
                                        quote.status === "Refusé" ? "bg-red-500/10 text-red-600 border-red-200/50 hover:bg-red-500/20" :
                                            "bg-orange-500/10 text-orange-600 border-orange-200/50 hover:bg-orange-500/20"
                                }
                            >
                                {quote.status}
                            </Badge>
                        </div>
                    </div>
                    <SheetDescription className="flex items-center gap-2 text-sm bg-background/50 p-2 rounded-md border w-fit">
                        <span className="text-muted-foreground w-20">Référence</span>
                        <span className="font-mono font-bold text-foreground">{quote.id}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="p-6 space-y-8">
                    {/* Client Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-semibold tracking-wide text-sm uppercase">
                            <User className="h-4 w-4" />
                            Client
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-card border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Nom Complet</span>
                                <p className="font-medium text-lg mt-1">{quote.client}</p>
                            </div>
                            <div className="space-y-2">
                                <a href={`mailto:${quote.email}`} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group">
                                    <div className="p-2 bg-background rounded-full border shadow-sm group-hover:border-primary/50 transition-colors">
                                        <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Email</span>
                                        <span className="font-medium text-sm truncate">{quote.email}</span>
                                    </div>
                                </a>
                                <a href={`tel:${quote.phone}`} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group">
                                    <div className="p-2 bg-background rounded-full border shadow-sm group-hover:border-primary/50 transition-colors">
                                        <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Téléphone</span>
                                        <span className="font-medium text-sm">{quote.phone}</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Transport Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-semibold tracking-wide text-sm uppercase">
                            <Truck className="h-4 w-4" />
                            Logistique
                        </div>
                        <div className="bg-muted/10 border rounded-xl overflow-hidden">
                            <div className="grid grid-cols-2 divide-x divide-border border-b border-border/50">
                                <div className="p-4 flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Type</span>
                                    <span className="font-medium capitalize flex items-center gap-2">
                                        {quote.type}
                                    </span>
                                </div>
                                <div className="p-4 flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Date Prévue</span>
                                    <span className="font-medium flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        {format(new Date(quote.transportDate), "dd MMM yyyy", { locale: fr })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Itinerary */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-semibold tracking-wide text-sm uppercase">
                            <MapPin className="h-4 w-4" />
                            Itinéraire
                        </div>
                        <div className="relative pl-8 py-2 ml-3 border-l-[3px] border-dotted border-muted-foreground/30 space-y-10">
                            <div className="relative">
                                <div className="absolute -left-[39px] top-0 h-6 w-6 rounded-full border-4 border-background bg-green-500 shadow-md flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                </div>
                                <div className="bg-card border p-4 rounded-lg shadow-sm relative group hover:border-green-500/50 transition-colors">
                                    <span className="absolute -top-3 left-4 px-2 py-0.5 bg-green-500/10 text-xs font-semibold text-green-600 border border-green-500/20 rounded-full backdrop-blur-sm">
                                        DÉPART
                                    </span>
                                    <p className="font-medium leading-relaxed mt-1 text-foreground/90">{quote.pickup}</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[39px] top-0 h-6 w-6 rounded-full border-4 border-background bg-red-500 shadow-md flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                </div>
                                <div className="bg-card border p-4 rounded-lg shadow-sm relative group hover:border-red-500/50 transition-colors">
                                    <span className="absolute -top-3 left-4 px-2 py-0.5 bg-red-500/10 text-xs font-semibold text-red-600 border border-red-500/20 rounded-full backdrop-blur-sm">
                                        ARRIVÉE
                                    </span>
                                    <p className="font-medium leading-relaxed mt-1 text-foreground/90">{quote.dropoff}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="p-6 bg-muted/10 border-t flex-col sm:flex-row gap-3">
                    {quote.status === "En attente" && (
                        <>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                onClick={() => handleStatusUpdate("Refusé")}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Refuser le dossier
                            </Button>
                            <Button
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/10"
                                onClick={() => handleStatusUpdate("Validé")}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" /> Valider et Traiter
                            </Button>
                        </>
                    )}
                    {quote.status !== "En attente" && (
                        <Button
                            variant="secondary"
                            className="w-full sm:w-auto"
                            onClick={() => handleStatusUpdate("En attente")}
                        >
                            Réinitialiser le statut
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent >
        </Sheet >
    );
}
