"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Bell,
    Lock,
    User,
    Building,
    Save,
    MessageCircle,
    Sparkles,
    Loader2,
    CheckCircle2,
    ShieldAlert,
    HelpCircle,
    ShieldCheck,
    History,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { FadeIn, AnimatedCard, motion } from "@/components/ui/motion";
import {
    AdminSettingsData,
    updateAdminProfileAction,
    updateCompanySettingsAction,
    updateWhatsAppSettingsAction,
    updateNotificationSettingsAction,
    changeAdminPasswordAction,
} from "@/app/actions/settings-actions";

interface SettingsClientProps {
    initialData: AdminSettingsData;
}

export function SettingsClient({ initialData }: SettingsClientProps) {
    const searchParams = useSearchParams();
    const rawTab = searchParams.get("tab");
    const initialTab =
        rawTab === "notifications" ||
        rawTab === "whatsapp" ||
        rawTab === "company" ||
        rawTab === "security"
            ? rawTab
            : "general";
    const [activeTab, setActiveTab] = useState(initialTab);

    // 1. Profil Administrateur (Général)
    const [profileName, setProfileName] = useState(initialData.admin.name);
    const [profileEmail, setProfileEmail] = useState(initialData.admin.email);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // 2. Notifications
    const [notifyNewQuote, setNotifyNewQuote] = useState(
        initialData.settings.notifyNewQuoteEmail
    );
    const [notifyWeekly, setNotifyWeekly] = useState(
        initialData.settings.notifyWeeklyReport
    );
    const [notifySystem, setNotifySystem] = useState(
        initialData.settings.notifySystemUpdates
    );
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);

    // 3. WhatsApp & IA
    const [waNumber, setWaNumber] = useState(
        initialData.settings.whatsappNumber
    );
    const [waTemplate, setWaTemplate] = useState(
        initialData.settings.whatsappTemplate
    );
    const [waAiAutoGenerate, setWaAiAutoGenerate] = useState(
        initialData.settings.whatsappAiAutoGenerate
    );
    const [waAutoAuditLog, setWaAutoAuditLog] = useState(
        initialData.settings.whatsappAutoAuditLog
    );
    const [waCrossSearch, setWaCrossSearch] = useState(
        initialData.settings.whatsappCrossSearchPhone
    );
    const [isSavingWhatsApp, setIsSavingWhatsApp] = useState(false);

    // 4. Entreprise
    const [companyName, setCompanyName] = useState(
        initialData.settings.companyName
    );
    const [address, setAddress] = useState(initialData.settings.address);
    const [siret, setSiret] = useState(initialData.settings.siret);
    const [vatNumber, setVatNumber] = useState(initialData.settings.vatNumber);
    const [contactEmail, setContactEmail] = useState(
        initialData.settings.contactEmail
    );
    const [contactPhone, setContactPhone] = useState(
        initialData.settings.contactPhone
    );
    const [isSavingCompany, setIsSavingCompany] = useState(false);

    // 5. Sécurité (Changement de mot de passe)
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordDialogOpen, setConfirmPasswordDialogOpen] =
        useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Handlers
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const res = await updateAdminProfileAction({
                name: profileName,
                email: profileEmail,
            });

            if (res.error) {
                toast.error(res.error);
            } else if (res.data) {
                toast.success("Profil administrateur mis à jour avec succès !");
                setProfileName(res.data.name);
                setProfileEmail(res.data.email);
            }
        } catch {
            toast.error("Erreur de connexion lors de la sauvegarde du profil.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSaveNotifications = async () => {
        setIsSavingNotifications(true);
        try {
            const res = await updateNotificationSettingsAction({
                notifyNewQuoteEmail: notifyNewQuote,
                notifyWeeklyReport: notifyWeekly,
                notifySystemUpdates: notifySystem,
            });

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(
                    "Préférences de notification enregistrées avec succès !"
                );
            }
        } catch {
            toast.error(
                "Erreur de connexion lors de la sauvegarde des notifications."
            );
        } finally {
            setIsSavingNotifications(false);
        }
    };

    const handleSaveWhatsApp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingWhatsApp(true);
        try {
            const res = await updateWhatsAppSettingsAction({
                whatsappNumber: waNumber,
                hfModel: initialData.settings.hfModel || "gemini-2.5-flash",
                whatsappTemplate: waTemplate,
                whatsappAiAutoGenerate: waAiAutoGenerate,
                whatsappAutoAuditLog: waAutoAuditLog,
                whatsappCrossSearchPhone: waCrossSearch,
            });

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(
                    "Configuration WhatsApp & IA enregistrée avec succès !"
                );
            }
        } catch {
            toast.error("Erreur de connexion lors de la sauvegarde WhatsApp.");
        } finally {
            setIsSavingWhatsApp(false);
        }
    };

    const handleSaveCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingCompany(true);
        try {
            const res = await updateCompanySettingsAction({
                companyName,
                address,
                siret,
                vatNumber,
                contactEmail,
                contactPhone,
            });

            if (res.error) {
                toast.error(res.error);
            } else if (res.data) {
                toast.success(
                    "Informations de l'entreprise enregistrées avec succès !"
                );
                setCompanyName(res.data.companyName);
                setAddress(res.data.address);
                setSiret(res.data.siret);
                setVatNumber(res.data.vatNumber);
                setContactEmail(res.data.contactEmail);
                setContactPhone(res.data.contactPhone);
            }
        } catch {
            toast.error(
                "Erreur de connexion lors de la sauvegarde entreprise."
            );
        } finally {
            setIsSavingCompany(false);
        }
    };

    const handlePasswordFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error("Veuillez renseigner votre mot de passe actuel.");
            return;
        }

        if (newPassword.length < 12) {
            toast.error(
                "Le nouveau mot de passe doit comporter au moins 12 caractères pour un administrateur."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(
                "Les deux nouveaux mots de passe ne correspondent pas."
            );
            return;
        }

        setConfirmPasswordDialogOpen(true);
    };

    const executeChangePassword = async () => {
        setIsChangingPassword(true);
        try {
            const res = await changeAdminPasswordAction({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (res.error) {
                toast.error(res.error);
            } else if (res.data) {
                toast.success(res.data.message);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setConfirmPasswordDialogOpen(false);
            }
        } catch {
            toast.error(
                "Erreur inattendue lors de la mise à jour du mot de passe."
            );
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <FadeIn direction="down">
                <div className="from-card via-card to-primary/5 flex flex-col justify-between gap-4 rounded-2xl border bg-linear-to-r p-6 shadow-xs sm:flex-row sm:items-center">
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="gap-1 bg-[#001F3D] text-white">
                                <ShieldCheck className="h-3 w-3 text-[#FF7C24]" />
                                Console Configuration
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="gap-1.5 font-mono text-[11px]"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Synchronisé PostgreSQL
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Paramètres &amp; Préférences
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Pilotez votre compte, les alertes en temps réel,
                            WhatsApp/IA et la sécurité de la plateforme.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[40px] w-fit gap-1.5"
                        asChild
                    >
                        <Link href="/admin/changelog">
                            <History className="text-primary h-4 w-4" />
                            Voir le Changelog
                            <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                        </Link>
                    </Button>
                </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-5"
                >
                    <div className="relative w-full">
                        <TabsList className="no-scrollbar bg-muted/60 flex h-auto w-full items-center justify-start gap-1.5 overflow-x-auto rounded-xl border p-1.5 scroll-smooth sm:inline-flex sm:w-auto">
                            <TabsTrigger
                                value="general"
                                className="data-[state=active]:bg-background data-[state=active]:text-primary inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm"
                            >
                                <User className="h-4 w-4 shrink-0" />
                                <span>Général</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                className="data-[state=active]:bg-background data-[state=active]:text-primary inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm"
                            >
                                <Bell className="h-4 w-4 shrink-0" />
                                <span>Notifications</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="whatsapp"
                                className="data-[state=active]:bg-background data-[state=active]:text-primary inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm"
                            >
                                <MessageCircle className="h-4 w-4 shrink-0" />
                                <span>WhatsApp &amp; IA</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="company"
                                className="data-[state=active]:bg-background data-[state=active]:text-primary inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm"
                            >
                                <Building className="h-4 w-4 shrink-0" />
                                <span>Entreprise</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="data-[state=active]:bg-background data-[state=active]:text-primary inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm"
                            >
                                <Lock className="h-4 w-4 shrink-0" />
                                <span>Sécurité</span>
                            </TabsTrigger>
                        </TabsList>
                        <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 w-6 bg-linear-to-l to-transparent sm:hidden" />
                    </div>

                    {/* 1. ONGLET GÉNÉRAL */}
                    <TabsContent value="general">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <form onSubmit={handleSaveProfile}>
                                    <CardHeader>
                                        <CardTitle>
                                            Profil Administrateur
                                        </CardTitle>
                                        <CardDescription>
                                            Modifiez vos informations
                                            personnelles et votre adresse email
                                            de connexion.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Label htmlFor="name">
                                                Nom d&apos;affichage
                                            </Label>
                                            <Input
                                                id="name"
                                                value={profileName}
                                                onChange={(e) =>
                                                    setProfileName(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Ex: Administrateur Principal"
                                                required
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileEmail}
                                                onChange={(e) =>
                                                    setProfileEmail(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="admin@hbclogistique.com"
                                                required
                                            />
                                        </motion.div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            disabled={isSavingProfile}
                                            className="w-full gap-2 sm:w-auto"
                                        >
                                            {isSavingProfile ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Enregistrer le profil
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>

                    {/* 2. ONGLET NOTIFICATIONS */}
                    <TabsContent value="notifications">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Préférences de Notifications
                                    </CardTitle>
                                    <CardDescription>
                                        Choisissez comment les administrateurs
                                        et l&apos;équipe sont alertés des
                                        activités de la plateforme.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <motion.div
                                        className="bg-muted/20 hover:border-primary/40 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Label
                                                    htmlFor="notify-quote"
                                                    className="cursor-pointer text-sm font-semibold sm:text-base"
                                                >
                                                    Nouvelles demandes de devis
                                                </Label>
                                                <Badge
                                                    variant={
                                                        notifyNewQuote
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className={
                                                        notifyNewQuote
                                                            ? "bg-emerald-600 text-[10px] text-white"
                                                            : "text-[10px]"
                                                    }
                                                >
                                                    {notifyNewQuote
                                                        ? "Actif"
                                                        : "Désactivé"}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground text-xs sm:text-sm">
                                                Déclenche l&apos;email d&apos;alerte
                                                administrateur dès qu&apos;un client
                                                soumet un nouveau devis.
                                            </p>
                                        </div>
                                        <Switch
                                            id="notify-quote"
                                            checked={notifyNewQuote}
                                            onCheckedChange={setNotifyNewQuote}
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="bg-muted/20 hover:border-primary/40 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Label
                                                    htmlFor="notify-weekly"
                                                    className="cursor-pointer text-sm font-semibold sm:text-base"
                                                >
                                                    Rapport d&apos;activité
                                                    hebdomadaire
                                                </Label>
                                                <Badge
                                                    variant={
                                                        notifyWeekly
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className={
                                                        notifyWeekly
                                                            ? "bg-emerald-600 text-[10px] text-white"
                                                            : "text-[10px]"
                                                    }
                                                >
                                                    {notifyWeekly
                                                        ? "Actif"
                                                        : "Désactivé"}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground text-xs sm:text-sm">
                                                Préférence pour le résumé
                                                consolidé des statistiques
                                                hebdomadaires.
                                            </p>
                                        </div>
                                        <Switch
                                            id="notify-weekly"
                                            checked={notifyWeekly}
                                            onCheckedChange={setNotifyWeekly}
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="bg-muted/20 hover:border-primary/40 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Label
                                                    htmlFor="notify-system"
                                                    className="cursor-pointer text-sm font-semibold sm:text-base"
                                                >
                                                    Mises à jour système,
                                                    What&apos;s New &amp;
                                                    alertes uptime
                                                </Label>
                                                <Badge
                                                    variant={
                                                        notifySystem
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className={
                                                        notifySystem
                                                            ? "bg-emerald-600 text-[10px] text-white"
                                                            : "text-[10px]"
                                                    }
                                                >
                                                    {notifySystem
                                                        ? "Actif"
                                                        : "Désactivé"}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground text-xs sm:text-sm">
                                                Contrôle le badge{" "}
                                                <span className="font-semibold">
                                                    « ! » What&apos;s New
                                                </span>{" "}
                                                dans l&apos;en-tête, la modale
                                                de nouveautés du changelog et
                                                les alertes critiques Uptime.
                                            </p>
                                        </div>
                                        <Switch
                                            id="notify-system"
                                            checked={notifySystem}
                                            onCheckedChange={setNotifySystem}
                                        />
                                    </motion.div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handleSaveNotifications}
                                        disabled={isSavingNotifications}
                                        className="w-full gap-2 sm:w-auto"
                                    >
                                        {isSavingNotifications ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Enregistrer les préférences
                                    </Button>
                                </CardFooter>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>

                    {/* 3. ONGLET WHATSAPP & IA */}
                    <TabsContent value="whatsapp">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <form onSubmit={handleSaveWhatsApp}>
                                    <CardHeader>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <MessageCircle className="h-5 w-5 text-emerald-500" />
                                                    WhatsApp &amp; Assistant IA
                                                </CardTitle>
                                                <CardDescription>
                                                    Configurez
                                                    l&apos;automatisation
                                                    Click-to-Chat et les
                                                    messages pré-remplis par
                                                    notre moteur IA (Gemini 2.5
                                                    / OpenRouter).
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                >
                                                    100% Gratuit (wa.me)
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="border-primary/30 bg-primary/10 text-primary"
                                                >
                                                    <Sparkles className="mr-1 h-3 w-3" />{" "}
                                                    Gemini 2.5 / OpenRouter
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Label htmlFor="whatsappNumber">
                                                Numéro WhatsApp Commercial /
                                                Support
                                            </Label>
                                            <Input
                                                id="whatsappNumber"
                                                value={waNumber}
                                                onChange={(e) =>
                                                    setWaNumber(e.target.value)
                                                }
                                                placeholder="+225 07 00 00 00 00"
                                                required
                                            />
                                            <p className="text-muted-foreground text-xs">
                                                Numéro d&apos;entreprise visible
                                                par les clients pour les
                                                échanges directs sur smartphone.
                                            </p>
                                        </motion.div>

                                        <div className="bg-muted/30 flex items-center justify-between gap-3 rounded-xl border p-3.5 text-xs">
                                            <div className="space-y-0.5">
                                                <p className="text-foreground font-semibold">
                                                    Moteur IA de production
                                                    actif
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Cascade automatique : Gemini
                                                    3.1 / 3.5 Flash → OpenRouter
                                                    → Template déterministe
                                                    ci-dessous.
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0 font-mono text-[11px]"
                                            >
                                                Production Ready
                                            </Badge>
                                        </div>

                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Label htmlFor="whatsappTemplate">
                                                Template de message standard
                                                (Fallback déterministe)
                                            </Label>
                                            <Textarea
                                                id="whatsappTemplate"
                                                rows={3}
                                                value={waTemplate}
                                                onChange={(e) =>
                                                    setWaTemplate(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                                                <span>
                                                    Variables dynamiques :
                                                </span>
                                                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono">
                                                    &#123;client&#125;
                                                </code>
                                                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono">
                                                    &#123;id&#125;
                                                </code>
                                                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono">
                                                    &#123;type&#125;
                                                </code>
                                                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono">
                                                    &#123;pickup&#125;
                                                </code>
                                                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono">
                                                    &#123;dropoff&#125;
                                                </code>
                                            </div>
                                        </motion.div>

                                        <div className="space-y-3 pt-2">
                                            <h4 className="text-sm font-semibold">
                                                Options d&apos;automatisation
                                            </h4>
                                            <div className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <Label
                                                        htmlFor="wa-ai"
                                                        className="cursor-pointer text-sm font-medium"
                                                    >
                                                        Génération IA 1-Clic des
                                                        relances WhatsApp
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Prépare automatiquement
                                                        le message de relance
                                                        personnalisé selon les
                                                        spécificités du devis.
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="wa-ai"
                                                    checked={waAiAutoGenerate}
                                                    onCheckedChange={
                                                        setWaAiAutoGenerate
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <Label
                                                        htmlFor="wa-audit"
                                                        className="cursor-pointer text-sm font-medium"
                                                    >
                                                        Historique automatique
                                                        des échanges
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Consigne une entrée dans
                                                        le journal d&apos;audit
                                                        du devis à chaque
                                                        ouverture de lien
                                                        WhatsApp.
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="wa-audit"
                                                    checked={waAutoAuditLog}
                                                    onCheckedChange={
                                                        setWaAutoAuditLog
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <Label
                                                        htmlFor="wa-search"
                                                        className="cursor-pointer text-sm font-medium"
                                                    >
                                                        Recherche croisée par
                                                        numéro de téléphone
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Associe et affiche tous
                                                        les devis d&apos;un même
                                                        client lors de la
                                                        consultation d&apos;un
                                                        dossier.
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="wa-search"
                                                    checked={waCrossSearch}
                                                    onCheckedChange={
                                                        setWaCrossSearch
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            disabled={isSavingWhatsApp}
                                            className="w-full gap-2 sm:w-auto"
                                        >
                                            {isSavingWhatsApp ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Enregistrer les paramètres WhatsApp
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>

                    {/* 4. ONGLET ENTREPRISE */}
                    <TabsContent value="company">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <form onSubmit={handleSaveCompany}>
                                    <CardHeader>
                                        <CardTitle>
                                            Informations Entreprise
                                        </CardTitle>
                                        <CardDescription>
                                            Ces informations légales sont
                                            synchronisées et figurent sur les
                                            devis générés et les factures.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Label htmlFor="companyName">
                                                Nom de l&apos;entreprise
                                            </Label>
                                            <Input
                                                id="companyName"
                                                value={companyName}
                                                onChange={(e) =>
                                                    setCompanyName(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Label htmlFor="address">
                                                Adresse du siège social
                                            </Label>
                                            <Input
                                                id="address"
                                                value={address}
                                                onChange={(e) =>
                                                    setAddress(e.target.value)
                                                }
                                                required
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <div className="grid gap-2">
                                                <Label htmlFor="siret">
                                                    Numéro RCCM
                                                </Label>
                                                <Input
                                                    id="siret"
                                                    value={siret}
                                                    onChange={(e) =>
                                                        setSiret(e.target.value)
                                                    }
                                                    placeholder="Ex: CI-ABJ-03-2026-B12-00001"
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="tva">
                                                    NCC (Numéro Compte
                                                    Contribuable)
                                                </Label>
                                                <Input
                                                    id="tva"
                                                    value={vatNumber}
                                                    onChange={(e) =>
                                                        setVatNumber(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Ex: 2600001-A"
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="contactEmail">
                                                    Email commercial public
                                                </Label>
                                                <Input
                                                    id="contactEmail"
                                                    type="email"
                                                    value={contactEmail}
                                                    onChange={(e) =>
                                                        setContactEmail(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="contact@hbclogistique.com"
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="contactPhone">
                                                    Téléphone commercial
                                                </Label>
                                                <Input
                                                    id="contactPhone"
                                                    value={contactPhone}
                                                    onChange={(e) =>
                                                        setContactPhone(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="+225 07 00 00 00 00"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            disabled={isSavingCompany}
                                            className="w-full gap-2 sm:w-auto"
                                        >
                                            {isSavingCompany ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Enregistrer les coordonnées
                                            entreprise
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>

                    {/* 5. ONGLET SÉCURITÉ */}
                    <TabsContent value="security">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <form onSubmit={handlePasswordFormSubmit}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>
                                                    Sécurité & Mot de Passe
                                                </CardTitle>
                                                <CardDescription>
                                                    Modifiez le mot de passe de
                                                    votre compte Administrateur
                                                    avec vérification
                                                    cryptographique.
                                                </CardDescription>
                                            </div>
                                            <ShieldAlert className="h-5 w-5 text-amber-500" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted/30 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-xs">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                <span className="font-semibold">
                                                    Session active :{" "}
                                                    {initialData.admin.email}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="font-mono text-[11px] uppercase"
                                            >
                                                Rôle : {initialData.admin.role}
                                            </Badge>
                                        </div>

                                        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                                            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                            <div>
                                                <p className="font-semibold">
                                                    Exigences de sécurité
                                                    Administrateur :
                                                </p>
                                                <p>
                                                    Le mot de passe doit
                                                    comporter au moins{" "}
                                                    <strong>
                                                        12 caractères
                                                    </strong>{" "}
                                                    et requiert la saisie de
                                                    votre mot de passe actuel.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="current">
                                                Mot de passe actuel
                                            </Label>
                                            <PasswordInput
                                                id="current"
                                                value={currentPassword}
                                                onChange={(e) =>
                                                    setCurrentPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Entrez votre mot de passe actuel"
                                                required
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="new">
                                                Nouveau mot de passe (min. 12
                                                car.)
                                            </Label>
                                            <PasswordInput
                                                id="new"
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Au moins 12 caractères"
                                                required
                                            />
                                            {newPassword && (
                                                <div className="text-xs">
                                                    {newPassword.length >=
                                                    12 ? (
                                                        <span className="flex items-center gap-1 font-medium text-emerald-600">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                                                            Longueur conforme (
                                                            {newPassword.length}{" "}
                                                            caractères)
                                                        </span>
                                                    ) : (
                                                        <span className="font-medium text-amber-600">
                                                            {12 -
                                                                newPassword.length}{" "}
                                                            caractère(s)
                                                            manquant(s) pour le
                                                            seuil admin
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="confirm">
                                                Confirmer le nouveau mot de
                                                passe
                                            </Label>
                                            <PasswordInput
                                                id="confirm"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Confirmez le nouveau mot de passe"
                                                required
                                            />
                                            {confirmPassword &&
                                                newPassword !==
                                                    confirmPassword && (
                                                    <p className="text-destructive text-xs font-medium">
                                                        Les mots de passe ne
                                                        correspondent pas.
                                                    </p>
                                                )}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            disabled={
                                                isChangingPassword ||
                                                !currentPassword ||
                                                newPassword.length < 12 ||
                                                newPassword !== confirmPassword
                                            }
                                            className="w-full gap-2 sm:w-auto"
                                        >
                                            {isChangingPassword ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Mettre à jour le mot de passe
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>
                </Tabs>
            </FadeIn>

            <ConfirmDialog
                open={confirmPasswordDialogOpen}
                onOpenChange={setConfirmPasswordDialogOpen}
                title="Confirmer le changement de mot de passe ?"
                description="Votre mot de passe administrateur sera immédiatement mis à jour. Assurez-vous de l'avoir conservé dans un gestionnaire de mots de passe sécurisé."
                confirmLabel="Mettre à jour"
                cancelLabel="Annuler"
                isLoading={isChangingPassword}
                onConfirm={executeChangePassword}
            />
        </div>
    );
}
