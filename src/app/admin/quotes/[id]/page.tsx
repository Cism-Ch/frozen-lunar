"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Quote } from "@/lib/quote-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { QuoteStatusBadge } from "@/components/features/admin/QuoteStatusBadge";
import { QuotePricingStudio } from "@/components/features/admin/QuotePricingStudio";
import { QuotePartnerDispatch } from "@/components/features/admin/QuotePartnerDispatch";
import { QuoteTimeline } from "./components/QuoteTimeline";
import { OrderChat } from "@/components/features/client/OrderChat";
import {
    AlertTriangle,
    ArrowLeft,
    Ban,
    Banknote,
    Calculator,
    CalendarIcon,
    Check,
    CheckCircle,
    Clock,
    Copy,
    Download,
    ExternalLink,
    FileText,
    Flame,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    MessageSquare,
    Paperclip,
    Phone,
    Save,
    Sparkles,
    Truck,
    User,
    XCircle,
} from "lucide-react";
import { safeFormatDate } from "@/lib/date-utils";
import { toast } from "sonner";
import {
    draftEmailAction,
    sendAdminQuoteEmailAction,
} from "@/app/actions/ai-actions";
import {
    prepareWhatsAppQuoteMessageAction,
    logWhatsAppContactAction,
    getQuotesByPhoneAction,
} from "@/app/actions/whatsapp-actions";
import { GeneratedWhatsAppMessage } from "@/lib/huggingface";
import {
    getQuoteByIdAction,
    updateQuoteAction,
    updateQuoteStatusAction,
    addQuoteNoteAction,
} from "@/app/actions/quote-management";
import { formatQuoteReference } from "@/lib/tracking-code";
import { resolveAttachmentProxyUrl } from "@/lib/attachment-url";
import { logger } from "@/lib/logger";

function cleanPhoneForWhatsApp(phone: string): string {
    let digits = phone.replace(/[^0-9]/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.length === 10 && digits.startsWith("0")) {
        return `225${digits.slice(1)}`;
    }
    return digits;
}

function isSafeAttachmentUrl(raw: string): boolean {
    return (
        raw.startsWith("https://") ||
        raw.startsWith("http://") ||
        raw.startsWith("/")
    );
}

