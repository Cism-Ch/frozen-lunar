"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Building2,
    CheckCircle2,
    ExternalLink,
    Handshake,
    Loader2,
    Mail,
    MessageCircle,
    Trash2,
    TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { QuotePartnerAssignment } from "@/lib/quote-storage";
import { safeFormatDate } from "@/lib/date-utils";
import {
    ApprovedPartnerOption,
    assignPartnerToQuoteAction,
    getApprovedPartnersAction,
    sendPartnerMissionEmailAction,
    unassignPartnerFromQuoteAction,
} from "@/app/actions/partner-actions";

interface QuotePartnerDispatchProps {
    quoteId: string;
    quoteRef: string;
    pickup: string;
    dropoff: string;
    transportDate: string;
    itemType: string;
    clientAmountLabel: string;
    clientSubtotalHt?: number;
    initialAssignment?: QuotePartnerAssignment;
    onUpdated: () => void;
}

/**
 * Normalise un numéro de téléphone (notamment Côte d'Ivoire +225) pour wa.me.
 */
function normalizeWhatsAppPhone(phone: string): string {
    let digits = phone.replace(/[^0-9]/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.length === 10 && digits.startsWith("0")) {
        return `225${digits.slice(1)}`;
    }
    return digits;
}

/**
 * Extrait un montant FCFA entier depuis `clientSubtotalHt` ou le libellé `amount`.
 */
function resolveClientPriceFcfa(
    clientSubtotalHt: number | undefined,
    clientAmountLabel: string
): number | undefined {
    if (typeof clientSubtotalHt === "number" && clientSubtotalHt > 0) {
        return Math.round(clientSubtotalHt);
    }
    const digits = clientAmountLabel.replace(/[^0-9]/g, "");
    if (!digits) return undefined;
    const parsed = Number.parseInt(digits, 10);
    return Number.isFinite(parsed) && parsed >= 1000 ? parsed : undefined;
}

/**
 * Module d'affectation partenaire agréé sur un devis admin :
 * sélection du transporteur, saisie du net partenaire, calcul auto de marge HBC,
 * et envoi en 1 clic de la fiche mission par WhatsApp ou Email.
 */
