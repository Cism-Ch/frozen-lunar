"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Quote, quoteStorage, QuoteSupplementaryInfo } from "@/lib/quote-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPin, Truck, Mail, Phone, User, CheckCircle, XCircle, MessageSquare, Info, Bot, FileText } from "lucide-react";
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

// Helper to format supplementary info nicely
function formatSupplementaryInfo(info: QuoteSupplementaryInfo | undefined): { label: string; value: string }[] {
    if (!info) return [];

    const items: { label: string; value: string }[] = [];

    if (info.category) {
        const categoryLabels: Record<string, string> = {
            materials: "Matériaux",
            container: "Container",
            machinery: "Machine industrielle",
            structure: "Charpente/Structure",
            other: "Autre",
        };
        items.push({ label: "Catégorie", value: categoryLabels[info.category] || info.category });
    }
    if (info.materialType) items.push({ label: "Type matériau", value: info.materialType });
    if (info.weight) items.push({ label: "Poids", value: info.weight });
    if (info.packaging) items.push({ label: "Conditionnement", value: info.packaging });
    if (info.hazardous !== undefined) items.push({ label: "Matières dangereuses", value: info.hazardous ? "Oui" : "Non" });
    if (info.containerSize) items.push({ label: "Taille container", value: info.containerSize });
    if (info.containerType) items.push({ label: "Type container", value: info.containerType });
    if (info.loadingType) items.push({ label: "Chargement", value: info.loadingType });
    if (info.isEmpty !== undefined) items.push({ label: "Container vide", value: info.isEmpty ? "Oui" : "Non" });
    if (info.machineType) items.push({ label: "Type machine", value: info.machineType });
    if (info.dimensions) items.push({ label: "Dimensions", value: info.dimensions });
    if (info.requiresCrane !== undefined) items.push({ label: "Grue requise", value: info.requiresCrane ? "Oui" : "Non" });
    if (info.structureType) items.push({ label: "Type structure", value: info.structureType });
    if (info.length) items.push({ label: "Longueur", value: info.length });
    if (info.specialRequirements) items.push({ label: "Exigences spéciales", value: info.specialRequirements });
    if (info.accessInfo) items.push({ label: "Accès", value: info.accessInfo });
    if (info.urgency) {
        const urgencyLabels: Record<string, string> = {
            standard: "Standard",
            urgent: "Urgent",
            very_urgent: "Très urgent",
        };
        items.push({ label: "Urgence", value: urgencyLabels[info.urgency] || info.urgency });
    }

    return items;
}

export function QuoteDetailsSheet({ quote, open, onOpenChange, onUpdate }: QuoteDetailsSheetProps) {
    if (!quote) return null;

    const handleStatusUpdate = (status: Quote["status"]) => {
        quoteStorage.updateStatus(quote.id, status);
        toast.success(`Devis ${status.toLowerCase()} avec succès`);
        onUpdate();

        onOpenChange(false);
    };

    const supplementaryItems = formatSupplementaryInfo(quote.supplementaryInfo);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 gap-0">
                <SheetHeader className="p-4 sm:p-6 bg-muted/10 border-b space-y-4 pr-12">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <SheetTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                Détails du Devis
                            </SheetTitle>
                            <div className="flex flex-wrap gap-2">
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
                                {quote.source && (
                                    <Badge variant="secondary" className="gap-1">
                                        {quote.source === "chat" ? (
                                            <><Bot className="h-3 w-3" /> Assistant</>
                                        ) : (
                                            <><FileText className="h-3 w-3" /> Formulaire</>
                                        )}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <SheetDescription className="flex items-center gap-2 text-xs sm:text-sm bg-background/50 p-2 rounded-md border w-full sm:w-fit">
                            <span className="text-muted-foreground">Réf.</span>
                            <span className="font-mono font-bold text-foreground truncate">{quote.id}</span>
                        </SheetDescription>
                        <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto" asChild>
                            <a href={`/admin/quotes/${encodeURIComponent(quote.id)}`}>
                                Ouvrir l'espace de travail
                            </a>
                        </Button>
                    </div>
                </SheetHeader>

                <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-y sm:divide-y-0 divide-border border-b border-border/50">
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

                    {/* Supplementary Info */}
                    {supplementaryItems.length > 0 && (
                        <>
                            <Separator className="bg-border/50" />
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold tracking-wide text-sm uppercase">
                                    <Info className="h-4 w-4" />
                                    Informations complémentaires
                                </div>
                                <div className="bg-muted/10 border rounded-xl p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {supplementaryItems.map((item, index) => (
                                            <div key={index} className="flex flex-col gap-0.5">
                                                <span className="text-xs text-muted-foreground">{item.label}</span>
                                                <span className="text-sm font-medium">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* User Notes */}
                    {quote.userNotes && (
                        <>
                            <Separator className="bg-border/50" />
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold tracking-wide text-sm uppercase">
                                    <MessageSquare className="h-4 w-4" />
                                    Notes du client
                                </div>
                                <div className="bg-muted/10 border rounded-xl p-4">
                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{quote.userNotes}</p>
                                </div>
                            </div>
                        </>
                    )}
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
