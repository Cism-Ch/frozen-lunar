"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Quote, QuoteSupplementaryInfo } from "@/lib/quote-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    CalendarIcon,
    MapPin,
    Truck,
    Mail,
    Phone,
    User,
    CheckCircle,
    XCircle,
    MessageSquare,
    Info,
    Bot,
    FileText,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { updateQuoteStatusAction } from "@/app/actions/quote-management";

interface QuoteDetailsSheetProps {
    quote: Quote | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

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

// Helper to format supplementary info nicely
function formatSupplementaryInfo(
    info: QuoteSupplementaryInfo | undefined
): { label: string; value: string }[] {
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
        items.push({
            label: "Catégorie",
            value: categoryLabels[info.category] || info.category,
        });
    }
    if (info.materialType)
        items.push({ label: "Type matériau", value: info.materialType });
    if (info.weight) items.push({ label: "Poids", value: info.weight });
    if (info.packaging)
        items.push({ label: "Conditionnement", value: info.packaging });
    if (info.hazardous !== undefined)
        items.push({
            label: "Matières dangereuses",
            value: info.hazardous ? "Oui" : "Non",
        });
    if (info.containerSize)
        items.push({ label: "Taille container", value: info.containerSize });
    if (info.containerType)
        items.push({ label: "Type container", value: info.containerType });
    if (info.loadingType)
        items.push({ label: "Chargement", value: info.loadingType });
    if (info.isEmpty !== undefined)
        items.push({
            label: "Container vide",
            value: info.isEmpty ? "Oui" : "Non",
        });
    if (info.machineType)
        items.push({ label: "Type machine", value: info.machineType });
    if (info.dimensions)
        items.push({ label: "Dimensions", value: info.dimensions });
    if (info.requiresCrane !== undefined)
        items.push({
            label: "Grue requise",
            value: info.requiresCrane ? "Oui" : "Non",
        });
    if (info.structureType)
        items.push({ label: "Type structure", value: info.structureType });
    if (info.length) items.push({ label: "Longueur", value: info.length });
    if (info.specialRequirements)
        items.push({
            label: "Exigences spéciales",
            value: info.specialRequirements,
        });
    if (info.accessInfo) items.push({ label: "Accès", value: info.accessInfo });
    if (info.urgency) {
        const urgencyLabels: Record<string, string> = {
            standard: "Standard",
            urgent: "Urgent",
            very_urgent: "Très urgent",
        };
        items.push({
            label: "Urgence",
            value: urgencyLabels[info.urgency] || info.urgency,
        });
    }

    return items;
}

