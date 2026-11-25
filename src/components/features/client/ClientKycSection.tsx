"use client";

import { useState } from "react";
import {
    AlertTriangle,
    BellRing,
    CheckCircle2,
    Clock,
    FileCheck2,
    FileUp,
    Loader2,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    canSendKycReminder,
    computeOverallKycStatus,
    KYC_REQUIREMENTS_BY_ACCOUNT_TYPE,
    type ClientAccountType,
    type ClientKycState,
    type KycDocType,
} from "@/lib/client-kyc";
import {
    requestKycValidationReminderAction,
    saveClientKycDocumentAction,
} from "@/app/actions/client-space-actions";
import { safeFormatDate } from "@/lib/date-utils";

interface ClientKycSectionProps {
    accountType: ClientAccountType;
    kyc: ClientKycState;
    onKycChange: (next: ClientKycState) => void;
}

export function ClientKycSection({
    accountType,
    kyc,
    onKycChange,
}: ClientKycSectionProps) {
    const [uploadingType, setUploadingType] = useState<KycDocType | null>(null);
    const [sendingReminder, setSendingReminder] = useState(false);

    const specs = KYC_REQUIREMENTS_BY_ACCOUNT_TYPE[accountType];
    const overallStatus = computeOverallKycStatus(accountType, kyc.documents);
    const reminderEligibility = canSendKycReminder(kyc);

    const handleFileUpload = async (docType: KycDocType, file: File | null) => {
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            toast.error("Fichier trop volumineux (maximum 4 Mo).");
            return;
        }

        setUploadingType(docType);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "partners-kyc");

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const uploadJson = (await uploadRes.json()) as {
                success?: boolean;
                key?: string;
                error?: string;
            };

            if (!uploadRes.ok || !uploadJson.success || !uploadJson.key) {
                toast.error(
                    uploadJson.error ||
                        "Échec du téléversement sécurisé du document."
                );
                return;
            }

            const saveRes = await saveClientKycDocumentAction({
                docType,
                fileKey: uploadJson.key,
                fileName: file.name,
                accountType,
            });

            if (saveRes.error || !saveRes.data) {
                toast.error(
                    saveRes.error || "Impossible d'enregistrer le document."
                );
                return;
            }

            onKycChange(saveRes.data);
            toast.success(
                "Document enregistré en toute sécurité. En attente de validation admin."
            );
        } catch {
            toast.error("Erreur réseau lors du téléversement.");
        } finally {
            setUploadingType(null);
        }
    };

    const handleSendReminder = async () => {
        if (sendingReminder || !reminderEligibility.allowed) return;
        setSendingReminder(true);
        try {
            const res = await requestKycValidationReminderAction();
            if (res.error || !res.data) {
                toast.error(res.error || "Impossible d'envoyer la relance.");
                return;
            }
            onKycChange({
                ...kyc,
                lastReminderAt: res.data.lastReminderAt,
            });
            toast.success(res.data.message);
        } finally {
            setSendingReminder(false);
        }
    };

    return (
        <div className="bg-muted/25 space-y-4 rounded-xl border p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <ShieldCheck className="text-primary h-4 w-4" />
                        <h3 className="text-sm font-bold sm:text-base">
                            Vérification d&apos;identité &amp; Documents
                            officiels (
                            {accountType === "COMPANY"
                                ? "Entreprise"
                                : "Particulier"}
                            )
                        </h3>
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Vos justificatifs sont stockés dans un espace privé
                        chiffré et vérifiés par notre équipe (PDF, JPG, PNG ou
                        WEBP — max 4 Mo).
                    </p>
                </div>

                {overallStatus === "VERIFIED" ? (
                    <Badge className="w-fit gap-1.5 bg-emerald-600 text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Identité vérifiée
                    </Badge>
                ) : overallStatus === "ACTION_REQUIRED" ? (
                    <Badge variant="destructive" className="w-fit gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Document à corriger
                    </Badge>
                ) : overallStatus === "PENDING" ? (
                    <Badge
                        variant="secondary"
                        className="w-fit gap-1.5 border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Validation en attente
                    </Badge>
                ) : (
                    <Badge variant="outline" className="w-fit gap-1.5">
                        Non vérifié
                    </Badge>
                )}
            </div>

            <div className="space-y-2.5">
                {specs.map((spec) => {
                    const uploaded = kyc.documents.find(
                        (d) => d.docType === spec.docType
                    );
                    const isUploading = uploadingType === spec.docType;

                    return (
                        <div
                            key={spec.docType}
                            className="bg-background flex flex-col justify-between gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center"
                        >
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold">
                                        {spec.label}
                                    </span>
                                    <Badge
                                        variant={
                                            spec.required
                                                ? "secondary"
                                                : "outline"
                                        }
                                        className="text-[10px]"
                                    >
                                        {spec.required
                                            ? "Obligatoire"
                                            : "Recommandé"}
                                    </Badge>
                                    {uploaded?.status === "APPROVED" && (
                                        <Badge className="gap-1 bg-emerald-600 text-[10px] text-white">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Validé
                                        </Badge>
                                    )}
                                    {uploaded?.status === "PENDING" && (
                                        <Badge
                                            variant="outline"
                                            className="gap-1 border-amber-500/40 text-[10px] text-amber-600 dark:text-amber-400"
                                        >
                                            <Clock className="h-3 w-3" />
                                            En attente
                                        </Badge>
                                    )}
                                    {uploaded?.status === "REJECTED" && (
                                        <Badge
                                            variant="destructive"
                                            className="gap-1 text-[10px]"
                                        >
                                            <XCircle className="h-3 w-3" />
                                            Refusé
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    {spec.description}
                                </p>
                                {uploaded && (
                                    <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-[11px]">
                                        <FileCheck2 className="text-primary h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                            {uploaded.fileName}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {safeFormatDate(
                                                uploaded.uploadedAt,
                                                "dd/MM/yyyy 'à' HH:mm"
                                            )}
                                        </span>
                                    </p>
                                )}
                                {uploaded?.status === "REJECTED" &&
                                    uploaded.rejectionReason && (
                                        <p className="text-destructive text-xs font-medium">
                                            Motif : {uploaded.rejectionReason}
                                        </p>
                                    )}
                            </div>

                            <div className="shrink-0">
                                <label className="inline-flex cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        className="hidden"
                                        disabled={isUploading}
                                        onChange={(e) => {
                                            const picked =
                                                e.target.files?.[0] || null;
                                            e.target.value = "";
                                            void handleFileUpload(
                                                spec.docType,
                                                picked
                                            );
                                        }}
                                    />
                                    <span className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors">
                                        {isUploading ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <FileUp className="h-3.5 w-3.5" />
                                        )}
                                        {uploaded
                                            ? "Remplacer"
                                            : "Téléverser"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Zone de relance validation (1 fois / 24h) */}
            <div className="bg-background/80 flex flex-col justify-between gap-3 rounded-xl border border-dashed p-3.5 sm:flex-row sm:items-center">
                <div className="space-y-0.5 text-xs">
                    <p className="font-semibold">
                        Documents encore en attente de validation ?
                    </p>
                    <p className="text-muted-foreground">
                        {reminderEligibility.allowed
                            ? "Envoyez un rappel prioritaire à notre équipe administrative (1 rappel autorisé par 24h)."
                            : reminderEligibility.reason}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!reminderEligibility.allowed || sendingReminder}
                    onClick={handleSendReminder}
                    className="min-h-[42px] shrink-0 gap-2 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
                >
                    {sendingReminder ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <BellRing className="h-4 w-4" />
                    )}
                    Réclamer la validation (1/j)
                </Button>
            </div>
        </div>
    );
}
