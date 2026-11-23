"use client";

import { useMemo, useState } from "react";
import {
    CheckCircle2,
    Clock,
    ExternalLink,
    FileLock2,
    Handshake,
    MapPin,
    Phone,
    Search,
    Trash2,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    deletePartnerApplicationAction,
    updatePartnerApplicationStatusAction,
    type PartnerApplicationItem,
} from "@/app/actions/partner-actions";
import { getKycDocumentSignedUrlAction } from "@/app/actions/upload-management";

interface AdminPartnersClientProps {
    initialApplications: PartnerApplicationItem[];
}

const STATUS_BADGE: Record<
    PartnerApplicationItem["status"],
    { label: string; className: string; icon: typeof Clock }
> = {
    PENDING: {
        label: "En étude",
        className:
            "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        icon: Clock,
    },
    APPROVED: {
        label: "Partenaire Agréé",
        className:
            "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        icon: CheckCircle2,
    },
    REJECTED: {
        label: "Refusé",
        className:
            "border-destructive/40 bg-destructive/10 text-destructive",
        icon: XCircle,
    },
};

export function AdminPartnersClient({
    initialApplications,
}: AdminPartnersClientProps) {
    const [applications, setApplications] =
        useState<PartnerApplicationItem[]>(initialApplications);
    const [statusFilter, setStatusFilter] = useState<
        "ALL" | PartnerApplicationItem["status"]
    >("ALL");
    const [search, setSearch] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);
    const [notesById, setNotesById] = useState<Record<string, string>>({});
    const [deleteTarget, setDeleteTarget] =
        useState<PartnerApplicationItem | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return applications.filter((app) => {
            if (statusFilter !== "ALL" && app.status !== statusFilter) {
                return false;
            }
            if (!q) return true;
            return (
                app.companyName.toLowerCase().includes(q) ||
                (app.rccmNumber || "").toLowerCase().includes(q) ||
                app.city.toLowerCase().includes(q) ||
                app.contactName.toLowerCase().includes(q)
            );
        });
    }, [applications, statusFilter, search]);

    const handleStatusChange = async (
        app: PartnerApplicationItem,
        nextStatus: PartnerApplicationItem["status"]
    ) => {
        setBusyId(app.id);
        try {
            const note = notesById[app.id] ?? app.adminNotes ?? undefined;
            const res = await updatePartnerApplicationStatusAction({
                id: app.id,
                status: nextStatus,
                adminNotes: note,
            });
            if (res.error || !res.data) {
                toast.error(res.error || "Impossible de mettre à jour.");
                return;
            }
            setApplications((prev) =>
                prev.map((item) => (item.id === app.id ? res.data! : item))
            );
            toast.success(
                `${app.companyName} : ${STATUS_BADGE[nextStatus].label}`
            );
        } finally {
            setBusyId(null);
        }
    };

    const handleOpenKycDoc = async (key: string) => {
        const res = await getKycDocumentSignedUrlAction(key);
        if (res.error || !res.data) {
            toast.error(
                res.error || "Impossible d'ouvrir le document KYC privé."
            );
            return;
        }
        window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setBusyId(deleteTarget.id);
        try {
            const res = await deletePartnerApplicationAction(deleteTarget.id);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            setApplications((prev) =>
                prev.filter((item) => item.id !== deleteTarget.id)
            );
            toast.success(`Dossier ${deleteTarget.companyName} supprimé.`);
        } finally {
            setBusyId(null);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Handshake className="text-primary h-5 w-5" />
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Candidatures Partenaires &amp; KYC
                    </h1>
                </div>
                <p className="text-muted-foreground text-sm">
                    Examinez les dossiers des transporteurs UEMOA/CEDEAO et
                    consultez leurs pièces KYC privées via URL signée (validité
                    5 min).
                </p>
            </div>

            {/* Filtres */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Tabs
                    value={statusFilter}
                    onValueChange={(val) =>
                        setStatusFilter(
                            val as "ALL" | PartnerApplicationItem["status"]
                        )
                    }
                >
                    <TabsList>
                        <TabsTrigger value="ALL">
                            Tous ({applications.length})
                        </TabsTrigger>
                        <TabsTrigger value="PENDING">
                            En étude (
                            {
                                applications.filter(
                                    (a) => a.status === "PENDING"
                                ).length
                            }
                            )
                        </TabsTrigger>
                        <TabsTrigger value="APPROVED">
                            Agréés (
                            {
                                applications.filter(
                                    (a) => a.status === "APPROVED"
                                ).length
                            }
                            )
                        </TabsTrigger>
                        <TabsTrigger value="REJECTED">
                            Refusés (
                            {
                                applications.filter(
                                    (a) => a.status === "REJECTED"
                                ).length
                            }
                            )
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-72">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher entreprise, RCCM, ville..."
                        className="min-h-[44px] pl-9"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="text-muted-foreground p-10 text-center text-sm">
                        Aucune candidature partenaire dans cette catégorie.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map((app) => {
                        const badge = STATUS_BADGE[app.status];
                        const isBusy = busyId === app.id;

                        return (
                            <Card key={app.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {app.companyName}
                                            </CardTitle>
                                            <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {app.city}, {app.country}
                                                </span>
                                                <span>•</span>
                                                <span className="font-mono">
                                                    RCCM : {app.rccmNumber}
                                                </span>
                                                {app.nccNumber && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-mono">
                                                            NCC :{" "}
                                                            {app.nccNumber}
                                                        </span>
                                                    </>
                                                )}
                                            </CardDescription>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={badge.className}
                                        >
                                            {badge.label}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="bg-muted/30 grid gap-3 rounded-xl border p-3.5 text-xs sm:grid-cols-3">
                                        <div>
                                            <span className="text-muted-foreground block">
                                                Responsable
                                            </span>
                                            <span className="font-medium">
                                                {app.contactName}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">
                                                Téléphone / WhatsApp
                                            </span>
                                            <span className="inline-flex items-center gap-1 font-mono font-medium">
                                                <Phone className="h-3 w-3" />
                                                {app.phone}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">
                                                Parc déclaré
                                            </span>
                                            <span className="font-semibold">
                                                {app.totalVehicles} véhicule(s)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        <p className="font-semibold">
                                            Description de la flotte :
                                        </p>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {app.fleetSummary}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {app.fleetCategories.map((cat) => (
                                                <Badge
                                                    key={cat}
                                                    variant="secondary"
                                                    className="text-[11px]"
                                                >
                                                    {cat}
                                                </Badge>
                                            ))}
                                            {app.operatingZones.map((z) => (
                                                <Badge
                                                    key={z}
                                                    variant="outline"
                                                    className="text-[11px]"
                                                >
                                                    {z}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pièces KYC Privées */}
                                    <div className="space-y-2">
                                        <p className="flex items-center gap-1.5 text-xs font-semibold">
                                            <FileLock2 className="text-primary h-4 w-4" />
                                            Documents KYC Privés (
                                            {app.kycDocumentKeys.length})
                                        </p>
                                        {app.kycDocumentKeys.length === 0 ? (
                                            <p className="text-muted-foreground text-xs">
                                                Aucune pièce jointe téléversée.
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {app.kycDocumentKeys.map(
                                                    (key, idx) => (
                                                        <Button
                                                            key={key}
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleOpenKycDoc(
                                                                    key
                                                                )
                                                            }
                                                            className="gap-1.5 text-xs"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                            Pièce KYC #{idx + 1}{" "}
                                                            (URL signée 5 min)
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes admin & Actions */}
                                    <div className="space-y-3 border-t pt-3">
                                        <Textarea
                                            rows={2}
                                            value={
                                                notesById[app.id] ??
                                                app.adminNotes ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                setNotesById((prev) => ({
                                                    ...prev,
                                                    [app.id]: e.target.value,
                                                }))
                                            }
                                            placeholder="Note interne de conformité (vérification RCCM, assurance, visite SICTA...)"
                                            className="text-xs"
                                        />

                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setDeleteTarget(app)
                                                }
                                                className="text-destructive hover:text-destructive gap-1.5"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Supprimer
                                            </Button>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        isBusy ||
                                                        app.status ===
                                                            "REJECTED"
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            app,
                                                            "REJECTED"
                                                        )
                                                    }
                                                    className="min-h-[40px] gap-1.5"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Refuser
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    disabled={
                                                        isBusy ||
                                                        app.status ===
                                                            "APPROVED"
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            app,
                                                            "APPROVED"
                                                        )
                                                    }
                                                    className="min-h-[40px] gap-1.5"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Agréer le partenaire
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                title="Supprimer ce dossier partenaire ?"
                description={
                    deleteTarget
                        ? `La candidature de « ${deleteTarget.companyName} » sera supprimée.`
                        : ""
                }
                confirmLabel="Supprimer"
                variant="destructive"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