export function QuoteDetailsSheet({
    quote,
    open,
    onOpenChange,
    onUpdate,
}: QuoteDetailsSheetProps) {
    if (!quote) return null;

    const handleStatusUpdate = async (status: Quote["status"]) => {
        try {
            const result = await updateQuoteStatusAction(quote.id, status);
            if (result.success) {
                toast.success(`Devis ${status.toLowerCase()} avec succès`);
                onUpdate();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour");
            }
        } catch (error: unknown) {
            console.error("Error updating status:", error);
            toast.error("Erreur lors de la mise à jour du statut");
        }
    };

    const supplementaryItems = formatSupplementaryInfo(quote.supplementaryInfo);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
                <SheetHeader className="bg-muted/10 space-y-4 border-b p-4 pr-12 sm:p-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <SheetTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
                                <Truck className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                                Détails du Devis
                            </SheetTitle>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant="outline"
                                    className={
                                        quote.status === "Validé"
                                            ? "border-green-200/50 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                            : quote.status === "Refusé"
                                              ? "border-red-200/50 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                              : "border-orange-200/50 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                                    }
                                >
                                    {quote.status}
                                </Badge>
                                {quote.source && (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1"
                                    >
                                        {quote.source === "chat" ? (
                                            <>
                                                <Bot className="h-3 w-3" />{" "}
                                                Assistant
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-3 w-3" />{" "}
                                                Formulaire
                                            </>
                                        )}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <SheetDescription className="bg-background/50 flex w-full items-center gap-2 rounded-md border p-2 text-xs sm:w-fit sm:text-sm">
                            <span className="text-muted-foreground">Réf.</span>
                            <span className="text-foreground truncate font-mono font-bold">
                                {quote.id}
                            </span>
                        </SheetDescription>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-2 sm:w-auto"
                            asChild
                        >
                            <a
                                href={`/admin/quotes/${encodeURIComponent(quote.id)}`}
                            >
                                Ouvrir l&apos;espace de travail
                            </a>
                        </Button>
                    </div>
                </SheetHeader>

                <div className="space-y-6 p-4 sm:space-y-8 sm:p-6">
                    {/* Client Information */}
                    <div className="space-y-4">
                        <div className="text-primary flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                            <User className="h-4 w-4" />
                            Client
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="bg-card rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md">
                                <span className="text-muted-foreground text-xs font-semibold uppercase">
                                    Nom Complet
                                </span>
                                <p className="mt-1 text-lg font-medium">
                                    {quote.client}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <a
                                    href={`mailto:${quote.email}`}
                                    className="bg-muted/20 hover:bg-muted/40 group flex items-center gap-3 rounded-lg border p-3 transition-colors"
                                >
                                    <div className="bg-background group-hover:border-primary/50 rounded-full border p-2 shadow-sm transition-colors">
                                        <Mail className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs">
                                            Email
                                        </span>
                                        <span className="truncate text-sm font-medium">
                                            {quote.email}
                                        </span>
                                    </div>
                                </a>
                                <a
                                    href={`tel:${quote.phone}`}
                                    className="bg-muted/20 hover:bg-muted/40 group flex items-center gap-3 rounded-lg border p-3 transition-colors"
                                >
                                    <div className="bg-background group-hover:border-primary/50 rounded-full border p-2 shadow-sm transition-colors">
                                        <Phone className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs">
                                            Téléphone
                                        </span>
                                        <span className="text-sm font-medium">
                                            {quote.phone}
                                        </span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Transport Details */}
                    <div className="space-y-4">
                        <div className="text-primary flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                            <Truck className="h-4 w-4" />
                            Logistique
                        </div>
                        <div className="bg-muted/10 overflow-hidden rounded-xl border">
                            <div className="divide-border border-border/50 grid grid-cols-1 divide-y border-b sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                                <div className="flex flex-col gap-1 p-4">
                                    <span className="text-muted-foreground text-xs font-semibold uppercase">
                                        Type
                                    </span>
                                    <span className="flex items-center gap-2 font-medium capitalize">
                                        {quote.type}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 p-4">
                                    <span className="text-muted-foreground text-xs font-semibold uppercase">
                                        Date Prévue
                                    </span>
                                    <span className="text-medium flex items-center gap-2">
                                        <CalendarIcon className="text-muted-foreground h-4 w-4" />
                                        {safeFormatDate(quote.transportDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Itinerary */}
                    <div className="space-y-4">
                        <div className="text-primary flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                            <MapPin className="h-4 w-4" />
                            Itinéraire
                        </div>
                        <div className="border-muted-foreground/30 relative ml-3 space-y-10 border-l-[3px] border-dotted py-2 pl-8">
                            <div className="relative">
                                <div className="border-background absolute top-0 -left-[39px] flex h-6 w-6 items-center justify-center rounded-full border-4 bg-green-500 shadow-md">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                </div>
                                <div className="bg-card group relative rounded-lg border p-4 shadow-sm transition-colors hover:border-green-500/50">
                                    <span className="absolute -top-3 left-4 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 backdrop-blur-sm">
                                        DÉPART
                                    </span>
                                    <p className="text-foreground/90 mt-1 leading-relaxed font-medium">
                                        {quote.pickup}
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="border-background absolute top-0 -left-[39px] flex h-6 w-6 items-center justify-center rounded-full border-4 bg-red-500 shadow-md">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                </div>
                                <div className="bg-card group relative rounded-lg border p-4 shadow-sm transition-colors hover:border-red-500/50">
                                    <span className="absolute -top-3 left-4 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 backdrop-blur-sm">
                                        ARRIVÉE
                                    </span>
                                    <p className="text-foreground/90 mt-1 leading-relaxed font-medium">
                                        {quote.dropoff}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Supplementary Info */}
                    {supplementaryItems.length > 0 && (
                        <>
                            <Separator className="bg-border/50" />
                            <div className="space-y-4">
                                <div className="text-primary flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                                    <Info className="h-4 w-4" />
                                    Informations complémentaires
                                </div>
                                <div className="bg-muted/10 rounded-xl border p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {supplementaryItems.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col gap-0.5"
                                                >
                                                    <span className="text-muted-foreground text-xs">
                                                        {item.label}
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            )
                                        )}
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
                                <div className="text-primary flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                                    <MessageSquare className="h-4 w-4" />
                                    Notes du client
                                </div>
                                <div className="bg-muted/10 rounded-xl border p-4">
                                    <p className="text-foreground/80 text-sm whitespace-pre-wrap">
                                        {quote.userNotes}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <SheetFooter className="bg-muted/10 flex-col gap-3 border-t p-6 sm:flex-row">
                    {quote.status === "En attente" && (
                        <>
                            <Button
                                variant="outline"
                                className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 w-full sm:w-auto"
                                onClick={() => handleStatusUpdate("Refusé")}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Refuser le
                                dossier
                            </Button>
                            <Button
                                className="w-full bg-green-600 shadow-lg shadow-green-900/10 hover:bg-green-700 sm:w-auto"
                                onClick={() => handleStatusUpdate("Validé")}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" /> Valider
                                et Traiter
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
            </SheetContent>
        </Sheet>
    );
}
