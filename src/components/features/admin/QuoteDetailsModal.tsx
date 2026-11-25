"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Quote,
    QuoteHistoryEvent,
    QuoteSupplementaryInfo,
} from "@/lib/quote-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/features/admin/QuoteStatusBadge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    AlertTriangle,
    ArrowRight,
    Ban,
    Bot,
    Calendar as CalendarIcon,
    Check,
    CheckCircle,
    Clock,
    Coins,
    Copy,
    Download,
    ExternalLink,
    FileText,
    Flame,
    Info,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    MessageSquare,
    Paperclip,
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
import { formatQuoteReference } from "@/lib/tracking-code";
import { resolveAttachmentProxyUrl } from "@/lib/attachment-url";
import { logger } from "@/lib/logger";

interface QuoteDetailsModalProps {
    quote: Quote | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

function safeFormatDate(
    dateString: string | undefined,
    withTime = false
): string {
    if (!dateString) return "Non spécifié";
    const pattern = withTime ? "dd MMM yyyy 'à' HH:mm" : "dd MMM yyyy";
    const parsed = parseISO(dateString);
    if (isValid(parsed)) {
        return format(parsed, pattern, { locale: fr });
    }
    const direct = new Date(dateString);
    if (isValid(direct)) {
        return format(direct, pattern, { locale: fr });
    }
    return dateString;
}

function cleanPhoneForWhatsApp(phone: string): string {
    let digits = phone.replace(/[^0-9]/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.length === 10 && digits.startsWith("0")) {
        return `225${digits.slice(1)}`;
    }
    return digits;
}

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

/**
 * Grande modale centrée responsive de consultation détaillée d'un devis admin.
 * Remplace la sidebar latérale par un espace dynamique avec marges X/Y égales et équilibrées.
 */
export function QuoteDetailsModal({
    quote,
    open,
    onOpenChange,
    onUpdate,
}: QuoteDetailsModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [pendingStatus, setPendingStatus] = useState<Quote["status"] | null>(
        null
    );
    const [isUpdating, setIsUpdating] = useState(false);

    if (!quote) return null;

    const quoteRef = formatQuoteReference({
        trackingCode: quote.trackingCode,
        id: quote.id,
    });
    const supplementaryItems = formatSupplementaryInfo(quote.supplementaryInfo);
    const breakdown = quote.supplementaryInfo?.pricingBreakdown;
    const attachments = quote.supplementaryInfo?.attachments ?? [];

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        quote.pickup
    )}&destination=${encodeURIComponent(quote.dropoff)}`;

    const hasHazardous = Boolean(quote.supplementaryInfo?.hazardous);
    const hasCrane = Boolean(quote.supplementaryInfo?.requiresCrane);
    const isUrgent =
        quote.supplementaryInfo?.urgency === "urgent" ||
        quote.supplementaryInfo?.urgency === "very_urgent";
    const hasOperationalAlerts = hasHazardous || hasCrane || isUrgent;

    const isPriced =
        Boolean(quote.amount) &&
        quote.amount.trim() !== "" &&
        quote.amount.toLowerCase() !== "en attente" &&
        quote.amount.toLowerCase() !== "à calculer";

    const copyToClipboard = async (
        text: string,
        label: string,
        fieldId: string
    ) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldId);
            toast.success(`${label} copié dans le presse-papier`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err: unknown) {
            logger.error("Erreur copie presse-papier", err);
            toast.error("Impossible de copier dans le presse-papier");
        }
    };

    const handleWhatsAppClick = async () => {
        const cleanDigits = cleanPhoneForWhatsApp(quote.phone);
        const message = encodeURIComponent(
            `Bonjour ${quote.client}, nous faisons suite à votre dossier ${quoteRef} pour le transport de ${quote.pickup} vers ${quote.dropoff}. Pouvons-nous faire un point ?`
        );
        window.open(
            `https://wa.me/${cleanDigits}?text=${message}`,
            "_blank",
            "noopener,noreferrer"
        );
        toast.success("Discussion WhatsApp ouverte");
        try {
            await logWhatsAppContactAction(
                quote.id,
                `Échange initié depuis la modale de consultation (${quoteRef})`
            );
        } catch (err: unknown) {
            logger.error("Erreur log WhatsApp", err);
        }
    };

    const executeStatusUpdate = async () => {
        if (!pendingStatus || isUpdating) return;
        setIsUpdating(true);
        try {
            const result = await updateQuoteStatusAction(
                quote.id,
                pendingStatus
            );
            if (result.success) {
                toast.success(
                    `Dossier ${quoteRef} passé en statut "${pendingStatus}".`
                );
                setPendingStatus(null);
                onUpdate();
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour");
            }
        } catch (error: unknown) {
            logger.error("Error updating status", error);
            toast.error("Erreur lors de la mise à jour du statut");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="flex max-h-[calc(100dvh-2.5rem)] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-h-[calc(100dvh-4rem)] sm:w-[calc(100vw-4rem)] sm:max-w-[calc(100vw-4rem)] lg:max-w-[min(88vw,1060px)]">
                    {/* 1. En-tête Fixe */}
                    <DialogHeader className="bg-background/95 shrink-0 border-b px-5 py-4 pr-12 text-left backdrop-blur sm:px-6 sm:py-5">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
                                        <span className="from-primary to-primary-accent flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br text-white">
                                            <Truck className="h-4 w-4" />
                                        </span>
                                        Dossier {quoteRef}
                                    </DialogTitle>
                                    <QuoteStatusBadge status={quote.status} />
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
                                </div>
                                <DialogDescription className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                                    <span>
                                        Créé le {safeFormatDate(quote.date, true)}
                                    </span>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyToClipboard(
                                                quoteRef,
                                                "Code de suivi",
                                                "quoteRef"
                                            )
                                        }
                                        className="hover:text-foreground inline-flex items-center gap-1 font-mono font-semibold transition-colors"
                                    >
                                        {copiedField === "quoteRef" ? (
                                            <Check className="h-3 w-3 text-emerald-500" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                        Copier la référence
                                    </button>
                                </DialogDescription>
                            </div>

                            <Button
                                size="sm"
                                className="from-primary to-primary-accent w-full gap-2 bg-linear-to-r font-semibold text-white shadow-sm sm:w-auto"
                                asChild
                            >
                                <Link
                                    href={`/admin/quotes/${encodeURIComponent(quote.id)}`}
                                    onClick={() => onOpenChange(false)}
                                >
                                    Ouvrir l&apos;espace de travail
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* 2. Corps Responsive 2 Colonnes avec Scroll Interne */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Colonne Gauche (7 cols) : Finance, Alertes, Itinéraire, Spécifications */}
                            <div className="space-y-5 lg:col-span-7">
                                {/* Bloc Financier */}
                                {isPriced ? (
                                    <div className="border-primary/25 from-primary/8 via-card to-card rounded-xl border bg-linear-to-br p-4 shadow-2xs">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-primary flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                                                <Coins className="h-4 w-4" />
                                                Montant chiffré
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                                            >
                                                Tarif fixé
                                            </Badge>
                                        </div>
                                        <p className="text-foreground mt-2 font-mono text-2xl font-extrabold tracking-tight sm:text-3xl">
                                            {quote.amount}
                                        </p>
                                        {breakdown && (
                                            <p className="text-muted-foreground mt-1.5 text-xs">
                                                Chiffrage structuré :{" "}
                                                {breakdown.lines.length} poste(s)
                                                {breakdown.vehicleName
                                                    ? ` • Véhicule : ${breakdown.vehicleName}`
                                                    : ""}
                                                {breakdown.includeVat
                                                    ? " • TVA 18% incluse"
                                                    : " • HT"}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 sm:flex-row sm:items-center">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-full bg-amber-500/15 p-2 text-amber-600 dark:text-amber-400">
                                                <Info className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">
                                                    Chiffrage en attente
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    Utilisez l&apos;atelier de
                                                    chiffrage assisté par IA
                                                    pour établir le tarif FCFA.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="shrink-0 gap-1.5 border-amber-500/40 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300"
                                            asChild
                                        >
                                            <Link
                                                href={`/admin/quotes/${encodeURIComponent(quote.id)}?tab=pricing`}
                                                onClick={() =>
                                                    onOpenChange(false)
                                                }
                                            >
                                                Chiffrer avec IA
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Motif d'annulation si annulé */}
                                {quote.status === "Annulé" && (
                                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/8 p-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase dark:text-rose-400">
                                            <Ban className="h-4 w-4" />
                                            Dossier annulé par le client
                                        </div>
                                        <p className="text-foreground mt-1.5 text-sm font-medium">
                                            {quote.cancellationReason ||
                                                "Aucun motif précisé"}
                                        </p>
                                        {quote.cancelledAt && (
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                Annulé le{" "}
                                                {safeFormatDate(
                                                    quote.cancelledAt
                                                )}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Alertes opérationnelles */}
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
                                                Grue requise
                                            </Badge>
                                        )}
                                        {isUrgent && (
                                            <Badge
                                                variant="destructive"
                                                className="gap-1.5 bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white"
                                            >
                                                <Flame className="h-3.5 w-3.5" />
                                                {quote.supplementaryInfo
                                                    ?.urgency === "very_urgent"
                                                    ? "Urgence critique"
                                                    : "Enlèvement prioritaire"}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Itinéraire & Dates */}
                                <div className="bg-card space-y-3 rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <MapPin className="text-primary h-3.5 w-3.5" />
                                            Axe de transport
                                        </span>
                                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            {safeFormatDate(
                                                quote.transportDate,
                                                true
                                            )}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="bg-muted/25 rounded-lg border p-3">
                                            <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                                Enlèvement
                                            </span>
                                            <p className="text-foreground mt-0.5 text-sm font-semibold">
                                                {quote.pickup}
                                            </p>
                                        </div>
                                        <div className="bg-muted/25 rounded-lg border p-3">
                                            <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                                                Livraison
                                            </span>
                                            <p className="text-foreground mt-0.5 text-sm font-semibold">
                                                {quote.dropoff}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full gap-2 text-xs"
                                        asChild
                                    >
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MapPin className="text-primary h-3.5 w-3.5" />
                                            Visualiser l&apos;itinéraire sur
                                            Google Maps
                                            <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
                                        </a>
                                    </Button>
                                </div>

                                {/* Spécifications Logistiques */}
                                <div className="bg-card space-y-2.5 rounded-xl border p-4">
                                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                        <Truck className="text-primary h-3.5 w-3.5" />
                                        Spécifications du fret
                                    </span>
                                    <div className="divide-border/60 divide-y text-xs sm:text-sm">
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-muted-foreground">
                                                Fret principal
                                            </span>
                                            <span className="font-semibold">
                                                {quote.type}
                                            </span>
                                        </div>
                                        {quote.vehicle && (
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-muted-foreground">
                                                    Véhicule demandé
                                                </span>
                                                <span className="font-semibold">
                                                    {quote.vehicleQuantity &&
                                                    quote.vehicleQuantity > 1
                                                        ? `${quote.vehicleQuantity}× `
                                                        : ""}
                                                    {quote.vehicle.name}
                                                </span>
                                            </div>
                                        )}
                                        {supplementaryItems.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between py-2"
                                            >
                                                <span className="text-muted-foreground">
                                                    {item.label}
                                                </span>
                                                <span className="font-semibold">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pièces jointes éventuelles */}
                                {attachments.length > 0 && (
                                    <div className="bg-card space-y-2 rounded-xl border p-4">
                                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <Paperclip className="text-primary h-3.5 w-3.5" />
                                            Pièces jointes ({attachments.length})
                                        </span>
                                        <div className="flex flex-col gap-2">
                                            {attachments.map((file, i) => {
                                                const label =
                                                    file.split("/").pop() ||
                                                    file;
                                                const viewUrl =
                                                    resolveAttachmentProxyUrl(
                                                        file,
                                                        false
                                                    ) ||
                                                    (file.startsWith(
                                                        "https://"
                                                    ) ||
                                                    file.startsWith(
                                                        "http://"
                                                    ) ||
                                                    file.startsWith("/")
                                                        ? file
                                                        : null);
                                                const downloadUrl =
                                                    resolveAttachmentProxyUrl(
                                                        file,
                                                        true
                                                    ) || viewUrl;
                                                return viewUrl ? (
                                                    <div
                                                        key={i}
                                                        className="bg-muted/30 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs"
                                                    >
                                                        <span className="flex min-w-0 items-center gap-1.5 font-mono font-medium">
                                                            <FileText className="text-primary h-3.5 w-3.5 shrink-0" />
                                                            <span className="truncate">
                                                                {label}
                                                            </span>
                                                        </span>
                                                        <div className="flex shrink-0 items-center gap-1.5">
                                                            <a
                                                                href={viewUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-background hover:bg-secondary inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors"
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                                Ouvrir
                                                            </a>
                                                            {downloadUrl && (
                                                                <a
                                                                    href={
                                                                        downloadUrl
                                                                    }
                                                                    download={
                                                                        label
                                                                    }
                                                                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
                                                                >
                                                                    <Download className="h-3 w-3" />
                                                                    Télécharger
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Badge
                                                        key={i}
                                                        variant="secondary"
                                                        className="w-fit gap-1.5 px-2.5 py-1 font-mono text-xs"
                                                    >
                                                        <FileText className="h-3 w-3" />
                                                        {label}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Colonne Droite (5 cols) : Client, Contact 1-clic, Notes, Audit */}
                            <div className="space-y-5 lg:col-span-5">
                                {/* Fiche Client & Contact */}
                                <div className="bg-card space-y-3 rounded-xl border p-4">
                                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                        <User className="text-primary h-3.5 w-3.5" />
                                        Donneur d&apos;ordre
                                    </span>
                                    <p className="text-foreground text-lg font-bold">
                                        {quote.client}
                                    </p>

                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleWhatsAppClick}
                                            className="w-full justify-start gap-2 border-emerald-500/35 bg-emerald-500/8 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            Contacter sur WhatsApp
                                        </Button>

                                        <div className="bg-muted/25 flex items-center justify-between rounded-lg border px-3 py-2 text-xs">
                                            <a
                                                href={`tel:${quote.phone}`}
                                                className="flex items-center gap-2 truncate font-medium hover:underline"
                                            >
                                                <Phone className="text-primary h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {quote.phone}
                                                </span>
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        quote.phone,
                                                        "Téléphone",
                                                        "phone"
                                                    )
                                                }
                                            >
                                                {copiedField === "phone" ? (
                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>

                                        <div className="bg-muted/25 flex items-center justify-between rounded-lg border px-3 py-2 text-xs">
                                            <a
                                                href={`mailto:${quote.email}`}
                                                className="flex items-center gap-2 truncate font-medium hover:underline"
                                            >
                                                <Mail className="text-primary h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {quote.email}
                                                </span>
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        quote.email,
                                                        "Email",
                                                        "email"
                                                    )
                                                }
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

                                {/* Instructions Client */}
                                {quote.userNotes && (
                                    <div className="bg-card space-y-2 rounded-xl border p-4">
                                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <MessageSquare className="text-primary h-3.5 w-3.5" />
                                            Instructions du client
                                        </span>
                                        <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap sm:text-sm">
                                            {quote.userNotes}
                                        </p>
                                    </div>
                                )}

                                {/* Mini-Timeline d'Audit */}
                                {quote.history && quote.history.length > 0 && (
                                    <div className="bg-card space-y-2.5 rounded-xl border p-4">
                                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <Clock className="h-3.5 w-3.5" />
                                            Dernières activités
                                        </span>
                                        <div className="space-y-2.5">
                                            {quote.history
                                                .slice(0, 4)
                                                .map(
                                                    (
                                                        event: QuoteHistoryEvent
                                                    ) => (
                                                        <div
                                                            key={event.id}
                                                            className="flex items-start justify-between gap-2 text-xs"
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                                                                <div>
                                                                    <p className="font-semibold">
                                                                        {
                                                                            event.action
                                                                        }
                                                                    </p>
                                                                    {event.description && (
                                                                        <p className="text-muted-foreground line-clamp-2">
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
                                                    )
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Pied de Page Fixe avec Actions Rapides Sécurisées */}
                    <DialogFooter className="bg-background/95 shrink-0 flex-col gap-2 border-t px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <span>Statut actuel :</span>
                            <QuoteStatusBadge status={quote.status} />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            {quote.status === "Annulé" ? (
                                <span className="text-muted-foreground text-xs italic">
                                    Dossier annulé par le client (verrouillé)
                                </span>
                            ) : quote.status === "En attente" ? (
                                <>
                                    <Button
                                        variant="outline"
                                        disabled={isUpdating}
                                        className="border-destructive/35 text-destructive hover:bg-destructive/10"
                                        onClick={() =>
                                            setPendingStatus("Refusé")
                                        }
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Refuser
                                    </Button>
                                    <Button
                                        disabled={isUpdating}
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                        onClick={() =>
                                            setPendingStatus("Validé")
                                        }
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                        )}
                                        Valider le dossier
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={isUpdating}
                                    onClick={() =>
                                        setPendingStatus("En attente")
                                    }
                                >
                                    Remettre en attente
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={pendingStatus !== null}
                onOpenChange={(isOpen) => !isOpen && setPendingStatus(null)}
                title={`Passer le dossier ${quoteRef} en "${pendingStatus}" ?`}
                description="Le statut du devis sera immédiatement mis à jour en base de données et consigné dans le journal d'audit."
                confirmLabel="Confirmer"
                cancelLabel="Annuler"
                variant={pendingStatus === "Refusé" ? "destructive" : "default"}
                isLoading={isUpdating}
                onConfirm={executeStatusUpdate}
            />
        </>
    );
}