export default function QuoteWorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<string | null>(null);

    const urlTabParam = searchParams.get("tab");
    const validUrlTab =
        urlTabParam === "pricing" ||
        urlTabParam === "chat" ||
        urlTabParam === "audit" ||
        urlTabParam === "overview"
            ? urlTabParam
            : "overview";
    const activeTab = selectedTab ?? validUrlTab;

    // États éditables (corrigé : synchronisés sur quote.amount et quote.userNotes)
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);

    // Confirmations statut
    const [pendingStatus, setPendingStatus] = useState<Quote["status"] | null>(
        null
    );
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Email IA
    const [emailOpen, setEmailOpen] = useState(false);
    const [emailDraft, setEmailDraft] = useState({ subject: "", body: "" });
    const [generatingEmail, setGeneratingEmail] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    // WhatsApp IA
    const [whatsappOpen, setWhatsappOpen] = useState(false);
    const [whatsappCustomNote, setWhatsappCustomNote] = useState("");
    const [whatsappDraft, setWhatsappDraft] =
        useState<GeneratedWhatsAppMessage | null>(null);
    const [generatingWhatsApp, setGeneratingWhatsApp] = useState(false);
    const [relatedQuotesCount, setRelatedQuotesCount] = useState<number | null>(
        null
    );

    const refreshQuote = async (quoteId: string) => {
        const res = await getQuoteByIdAction(quoteId);
        if (res.success && res.quote) {
            const loaded = res.quote as Quote;
            setQuote(loaded);
            setAmount(loaded.amount || "");
            setNotes(loaded.userNotes || "");
        }
    };

    useEffect(() => {
        const loadQuote = async () => {
            if (!id) return;
            try {
                const result = await getQuoteByIdAction(decodeURIComponent(id));
                if (result.success && result.quote) {
                    const loaded = result.quote as Quote;
                    setQuote(loaded);
                    setAmount(loaded.amount || "");
                    setNotes(loaded.userNotes || "");
                } else {
                    toast.error("Devis introuvable");
                    router.push("/admin/quotes");
                }
            } catch (error: unknown) {
                logger.error("Error loading quote", error);
                toast.error("Erreur lors du chargement du devis");
                router.push("/admin/quotes");
            } finally {
                setLoading(false);
            }
        };
        void loadQuote();
    }, [id, router]);

    useEffect(() => {
        if (quote?.phone) {
            getQuotesByPhoneAction({ phone: quote.phone })
                .then((res) => {
                    if (res.data) setRelatedQuotesCount(res.data.length);
                })
                .catch(() => {});
        }
    }, [quote?.phone]);

    const handleSaveChanges = async () => {
        if (!quote) return;
        setSaving(true);
        try {
            const result = await updateQuoteAction(quote.id, {
                amount,
                userNotes: notes,
            });
            if (result.success) {
                await refreshQuote(quote.id);
                toast.success("Modifications enregistrées");
            } else {
                toast.error(result.error || "Erreur lors de la sauvegarde");
            }
        } catch (error: unknown) {
            logger.error("Error saving changes", error);
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    const executeStatusChange = async () => {
        if (!quote || !pendingStatus) return;
        setUpdatingStatus(true);
        try {
            const result = await updateQuoteStatusAction(
                quote.id,
                pendingStatus
            );
            if (result.success) {
                await refreshQuote(quote.id);
                toast.success(`Statut mis à jour : ${pendingStatus}`);
                setPendingStatus(null);
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour");
            }
        } catch (error: unknown) {
            logger.error("Error updating status", error);
            toast.error("Erreur lors de la mise à jour du statut");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!quote) return;
        const { generateQuotePDF } = await import("@/lib/pdf-generator");
        generateQuotePDF(quote);
        toast.success("PDF téléchargé");
        try {
            await addQuoteNoteAction(quote.id, "PDF généré et téléchargé");
            await refreshQuote(quote.id);
        } catch (err: unknown) {
            logger.error("PDF audit log error", err);
        }
    };

    const handleOpenWhatsAppDialog = async (customNote?: string) => {
        if (!quote) return;
        setWhatsappOpen(true);
        setGeneratingWhatsApp(true);
        try {
            const noteToUse =
                typeof customNote === "string"
                    ? customNote
                    : whatsappCustomNote;
            const result = await prepareWhatsAppQuoteMessageAction({
                quoteId: quote.id,
                customNote: noteToUse,
            });
            if (result.data) {
                setWhatsappDraft(result.data);
            } else {
                toast.error(
                    result.error || "Erreur de préparation du message WhatsApp"
                );
            }
        } catch (err: unknown) {
            logger.error("Erreur génération WhatsApp", err);
            toast.error("Erreur inattendue lors de la préparation WhatsApp");
        } finally {
            setGeneratingWhatsApp(false);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!whatsappDraft || !quote) return;
        window.open(whatsappDraft.url, "_blank", "noopener,noreferrer");
        toast.success("Lien WhatsApp ouvert");
        setWhatsappOpen(false);
        await logWhatsAppContactAction(quote.id);
        await refreshQuote(quote.id);
    };

    const handleGenerateEmail = async (
        type: "validation" | "refusal" | "question"
    ) => {
        if (!quote) return;
        const ref = formatQuoteReference({
            trackingCode: quote.trackingCode,
            id: quote.id,
        });
        setGeneratingEmail(true);
        setEmailOpen(true);
        setEmailDraft({ subject: "Génération en cours...", body: "" });
        try {
            const res = await draftEmailAction({
                type,
                clientName: quote.client,
                quoteId: ref,
            });
            if (res.data) {
                setEmailDraft(res.data);
            } else {
                toast.error(res.error || "Erreur de génération d'email");
                setEmailOpen(false);
            }
        } catch (error: unknown) {
            logger.error("Error generating AI email", error);
            toast.error("Erreur de génération d'email");
            setEmailOpen(false);
        } finally {
            setGeneratingEmail(false);
        }
    };

    const handleSendEmail = async () => {
        if (!quote || sendingEmail) return;
        setSendingEmail(true);
        try {
            const res = await sendAdminQuoteEmailAction({
                quoteId: quote.id,
                subject: emailDraft.subject,
                body: emailDraft.body,
            });
            if (res.data) {
                toast.success(`Email envoyé au client (${res.data.provider})`);
                setEmailOpen(false);
                await refreshQuote(quote.id);
            } else {
                toast.error(res.error || "Impossible d'envoyer l'email");
            }
        } catch (error: unknown) {
            logger.error("Error sending quote email", error);
            toast.error("Impossible d'envoyer l'email");
        } finally {
            setSendingEmail(false);
        }
    };

    const hasChanges = quote
        ? amount !== (quote.amount || "") ||
          notes !== (quote.userNotes || "")
        : false;

    if (loading) {
        return (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement de l&apos;espace de travail...
            </div>
        );
    }

    if (!quote) return null;

    const quoteRef = formatQuoteReference({
        trackingCode: quote.trackingCode,
        id: quote.id,
    });
    const attachments = quote.supplementaryInfo?.attachments ?? [];
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        quote.pickup
    )}&destination=${encodeURIComponent(quote.dropoff)}`;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-20 lg:pb-6">
            {/* Barre Supérieure de l'Espace de Travail */}
            <div className="bg-card/95 sticky top-2 z-20 flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-xl"
                        asChild
                    >
                        <Link href="/admin/quotes" aria-label="Retour aux devis">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="font-mono text-lg font-extrabold tracking-tight sm:text-xl">
                                {quoteRef}
                            </h1>
                            <button
                                type="button"
                                onClick={async () => {
                                    await navigator.clipboard.writeText(
                                        quoteRef
                                    );
                                    setCopiedRef(true);
                                    toast.success("Code de suivi copié");
                                    setTimeout(() => setCopiedRef(false), 1800);
                                }}
                                className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                                title="Copier le code de suivi"
                            >
                                {copiedRef ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </button>
                            <QuoteStatusBadge status={quote.status} />
                            <Badge variant="outline" className="font-mono text-xs">
                                {quote.amount || "À calculer"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            {quote.client} • Créé le{" "}
                            {safeFormatDate(quote.date, "dd MMM yyyy 'à' HH:mm")}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={handleDownloadPDF}
                    >
                        <Download className="h-4 w-4" />
                        PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-emerald-500/35 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                        onClick={() => handleOpenWhatsAppDialog()}
                    >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp IA
                    </Button>
                    {hasChanges && (
                        <Button
                            size="sm"
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="gap-1.5"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Enregistrer
                        </Button>
                    )}
                </div>
            </div>

            {/* Onglets Modulaires de l'Espace de Travail */}
            <Tabs
                value={activeTab}
                onValueChange={setSelectedTab}
                className="space-y-6"
            >
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1.5 sm:w-fit">
                    <TabsTrigger value="overview" className="gap-2 px-3.5 py-2">
                        <FileText className="h-4 w-4" />
                        Dossier &amp; Fret
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="gap-2 px-3.5 py-2">
                        <Calculator className="text-primary h-4 w-4" />
                        Chiffrage IA
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="gap-2 px-3.5 py-2">
                        <MessageSquare className="h-4 w-4" />
                        Messagerie Client
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="gap-2 px-3.5 py-2">
                        <Clock className="h-4 w-4" />
                        Journal d&apos;Audit
                    </TabsTrigger>
                </TabsList>

                {/* 1. VUE DOSSIER & FRET */}
                <TabsContent value="overview" className="space-y-6">
                    {quote.status === "Annulé" && (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/8 p-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase dark:text-rose-400">
                                <Ban className="h-4 w-4" />
                                Devis annulé par le client
                            </div>
                            <p className="mt-1 text-sm font-semibold">
                                {quote.cancellationReason ||
                                    "Aucun motif renseigné"}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Gauche 8 cols */}
                        <div className="space-y-6 lg:col-span-8">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <MapPin className="text-primary h-4 w-4" />
                                        Itinéraire &amp; Spécifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="bg-muted/25 rounded-xl border p-3.5">
                                            <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                                                Départ / Enlèvement
                                            </span>
                                            <p className="mt-1 font-semibold">
                                                {quote.pickup}
                                            </p>
                                        </div>
                                        <div className="bg-muted/25 rounded-xl border p-3.5">
                                            <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase">
                                                Arrivée / Livraison
                                            </span>
                                            <p className="mt-1 font-semibold">
                                                {quote.dropoff}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="bg-muted/20 flex items-center gap-3 rounded-xl border p-3">
                                            <CalendarIcon className="text-primary h-4 w-4" />
                                            <div>
                                                <p className="text-muted-foreground text-xs">
                                                    Échéance / Date &amp; heure prévue
                                                </p>
                                                <p className="text-sm font-semibold">
                                                    {safeFormatDate(
                                                        quote.transportDate,
                                                        "dd MMM yyyy 'à' HH:mm"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-muted/20 flex items-center gap-3 rounded-xl border p-3">
                                            <Truck className="text-primary h-4 w-4" />
                                            <div>
                                                <p className="text-muted-foreground text-xs">
                                                    Marchandise / Fret
                                                </p>
                                                <p className="text-sm font-semibold">
                                                    {quote.type}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {quote.vehicle && (
                                        <div className="bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
                                            <div className="flex items-center gap-2.5">
                                                <Truck className="text-primary h-4 w-4 shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs">
                                                        Véhicule sélectionné
                                                    </p>
                                                    <p className="text-sm font-bold">
                                                        {quote.vehicleQuantity &&
                                                        quote.vehicleQuantity > 1
                                                            ? `${quote.vehicleQuantity}× `
                                                            : ""}
                                                        {quote.vehicle.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Badge variant="secondary" className="text-xs">
                                                    {quote.vehicle.capacityLabel}
                                                </Badge>
                                                {quote.vehicle.dailyRateFcfa && (
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {quote.vehicle.dailyRateFcfa.toLocaleString("fr-FR")}{" "}
                                                        FCFA/j
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contraintes */}
                                    {(quote.supplementaryInfo?.hazardous ||
                                        quote.supplementaryInfo?.requiresCrane ||
                                        quote.supplementaryInfo?.urgency ===
                                            "urgent" ||
                                        quote.supplementaryInfo?.urgency ===
                                            "very_urgent") && (
                                        <div className="flex flex-wrap gap-2">
                                            {quote.supplementaryInfo
                                                ?.hazardous && (
                                                <Badge
                                                    variant="destructive"
                                                    className="gap-1.5"
                                                >
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    Matières dangereuses
                                                </Badge>
                                            )}
                                            {quote.supplementaryInfo
                                                ?.requiresCrane && (
                                                <Badge variant="secondary">
                                                    Grue requise
                                                </Badge>
                                            )}
                                            {(quote.supplementaryInfo
                                                ?.urgency === "urgent" ||
                                                quote.supplementaryInfo
                                                    ?.urgency ===
                                                    "very_urgent") && (
                                                <Badge className="gap-1 bg-orange-600 text-white">
                                                    <Flame className="h-3.5 w-3.5" />
                                                    Prioritaire
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2"
                                        asChild
                                    >
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MapPin className="text-primary h-4 w-4" />
                                            Ouvrir l&apos;itinéraire sur Google
                                            Maps
                                            <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-60" />
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Pièces jointes & Notes */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileText className="text-primary h-4 w-4" />
                                        Notes du dossier &amp; Pièces jointes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {attachments.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-1.5 text-xs uppercase">
                                                <Paperclip className="h-3.5 w-3.5" />
                                                Pièces jointes (
                                                {attachments.length})
                                            </Label>
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
                                                        (isSafeAttachmentUrl(
                                                            file
                                                        )
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
                                                                <Paperclip className="text-primary h-3.5 w-3.5 shrink-0" />
                                                                <span className="truncate">
                                                                    {label}
                                                                </span>
                                                            </span>
                                                            <div className="flex shrink-0 items-center gap-1.5">
                                                                <a
                                                                    href={
                                                                        viewUrl
                                                                    }
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
                                                            className="w-fit font-mono text-xs"
                                                        >
                                                            {label}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="quote-notes">
                                            Instructions &amp; notes internes
                                        </Label>
                                        <Textarea
                                            id="quote-notes"
                                            value={notes}
                                            onChange={(e) =>
                                                setNotes(e.target.value)
                                            }
                                            className="min-h-[130px]"
                                            placeholder="Codes d'accès, contraintes chantier, consignes chauffeur..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Droite 4 cols : Client + Décision Statut + Email IA */}
                        <div className="space-y-6 lg:col-span-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="text-primary h-4 w-4" />
                                        Client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <p className="text-base font-bold">
                                        {quote.client}
                                    </p>
                                    <a
                                        href={`mailto:${quote.email}`}
                                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 truncate"
                                    >
                                        <Mail className="text-primary h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {quote.email}
                                        </span>
                                    </a>
                                    <a
                                        href={`tel:${quote.phone}`}
                                        className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                                    >
                                        <Phone className="text-primary h-4 w-4 shrink-0" />
                                        <span>{quote.phone}</span>
                                    </a>
                                    {relatedQuotesCount !== null &&
                                        relatedQuotesCount > 1 && (
                                            <Badge variant="secondary">
                                                {relatedQuotesCount} dossiers
                                                associés à ce numéro
                                            </Badge>
                                        )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm tracking-wider uppercase">
                                        Décision &amp; Communication
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2.5">
                                    {quote.status === "Annulé" ? (
                                        <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-xs">
                                            Ce dossier a été annulé par le client. Les changements de statut sont verrouillés.
                                        </p>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start border-emerald-500/30 bg-emerald-500/8 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                                                onClick={() =>
                                                    setPendingStatus("Validé")
                                                }
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Valider le devis
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start border-rose-500/30 bg-rose-500/8 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400"
                                                onClick={() =>
                                                    setPendingStatus("Refusé")
                                                }
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Refuser le dossier
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() =>
                                                    setPendingStatus("En attente")
                                                }
                                            >
                                                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                                Remettre en attente
                                            </Button>
                                        </>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                handleGenerateEmail(
                                                    "validation"
                                                )
                                            }
                                        >
                                            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
                                            Email Valid.
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                handleGenerateEmail("refusal")
                                            }
                                        >
                                            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
                                            Email Refus
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <QuotePartnerDispatch
                                quoteId={quote.id}
                                quoteRef={quoteRef}
                                pickup={quote.pickup}
                                dropoff={quote.dropoff}
                                transportDate={quote.transportDate}
                                itemType={quote.type}
                                clientAmountLabel={quote.amount || ""}
                                clientSubtotalHt={
                                    quote.supplementaryInfo?.pricingBreakdown
                                        ?.subtotalHt
                                }
                                initialAssignment={
                                    quote.supplementaryInfo?.partnerAssignment
                                }
                                onUpdated={() => {
                                    void refreshQuote(quote.id);
                                }}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* 2. ATELIER DE CHIFFRAGE IA */}
                <TabsContent value="pricing" className="space-y-6">
                    <QuotePricingStudio
                        key={
                            quote.supplementaryInfo?.pricingBreakdown
                                ?.updatedAt || quote.id
                        }
                        quoteId={quote.id}
                        quoteRef={quoteRef}
                        initialBreakdown={
                            quote.supplementaryInfo?.pricingBreakdown
                        }
                        selectedVehicle={
                            quote.vehicle
                                ? {
                                      name: quote.vehicle.name,
                                      dailyRateFcfa: quote.vehicle.dailyRateFcfa,
                                      quantity: quote.vehicleQuantity || 1,
                                  }
                                : undefined
                        }
                        onPricingSaved={(newAmount) => {
                            setAmount(newAmount);
                            void refreshQuote(quote.id);
                        }}
                    />

                    {/* Ajustement libre rapide */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Banknote className="text-primary h-4 w-4" />
                                Ajustement manuel direct du montant affiché
                            </CardTitle>
                            <CardDescription>
                                Permet de surcharger librement le libellé du
                                tarif sans modifier les lignes ci-dessus.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Ex: 1 450 000 FCFA HT"
                                className="font-mono text-base font-semibold"
                            />
                            <Button
                                onClick={handleSaveChanges}
                                disabled={saving || !hasChanges}
                                className="shrink-0 gap-2"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Enregistrer le montant
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. MESSAGERIE HYBRIDE */}
                <TabsContent value="chat">
                    <OrderChat quoteId={quote.id} viewerRole="admin" />
                </TabsContent>

                {/* 4. JOURNAL D'AUDIT */}
                <TabsContent value="audit">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="text-primary h-4 w-4" />
                                Historique complet du dossier {quoteRef}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <QuoteTimeline quote={quote} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Confirmation Statut */}
            <ConfirmDialog
                open={pendingStatus !== null}
                onOpenChange={(open) => !open && setPendingStatus(null)}
                title={`Passer le dossier ${quoteRef} en "${pendingStatus}" ?`}
                description="Cette modification sera immédiatement enregistrée et tracée dans le journal d'audit."
                confirmLabel="Confirmer"
                cancelLabel="Annuler"
                variant={pendingStatus === "Refusé" ? "destructive" : "default"}
                isLoading={updatingStatus}
                onConfirm={executeStatusChange}
            />

            {/* Modale Email IA */}
            <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Assistant de Rédaction Email IA</DialogTitle>
                        <DialogDescription>
                            Ajustez le brouillon avant de le copier ou
                            l&apos;envoyer au client.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-3">
                        <div className="grid gap-2">
                            <Label>Objet</Label>
                            <Input
                                value={emailDraft.subject}
                                onChange={(e) =>
                                    setEmailDraft({
                                        ...emailDraft,
                                        subject: e.target.value,
                                    })
                                }
                                disabled={generatingEmail}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Message</Label>
                            <Textarea
                                value={emailDraft.body}
                                onChange={(e) =>
                                    setEmailDraft({
                                        ...emailDraft,
                                        body: e.target.value,
                                    })
                                }
                                className="h-[200px]"
                                disabled={generatingEmail}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setEmailOpen(false)}
                            disabled={sendingEmail}
                        >
                            Fermer
                        </Button>
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await navigator.clipboard.writeText(
                                    `${emailDraft.subject}\n\n${emailDraft.body}`
                                );
                                toast.success("Brouillon copié dans le presse-papier");
                            }}
                            disabled={generatingEmail || sendingEmail}
                        >
                            Copier le brouillon
                        </Button>
                        <Button
                            onClick={handleSendEmail}
                            disabled={
                                generatingEmail ||
                                sendingEmail ||
                                !emailDraft.subject.trim() ||
                                !emailDraft.body.trim()
                            }
                            className="gap-1.5"
                        >
                            {sendingEmail ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="h-4 w-4" />
                            )}
                            Envoyer au client
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modale WhatsApp IA */}
            <Dialog open={whatsappOpen} onOpenChange={setWhatsappOpen}>
                <DialogContent className="sm:max-w-[580px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-emerald-500" />
                            Message WhatsApp — {quoteRef}
                        </DialogTitle>
                        <DialogDescription>
                            Personnalisez votre message de suivi avant ouverture
                            dans WhatsApp.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="flex gap-2">
                            <Input
                                value={whatsappCustomNote}
                                onChange={(e) =>
                                    setWhatsappCustomNote(e.target.value)
                                }
                                placeholder="Consigne courte pour régénérer..."
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    handleOpenWhatsAppDialog(whatsappCustomNote)
                                }
                                disabled={generatingWhatsApp}
                            >
                                Régénérer
                            </Button>
                        </div>
                        <Textarea
                            rows={6}
                            value={whatsappDraft?.text || ""}
                            disabled={generatingWhatsApp}
                            onChange={(e) => {
                                if (!whatsappDraft) return;
                                const digits = cleanPhoneForWhatsApp(
                                    quote.phone
                                );
                                setWhatsappDraft({
                                    ...whatsappDraft,
                                    text: e.target.value,
                                    url: `https://wa.me/${digits}?text=${encodeURIComponent(e.target.value)}`,
                                });
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setWhatsappOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSendWhatsApp}
                            disabled={generatingWhatsApp || !whatsappDraft}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            Ouvrir WhatsApp
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
