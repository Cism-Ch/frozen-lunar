"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Quote,
    QuoteSupplementaryInfo,
    QuoteHistoryEvent,
} from "@/lib/quote-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/features/admin/QuoteStatusBadge";
import { Separator } from "@/components/ui/separator";
import {
    AlertTriangle,
    ArrowRight,
    Bot,
    Calendar as CalendarIcon,
    Check,
    CheckCircle,
    Clock,
    Coins,
    Copy,
    ExternalLink,
    FileText,
    Flame,
    Info,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    MessageSquare,
    Phone,
    Truck,
    User,
    XCircle,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { updateQuoteStatusAction } from "@/app/actions/quote-management";
import { logWhatsAppContactAction } from "@/app/actions/whatsapp-actions";

interface QuoteDetailsSheetProps {
    quote: Quote | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

/**
 * Formatage sécurisé de date (ISO ou texte libre)
 */
function safeFormatDate(dateString: string | undefined): string {
    if (!dateString) return "Non spécifié";

    const parsed = parseISO(dateString);
    if (isValid(parsed)) {
        return format(parsed, "dd MMM yyyy", { locale: fr });
    }

    const direct = new Date(dateString);
    if (isValid(direct)) {
        return format(direct, "dd MMM yyyy", { locale: fr });
    }

    return dateString;
}

/**
 * Nettoyage et normalisation du numéro pour le lien WhatsApp Click-to-Chat
 */
function cleanPhoneForWhatsApp(phone: string): string {
    let digits = phone.replace(/[^0-9]/g, "");
    if (digits.startsWith("00")) {
        digits = digits.slice(2);
    }
    // Si format local ivoirien à 10 chiffres (ex: 0701020304)
    if (digits.length === 10 && digits.startsWith("0")) {
        return `225${digits.slice(1)}`;
    }
    return digits;
}

/**
 * Extraction et typage des informations complémentaires de transport
 */
function formatSupplementaryInfo(
    info: QuoteSupplementaryInfo | undefined
): { label: string; value: string }[] {
    if (!info) return [];

    const items: { label: string; value: string }[] = [];

    if (info.category) {
        const categoryLabels: Record<string, string> = {
            materials: "Matériaux de construction",
            container: "Container maritime",
            machinery: "Machine industrielle",
            structure: "Charpente / Structure métallique",
            other: "Autre fret spécialisé",
        };
        items.push({
            label: "Catégorie",
            value: categoryLabels[info.category] || info.category,
        });
    }
    if (info.materialType)
        items.push({ label: "Type de matériau", value: info.materialType });
    if (info.weight) items.push({ label: "Poids estimé", value: info.weight });
    if (info.packaging)
        items.push({ label: "Conditionnement", value: info.packaging });
    if (info.containerSize)
        items.push({ label: "Taille container", value: info.containerSize });
    if (info.containerType)
        items.push({ label: "Type container", value: info.containerType });
    if (info.loadingType)
        items.push({ label: "Mode de chargement", value: info.loadingType });
    if (info.isEmpty !== undefined)
        items.push({
            label: "Container vide",
            value: info.isEmpty ? "Oui" : "Non",
        });
    if (info.machineType)
        items.push({ label: "Type de machine", value: info.machineType });
    if (info.dimensions)
        items.push({ label: "Dimensions (L×l×h)", value: info.dimensions });
    if (info.structureType)
        items.push({ label: "Type d'ouvrage", value: info.structureType });
    if (info.length)
        items.push({ label: "Longueur hors-tout", value: info.length });
    if (info.accessInfo)
        items.push({ label: "Conditions d'accès", value: info.accessInfo });

    return items;
}

export function QuoteDetailsSheet({
    quote,
    open,
    onOpenChange,
    onUpdate,
}: QuoteDetailsSheetProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    if (!quote) return null;

    const copyToClipboard = async (
        text: string,
        label: string,
        fieldId: string
    ) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand("copy");
                textArea.remove();
            }
            setCopiedField(fieldId);
            toast.success(`${label} copié dans le presse-papier`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err: unknown) {
            console.error("Erreur copie presse-papier:", err);
            toast.error("Impossible de copier dans le presse-papier");
        }
    };

    const handleWhatsAppClick = async () => {
        if (!quote) return;
        const cleanDigits = cleanPhoneForWhatsApp(quote.phone);
        const message = encodeURIComponent(
            `Bonjour ${quote.client}, nous faisons suite à votre devis #${quote.id.slice(0, 8)} pour le transport de ${quote.pickup} vers ${quote.dropoff}. Pouvons-nous échanger à ce sujet ?`
        );
        const url = `https://wa.me/${cleanDigits}?text=${message}`;
        window.open(url, "_blank", "noopener,noreferrer");
        toast.success("Discussion WhatsApp ouverte");

        try {
            await logWhatsAppContactAction(
                quote.id,
                "Échange initié depuis le panneau latéral de consultation"
            );
        } catch (err: unknown) {
            console.error("Erreur log WhatsApp:", err);
        }
    };

    const handleStatusUpdate = async (status: Quote["status"]) => {
        if (!quote || isUpdating) return;
        setIsUpdating(true);
        try {
            const result = await updateQuoteStatusAction(quote.id, status);
            if (result.success) {
                toast.success(
                    `Dossier #${quote.id.slice(0, 8)} ${status.toLowerCase()} avec succès`
                );
                onUpdate();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour");
            }
        } catch (error: unknown) {
            console.error("Error updating status:", error);
            toast.error("Erreur lors de la mise à jour du statut");
        } finally {
            setIsUpdating(false);
        }
    };

    const supplementaryItems = formatSupplementaryInfo(quote.supplementaryInfo);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        quote.pickup
    )}&destination=${encodeURIComponent(quote.dropoff)}`;

    // Contraintes opérationnelles lourdes
    const hasHazardous = Boolean(quote.supplementaryInfo?.hazardous);
    const hasCrane = Boolean(quote.supplementaryInfo?.requiresCrane);
    const isUrgent =
        quote.supplementaryInfo?.urgency === "urgent" ||
        quote.supplementaryInfo?.urgency === "very_urgent";
    const hasOperationalAlerts = hasHazardous || hasCrane || isUrgent;

    // Détection d'un tarif renseigné
    const isPriced =
        Boolean(quote.amount) &&
        quote.amount.trim() !== "" &&
        quote.amount.toLowerCase() !== "en attente" &&
        quote.amount.toLowerCase() !== "à calculer";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex h-full max-h-[100dvh] w-full flex-col gap-0 p-0 sm:max-w-xl">
                {/* 1. En-tête Sticky */}
                <SheetHeader className="bg-background/95 z-10 shrink-0 space-y-3 border-b p-4 pr-12 backdrop-blur sm:p-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <SheetTitle className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
                                <Truck className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                                Dossier de Cotation
                            </SheetTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <QuoteStatusBadge status={quote.status} />
                                {quote.source && (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1 text-xs font-medium"
                                    >
                                        {quote.source === "chat" ? (
                                            <>
                                                <Bot className="h-3 w-3" />
                                                Assistant IA
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-3 w-3" />
                                                Formulaire Web
                                            </>
                                        )}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <SheetDescription className="sr-only">
                        Détails et informations opérationnelles du devis #
                        {quote.id} pour {quote.client}
                    </SheetDescription>

                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="bg-muted/40 hover:bg-muted/60 flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors sm:w-fit sm:text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground font-medium">
                                    Réf.
                                </span>
                                <span className="text-foreground font-mono font-bold">
                                    #{quote.id.slice(0, 8)}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground h-6 w-6"
                                onClick={() =>
                                    copyToClipboard(
                                        quote.id,
                                        "Référence du devis",
                                        "quoteId"
                                    )
                                }
                                title="Copier l'identifiant complet"
                            >
                                {copiedField === "quoteId" ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-2 text-xs font-medium sm:w-auto"
                            asChild
                        >
                            <Link
                                href={`/admin/quotes/${encodeURIComponent(quote.id)}`}
                            >
                                Ouvrir l&apos;espace de travail
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                </SheetHeader>

                {/* 2. Corps Défilable Indépendant */}
                <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
                    {/* A. Bloc Financier & Cotation */}
                    {isPriced ? (
                        <div className="border-primary/20 from-primary/5 via-card to-card relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-xs">
                            <div className="flex items-center justify-between">
                                <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                    <Coins className="h-4 w-4" />
                                    Montant de la prestation
                                </div>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                                >
                                    Tarif fixé
                                </Badge>
                            </div>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-foreground font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                                    {quote.amount}
                                </span>
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Tarif convenu pour la prise en charge
                                logistique.
                            </p>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 dark:bg-amber-950/20">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                    <div className="mt-0.5 rounded-full bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
                                        <Info className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-foreground text-sm font-semibold">
                                            Chiffrage en attente
                                        </h4>
                                        <p className="text-muted-foreground mt-0.5 text-xs">
                                            Le montant final n&apos;est pas
                                            encore arrêté pour cette demande.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 shrink-0 gap-1.5 border-amber-500/30 text-xs font-medium text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
                                    asChild
                                >
                                    <Link
                                        href={`/admin/quotes/${encodeURIComponent(quote.id)}`}
                                    >
                                        Chiffrer
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* B. Alertes Opérationnelles Critiques */}
                    {hasOperationalAlerts && (
                        <div className="flex flex-wrap gap-2">
                            {hasHazardous && (
                                <Badge
                                    variant="destructive"
                                    className="gap-1.5 px-2.5 py-1 text-xs font-semibold"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Matières dangereuses
                                </Badge>
                            )}
                            {hasCrane && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300"
                                >
                                    <Truck className="h-3.5 w-3.5" />
                                    Grue requise au chargement
                                </Badge>
                            )}
                            {isUrgent && (
                                <Badge
                                    variant="destructive"
                                    className="animate-pulse gap-1.5 bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white"
                                >
                                    <Flame className="h-3.5 w-3.5" />
                                    {quote.supplementaryInfo?.urgency ===
                                    "very_urgent"
                                        ? "Urgence critique"
                                        : "Enlèvement prioritaire"}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* C. Fiche Client & Contact Direct */}
                    <div className="space-y-3">
                        <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                            <User className="text-primary h-3.5 w-3.5" />
                            Client & Contact
                        </div>

                        <div className="bg-card rounded-xl border p-4 shadow-xs">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs font-semibold uppercase">
                                    Donneur d&apos;ordre
                                </span>
                                <p className="text-foreground text-lg font-bold">
                                    {quote.client}
                                </p>
                            </div>
                        </div>

                        {/* Rangée d'Actions Rapides */}
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            {/* WhatsApp Direct */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleWhatsAppClick}
                                className="group h-auto flex-col items-start gap-1 border-emerald-500/30 bg-emerald-500/5 p-3 text-left transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10"
                            >
                                <div className="flex w-full items-center justify-between">
                                    <span className="text-[11px] font-semibold text-emerald-700 uppercase dark:text-emerald-400">
                                        WhatsApp
                                    </span>
                                    <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="text-foreground truncate text-xs font-medium">
                                    Échanger en direct
                                </span>
                            </Button>

                            {/* Téléphone */}
                            <div className="bg-card hover:border-primary/40 flex items-center justify-between rounded-lg border p-2.5 shadow-xs transition-colors">
                                <a
                                    href={`tel:${quote.phone}`}
                                    className="flex flex-1 flex-col truncate pr-1"
                                    title="Appeler le client"
                                >
                                    <div className="flex items-center justify-between pr-2">
                                        <span className="text-muted-foreground text-[11px] font-semibold uppercase">
                                            Téléphone
                                        </span>
                                        <Phone className="text-primary h-3.5 w-3.5 opacity-80" />
                                    </div>
                                    <span className="text-foreground truncate text-xs font-medium">
                                        {quote.phone}
                                    </span>
                                </a>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground h-7 w-7 shrink-0"
                                    onClick={() =>
                                        copyToClipboard(
                                            quote.phone,
                                            "Téléphone",
                                            "phone"
                                        )
                                    }
                                    title="Copier le numéro"
                                >
                                    {copiedField === "phone" ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </div>

                            {/* Email */}
                            <div className="bg-card hover:border-primary/40 flex items-center justify-between rounded-lg border p-2.5 shadow-xs transition-colors">
                                <a
                                    href={`mailto:${quote.email}`}
                                    className="flex flex-1 flex-col truncate pr-1"
                                    title="Envoyer un email"
                                >
                                    <div className="flex items-center justify-between pr-2">
                                        <span className="text-muted-foreground text-[11px] font-semibold uppercase">
                                            Email
                                        </span>
                                        <Mail className="text-primary h-3.5 w-3.5 opacity-80" />
                                    </div>
                                    <span className="text-foreground truncate text-xs font-medium">
                                        {quote.email}
                                    </span>
                                </a>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground h-7 w-7 shrink-0"
                                    onClick={() =>
                                        copyToClipboard(
                                            quote.email,
                                            "Email",
                                            "email"
                                        )
                                    }
                                    title="Copier l'email"
                                >
                                    {copiedField === "email" ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* D. Itinéraire & Trajet Expédition */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                <MapPin className="text-primary h-3.5 w-3.5" />
                                Axe de Transport & Dates
                            </div>
                            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {safeFormatDate(quote.transportDate)}
                            </span>
                        </div>

                        {/* Tracé Visuel */}
                        <div className="border-muted-foreground/30 relative ml-3 space-y-6 border-l-[3px] border-dotted py-1 pl-6">
                            {/* Point de Départ */}
                            <div className="relative">
                                <div className="border-background absolute top-1 -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-4 bg-emerald-500 shadow-xs">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                </div>
                                <div className="bg-card rounded-lg border p-3 shadow-xs">
                                    <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                        Point d&apos;Enlèvement
                                    </span>
                                    <p className="text-foreground mt-0.5 text-sm font-semibold">
                                        {quote.pickup}
                                    </p>
                                </div>
                            </div>

                            {/* Point d'Arrivée */}
                            <div className="relative">
                                <div className="border-background absolute top-1 -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-4 bg-rose-500 shadow-xs">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                </div>
                                <div className="bg-card rounded-lg border p-3 shadow-xs">
                                    <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                                        Destination de Livraison
                                    </span>
                                    <p className="text-foreground mt-0.5 text-sm font-semibold">
                                        {quote.dropoff}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bouton Google Maps */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-muted-foreground hover:text-foreground w-full gap-2 text-xs font-medium"
                            asChild
                        >
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MapPin className="text-primary h-3.5 w-3.5" />
                                Calculer l&apos;itinéraire sur Google Maps
                                <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
                            </a>
                        </Button>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* E. Fret & Spécifications Métier */}
                    <div className="space-y-3">
                        <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                            <Truck className="text-primary h-3.5 w-3.5" />
                            Spécifications Logistiques
                        </div>

                        <div className="bg-muted/20 divide-border/60 divide-y rounded-xl border">
                            <div className="flex items-center justify-between p-3 text-xs sm:text-sm">
                                <span className="text-muted-foreground font-medium">
                                    Fret principal
                                </span>
                                <span className="text-foreground font-semibold capitalize">
                                    {quote.type}
                                </span>
                            </div>

                            {supplementaryItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 text-xs sm:text-sm"
                                >
                                    <span className="text-muted-foreground font-medium">
                                        {item.label}
                                    </span>
                                    <span className="text-foreground font-semibold">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* F. Notes du Client */}
                    {quote.userNotes && (
                        <>
                            <Separator className="bg-border/60" />
                            <div className="space-y-3">
                                <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                    <MessageSquare className="text-primary h-3.5 w-3.5" />
                                    Instructions Particulières du Client
                                </div>
                                <div className="bg-muted/20 rounded-xl border p-3.5">
                                    <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap sm:text-sm">
                                        {quote.userNotes}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* G. Mini-Timeline d'Audit */}
                    {quote.history && quote.history.length > 0 && (
                        <>
                            <Separator className="bg-border/60" />
                            <div className="space-y-3">
                                <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                    <Clock className="h-3.5 w-3.5" />
                                    Dernières activités d&apos;audit
                                </div>
                                <div className="bg-muted/20 space-y-2 rounded-xl border p-3">
                                    {quote.history
                                        .slice(-3)
                                        .reverse()
                                        .map((event: QuoteHistoryEvent) => (
                                            <div
                                                key={event.id}
                                                className="flex items-start justify-between gap-2 text-xs"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <span className="bg-primary/70 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                                                    <div>
                                                        <span className="text-foreground font-semibold">
                                                            {event.action}
                                                        </span>
                                                        {event.description && (
                                                            <p className="text-muted-foreground line-clamp-1">
                                                                {
                                                                    event.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
                                                    {safeFormatDate(
                                                        event.timestamp
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Pied de Page Sticky */}
                <SheetFooter className="bg-background/95 z-10 mt-0 flex shrink-0 flex-col items-center justify-between gap-3 border-t p-4 backdrop-blur sm:flex-row sm:p-6">
                    {quote.status === "En attente" ? (
                        <>
                            <Button
                                variant="outline"
                                disabled={isUpdating}
                                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 w-full transition-colors sm:w-auto"
                                onClick={() => handleStatusUpdate("Refusé")}
                            >
                                {isUpdating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Refuser le dossier
                            </Button>
                            <Button
                                disabled={isUpdating}
                                className="w-full bg-emerald-600 text-white shadow-md shadow-emerald-900/10 transition-colors hover:bg-emerald-700 sm:w-auto"
                                onClick={() => handleStatusUpdate("Validé")}
                            >
                                {isUpdating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Valider et Traiter
                            </Button>
                        </>
                    ) : (
                        <div className="flex w-full items-center justify-between gap-3">
                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                <span>Statut actuel :</span>
                                <QuoteStatusBadge status={quote.status} />
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={isUpdating}
                                className="w-full sm:w-auto"
                                onClick={() => handleStatusUpdate("En attente")}
                            >
                                {isUpdating && (
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                )}
                                Réinitialiser le statut
                            </Button>
                        </div>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
