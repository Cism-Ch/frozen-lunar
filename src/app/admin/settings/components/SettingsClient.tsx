"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Eye,
    EyeOff,
    CheckCircle2,
    ShieldAlert,
    HelpCircle,
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
    const [hfModel, setHfModel] = useState(initialData.settings.hfModel);
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
    const [isSavingCompany, setIsSavingCompany] = useState(false);

    // 5. Sécurité (Changement de mot de passe)
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
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
                hfModel: hfModel,
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
            }
        } catch {
            toast.error(
                "Erreur de connexion lors de la sauvegarde entreprise."
            );
        } finally {
            setIsSavingCompany(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
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
        <div className="space-y-6">
            <FadeIn direction="down">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-3xl font-bold tracking-tight">
                            Paramètres
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Gérez les préférences de votre compte, de
                            l&apos;entreprise et des automatisations.
                        </p>
                    </div>
                    <Badge
                        variant="secondary"
                        className="w-fit gap-1.5 px-3 py-1 font-mono text-xs"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Synchronisé avec PostgreSQL
                    </Badge>
                </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList className="flex h-auto w-full flex-wrap gap-1 sm:inline-flex sm:w-auto">
                        <TabsTrigger
                            value="general"
                            className="flex-1 gap-2 sm:flex-none"
                        >
                            <User className="h-4 w-4" />{" "}
                            <span className="hidden sm:inline">Général</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="flex-1 gap-2 sm:flex-none"
                        >
                            <Bell className="h-4 w-4" />{" "}
                            <span className="hidden sm:inline">
                                Notifications
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="whatsapp"
                            className="flex-1 gap-2 sm:flex-none"
                        >
                            <MessageCircle className="h-4 w-4" />{" "}
                            <span className="hidden sm:inline">
                                WhatsApp & IA
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="company"
                            className="flex-1 gap-2 sm:flex-none"
                        >
                            <Building className="h-4 w-4" />{" "}
                            <span className="hidden sm:inline">Entreprise</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="flex-1 gap-2 sm:flex-none"
                        >
                            <Lock className="h-4 w-4" />{" "}
                            <span className="hidden sm:inline">Sécurité</span>
                        </TabsTrigger>
                    </TabsList>

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
                                        className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="notify-quote"
                                                className="cursor-pointer text-base"
                                            >
                                                Nouvelles demandes de devis
                                            </Label>
                                            <p className="text-muted-foreground text-sm">
                                                Recevoir un email instantané à
                                                chaque nouvelle demande de
                                                transport.
                                            </p>
                                        </div>
                                        <Switch
                                            id="notify-quote"
                                            checked={notifyNewQuote}
                                            onCheckedChange={setNotifyNewQuote}
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="notify-weekly"
                                                className="cursor-pointer text-base"
                                            >
                                                Rapport d&apos;activité
                                                hebdomadaire
                                            </Label>
                                            <p className="text-muted-foreground text-sm">
                                                Recevoir un résumé consolidé des
                                                statistiques chaque lundi matin.
                                            </p>
                                        </div>
                                        <Switch
                                            id="notify-weekly"
                                            checked={notifyWeekly}
                                            onCheckedChange={setNotifyWeekly}
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="notify-system"
                                                className="cursor-pointer text-base"
                                            >
                                                Mises à jour système & alertes
                                            </Label>
                                            <p className="text-muted-foreground text-sm">
                                                Être informé des maintenances,
                                                seuils d&apos;erreurs et logs
                                                critiques.
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
                                                    WhatsApp & IA Hugging Face
                                                </CardTitle>
                                                <CardDescription>
                                                    Configurez
                                                    l&apos;automatisation
                                                    Click-to-Chat 100% gratuite
                                                    et le modèle d&apos;IA open
                                                    source.
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
                                                    className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                >
                                                    <Sparkles className="mr-1 h-3 w-3" />{" "}
                                                    Hugging Face
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
                                                placeholder="+33 1 23 45 67 89"
                                                required
                                            />
                                            <p className="text-muted-foreground text-xs">
                                                Numéro d&apos;entreprise visible
                                                par les clients pour les
                                                échanges directs sur smartphone.
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Label htmlFor="hfModel">
                                                Modèle IA Open Source (Hugging
                                                Face)
                                            </Label>
                                            <Input
                                                id="hfModel"
                                                value={hfModel}
                                                onChange={(e) =>
                                                    setHfModel(e.target.value)
                                                }
                                                placeholder="mistralai/Mistral-7B-Instruct-v0.3"
                                                required
                                            />
                                            <p className="text-muted-foreground text-xs">
                                                Modèle utilisé via l&apos;API
                                                Hugging Face Inference pour
                                                générer et adapter le message de
                                                relance.
                                            </p>
                                        </motion.div>

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
                                                        Génération IA 1-Clic via
                                                        Hugging Face
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
                                                    Numéro SIRET
                                                </Label>
                                                <Input
                                                    id="siret"
                                                    value={siret}
                                                    onChange={(e) =>
                                                        setSiret(e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="tva">
                                                    Numéro TVA
                                                    intracommunautaire
                                                </Label>
                                                <Input
                                                    id="tva"
                                                    value={vatNumber}
                                                    onChange={(e) =>
                                                        setVatNumber(
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        </motion.div>
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
                                <form onSubmit={handleChangePassword}>
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

                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Label htmlFor="current">
                                                Mot de passe actuel
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="current"
                                                    type={
                                                        showCurrentPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={currentPassword}
                                                    onChange={(e) =>
                                                        setCurrentPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Entrez votre mot de passe actuel"
                                                    className="pr-10"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-foreground absolute top-0 right-0 h-full px-3"
                                                    onClick={() =>
                                                        setShowCurrentPassword(
                                                            !showCurrentPassword
                                                        )
                                                    }
                                                    tabIndex={-1}
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Label htmlFor="new">
                                                Nouveau mot de passe (min. 12
                                                car.)
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="new"
                                                    type={
                                                        showNewPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={newPassword}
                                                    onChange={(e) =>
                                                        setNewPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Au moins 12 caractères"
                                                    className="pr-10"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-foreground absolute top-0 right-0 h-full px-3"
                                                    onClick={() =>
                                                        setShowNewPassword(
                                                            !showNewPassword
                                                        )
                                                    }
                                                    tabIndex={-1}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
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
                                        </motion.div>

                                        <motion.div
                                            className="grid gap-2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Label htmlFor="confirm">
                                                Confirmer le nouveau mot de
                                                passe
                                            </Label>
                                            <Input
                                                id="confirm"
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
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
                                        </motion.div>
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
        </div>
    );
}
