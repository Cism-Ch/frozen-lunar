"use client";

import { useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Building2,
    CheckCircle2,
    Code,
    Download,
    ExternalLink,
    FileCheck2,
    KeyRound,
    LogOut,
    Search,
    Shield,
    ShieldAlert,
    Trash2,
    User,
    UserCog,
    Users,
    XCircle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    deleteUserAction,
    reviewClientKycDocumentAction,
    revokeUserSessionsAction,
    toggleUserEmailVerifiedAction,
    updateUserRoleAction,
} from "@/app/actions/user-management";
import {
    computeOverallKycStatus,
    getKycDocLabel,
    type ClientKycState,
    type KycDocType,
} from "@/lib/client-kyc";
import { KycValidationQueue } from "@/components/features/admin/KycValidationQueue";
import { resolveAttachmentProxyUrl } from "@/lib/attachment-url";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface ManagedUserItem {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    accountType: "INDIVIDUAL" | "COMPANY" | null;
    companyName: string | null;
    phone: string | null;
    quotesCount: number;
    activeSessionsCount: number;
    kyc?: ClientKycState;
}

interface UserListProps {
    users: ManagedUserItem[];
    currentUserId: string;
}

const ADMIN_ROLES = new Set(["admin", "superadmin", "developer", "moderator"]);