export function QuotePartnerDispatch({
    quoteId,
    quoteRef,
    pickup,
    dropoff,
    transportDate,
    itemType,
    clientAmountLabel,
    clientSubtotalHt,
    initialAssignment,
    onUpdated,
}: QuotePartnerDispatchProps) {
    const [partners, setPartners] = useState<ApprovedPartnerOption[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(true);

    const [selectedPartnerId, setSelectedPartnerId] = useState(
        initialAssignment?.partnerId ?? ""
    );
    const [partnerNetInput, setPartnerNetInput] = useState(
        initialAssignment ? String(initialAssignment.partnerNetFcfa) : ""
    );
    const [missionNotes, setMissionNotes] = useState(
        initialAssignment?.missionNotes ?? ""
    );

    const [saving, setSaving] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        let active = true;
        const loadPartners = async () => {
            try {
                const res = await getApprovedPartnersAction();
                if (!active) return;
                if (res.data) {
                    setPartners(res.data);
                }
            } finally {
                if (active) setLoadingPartners(false);
            }
        };
        void loadPartners();
        return () => {
            active = false;
        };
    }, []);

    const clientPriceFcfa = useMemo(
        () => resolveClientPriceFcfa(clientSubtotalHt, clientAmountLabel),
        [clientSubtotalHt, clientAmountLabel]
    );

    const partnerNetFcfa = useMemo(() => {
        const digits = partnerNetInput.replace(/[^0-9]/g, "");
        if (!digits) return null;
        const val = Number.parseInt(digits, 10);
        return Number.isFinite(val) ? val : null;
    }, [partnerNetInput]);

    const marginPreview = useMemo(() => {
        if (clientPriceFcfa === undefined || partnerNetFcfa === null) {
            return null;
        }
        const diff = clientPriceFcfa - partnerNetFcfa;
        const pct =
            clientPriceFcfa > 0 ? Math.round((diff / clientPriceFcfa) * 100) : 0;
        return { diff, pct };
    }, [clientPriceFcfa, partnerNetFcfa]);

    const handleAssign = async () => {
        if (!selectedPartnerId) {
            toast.error("Veuillez sélectionner un partenaire agréé.");
            return;
        }
        if (partnerNetFcfa === null || partnerNetFcfa < 0) {
            toast.error("Veuillez indiquer un tarif net partenaire valide.");
            return;
        }

        setSaving(true);
        try {
            const res = await assignPartnerToQuoteAction({
                quoteId,
                partnerId: selectedPartnerId,
                partnerNetFcfa,
                clientPriceFcfa,
                missionNotes: missionNotes.trim() || undefined,
            });
            if (res.data) {
                toast.success(
                    `Partenaire affecté : ${res.data.partnerName}`
                );
                onUpdated();
            } else {
                toast.error(res.error || "Impossible d'affecter ce partenaire.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleUnassign = async () => {
        setRemoving(true);
        try {
            const res = await unassignPartnerFromQuoteAction(quoteId);
            if (res.data?.removed) {
                setSelectedPartnerId("");
                setPartnerNetInput("");
                setMissionNotes("");
                toast.success("Affectation partenaire retirée.");
                onUpdated();
            } else {
                toast.error(res.error || "Erreur lors du retrait.");
            }
        } finally {
            setRemoving(false);
        }
    };

    const handleSendMissionEmail = async () => {
        setSendingEmail(true);
        try {
            const res = await sendPartnerMissionEmailAction(quoteId);
            if (res.data) {
                toast.success(
                    `Fiche mission envoyée par email (${res.data.provider})`
                );
                onUpdated();
            } else {
                toast.error(res.error || "Impossible d'envoyer l'email mission.");
            }
        } finally {
            setSendingEmail(false);
        }
    };

    const whatsappMissionUrl = useMemo(() => {
        if (!initialAssignment) return null;
        const rawPhone =
            initialAssignment.whatsapp || initialAssignment.phone || "";
        const clean = normalizeWhatsAppPhone(rawPhone);
        if (!clean) return null;

        const deadline = safeFormatDate(transportDate, "dd/MM/yyyy 'à' HH:mm");
        const netLabel = `${initialAssignment.partnerNetFcfa.toLocaleString("fr-FR")} FCFA`;
        const lines = [
            `Bonjour ${initialAssignment.contactName} (${initialAssignment.partnerName}),`,
            `HBC Logistique vous propose la mission ${quoteRef} :`,
            `• Fret : ${itemType}`,
            `• Trajet : ${pickup} → ${dropoff}`,
            `• Échéance : ${deadline}`,
            `• Net partenaire convenu : ${netLabel}`,
            initialAssignment.missionNotes
                ? `• Consignes : ${initialAssignment.missionNotes}`
                : "",
            "Merci de confirmer votre disponibilité.",
        ].filter(Boolean);

        return `https://wa.me/${clean}?text=${encodeURIComponent(lines.join("\n"))}`;
    }, [initialAssignment, quoteRef, itemType, pickup, dropoff, transportDate]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-sm tracking-wider uppercase">
                        <Handshake className="text-primary h-4 w-4" />
                        Dispatch Partenaire
                    </CardTitle>
                    {initialAssignment && (
                        <Badge className="gap-1 bg-emerald-600 text-[10px] text-white">
                            <CheckCircle2 className="h-3 w-3" />
                            Affecté
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {loadingPartners ? (
                    <div className="text-muted-foreground flex items-center gap-2 py-2 text-xs">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Chargement des partenaires agréés...
                    </div>
                ) : partners.length === 0 ? (
                    <div className="bg-muted/30 space-y-2 rounded-xl border border-dashed p-3 text-xs">
                        <p className="text-muted-foreground">
                            Aucun partenaire agréé (statut{" "}
                            <span className="font-semibold">APPROVED</span>)
                            disponible pour le moment.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-full gap-1.5 text-xs"
                            asChild
                        >
                            <Link href="/admin/partners">
                                <Building2 className="h-3.5 w-3.5" />
                                Gérer les candidatures partenaires
                                <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1.5">
                            <Label htmlFor="partner-select" className="text-xs">
                                Partenaire agréé
                            </Label>
                            <Select
                                value={selectedPartnerId}
                                onValueChange={setSelectedPartnerId}
                            >
                                <SelectTrigger
                                    id="partner-select"
                                    className="min-h-[42px] text-xs"
                                >
                                    <SelectValue placeholder="Sélectionner un transporteur..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {partners.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            <span className="font-medium">
                                                {p.companyName}
                                            </span>{" "}
                                            <span className="text-muted-foreground">
                                                ({p.city} • {p.totalVehicles}{" "}
                                                véh.)
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="partner-net" className="text-xs">
                                Tarif net partenaire (FCFA)
                            </Label>
                            <Input
                                id="partner-net"
                                inputMode="numeric"
                                value={partnerNetInput}
                                onChange={(e) =>
                                    setPartnerNetInput(
                                        e.target.value.replace(/[^0-9]/g, "")
                                    )
                                }
                                placeholder="Ex: 750000"
                                className="min-h-[42px] font-mono text-sm"
                            />
                            {clientPriceFcfa !== undefined && (
                                <p className="text-muted-foreground text-[11px]">
                                    Base client détectée :{" "}
                                    <span className="font-mono font-semibold">
                                        {clientPriceFcfa.toLocaleString("fr-FR")}{" "}
                                        FCFA
                                    </span>
                                </p>
                            )}
                        </div>

                        {marginPreview && (
                            <div
                                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                                    marginPreview.diff >= 0
                                        ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
                                        : "border-rose-500/30 bg-rose-500/8 text-rose-700 dark:text-rose-400"
                                }`}
                            >
                                <span className="flex items-center gap-1.5 font-medium">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Marge HBC estimée
                                </span>
                                <span className="font-mono font-bold">
                                    {marginPreview.diff >= 0 ? "+" : ""}
                                    {marginPreview.diff.toLocaleString("fr-FR")}{" "}
                                    FCFA ({marginPreview.pct}%)
                                </span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="partner-notes" className="text-xs">
                                Consignes mission (optionnel)
                            </Label>
                            <Input
                                id="partner-notes"
                                value={missionNotes}
                                onChange={(e) => setMissionNotes(e.target.value)}
                                placeholder="Contact sur site, heure d'arrivée, EPI..."
                                className="min-h-[42px] text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                className="min-h-[42px] flex-1 gap-1.5"
                                onClick={handleAssign}
                                disabled={saving || !selectedPartnerId}
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Handshake className="h-4 w-4" />
                                )}
                                {initialAssignment
                                    ? "Mettre à jour"
                                    : "Affecter le partenaire"}
                            </Button>

                            {initialAssignment && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="min-h-[42px] border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                                    onClick={handleUnassign}
                                    disabled={removing}
                                    aria-label="Retirer l'affectation partenaire"
                                >
                                    {removing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {initialAssignment && (
                    <div className="bg-muted/25 space-y-2.5 rounded-xl border p-3">
                        <div className="text-xs">
                            <p className="font-bold">
                                {initialAssignment.partnerName}
                            </p>
                            <p className="text-muted-foreground">
                                {initialAssignment.contactName} •{" "}
                                {initialAssignment.city}
                            </p>
                            <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                                Net convenu :{" "}
                                <span className="text-foreground font-semibold">
                                    {initialAssignment.partnerNetFcfa.toLocaleString(
                                        "fr-FR"
                                    )}{" "}
                                    FCFA
                                </span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {whatsappMissionUrl && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="min-h-[40px] gap-1.5 border-emerald-500/35 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                                    asChild
                                >
                                    <a
                                        href={whatsappMissionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        WhatsApp
                                    </a>
                                </Button>
                            )}
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="min-h-[40px] gap-1.5 text-xs"
                                onClick={handleSendMissionEmail}
                                disabled={sendingEmail}
                            >
                                {sendingEmail ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Mail className="h-3.5 w-3.5" />
                                )}
                                Email mission
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
