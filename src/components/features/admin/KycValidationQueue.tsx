"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    BellRing,
    Building2,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    FileCheck2,
    Loader2,
    Mail,
    Phone,
    ShieldCheck,
    User,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { reviewClientKycDocumentAction } from "@/app/actions/user-management";
import { resolveAttachmentProxyUrl } from "@/lib/attachment-url";
import {
    computeOverallKycStatus,
    getKycDocLabel,
    type ClientKycState,
    type KycDocType,
    type OverallKycStatus,
} from "@/lib/client-kyc";
import { safeFormatDate } from "@/lib/date-utils";

export interface KycManagedClient {
    id: string;
    name: string;
    email: string;
    accountType: "INDIVIDUAL" | "COMPANY" | null;
    companyName: string | null;
    phone: string | null;
    kyc: ClientKycState;
}

interface KycValidationQueueProps {
    clients: KycManagedClient[];
    searchQuery: string;
}

type KycFilter = "ALL" | "PENDING" | "VERIFIED" | "ACTION_REQUIRED";

/**
 * Composant dédié et intuitif pour gérer tous les profils clients ayant téléversé
 * des documents KYC (à valider, validés ou refusés) depuis `/admin/users`.
 */
export function KycValidationQueue({
    clients,
    searchQuery,
}: KycValidationQueueProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<KycFilter>("ALL");
    const [localKycByUser, setLocalKycByUser] = useState<
        Record<string, ClientKycState>
    >({});
    const [rejectionDrafts, setRejectionDrafts] = useState<
        Record<string, string>
    >({});
    const [busyKey, setBusyKey] = useState<string | null>(null);

    const enrichedClients = useMemo(() => {
        return clients
            .map((client) => {
                const kyc = localKycByUser[client.id] ?? client.kyc;
                const accountType =
                    client.accountType === "COMPANY" ? "COMPANY" : "INDIVIDUAL";
                const overallStatus: OverallKycStatus = computeOverallKycStatus(
                    accountType,
                    kyc.documents
                );
                return { ...client, kyc, accountType, overallStatus };
            })
            .filter((c) => c.kyc.documents.length > 0);
    }, [clients, localKycByUser]);

    const counts = useMemo(() => {
        let pending = 0;
        let verified = 0;
        let rejected = 0;
        for (const c of enrichedClients) {
            if (c.overallStatus === "VERIFIED") verified += 1;
            else if (c.overallStatus === "ACTION_REQUIRED") rejected += 1;
            else pending += 1;
        }
        return { total: enrichedClients.length, pending, verified, rejected };
    }, [enrichedClients]);

    const filteredClients = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return enrichedClients.filter((c) => {
            if (filter === "PENDING" && c.overallStatus !== "PENDING") {
                return false;
            }
            if (filter === "VERIFIED" && c.overallStatus !== "VERIFIED") {
                return false;
            }
            if (
                filter === "ACTION_REQUIRED" &&
                c.overallStatus !== "ACTION_REQUIRED"
            ) {
                return false;
            }
            if (!q) return true;
            return (
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.companyName || "").toLowerCase().includes(q) ||
                (c.phone || "").toLowerCase().includes(q)
            );
        });
    }, [enrichedClients, filter, searchQuery]);

    const handleDecision = async (
        userId: string,
        docType: KycDocType,
        decision: "APPROVED" | "REJECTED"
    ) => {
        const draftKey = `${userId}:${docType}`;
        setBusyKey(draftKey);
        try {
            const res = await reviewClientKycDocumentAction({
                userId,
                docType,
                decision,
                rejectionReason:
                    decision === "REJECTED"
                        ? rejectionDrafts[draftKey]?.trim() || undefined
                        : undefined,
            });
            if (!res.success || !res.kyc) {
                toast.error(res.error || "Impossible de traiter ce document.");
                return;
            }
            setLocalKycByUser((prev) => ({ ...prev, [userId]: res.kyc! }));
            if (decision === "REJECTED") {
                setRejectionDrafts((prev) => {
                    const next = { ...prev };
                    delete next[draftKey];
                    return next;
                });
            }
            toast.success(
                decision === "APPROVED"
                    ? "Document validé avec succès."
                    : "Document refusé (le client a été notifié du statut)."
            );
            router.refresh();
        } finally {
            setBusyKey(null);
        }
    };

    return (
        <div className="space-y-5">
            {/* Barre de filtres intuitifs par statut KYC */}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant={filter === "ALL" ? "default" : "outline"}
                    onClick={() => setFilter("ALL")}
                    className="min-h-[38px] gap-1.5"
                >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    Tous ({counts.total})
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={filter === "PENDING" ? "default" : "outline"}
                    onClick={() => setFilter("PENDING")}
                    className="min-h-[38px] gap-1.5"
                >
                    <Clock className="h-3.5 w-3.5 text-amber-500" />À valider (
                    {counts.pending})
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={filter === "VERIFIED" ? "default" : "outline"}
                    onClick={() => setFilter("VERIFIED")}
                    className="min-h-[38px] gap-1.5"
                >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Profils validés ({counts.verified})
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={
                        filter === "ACTION_REQUIRED" ? "default" : "outline"
                    }
                    onClick={() => setFilter("ACTION_REQUIRED")}
                    className="min-h-[38px] gap-1.5"
                >
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    Refusés / À corriger ({counts.rejected})
                </Button>
            </div>

            {filteredClients.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm">
                        <ShieldCheck className="h-8 w-8 opacity-40" />
                        <p className="font-medium">
                            Aucun profil client KYC dans cette catégorie.
                        </p>
                        <p className="max-w-md text-xs">
                            Dès qu&apos;un client téléverse sa CNI/Passeport ou
                            ses documents RCCM/DFE depuis son Espace Client, son
                            dossier apparaît ici pour validation en 1 clic.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {filteredClients.map((client) => {
                        const isVerified = client.overallStatus === "VERIFIED";
                        const isRejected =
                            client.overallStatus === "ACTION_REQUIRED";

                        return (
                            <Card
                                key={client.id}
                                className={
                                    isVerified
                                        ? "border-emerald-500/35 shadow-xs"
                                        : isRejected
                                          ? "border-rose-500/35 shadow-xs"
                                          : "border-amber-500/35 shadow-xs"
                                }
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            {/* Cercle vert autour de l'icône utilisateur lorsque le profil est validé */}
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                                    isVerified
                                                        ? "bg-emerald-500/15 text-emerald-600 ring-2 ring-emerald-500 ring-offset-2 ring-offset-background dark:text-emerald-400"
                                                        : isRejected
                                                          ? "bg-rose-500/15 text-rose-600 ring-2 ring-rose-500/70 ring-offset-2 ring-offset-background dark:text-rose-400"
                                                          : "bg-amber-500/15 text-amber-600 ring-2 ring-amber-500/70 ring-offset-2 ring-offset-background dark:text-amber-400"
                                                }`}
                                            >
                                                {client.accountType ===
                                                "COMPANY" ? (
                                                    <Building2 className="h-5 w-5" />
                                                ) : (
                                                    <User className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <p className="truncate text-sm font-bold">
                                                        {client.companyName ||
                                                            client.name}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px]"
                                                    >
                                                        {client.accountType ===
                                                        "COMPANY"
                                                            ? "Entreprise"
                                                            : "Particulier"}
                                                    </Badge>
                                                </div>
                                                <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {client.email}
                                                    </span>
                                                    {client.phone && (
                                                        <span className="inline-flex items-center gap-1 font-mono">
                                                            <Phone className="h-3 w-3" />
                                                            {client.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {isVerified ? (
                                            <Badge className="shrink-0 gap-1 bg-emerald-600 text-white">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Validé
                                            </Badge>
                                        ) : isRejected ? (
                                            <Badge
                                                variant="destructive"
                                                className="shrink-0 gap-1"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                À corriger
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0 gap-1 border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                            >
                                                <Clock className="h-3.5 w-3.5" />
                                                À valider
                                            </Badge>
                                        )}
                                    </div>

                                    {client.kyc.lastReminderAt && (
                                        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/8 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                            <BellRing className="h-3.5 w-3.5 shrink-0" />
                                            Relance client reçue le{" "}
                                            {safeFormatDate(
                                                client.kyc.lastReminderAt,
                                                "dd/MM/yyyy 'à' HH:mm"
                                            )}
                                        </div>
                                    )}
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {client.kyc.documents.map((doc) => {
                                        const draftKey = `${client.id}:${doc.docType}`;
                                        const isBusy = busyKey === draftKey;
                                        const viewUrl =
                                            resolveAttachmentProxyUrl(
                                                doc.fileKey,
                                                false
                                            );
                                        const downloadUrl =
                                            resolveAttachmentProxyUrl(
                                                doc.fileKey,
                                                true
                                            );

                                        return (
                                            <div
                                                key={doc.docType}
                                                className="bg-muted/25 space-y-2.5 rounded-xl border p-3"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold">
                                                            {getKycDocLabel(
                                                                doc.docType
                                                            )}
                                                        </p>
                                                        <p className="text-muted-foreground truncate font-mono text-[11px]">
                                                            {doc.fileName} •{" "}
                                                            {safeFormatDate(
                                                                doc.uploadedAt,
                                                                "dd/MM/yyyy HH:mm"
                                                            )}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            doc.status ===
                                                            "APPROVED"
                                                                ? "default"
                                                                : doc.status ===
                                                                    "REJECTED"
                                                                  ? "destructive"
                                                                  : "secondary"
                                                        }
                                                        className={
                                                            doc.status ===
                                                            "APPROVED"
                                                                ? "bg-emerald-600 text-[10px] text-white"
                                                                : "text-[10px]"
                                                        }
                                                    >
                                                        {doc.status ===
                                                        "APPROVED"
                                                            ? "Validé"
                                                            : doc.status ===
                                                                "REJECTED"
                                                              ? "Refusé"
                                                              : "En attente"}
                                                    </Badge>
                                                </div>

                                                {doc.status !== "APPROVED" && (
                                                    <Input
                                                        value={
                                                            rejectionDrafts[
                                                                draftKey
                                                            ] || ""
                                                        }
                                                        onChange={(e) =>
                                                            setRejectionDrafts(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [draftKey]:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            )
                                                        }
                                                        placeholder="Motif optionnel en cas de refus (ex: document flou)..."
                                                        className="bg-background h-8 text-xs"
                                                    />
                                                )}

                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        {viewUrl && (
                                                            <a
                                                                href={viewUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-background hover:bg-secondary inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                                Ouvrir
                                                            </a>
                                                        )}
                                                        {downloadUrl && (
                                                            <a
                                                                href={
                                                                    downloadUrl
                                                                }
                                                                download={
                                                                    doc.fileName
                                                                }
                                                                className="bg-background hover:bg-secondary inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors"
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                                Télécharger
                                                            </a>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isBusy}
                                                            onClick={() =>
                                                                void handleDecision(
                                                                    client.id,
                                                                    doc.docType,
                                                                    "REJECTED"
                                                                )
                                                            }
                                                            className="h-8 gap-1 border-rose-500/35 text-xs text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                                                        >
                                                            {isBusy ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <XCircle className="h-3.5 w-3.5" />
                                                            )}
                                                            Refuser
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            disabled={
                                                                isBusy ||
                                                                doc.status ===
                                                                    "APPROVED"
                                                            }
                                                            onClick={() =>
                                                                void handleDecision(
                                                                    client.id,
                                                                    doc.docType,
                                                                    "APPROVED"
                                                                )
                                                            }
                                                            className="h-8 gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                                                        >
                                                            {isBusy ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                            )}
                                                            Valider
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
