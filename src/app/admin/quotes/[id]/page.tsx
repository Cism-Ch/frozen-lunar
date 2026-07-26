"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Quote, quoteStorage } from "@/lib/quote-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    CalendarIcon,
    Truck,
    MapPin,
    User,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    Clock,
    Save,
    Euro,
    FileText,
    Download,
    Sparkles,
} from "lucide-react";
import { safeFormatDate } from "@/lib/date-utils";
import { toast } from "sonner";
import Link from "next/link";
import { QuoteTimeline } from "./components/QuoteTimeline";
import { generateQuotePDF } from "@/lib/pdf-generator";
import { geminiService, EstimationResult } from "@/lib/gemini";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    getQuoteByIdAction,
    updateQuoteAction,
    updateQuoteStatusAction,
    addQuoteNoteAction,
} from "@/app/actions/quote-management";

export default function QuoteModerationPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    // Editable states
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");

    const [aiEstimation, setAiEstimation] = useState<EstimationResult | null>(
        null
    );
    const [estimating, setEstimating] = useState(false);

    // Email Drawer State
    const [emailOpen, setEmailOpen] = useState(false);
    const [emailDraft, setEmailDraft] = useState({ subject: "", body: "" });
    const [generatingEmail, setGeneratingEmail] = useState(false);

    const handleEstimate = async () => {
        if (!quote) return;
        setEstimating(true);
        try {
            const result = await geminiService.estimateTransport(
                quote.pickup,
                quote.dropoff,
                quote.type
            );
            setAiEstimation(result);
            toast.success("Estimation générée par IA");
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(
                    "Error during AI estimation:",
                    error.message,
                    error.stack
                );
            } else {
                console.error("Error during AI estimation:", error);
            }
            toast.error("Erreur lors de l&apos;estimation");
        } finally {
            setEstimating(false);
        }
    };

    const handleGenerateEmail = async (
        type: "validation" | "refusal" | "question"
    ) => {
        if (!quote) return;
        setGeneratingEmail(true);
        setEmailOpen(true);
        setEmailDraft({ subject: "Génération en cours...", body: "" });

        try {
            const draft = await geminiService.draftEmail(
                type,
                quote.client,
                quote.id
            );
            setEmailDraft(draft);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(
                    "Error generating AI email:",
                    error.message,
                    error.stack
                );
            } else {
                console.error("Error generating AI email:", error);
            }
            toast.error("Erreur de génération d&apos;email");
            setEmailOpen(false);
        } finally {
            setGeneratingEmail(false);
        }
    };

    const applyEstimation = async () => {
        if (aiEstimation && quote) {
            const priceValue =
                aiEstimation.price.replace(/[^0-9,]/g, "") + "€ HT"; // Basic parsing
            setAmount(priceValue);

            try {
                await addQuoteNoteAction(
                    quote.id,
                    `Estimation IA appliquée: ${aiEstimation.price}`
                );
                toast.success("Prix appliqué");

                // Refresh quote to see history
                const result = await getQuoteByIdAction(quote.id);
                if (result.success && result.quote) {
                    setQuote(result.quote as Quote);
                }
            } catch (error: unknown) {
                console.error("Error applying estimation:", error);
                toast.error(
                    "Erreur lors de l&apos;application de l&apos;estimation"
                );
            }
        }
    };

    useEffect(() => {
        const loadQuote = async () => {
            if (!id) return;

            try {
                const result = await getQuoteByIdAction(decodeURIComponent(id));
                if (result.success && result.quote) {
                    setQuote(result.quote as Quote);
                    setAmount(result.quote.amount || "");
                    setNotes(result.quote.userNotes || "");
                } else {
                    toast.error("Devis introuvable");
                    router.push("/admin/quotes");
                }
            } catch (error: unknown) {
                console.error("Error loading quote:", error);
                toast.error("Erreur lors du chargement du devis");
                router.push("/admin/quotes");
            } finally {
                setLoading(false);
            }
        };
        loadQuote();
    }, [id, router]);

    const handleSaveChanges = async () => {
        if (!quote) return;

        try {
            const result = await updateQuoteAction(quote.id, {
                amount,
                userNotes: notes,
            });

            if (result.success) {
                // Reload quote to get fresh history
                const refreshResult = await getQuoteByIdAction(quote.id);
                if (refreshResult.success && refreshResult.quote) {
                    setQuote(refreshResult.quote as Quote);
                }

                toast.success("Modifications enregistrées");
            } else {
                toast.error(result.error || "Erreur lors de la sauvegarde");
            }
        } catch (error: unknown) {
            console.error("Error saving changes:", error);
            toast.error("Erreur lors de la sauvegarde");
        }
    };

    const handleStatusChange = async (status: Quote["status"]) => {
        if (!quote) return;

        try {
            const result = await updateQuoteStatusAction(quote.id, status);
            if (result.success) {
                // Reload quote to get updated status and history
                const refreshResult = await getQuoteByIdAction(quote.id);
                if (refreshResult.success && refreshResult.quote) {
                    setQuote(refreshResult.quote as Quote);
                }
                toast.success(`Devis ${status.toLowerCase()}`);
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour");
            }
        } catch (error: unknown) {
            console.error("Error updating status:", error);
            toast.error("Erreur lors de la mise à jour du statut");
        }
    };

    // Derived state for changes
    const hasChanges = quote
        ? amount !== (quote.amount || "") || notes !== (quote.notes || "")
        : false;

    if (loading)
        return (
            <div className="text-muted-foreground p-8 text-center">
                Chargement du dossier...
            </div>
        );
    if (!quote) return null;

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                    <Link href="/admin/quotes">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
                                Dossier {quote.id.slice(0, 8)}...
                            </h1>
                            <Badge
                                variant="outline"
                                className={
                                    quote.status === "Validé"
                                        ? "border-green-200/50 bg-green-500/10 text-green-600"
                                        : quote.status === "Refusé"
                                          ? "border-red-200/50 bg-red-500/10 text-red-600"
                                          : "border-orange-200/50 bg-orange-500/10 text-orange-600"
                                }
                            >
                                {quote.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Créé le {safeFormatDate(quote.date, "dd MMMM yyyy")}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            generateQuotePDF(quote);
                            quoteStorage.addNote(
                                quote.id,
                                "PDF généré et téléchargé"
                            );
                            const updated = quoteStorage.getById(quote.id);
                            if (updated) setQuote(updated);
                        }}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            Télécharger
                        </span>{" "}
                        PDF
                    </Button>

                    {hasChanges && (
                        <Button
                            onClick={handleSaveChanges}
                            size="sm"
                            className="bg-primary text-primary-foreground gap-2 shadow-lg"
                        >
                            <Save className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Enregistrer
                            </span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column - Read Only Context */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Itinerary Card */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="text-primary h-5 w-5" />
                                Itinéraire & Transport
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative space-y-8 pl-6">
                                {/* Dotted Line */}
                                <div className="border-muted-foreground/20 absolute top-3 bottom-3 left-6 w-px border-l-2 border-dashed" />

                                {/* Pickup */}
                                <div className="relative pl-8">
                                    <div className="bg-background absolute top-0 left-[-5px] h-4 w-4 rounded-full border-2 border-green-500 shadow-sm" />
                                    <div className="bg-muted/10 rounded-lg border p-4">
                                        <h4 className="mb-1 text-xs font-semibold tracking-wider text-green-600 uppercase">
                                            Départ
                                        </h4>
                                        <p className="text-lg font-medium">
                                            {quote.pickup}
                                        </p>
                                    </div>
                                </div>

                                {/* Dropoff */}
                                <div className="relative pl-8">
                                    <div className="bg-background absolute top-0 left-[-5px] h-4 w-4 rounded-full border-2 border-red-500 shadow-sm" />
                                    <div className="bg-muted/10 rounded-lg border p-4">
                                        <h4 className="mb-1 text-xs font-semibold tracking-wider text-red-600 uppercase">
                                            Arrivée
                                        </h4>
                                        <p className="text-lg font-medium">
                                            {quote.dropoff}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="bg-muted/20 flex items-center gap-3 rounded-lg p-3">
                                    <CalendarIcon className="text-muted-foreground h-5 w-5" />
                                    <div>
                                        <p className="text-muted-foreground text-xs">
                                            Date Prévue
                                        </p>
                                        <p className="font-medium">
                                            {safeFormatDate(
                                                quote.transportDate,
                                                "dd MMM yyyy"
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-muted/20 flex items-center gap-3 rounded-lg p-3">
                                    <Truck className="text-muted-foreground h-5 w-5" />
                                    <div>
                                        <p className="text-muted-foreground text-xs">
                                            Type de Véhicule
                                        </p>
                                        <p className="font-medium capitalize">
                                            {quote.type}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client Card */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="text-primary h-5 w-5" />
                                Informations Client
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="tex-sm text-muted-foreground mb-1 font-medium">
                                        Contact Principal
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {quote.client}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <a
                                        href={`mailto:${quote.email}`}
                                        className="hover:bg-muted group flex items-center gap-3 rounded-md p-2 transition-colors"
                                    >
                                        <div className="bg-primary/5 group-hover:bg-primary/10 rounded-full p-2">
                                            <Mail className="text-primary h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {quote.email}
                                        </span>
                                    </a>
                                    <a
                                        href={`tel:${quote.phone}`}
                                        className="hover:bg-muted group flex items-center gap-3 rounded-md p-2 transition-colors"
                                    >
                                        <div className="bg-primary/5 group-hover:bg-primary/10 rounded-full p-2">
                                            <Phone className="text-primary h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {quote.phone}
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Workspace */}
                <div className="text-foreground space-y-6">
                    {/* Tarification */}
                    <Card className="border-l-primary/50 overflow-hidden border-l-4">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Euro className="h-24 w-24" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Euro className="h-5 w-5" />
                                Tarification
                            </CardTitle>
                            <CardDescription>
                                Définissez le prix final ou une estimation pour
                                le client.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Montant (Devise incluse ex: 150€)
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(e.target.value)
                                        }
                                        className="font-mono text-lg"
                                        placeholder="Ex: 450€ HT"
                                    />
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={handleEstimate}
                                        disabled={estimating}
                                        title="Estimer avec IA"
                                    >
                                        <Sparkles
                                            className={`h-4 w-4 text-purple-600 ${estimating ? "animate-pulse" : ""}`}
                                        />
                                    </Button>
                                </div>
                                {aiEstimation && (
                                    <div className="animate-in fade-in slide-in-from-top-2 mt-4 space-y-2 rounded-lg border border-purple-200/20 bg-purple-500/5 p-3 text-sm">
                                        <div className="flex flex-col gap-1 font-medium text-purple-700 sm:flex-row sm:justify-between">
                                            <span>
                                                Estimation: {aiEstimation.price}
                                            </span>
                                            <span>
                                                {aiEstimation.distance} /{" "}
                                                {aiEstimation.duration}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-xs">
                                            {aiEstimation.reasoning}
                                        </p>
                                        <Button
                                            variant="link"
                                            className="h-auto p-0 text-xs text-purple-600"
                                            onClick={applyEstimation}
                                        >
                                            Appliquer ce prix
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Internes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Notes Internes
                            </CardTitle>
                            <CardDescription>
                                Visible uniquement par l&apos;équipe admin et
                                les chauffeurs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="focus-visible:ring-primary/20 min-h-[150px] resize-none"
                                placeholder="Instructions spéciales, codes d'accès, spécificités du chargement..."
                            />
                        </CardContent>
                    </Card>

                    {/* Actions Rapides */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground text-sm tracking-wider uppercase">
                                Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full justify-start border-green-200/20 bg-green-500/10 text-green-600 hover:border-green-300/30 hover:bg-green-500/20"
                                variant="outline"
                                onClick={() => handleStatusChange("Validé")}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Valider le devis
                            </Button>

                            <Button
                                className="w-full justify-start border-red-200/20 bg-red-500/10 text-red-600 hover:border-red-300/30 hover:bg-red-500/20"
                                variant="outline"
                                onClick={() => handleStatusChange("Refusé")}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Refuser le transport
                            </Button>

                            <Separator className="my-2" />

                            <Button
                                className="w-full justify-start border-orange-200/20 bg-orange-500/10 text-orange-600 hover:border-orange-300/30 hover:bg-orange-500/20"
                                variant="outline"
                                onClick={() => handleStatusChange("En attente")}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Remettre en attente
                            </Button>

                            <Separator className="my-2" />

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="justify-start sm:justify-center"
                                    onClick={() =>
                                        handleGenerateEmail("validation")
                                    }
                                >
                                    <Sparkles className="mr-2 h-3 w-3 text-purple-500" />{" "}
                                    Email Validation
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="justify-start sm:justify-center"
                                    onClick={() =>
                                        handleGenerateEmail("refusal")
                                    }
                                >
                                    <Sparkles className="mr-2 h-3 w-3 text-purple-500" />{" "}
                                    Email Refus
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Historique */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm tracking-wider uppercase">
                                <Clock className="h-4 w-4" />
                                Historique
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <QuoteTimeline quote={quote} />
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* AI Email Dialog */}
            <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Assistant de Rédaction IA</DialogTitle>
                        <DialogDescription>
                            Modifiez le brouillon généré avant de l&apos;envoyer
                            (Simulation).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setEmailOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={() => {
                                toast.success("Email envoyé (Simulation)");
                                setEmailOpen(false);
                                // Log communication in history
                                if (quote)
                                    quoteStorage.addNote(
                                        quote.id,
                                        `Email envoyé: ${emailDraft.subject}`
                                    );
                            }}
                        >
                            Envoyer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
