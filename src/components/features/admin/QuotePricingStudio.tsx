"use client";

import { useMemo, useRef, useState } from "react";
import {
    Bot,
    Calculator,
    CheckCircle2,
    Loader2,
    Plus,
    ShieldAlert,
    Sparkles,
    Trash2,
    Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    assistQuotePricingAction,
    saveStructuredPricingAction,
} from "@/app/actions/quote-pricing-actions";
import type {
    QuotePricingBreakdown,
    QuotePricingLine,
} from "@/lib/quote-storage";

interface QuotePricingStudioProps {
    quoteId: string;
    quoteRef: string;
    initialBreakdown?: QuotePricingBreakdown;
    selectedVehicle?: {
        name: string;
        dailyRateFcfa?: number | null;
        quantity: number;
    };
    onPricingSaved: (newAmount: string) => void;
}

function buildInitialLines(
    initialBreakdown?: QuotePricingBreakdown,
    selectedVehicle?: QuotePricingStudioProps["selectedVehicle"]
): QuotePricingLine[] {
    if (initialBreakdown?.lines?.length) {
        return initialBreakdown.lines;
    }
    if (selectedVehicle?.dailyRateFcfa && selectedVehicle.dailyRateFcfa > 0) {
        const qty = Math.max(1, selectedVehicle.quantity || 1);
        return [
            {
                id: "init-vehicle",
                label: `Mobilisation véhicule (${qty > 1 ? `${qty}× ` : ""}${selectedVehicle.name})`,
                category: "base",
                amountFcfa: selectedVehicle.dailyRateFcfa * qty,
            },
        ];
    }
    return [];
}

/**
 * Atelier de chiffrage interactif assisté par l'Agent IA.
 */
