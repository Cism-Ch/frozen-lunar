"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { generateQuotePDF } from "@/lib/pdf-generator";
import { safeFormatDate } from "@/lib/date-utils";
import {
    getClientDashboardAction,
    reorderClientQuoteAction,
    upsertCompanyProfileAction,
    type ClientDashboardDTO,
    type ClientQuoteSummaryDTO,
    type SavedAddressItem,
} from "@/app/actions/client-space-actions";

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

    // Formulaire profil entreprise & adresses
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

    const applyDashboardData = useCallback((data: ClientDashboardDTO) => {
        setDashboard(data);
        if (data.profile) {
            setCompanyName(data.profile.companyName);
            setRccmNumber(data.profile.rccmNumber || "");
            setNccNumber(data.profile.nccNumber || "");
            setPhone(data.profile.phone);
            setDefaultPickup(data.profile.defaultPickup || "");
            setDefaultDropoff(data.profile.defaultDropoff || "");
            setSavedAddresses(data.profile.savedAddresses);
        } else {
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
                companyName,
                rccmNumber,
                nccNumber,
                phone,
                defaultPickup,
                defaultDropoff,
                savedAddresses,
            });
            if (res.error || !res.data) {
                toast.error(
                    res.error || "Impossible d'enregistrer le profil."
                );
                return;
            }
            toast.success("Profil entreprise & adresses enregistrés");
            await loadDashboard();
        } finally {
            setSavingProfile(false);
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
                `Nouvelle commande #${res.data.newQuoteId.slice(0, 8)} créée en 1 clic !`
            );
            await loadDashboard();
        } finally {
            setReorderingId(null);
        }
    };

    const handleDownloadPdf = (q: ClientQuoteSummaryDTO) => {
        generateQuotePDF({
            id: q.id,
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
            status: q.statusLabel as "En attente" | "Validé" | "Refusé",
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
                                <Input
                                    id="c-pass"
                                    type="password"
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
                        <Link href="/#devis">
                            <Plus className="h-4 w-4" />
                            Nouveau devis
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleSignOut}
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

            {/* Onglets : Commandes vs Profil Entreprise */}
            <Tabs defaultValue="quotes" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="quotes" className="min-h-[40px] gap-2">
                        <FileText className="h-4 w-4" />
                        Mes Devis &amp; Suivi ({quotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="min-h-[40px] gap-2">
                        <User className="h-4 w-4" />
                        Profil Entreprise &amp; Adresses
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
                                                <span className="font-mono text-xs font-bold">
                                                    #{q.id.slice(0, 8)}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        q.status === "VALIDATED"
                                                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                                            : q.status ===
                                                                "REJECTED"
                                                              ? "border-destructive/40 bg-destructive/10 text-destructive"
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
                                                    handleReorder(q.id)
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
                                Coordonnées Entreprise &amp; Entrepôts Favoris
                            </CardTitle>
                            <CardDescription>
                                Conservez vos références RCCM/NCC et vos lieux
                                d&apos;enlèvement habituels pour accélérer vos
                                commandes régulières.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSaveProfile}
                                className="space-y-6"
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cp-name">
                                            Raison sociale / Nom *
                                        </Label>
                                        <Input
                                            id="cp-name"
                                            required
                                            value={companyName}
                                            onChange={(e) =>
                                                setCompanyName(e.target.value)
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

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cp-rccm">
                                            Numéro RCCM (optionnel)
                                        </Label>
                                        <Input
                                            id="cp-rccm"
                                            value={rccmNumber}
                                            onChange={(e) =>
                                                setRccmNumber(e.target.value)
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
                                    Enregistrer mon profil entreprise
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
