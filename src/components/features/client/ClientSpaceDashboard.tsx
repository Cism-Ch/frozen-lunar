"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Ban,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    Loader2,
    LogOut,
    MapPin,
    MessageSquare,
    Plus,
    RefreshCw,
    RotateCcw,
    Save,
    ShieldCheck,
    Trash2,
    Truck,
    User,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { safeFormatDate } from "@/lib/date-utils";
import {
    cancelClientQuoteAction,
    getClientDashboardAction,
    reorderClientQuoteAction,
    upsertCompanyProfileAction,
    type ClientDashboardDTO,
    type ClientQuoteSummaryDTO,
    type SavedAddressItem,
} from "@/app/actions/client-space-actions";

const PRESET_CANCELLATION_REASONS = [
    "Changement de date de transport",
    "Projet reporté ou annulé",
    "Erreur dans les informations saisies",
    "Besoin logistique / véhicule modifié",
    "Autre motif (préciser ci-dessous)",
] as const;

export function ClientSpaceDashboard() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [dashboard, setDashboard] = useState<ClientDashboardDTO | null>(null);
    const [loadingData, setLoadingData] = useState(false);

    // Formulaire connexion / inscription B2B
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
    const [authName, setAuthName] = useState("");
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authBusy, setAuthBusy] = useState(false);

    // Formulaire profil Particulier ou Entreprise & adresses
    const [accountType, setAccountType] = useState<"INDIVIDUAL" | "COMPANY">(
        "INDIVIDUAL"
    );
    const [companyName, setCompanyName] = useState("");
    const [rccmNumber, setRccmNumber] = useState("");
    const [nccNumber, setNccNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [defaultPickup, setDefaultPickup] = useState("");
    const [defaultDropoff, setDefaultDropoff] = useState("");
    const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>(
        []
    );
    const [newAddrLabel, setNewAddrLabel] = useState("");
    const [newAddrValue, setNewAddrValue] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [reorderingId, setReorderingId] = useState<string | null>(null);

    // Modales centrées : Annulation, Recommande 1-clic & Déconnexion
    const [cancelTarget, setCancelTarget] =
        useState<ClientQuoteSummaryDTO | null>(null);
    const [selectedCancelPreset, setSelectedCancelPreset] = useState<string>(
        PRESET_CANCELLATION_REASONS[0]
    );
    const [customCancelReason, setCustomCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [reorderTarget, setReorderTarget] =
        useState<ClientQuoteSummaryDTO | null>(null);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"quotes" | "profile">(() => {
        if (typeof window === "undefined") return "quotes";
        return new URLSearchParams(window.location.search).get("tab") ===
            "profile"
            ? "profile"
            : "quotes";
    });

    const applyDashboardData = useCallback((data: ClientDashboardDTO) => {
        setDashboard(data);
        if (data.profile) {
            setAccountType(data.profile.accountType);
            setCompanyName(data.profile.companyName);
            setRccmNumber(data.profile.rccmNumber || "");
            setNccNumber(data.profile.nccNumber || "");
            setPhone(data.profile.phone);
            setDefaultPickup(data.profile.defaultPickup || "");
            setDefaultDropoff(data.profile.defaultDropoff || "");
            setSavedAddresses(data.profile.savedAddresses);
        } else {
            setAccountType("INDIVIDUAL");
            setCompanyName(data.user.name || "");
        }
    }, []);

    const loadDashboard = useCallback(async () => {
        setLoadingData(true);
        try {
            const res = await getClientDashboardAction();
            if (res.data) {
                applyDashboardData(res.data);
            }
        } finally {
            setLoadingData(false);
        }
    }, [applyDashboardData]);

    useEffect(() => {
        if (isPending || !session?.user) return;
        let active = true;
        async function initDashboard() {
            const res = await getClientDashboardAction();
            if (!active) return;
            if (res.data) {
                applyDashboardData(res.data);
            }
        }
        void initDashboard();
        return () => {
            active = false;
        };
    }, [isPending, session?.user, applyDashboardData]);

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthBusy(true);
        try {
            if (authMode === "signin") {
                const res = await authClient.signIn.email({
                    email: authEmail.trim(),
                    password: authPassword,
                });
                if (res.error) {
                    toast.error(
                        res.error.message || "Identifiants incorrects."
                    );
                    return;
                }
                toast.success("Connexion à votre Espace Client réussie");
                await loadDashboard();
            } else {
                const res = await authClient.signUp.email({
                    name: authName.trim() || "Client Entreprise",
                    email: authEmail.trim(),
                    password: authPassword,
                });
                if (res.error) {
                    toast.error(
                        res.error.message ||
                            "Impossible de créer votre compte."
                    );
                    return;
                }
                toast.success("Compte Espace Client créé avec succès !");
                await loadDashboard();
            }
        } catch {
            toast.error("Erreur lors de l'authentification.");
        } finally {
            setAuthBusy(false);
        }
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        setDashboard(null);
        toast.success("Déconnexion réussie");
        router.refresh();
    };

    const handleAddAddress = () => {
        if (newAddrLabel.trim().length < 2 || newAddrValue.trim().length < 5) {
            toast.error("Renseignez un libellé et une adresse complète.");
            return;
        }
        if (savedAddresses.length >= 10) {
            toast.error("Maximum 10 adresses enregistrées.");
            return;
        }
        setSavedAddresses((prev) => [
            ...prev,
            { label: newAddrLabel.trim(), address: newAddrValue.trim() },
        ]);
        setNewAddrLabel("");
        setNewAddrValue("");
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await upsertCompanyProfileAction({
                accountType,
                companyName,
                rccmNumber: accountType === "COMPANY" ? rccmNumber : "",
                nccNumber: accountType === "COMPANY" ? nccNumber : "",
                phone,
                defaultPickup,
                defaultDropoff,
                savedAddresses,
            });
            if (res.error || !res.data) {
                toast.error(
                    res.error || "Impossible d'enregistrer votre profil."
                );
                return;
            }
            toast.success("Profil et adresses favorites enregistrés");
            await loadDashboard();
        } finally {
            setSavingProfile(false);
        }
    };

    const handleConfirmCancelQuote = async () => {
        if (!cancelTarget) return;
        const isOther = selectedCancelPreset.startsWith("Autre");
        const finalReason = isOther
            ? customCancelReason.trim()
            : customCancelReason.trim()
              ? `${selectedCancelPreset} — ${customCancelReason.trim()}`
              : selectedCancelPreset;

        if (finalReason.length < 3) {
            toast.error("Veuillez préciser le motif d'annulation.");
            return;
        }

        setIsCancelling(true);
        try {
            const res = await cancelClientQuoteAction({
                quoteId: cancelTarget.id,
                reason: finalReason,
            });
            if (res.error || !res.data) {
                toast.error(res.error || "Impossible d'annuler ce devis.");
                return;
            }
            toast.success(
                `Devis ${res.data.trackingCode} annulé. Notre équipe a été informée.`
            );
            setCancelTarget(null);
            setCustomCancelReason("");
            await loadDashboard();
        } finally {
            setIsCancelling(false);
        }
    };

    const handleReorder = async (quoteId: string) => {
        setReorderingId(quoteId);
        try {
            const res = await reorderClientQuoteAction(quoteId);
            if (res.error || !res.data) {
                toast.error(res.error || "Impossible de recommander.");
                return;
            }
            toast.success(
                `Nouvelle commande ${res.data.trackingCode} créée en 1 clic !`
            );
            await loadDashboard();
        } finally {
            setReorderingId(null);
            setReorderTarget(null);
        }
    };

    const handleDownloadPdf = async (q: ClientQuoteSummaryDTO) => {
        const { generateQuotePDF } = await import("@/lib/pdf-generator");
        generateQuotePDF({
            id: q.id,
            trackingCode: q.trackingCode,
            date: q.date,
            client: q.clientName,
            email: q.email,
            phone: q.phone,
            type: q.vehicleName
                ? `${q.itemType} (${q.vehicleQuantity}× ${q.vehicleName})`
                : q.itemType,
            pickup: q.pickupLocation,
            dropoff: q.dropoffLocation,
            transportDate: q.transportDate,
            status: q.statusLabel as
                | "En attente"
                | "Validé"
                | "Refusé"
                | "Annulé",
            amount: q.amount,
            userNotes: q.userNotes || undefined,
            source: "form",
            history: [],
        });
        toast.success("Téléchargement du PDF lancé");
    };

    if (isPending) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    // Vue non connectée : Portail Connexion / Inscription Entreprise
    if (!session?.user) {
        return (
            <div className="mx-auto max-w-xl space-y-6">
                <div className="space-y-2 text-center">
                    <Badge variant="outline" className="gap-1.5">
                        <ShieldCheck className="text-primary h-3.5 w-3.5" />
                        Espace Client &amp; Entreprise • HBC Logistique CI
                    </Badge>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Gérez vos transports et échangez en direct
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Retrouvez l&apos;historique de vos devis, téléchargez vos
                        PDF, enregistrez vos entrepôts favoris et discutez avec
                        notre IA et nos validateurs humains.
                    </p>
                </div>

                <Card className="shadow-xl">
                    <CardHeader>
                        <Tabs
                            value={authMode}
                            onValueChange={(val) =>
                                setAuthMode(val as "signin" | "signup")
                            }
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="signin">
                                    Connexion
                                </TabsTrigger>
                                <TabsTrigger value="signup">
                                    Créer un compte client
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            {authMode === "signup" && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="c-name">
                                        Nom ou Raison sociale
                                    </Label>
                                    <Input
                                        id="c-name"
                                        required
                                        value={authName}
                                        onChange={(e) =>
                                            setAuthName(e.target.value)
                                        }
                                        placeholder="Ex: SOGB Côte d'Ivoire / Jean Kouamé"
                                        className="min-h-[44px]"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="c-email">
                                    Adresse email professionnelle
                                </Label>
                                <Input
                                    id="c-email"
                                    type="email"
                                    required
                                    value={authEmail}
                                    onChange={(e) =>
                                        setAuthEmail(e.target.value)
                                    }
                                    placeholder="logistique@entreprise.ci"
                                    className="min-h-[44px]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c-pass">Mot de passe</Label>
                                <PasswordInput
                                    id="c-pass"
                                    required
                                    minLength={8}
                                    value={authPassword}
                                    onChange={(e) =>
                                        setAuthPassword(e.target.value)
                                    }
                                    placeholder="8 caractères minimum"
                                    className="min-h-[44px]"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={authBusy}
                                className="min-h-[44px] w-full gap-2"
                            >
                                {authBusy && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {authMode === "signin"
                                    ? "Accéder à mon Espace Client"
                                    : "Créer mon Espace Client"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const quotes = dashboard?.quotes ?? [];

    return (
        <div className="space-y-8">
            {/* En-tête Client Connecté */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Building2 className="text-primary h-5 w-5" />
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Espace Client —{" "}
                            {dashboard?.profile?.companyName ||
                                session.user.name}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Connecté en tant que{" "}
                        <span className="font-mono font-medium">
                            {session.user.email}
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => void loadDashboard()}
                        disabled={loadingData}
                        className="min-h-[44px] gap-2"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`}
                        />
                        Actualiser
                    </Button>
                    <Button asChild className="min-h-[44px] gap-2">
                        <Link href="/devis">
                            <Plus className="h-4 w-4" />
                            Nouveau devis
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setLogoutConfirmOpen(true)}
                        className="min-h-[44px] gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </div>
            </div>

            {/* KPIs Client */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Total Dossiers
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {quotes.length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            En étude
                        </p>
                        <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {
                                quotes.filter((q) => q.status === "PENDING")
                                    .length
                            }
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Validés
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {
                                quotes.filter((q) => q.status === "VALIDATED")
                                    .length
                            }
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Adresses favorites
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {savedAddresses.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Onglets : Commandes vs Mon Profil & Adresses */}
            <Tabs
                value={activeTab}
                onValueChange={(v) =>
                    setActiveTab(v === "profile" ? "profile" : "quotes")
                }
                className="space-y-6"
            >
                <TabsList>
                    <TabsTrigger value="quotes" className="min-h-[40px] gap-2">
                        <FileText className="h-4 w-4" />
                        Mes Devis &amp; Suivi ({quotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="min-h-[40px] gap-2">
                        <User className="h-4 w-4" />
                        Mon Profil &amp; Adresses
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="quotes" className="space-y-4">
                    {quotes.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                                <Truck className="text-muted-foreground h-10 w-10" />
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        Aucun devis rattaché à votre compte
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Vos demandes créées avec l&apos;email{" "}
                                        <strong>{session.user.email}</strong>{" "}
                                        apparaissent automatiquement ici.
                                    </p>
                                </div>
                                <Button asChild className="min-h-[44px]">
                                    <Link href="/#devis">
                                        Configurer mon premier transport
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {quotes.map((q) => (
                                <Card key={q.id}>
                                    <CardContent className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="bg-muted rounded px-2 py-0.5 font-mono text-xs font-bold">
                                                    {q.trackingCode}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        q.status === "VALIDATED"
                                                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                                            : q.status ===
                                                                "REJECTED"
                                                              ? "border-destructive/40 bg-destructive/10 text-destructive"
                                                              : q.status ===
                                                                  "CANCELLED"
                                                                ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                                                                : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                                    }
                                                >
                                                    {q.status ===
                                                        "VALIDATED" && (
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    )}
                                                    {q.status ===
                                                        "REJECTED" && (
                                                        <XCircle className="mr-1 h-3 w-3" />
                                                    )}
                                                    {q.status ===
                                                        "CANCELLED" && (
                                                        <Ban className="mr-1 h-3 w-3" />
                                                    )}
                                                    {q.status === "PENDING" && (
                                                        <Clock className="mr-1 h-3 w-3" />
                                                    )}
                                                    {q.statusLabel}
                                                </Badge>
                                                {q.vehicleName && (
                                                    <Badge variant="secondary">
                                                        {q.vehicleQuantity}×{" "}
                                                        {q.vehicleName}
                                                    </Badge>
                                                )}
                                                {q.threadStatus ===
                                                    "HUMAN_TAKEOVER" && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-primary/40 bg-primary/10 text-primary"
                                                    >
                                                        Validateur en ligne
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-base font-semibold">
                                                {q.itemType} —{" "}
                                                <span className="text-primary">
                                                    {q.amount}
                                                </span>
                                            </p>

                                            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {q.pickupLocation} →{" "}
                                                    {q.dropoffLocation}
                                                </span>
                                                <span>•</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Transport :{" "}
                                                    {safeFormatDate(
                                                        q.transportDate
                                                    )}
                                                </span>
                                            </div>
                                            {q.status === "CANCELLED" &&
                                                q.cancellationReason && (
                                                    <p className="text-destructive/90 text-xs">
                                                        <strong>
                                                            Motif d&apos;annulation
                                                            :
                                                        </strong>{" "}
                                                        {q.cancellationReason}
                                                    </p>
                                                )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                asChild
                                                size="sm"
                                                className="min-h-[40px] gap-1.5"
                                            >
                                                <Link
                                                    href={`/espace-client/quotes/${q.id}`}
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    Suivi &amp; Chat Direct
                                                </Link>
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleDownloadPdf(q)
                                                }
                                                className="min-h-[40px] gap-1.5"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                PDF
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                disabled={
                                                    reorderingId === q.id
                                                }
                                                onClick={() =>
                                                    setReorderTarget(q)
                                                }
                                                className="min-h-[40px] gap-1.5"
                                            >
                                                {reorderingId === q.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                )}
                                                Recommander (1-Clic)
                                            </Button>

                                            {(q.status === "PENDING" ||
                                                q.status === "VALIDATED") && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCancelTarget(q);
                                                        setSelectedCancelPreset(
                                                            PRESET_CANCELLATION_REASONS[0]
                                                        );
                                                        setCustomCancelReason(
                                                            ""
                                                        );
                                                    }}
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive min-h-[40px] gap-1.5"
                                                >
                                                    <Ban className="h-3.5 w-3.5" />
                                                    Annuler
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Mon Profil &amp; Adresses Favorites
                            </CardTitle>
                            <CardDescription>
                                Choisissez votre type de compte (Particulier ou
                                Entreprise) pour pré-remplir automatiquement vos
                                prochaines demandes de devis.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSaveProfile}
                                className="space-y-6"
                            >
                                {/* Sélecteur Particulier vs Entreprise */}
                                <div className="space-y-2">
                                    <Label>Type de compte *</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAccountType("INDIVIDUAL")
                                            }
                                            className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                                                accountType === "INDIVIDUAL"
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border hover:border-primary/40"
                                            }`}
                                        >
                                            <User className="h-4 w-4" />
                                            Particulier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAccountType("COMPANY")
                                            }
                                            className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                                                accountType === "COMPANY"
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border hover:border-primary/40"
                                            }`}
                                        >
                                            <Building2 className="h-4 w-4" />
                                            Entreprise
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cp-name">
                                            {accountType === "COMPANY"
                                                ? "Raison sociale de l'entreprise *"
                                                : "Nom et Prénoms *"}
                                        </Label>
                                        <Input
                                            id="cp-name"
                                            required
                                            value={companyName}
                                            onChange={(e) =>
                                                setCompanyName(e.target.value)
                                            }
                                            placeholder={
                                                accountType === "COMPANY"
                                                    ? "Ex: Ivoire Construction SARL"
                                                    : "Ex: Kouamé Jean-Baptiste"
                                            }
                                            className="min-h-[44px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cp-phone">
                                            Téléphone principal (+225) *
                                        </Label>
                                        <Input
                                            id="cp-phone"
                                            required
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            placeholder="+225 07 00 00 00 00"
                                            className="min-h-[44px]"
                                        />
                                    </div>
                                </div>

                                {accountType === "COMPANY" && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cp-rccm">
                                                Numéro RCCM (optionnel)
                                            </Label>
                                            <Input
                                                id="cp-rccm"
                                                value={rccmNumber}
                                                onChange={(e) =>
                                                    setRccmNumber(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="CI-ABJ-03-..."
                                                className="min-h-[44px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cp-ncc">
                                                N° Compte Contribuable NCC
                                                (optionnel)
                                            </Label>
                                            <Input
                                                id="cp-ncc"
                                                value={nccNumber}
                                                onChange={(e) =>
                                                    setNccNumber(e.target.value)
                                                }
                                                placeholder="Ex: 2401589-K"
                                                className="min-h-[44px]"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cp-pickup">
                                            Lieu d&apos;enlèvement par défaut
                                        </Label>
                                        <Input
                                            id="cp-pickup"
                                            value={defaultPickup}
                                            onChange={(e) =>
                                                setDefaultPickup(e.target.value)
                                            }
                                            placeholder="Ex: Zone Industrielle Yopougon, Abidjan"
                                            className="min-h-[44px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cp-dropoff">
                                            Lieu de livraison par défaut
                                        </Label>
                                        <Input
                                            id="cp-dropoff"
                                            value={defaultDropoff}
                                            onChange={(e) =>
                                                setDefaultDropoff(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ex: Port Autonome de San-Pédro"
                                            className="min-h-[44px]"
                                        />
                                    </div>
                                </div>

                                {/* Carnet d'adresses */}
                                <div className="bg-muted/30 space-y-3 rounded-xl border p-4">
                                    <p className="text-sm font-semibold">
                                        Carnet de sites &amp; chantiers
                                        enregistrés
                                    </p>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Input
                                            value={newAddrLabel}
                                            onChange={(e) =>
                                                setNewAddrLabel(e.target.value)
                                            }
                                            placeholder="Libellé (ex: Dépôt Vridi)"
                                            className="min-h-[42px] sm:w-48"
                                        />
                                        <Input
                                            value={newAddrValue}
                                            onChange={(e) =>
                                                setNewAddrValue(e.target.value)
                                            }
                                            placeholder="Adresse complète"
                                            className="min-h-[42px] flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleAddAddress}
                                            className="min-h-[42px] gap-1.5"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Ajouter
                                        </Button>
                                    </div>

                                    {savedAddresses.length > 0 && (
                                        <ul className="space-y-2 pt-2">
                                            {savedAddresses.map((addr, idx) => (
                                                <li
                                                    key={`${addr.label}-${idx}`}
                                                    className="bg-background flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                                                >
                                                    <span>
                                                        <strong>
                                                            {addr.label} :
                                                        </strong>{" "}
                                                        {addr.address}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setSavedAddresses(
                                                                (prev) =>
                                                                    prev.filter(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) =>
                                                                            i !==
                                                                            idx
                                                                    )
                                                            )
                                                        }
                                                        className="text-destructive h-7 w-7"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="min-h-[44px] gap-2"
                                >
                                    {savingProfile ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Enregistrer mon profil
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modale centrée d'annulation de devis avec motifs présélectionnés ou libre */}
            <Dialog
                open={!!cancelTarget}
                onOpenChange={(open) => {
                    if (!open) setCancelTarget(null);
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Ban className="text-destructive h-5 w-5" />
                            Annuler le devis {cancelTarget?.trackingCode} ?
                        </DialogTitle>
                        <DialogDescription>
                            Indiquez le motif de votre annulation afin
                            d&apos;informer notre équipe d&apos;exploitation et
                            d&apos;améliorer notre suivi.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Sélectionnez un motif</Label>
                            <div className="grid gap-2">
                                {PRESET_CANCELLATION_REASONS.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() =>
                                            setSelectedCancelPreset(preset)
                                        }
                                        className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-all ${
                                            selectedCancelPreset === preset
                                                ? "border-destructive bg-destructive/10 text-destructive"
                                                : "border-border hover:border-destructive/40"
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cancel-custom-reason">
                                Précision complémentaire{" "}
                                {selectedCancelPreset.startsWith("Autre")
                                    ? "*"
                                    : "(optionnel)"}
                            </Label>
                            <Textarea
                                id="cancel-custom-reason"
                                rows={3}
                                value={customCancelReason}
                                onChange={(e) =>
                                    setCustomCancelReason(e.target.value)
                                }
                                placeholder="Ex: Nous décalons la livraison à la semaine prochaine..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCancelTarget(null)}
                            disabled={isCancelling}
                        >
                            Conserver le devis
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmCancelQuote}
                            disabled={isCancelling}
                            className="gap-2"
                        >
                            {isCancelling && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Confirmer l&apos;annulation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modale centrée de confirmation Recommande 1-Clic */}
            <ConfirmDialog
                open={!!reorderTarget}
                onOpenChange={(open) => {
                    if (!open) setReorderTarget(null);
                }}
                title={`Recommander le transport ${reorderTarget?.trackingCode || ""} ?`}
                description={
                    reorderTarget
                        ? `Un nouveau devis identique (${reorderTarget.itemType} : ${reorderTarget.pickupLocation} → ${reorderTarget.dropoffLocation}) sera créé immédiatement pour dans 48h.`
                        : ""
                }
                confirmLabel="Confirmer la commande"
                onConfirm={() => {
                    if (reorderTarget) {
                        void handleReorder(reorderTarget.id);
                    }
                }}
            />

            {/* Modale centrée de confirmation Déconnexion */}
            <ConfirmDialog
                open={logoutConfirmOpen}
                onOpenChange={setLogoutConfirmOpen}
                title="Se déconnecter de l'Espace Client ?"
                description="Vous devrez saisir votre email et mot de passe pour accéder à nouveau à vos devis et discussions."
                confirmLabel="Se déconnecter"
                variant="destructive"
                onConfirm={() => {
                    setLogoutConfirmOpen(false);
                    void handleSignOut();
                }}
            />
        </div>
    );
}