export function UserList({ users, currentUserId }: UserListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [clientTypeFilter, setClientTypeFilter] = useState<
        "ALL" | "COMPANY" | "INDIVIDUAL"
    >("ALL");

    // Modales de confirmation centrées
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [confirmRevokeUser, setConfirmRevokeUser] =
        useState<ManagedUserItem | null>(null);
    const [pendingRoleChange, setPendingRoleChange] = useState<{
        user: ManagedUserItem;
        newRole: "admin" | "moderator" | "developer" | "user";
    } | null>(null);
    const [kycModalUser, setKycModalUser] = useState<ManagedUserItem | null>(
        null
    );
    const [busyAction, setBusyAction] = useState(false);

    const handleReviewKyc = async (
        userId: string,
        docType: KycDocType,
        decision: "APPROVED" | "REJECTED"
    ) => {
        setBusyAction(true);
        try {
            const res = await reviewClientKycDocumentAction({
                userId,
                docType,
                decision,
            });
            if (!res.success || !res.kyc) {
                toast.error(res.error || "Erreur lors de la validation KYC.");
                return;
            }
            setKycModalUser((prev) =>
                prev && prev.id === userId ? { ...prev, kyc: res.kyc } : prev
            );
            toast.success(
                decision === "APPROVED"
                    ? "Document validé avec succès."
                    : "Document refusé (le client pourra le remplacer)."
            );
        } finally {
            setBusyAction(false);
        }
    };

    const adminTeam = useMemo(
        () => users.filter((u) => ADMIN_ROLES.has(u.role)),
        [users]
    );
    const clientAccounts = useMemo(
        () => users.filter((u) => !ADMIN_ROLES.has(u.role)),
        [users]
    );

    const filteredAdmins = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return adminTeam;
        return adminTeam.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.role.toLowerCase().includes(q)
        );
    }, [adminTeam, searchQuery]);

    const filteredClients = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return clientAccounts.filter((u) => {
            if (clientTypeFilter === "COMPANY" && u.accountType !== "COMPANY") {
                return false;
            }
            if (
                clientTypeFilter === "INDIVIDUAL" &&
                u.accountType === "COMPANY"
            ) {
                return false;
            }
            if (!q) return true;
            return (
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.companyName || "").toLowerCase().includes(q) ||
                (u.phone || "").toLowerCase().includes(q)
            );
        });
    }, [clientAccounts, searchQuery, clientTypeFilter]);

    const totalSessions = useMemo(
        () => users.reduce((sum, u) => sum + u.activeSessionsCount, 0),
        [users]
    );

    const kycClients = useMemo(
        () =>
            clientAccounts.filter(
                (u) => u.kyc && u.kyc.documents.length > 0
            ),
        [clientAccounts]
    );

    const pendingKycCount = useMemo(
        () =>
            kycClients.filter((u) => {
                const status = computeOverallKycStatus(
                    u.accountType === "COMPANY" ? "COMPANY" : "INDIVIDUAL",
                    u.kyc?.documents || []
                );
                return status === "PENDING";
            }).length,
        [kycClients]
    );

    const userToDelete = users.find((u) => u.id === confirmDeleteId);

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setBusyAction(true);
        try {
            const formData = new FormData();
            formData.append("userId", confirmDeleteId);
            const result = await deleteUserAction(formData);
            if (result.success) {
                toast.success(result.message);
                setConfirmDeleteId(null);
            } else {
                toast.error(result.error);
            }
        } finally {
            setBusyAction(false);
        }
    };

    const handleConfirmRevoke = async () => {
        if (!confirmRevokeUser) return;
        setBusyAction(true);
        try {
            const res = await revokeUserSessionsAction(confirmRevokeUser.id);
            if (res.success) {
                toast.success(res.message);
                setConfirmRevokeUser(null);
            } else {
                toast.error(res.error || "Erreur lors de la révocation.");
            }
        } finally {
            setBusyAction(false);
        }
    };

    const handleConfirmRoleChange = async () => {
        if (!pendingRoleChange) return;
        setBusyAction(true);
        try {
            const res = await updateUserRoleAction({
                userId: pendingRoleChange.user.id,
                role: pendingRoleChange.newRole,
            });
            if (res.success) {
                toast.success(res.message);
                setPendingRoleChange(null);
            } else {
                toast.error(res.error || "Erreur lors du changement de rôle.");
            }
        } finally {
            setBusyAction(false);
        }
    };

    const handleToggleVerified = async (u: ManagedUserItem) => {
        const res = await toggleUserEmailVerifiedAction(
            u.id,
            !u.emailVerified
        );
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.error || "Erreur de mise à jour.");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
            case "superadmin":
                return (
                    <Badge className="bg-red-600 text-white hover:bg-red-700">
                        <ShieldAlert className="mr-1 h-3 w-3" /> Admin
                    </Badge>
                );
            case "developer":
                return (
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                        <Code className="mr-1 h-3 w-3" /> Dev
                    </Badge>
                );
            case "moderator":
                return (
                    <Badge className="bg-orange-600 text-white hover:bg-orange-700">
                        <Shield className="mr-1 h-3 w-3" /> Modérateur
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary">
                        <UserCog className="mr-1 h-3 w-3" /> Client
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Bandeau KPI */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Équipe Administrative
                        </p>
                        <p className="mt-1 text-2xl font-extrabold">
                            {adminTeam.length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Comptes Clients
                        </p>
                        <p className="text-primary mt-1 text-2xl font-extrabold">
                            {clientAccounts.length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Clients Entreprises
                        </p>
                        <p className="mt-1 text-2xl font-extrabold">
                            {
                                clientAccounts.filter(
                                    (c) => c.accountType === "COMPANY"
                                ).length
                            }
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Sessions actives
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {totalSessions}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Barre de recherche globale */}
            <div className="relative max-w-md">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom, email, entreprise ou téléphone..."
                    className="pl-9"
                />
            </div>

            {/* 2 Onglets Séparés : Équipe Administrative vs Comptes Clients */}
            <Tabs defaultValue="admin-team" className="space-y-4">
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-fit">
                    <TabsTrigger
                        value="admin-team"
                        className="min-h-[40px] gap-2 px-4"
                    >
                        <Shield className="text-primary h-4 w-4" />
                        Équipe Administrative ({filteredAdmins.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="clients"
                        className="min-h-[40px] gap-2 px-4"
                    >
                        <Users className="h-4 w-4" />
                        Comptes Clients ({filteredClients.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="kyc-queue"
                        className="min-h-[40px] gap-2 px-4"
                    >
                        <FileCheck2 className="text-primary h-4 w-4" />
                        Validations KYC ({kycClients.length})
                        {pendingKycCount > 0 && (
                            <Badge className="ml-1 bg-amber-500 px-1.5 py-0 text-[10px] text-white">
                                {pendingKycCount} à valider
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ONGLET 1 : ÉQUIPE ADMINISTRATIVE */}
                <TabsContent value="admin-team" className="space-y-4">
                    <div className="overflow-x-auto rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/35">
                                    <TableHead>Membre</TableHead>
                                    <TableHead>Rôle &amp; Accès</TableHead>
                                    <TableHead>Sessions</TableHead>
                                    <TableHead>Ajouté le</TableHead>
                                    <TableHead className="text-right">
                                        Actions Sécurité
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAdmins.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-muted-foreground py-8 text-center text-sm"
                                        >
                                            Aucun membre administratif trouvé.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAdmins.map((u) => {
                                        const isSelf = u.id === currentUserId;
                                        return (
                                            <TableRow key={u.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">
                                                            {u.name}
                                                            {isSelf && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="ml-2 text-[10px]"
                                                                >
                                                                    Vous
                                                                </Badge>
                                                            )}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {u.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getRoleBadge(u.role)}
                                                        {!isSelf && (
                                                            <Select
                                                                value={u.role}
                                                                onValueChange={(
                                                                    val
                                                                ) =>
                                                                    setPendingRoleChange(
                                                                        {
                                                                            user: u,
                                                                            newRole:
                                                                                val as
                                                                                    | "admin"
                                                                                    | "moderator"
                                                                                    | "developer"
                                                                                    | "user",
                                                                        }
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="h-8 w-[130px] text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="admin">
                                                                        Admin
                                                                    </SelectItem>
                                                                    <SelectItem value="moderator">
                                                                        Modérateur
                                                                    </SelectItem>
                                                                    <SelectItem value="developer">
                                                                        Développeur
                                                                    </SelectItem>
                                                                    <SelectItem value="user">
                                                                        Client
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {u.activeSessionsCount}{" "}
                                                    active(s)
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {format(
                                                        new Date(u.createdAt),
                                                        "dd MMM yyyy",
                                                        { locale: fr }
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isSelf}
                                                            title="Révoquer toutes les sessions"
                                                            onClick={() =>
                                                                setConfirmRevokeUser(
                                                                    u
                                                                )
                                                            }
                                                            className="h-8 gap-1 text-xs"
                                                        >
                                                            <LogOut className="h-3.5 w-3.5" />
                                                            <span className="hidden lg:inline">
                                                                Révoquer
                                                            </span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={isSelf}
                                                            onClick={() =>
                                                                setConfirmDeleteId(
                                                                    u.id
                                                                )
                                                            }
                                                            className="h-8 w-8 text-red-600 hover:bg-red-500/10 dark:text-rose-400"
                                                            aria-label={`Supprimer ${u.name}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* ONGLET 2 : COMPTES CLIENTS */}
                <TabsContent value="clients" className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {(
                            [
                                { value: "ALL", label: "Tous les clients" },
                                { value: "COMPANY", label: "Entreprises" },
                                { value: "INDIVIDUAL", label: "Particuliers" },
                            ] as const
                        ).map((f) => (
                            <Button
                                key={f.value}
                                size="sm"
                                variant={
                                    clientTypeFilter === f.value
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setClientTypeFilter(f.value)}
                                className="h-8 text-xs"
                            >
                                {f.label}
                            </Button>
                        ))}
                    </div>

                    <div className="overflow-x-auto rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/35">
                                    <TableHead>Client</TableHead>
                                    <TableHead>Type &amp; Profil</TableHead>
                                    <TableHead>Activité</TableHead>
                                    <TableHead>Statut Email</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-muted-foreground py-8 text-center text-sm"
                                        >
                                            Aucun compte client enregistré.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClients.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        {u.name}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">
                                                        {u.email}
                                                    </span>
                                                    {u.phone && (
                                                        <span className="text-muted-foreground font-mono text-[11px]">
                                                            {u.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="w-fit gap-1 text-xs"
                                                    >
                                                        {u.accountType ===
                                                        "COMPANY" ? (
                                                            <>
                                                                <Building2 className="h-3 w-3" />
                                                                Entreprise
                                                            </>
                                                        ) : (
                                                            <>
                                                                <User className="h-3 w-3" />
                                                                Particulier
                                                            </>
                                                        )}
                                                    </Badge>
                                                    {u.companyName && (
                                                        <span className="text-muted-foreground max-w-[180px] truncate text-xs">
                                                            {u.companyName}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <span className="font-semibold">
                                                    {u.quotesCount} devis
                                                </span>
                                                <span className="text-muted-foreground block">
                                                    Inscrit le{" "}
                                                    {format(
                                                        new Date(u.createdAt),
                                                        "dd MMM yyyy",
                                                        { locale: fr }
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        void handleToggleVerified(
                                                            u
                                                        )
                                                    }
                                                    className="h-7 gap-1 px-2 text-xs"
                                                >
                                                    <CheckCircle2
                                                        className={
                                                            u.emailVerified
                                                                ? "h-3.5 w-3.5 text-emerald-500"
                                                                : "text-muted-foreground h-3.5 w-3.5"
                                                        }
                                                    />
                                                    {u.emailVerified
                                                        ? "Vérifié"
                                                        : "Non vérifié"}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {u.kyc &&
                                                        u.kyc.documents.length >
                                                            0 && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setKycModalUser(
                                                                        u
                                                                    )
                                                                }
                                                                className="h-8 gap-1 text-xs"
                                                            >
                                                                <FileCheck2 className="text-primary h-3.5 w-3.5" />
                                                                KYC (
                                                                {
                                                                    u.kyc
                                                                        .documents
                                                                        .length
                                                                }
                                                                )
                                                            </Button>
                                                        )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Déconnecter les sessions actives"
                                                        onClick={() =>
                                                            setConfirmRevokeUser(
                                                                u
                                                            )
                                                        }
                                                        className="h-8 gap-1 text-xs"
                                                    >
                                                        <KeyRound className="h-3.5 w-3.5" />
                                                        <span className="hidden lg:inline">
                                                            Sessions (
                                                            {
                                                                u.activeSessionsCount
                                                            }
                                                            )
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setConfirmDeleteId(
                                                                u.id
                                                            )
                                                        }
                                                        className="h-8 w-8 text-red-600 hover:bg-red-500/10 dark:text-rose-400"
                                                        aria-label={`Supprimer ${u.name}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* Onglet 3 : File Dédiée de Validation KYC Clients */}
                <TabsContent value="kyc-queue" className="space-y-4">
                    <KycValidationQueue
                        clients={kycClients.map((c) => ({
                            id: c.id,
                            name: c.name,
                            email: c.email,
                            accountType: c.accountType,
                            companyName: c.companyName,
                            phone: c.phone,
                            kyc: c.kyc!,
                        }))}
                        searchQuery={searchQuery}
                    />
                </TabsContent>
            </Tabs>

            {/* Confirmation Suppression */}
            <ConfirmDialog
                open={confirmDeleteId !== null}
                onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                title={`Supprimer le compte de ${userToDelete?.name ?? "cet utilisateur"} ?`}
                description="Cette action est irréversible. Le compte et toutes ses sessions actives seront définitivement supprimés."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                variant="destructive"
                isLoading={busyAction}
                onConfirm={handleConfirmDelete}
            />

            {/* Confirmation Révocation Sessions */}
            <ConfirmDialog
                open={confirmRevokeUser !== null}
                onOpenChange={(open) => !open && setConfirmRevokeUser(null)}
                title={`Révoquer les sessions de ${confirmRevokeUser?.name ?? ""} ?`}
                description="L'utilisateur sera immédiatement déconnecté de tous ses appareils et devra se réauthentifier."
                confirmLabel="Révoquer les sessions"
                cancelLabel="Annuler"
                variant="destructive"
                isLoading={busyAction}
                onConfirm={handleConfirmRevoke}
            />

            {/* Confirmation Changement de Rôle */}
            <ConfirmDialog
                open={pendingRoleChange !== null}
                onOpenChange={(open) => !open && setPendingRoleChange(null)}
                title={`Modifier le rôle de ${pendingRoleChange?.user.name ?? ""} ?`}
                description={`Ce compte passera au rôle "${pendingRoleChange?.newRole ?? ""}" et ses permissions d'accès seront immédiatement mises à jour.`}
                confirmLabel="Confirmer le rôle"
                cancelLabel="Annuler"
                isLoading={busyAction}
                onConfirm={handleConfirmRoleChange}
            />

            {/* Modale de Revue des Documents KYC Client */}
            <Dialog
                open={kycModalUser !== null}
                onOpenChange={(open) => !open && setKycModalUser(null)}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileCheck2 className="text-primary h-5 w-5" />
                            Validation Documents KYC —{" "}
                            {kycModalUser?.companyName || kycModalUser?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Ouvrez ou téléchargez les pièces justificatives via
                            le proxy sécurisé puis validez ou refusez chaque
                            document.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {(kycModalUser?.kyc?.documents || []).map((doc) => {
                            const viewUrl = resolveAttachmentProxyUrl(
                                doc.fileKey,
                                false
                            );
                            const downloadUrl = resolveAttachmentProxyUrl(
                                doc.fileKey,
                                true
                            );
                            return (
                                <div
                                    key={doc.docType}
                                    className="bg-muted/25 space-y-2.5 rounded-xl border p-3.5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {getKycDocLabel(doc.docType)}
                                            </p>
                                            <p className="text-muted-foreground font-mono text-xs">
                                                {doc.fileName}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                doc.status === "APPROVED"
                                                    ? "default"
                                                    : doc.status === "REJECTED"
                                                      ? "destructive"
                                                      : "secondary"
                                            }
                                            className="text-xs"
                                        >
                                            {doc.status === "APPROVED"
                                                ? "Validé"
                                                : doc.status === "REJECTED"
                                                  ? "Refusé"
                                                  : "En attente"}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            {viewUrl && (
                                                <a
                                                    href={viewUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-background hover:bg-secondary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Ouvrir
                                                </a>
                                            )}
                                            {downloadUrl && (
                                                <a
                                                    href={downloadUrl}
                                                    download={doc.fileName}
                                                    className="bg-background hover:bg-secondary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Télécharger
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={busyAction}
                                                onClick={() =>
                                                    kycModalUser &&
                                                    void handleReviewKyc(
                                                        kycModalUser.id,
                                                        doc.docType,
                                                        "REJECTED"
                                                    )
                                                }
                                                className="h-8 gap-1 border-rose-500/30 text-xs text-rose-600 hover:bg-rose-500/10"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Refuser
                                            </Button>
                                            <Button
                                                size="sm"
                                                disabled={busyAction}
                                                onClick={() =>
                                                    kycModalUser &&
                                                    void handleReviewKyc(
                                                        kycModalUser.id,
                                                        doc.docType,
                                                        "APPROVED"
                                                    )
                                                }
                                                className="h-8 gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Valider
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