export function QuotePricingStudio({
    quoteId,
    quoteRef,
    initialBreakdown,
    selectedVehicle,
    onPricingSaved,
}: QuotePricingStudioProps) {
    const lineCounterRef = useRef(1);
    const [customInstructions, setCustomInstructions] = useState("");
    const [lines, setLines] = useState<QuotePricingLine[]>(() =>
        buildInitialLines(initialBreakdown, selectedVehicle)
    );
    const [vehicleName, setVehicleName] = useState(
        initialBreakdown?.vehicleName ||
            (selectedVehicle
                ? `${selectedVehicle.quantity > 1 ? `${selectedVehicle.quantity}× ` : ""}${selectedVehicle.name}`
                : "")
    );
    const [estimatedDistanceKm, setEstimatedDistanceKm] = useState<
        number | undefined
    >(initialBreakdown?.estimatedDistanceKm);
    const [estimatedDuration, setEstimatedDuration] = useState<
        string | undefined
    >(initialBreakdown?.estimatedDuration);
    const [includeVat, setIncludeVat] = useState(
        initialBreakdown?.includeVat ?? false
    );
    const [aiReasoning, setAiReasoning] = useState(
        initialBreakdown?.aiReasoning || ""
    );
    const [aiSource, setAiSource] = useState(initialBreakdown?.aiSource || "");

    const [isAssisting, setIsAssisting] = useState(false);
    const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const totals = useMemo(() => {
        const subtotalHt = lines.reduce(
            (sum, line) => sum + (Number.isFinite(line.amountFcfa) ? line.amountFcfa : 0),
            0
        );
        const vatAmount = includeVat
            ? Math.round((subtotalHt * 0.18) / 1000) * 1000
            : 0;
        const finalTotal = subtotalHt + vatAmount;
        return { subtotalHt, vatAmount, finalTotal };
    }, [lines, includeVat]);

    const handleAssistWithAi = async () => {
        setIsAssisting(true);
        try {
            const res = await assistQuotePricingAction({
                quoteId,
                customInstructions: customInstructions.trim() || undefined,
            });
            if (res.error || !res.data) {
                toast.error(
                    res.error || "L'agent IA n'a pas pu calculer le chiffrage."
                );
                return;
            }
            setLines(res.data.lines);
            setVehicleName(res.data.vehicleName || "");
            setEstimatedDistanceKm(res.data.estimatedDistanceKm);
            setEstimatedDuration(res.data.estimatedDuration);
            setAiReasoning(res.data.aiReasoning || "");
            setAiSource(res.data.aiSource || "");
            toast.success(
                `Chiffrage IA généré (${res.data.lines.length} postes FCFA).`
            );
        } finally {
            setIsAssisting(false);
        }
    };

    const handleAddLine = () => {
        lineCounterRef.current += 1;
        setLines((prev) => [
            ...prev,
            {
                id: `custom-${lineCounterRef.current}`,
                label: "Prestation complémentaire",
                category: "other",
                amountFcfa: 50000,
            },
        ]);
    };

    const handleUpdateLine = (
        id: string,
        patch: Partial<Pick<QuotePricingLine, "label" | "amountFcfa">>
    ) => {
        setLines((prev) =>
            prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
        );
    };

    const handleRemoveLine = (id: string) => {
        if (lines.length <= 1) {
            toast.error("Conservez au moins une ligne de coût.");
            return;
        }
        setLines((prev) => prev.filter((l) => l.id !== id));
    };

    const executeSavePricing = async () => {
        setIsSaving(true);
        try {
            const res = await saveStructuredPricingAction({
                quoteId,
                vehicleName: vehicleName || undefined,
                estimatedDistanceKm,
                estimatedDuration,
                lines,
                includeVat,
                aiReasoning: aiReasoning || undefined,
                aiSource: aiSource || undefined,
            });
            if (res.error || !res.data) {
                toast.error(
                    res.error || "Erreur lors de l'enregistrement du chiffrage."
                );
                return;
            }
            toast.success(`Chiffrage appliqué : ${res.data.amount}`);
            setConfirmSaveOpen(false);
            onPricingSaved(res.data.amount);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Card className="border-primary/25 overflow-hidden shadow-xs">
                <CardHeader className="from-secondary/5 via-background to-primary/5 border-b bg-linear-to-r">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calculator className="text-primary h-5 w-5" />
                                Atelier de Chiffrage Assisté par IA
                            </CardTitle>
                            <CardDescription>
                                Générez une ventilation de coûts FCFA adaptée à
                                la Côte d&apos;Ivoire, ajustez vos postes puis
                                appliquez le tarif au dossier {quoteRef}.
                            </CardDescription>
                        </div>
                        {aiSource && (
                            <Badge
                                variant="outline"
                                className="w-fit gap-1.5 font-mono text-xs"
                            >
                                {aiSource === "gemini" ||
                                aiSource === "openrouter" ? (
                                    <Sparkles className="text-primary h-3.5 w-3.5" />
                                ) : (
                                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                                )}
                                {aiSource === "gemini"
                                    ? "Gemini 2.5 Flash"
                                    : aiSource === "openrouter"
                                      ? "OpenRouter IA"
                                      : "Moteur Heuristique CI"}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Barre de commande Agent IA */}
                    <div className="bg-muted/30 space-y-3 rounded-xl border p-4">
                        <Label
                            htmlFor="ai-pricing-instructions"
                            className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
                        >
                            <Bot className="text-primary h-4 w-4" />
                            Consigne optionnelle pour l&apos;agent de chiffrage
                        </Label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                                id="ai-pricing-instructions"
                                value={customInstructions}
                                onChange={(e) =>
                                    setCustomInstructions(e.target.value)
                                }
                                placeholder="Ex: Ajouter escorte convoi exceptionnel, grue au déchargement, 2h d'attente au port..."
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                onClick={handleAssistWithAi}
                                disabled={isAssisting}
                                className="from-primary to-primary-accent shrink-0 gap-2 bg-linear-to-r font-semibold text-white"
                            >
                                {isAssisting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                                Analyser &amp; Chiffrer (IA)
                            </Button>
                        </div>

                        {(vehicleName || aiReasoning) && (
                            <div className="bg-background/80 space-y-2 rounded-lg border p-3 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                    {vehicleName && (
                                        <Badge
                                            variant="secondary"
                                            className="gap-1.5 font-semibold"
                                        >
                                            <Truck className="text-primary h-3.5 w-3.5" />
                                            {vehicleName}
                                        </Badge>
                                    )}
                                    {estimatedDistanceKm !== undefined && (
                                        <Badge variant="outline">
                                            ~{estimatedDistanceKm} km
                                        </Badge>
                                    )}
                                    {estimatedDuration && (
                                        <Badge variant="outline">
                                            Durée estimée : {estimatedDuration}
                                        </Badge>
                                    )}
                                </div>
                                {aiReasoning && (
                                    <p className="text-muted-foreground leading-relaxed">
                                        {aiReasoning}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tableau Éditable des Postes FCFA */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold">
                                Ventilation des postes (FCFA)
                            </h4>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                onClick={handleAddLine}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Ajouter un poste
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {lines.length === 0 ? (
                                <div className="bg-muted/20 text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
                                    Aucun poste chiffré pour le moment. Cliquez sur{" "}
                                    <span className="text-foreground font-semibold">
                                        Analyser &amp; Chiffrer (IA)
                                    </span>{" "}
                                    ou ajoutez manuellement une ligne de coût.
                                </div>
                            ) : (
                                lines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="bg-card grid grid-cols-1 items-center gap-2 rounded-xl border p-3 sm:grid-cols-12"
                                    >
                                        <div className="sm:col-span-7">
                                            <Input
                                                value={line.label}
                                                onChange={(e) =>
                                                    handleUpdateLine(line.id, {
                                                        label: e.target.value,
                                                    })
                                                }
                                                placeholder="Description du poste"
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 sm:col-span-4">
                                            <Input
                                                type="number"
                                                min={0}
                                                step={5000}
                                                value={line.amountFcfa}
                                                onChange={(e) =>
                                                    handleUpdateLine(line.id, {
                                                        amountFcfa: Math.max(
                                                            0,
                                                            Number(
                                                                e.target.value
                                                            ) || 0
                                                        ),
                                                    })
                                                }
                                                className="h-9 text-right font-mono text-sm font-semibold"
                                            />
                                            <span className="text-muted-foreground shrink-0 text-xs font-semibold">
                                                FCFA
                                            </span>
                                        </div>
                                        <div className="flex justify-end sm:col-span-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive h-8 w-8"
                                                onClick={() =>
                                                    handleRemoveLine(line.id)
                                                }
                                                aria-label="Supprimer cette ligne"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Récapitulatif Financier & TVA 18% CI */}
                    <div className="bg-secondary/5 dark:bg-secondary-steel/10 space-y-3 rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label
                                    htmlFor="toggle-vat-ci"
                                    className="cursor-pointer text-sm font-semibold"
                                >
                                    Appliquer la TVA Côte d&apos;Ivoire (18%)
                                </Label>
                                <p className="text-muted-foreground text-xs">
                                    Désactivé = cotation en FCFA HT • Activé =
                                    cotation en FCFA TTC
                                </p>
                            </div>
                            <Switch
                                id="toggle-vat-ci"
                                checked={includeVat}
                                onCheckedChange={setIncludeVat}
                            />
                        </div>

                        <div className="border-border/70 space-y-1.5 border-t pt-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Sous-total HT
                                </span>
                                <span className="font-mono font-semibold">
                                    {totals.subtotalHt.toLocaleString("fr-FR")}{" "}
                                    FCFA
                                </span>
                            </div>
                            {includeVat && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        TVA (18%)
                                    </span>
                                    <span className="font-mono font-semibold">
                                        {totals.vatAmount.toLocaleString(
                                            "fr-FR"
                                        )}{" "}
                                        FCFA
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 text-base font-extrabold">
                                <span>
                                    Total {includeVat ? "TTC" : "HT"} à
                                    appliquer
                                </span>
                                <span className="text-primary font-mono text-xl">
                                    {totals.finalTotal.toLocaleString("fr-FR")}{" "}
                                    FCFA {includeVat ? "TTC" : "HT"}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="button"
                                onClick={() => setConfirmSaveOpen(true)}
                                disabled={isSaving || totals.finalTotal <= 0}
                                className="w-full gap-2 bg-emerald-600 font-semibold text-white hover:bg-emerald-700 sm:w-auto"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Appliquer ce chiffrage au dossier
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmSaveOpen}
                onOpenChange={setConfirmSaveOpen}
                title={`Appliquer ${totals.finalTotal.toLocaleString("fr-FR")} FCFA ${includeVat ? "TTC" : "HT"} ?`}
                description={`Le montant final et les ${lines.length} lignes de détail seront enregistrés sur le dossier ${quoteRef} et tracés dans l'historique d'audit.`}
                confirmLabel="Enregistrer le chiffrage"
                cancelLabel="Annuler"
                isLoading={isSaving}
                onConfirm={executeSavePricing}
            />
        </>
    );
}
