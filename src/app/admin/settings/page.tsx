"use client";

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
} from "lucide-react";
import { toast } from "sonner";
import { FadeIn, AnimatedCard, motion } from "@/components/ui/motion";

export default function SettingsPage() {
    const handleSave = () => {
        toast.success("Paramètres enregistrés avec succès");
    };

    return (
        <div className="space-y-6">
            <FadeIn direction="down">
                <div className="text-center sm:text-left">
                    <h3 className="text-3xl font-bold tracking-tight">
                        Paramètres
                    </h3>
                    <p className="text-muted-foreground mt-2">
                        Gérez les préférences de votre compte et de
                        l&apos;application.
                    </p>
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

                    <TabsContent value="general">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profil Administrateur</CardTitle>
                                    <CardDescription>
                                        Modifiez vos informations personnelles
                                        et votre adresse email.
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
                                        <Input id="name" defaultValue="Admin" />
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
                                            defaultValue="admin@hbclogistique.com"
                                        />
                                    </motion.div>
                                </CardContent>
                                <CardFooter>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            onClick={handleSave}
                                            className="w-full gap-2 sm:w-auto"
                                        >
                                            <Save className="h-4 w-4" />{" "}
                                            Enregistrer
                                        </Button>
                                    </motion.div>
                                </CardFooter>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Préférences de Notifications
                                    </CardTitle>
                                    <CardDescription>
                                        Choisissez comment vous souhaitez être
                                        informé.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        {
                                            label: "Nouvelles demandes de devis",
                                            desc: "Recevoir un email instantané à chaque nouvelle demande.",
                                            checked: true,
                                        },
                                        {
                                            label: "Rapport d'activité hebdomadaire",
                                            desc: "Recevoir un résumé des statistiques chaque lundi matin.",
                                            checked: true,
                                        },
                                        {
                                            label: "Mises à jour système",
                                            desc: "Être informé des maintenances et nouvelles fonctionnalités.",
                                            checked: false,
                                        },
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.label}
                                            className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="space-y-0.5">
                                                <Label className="text-base">
                                                    {item.label}
                                                </Label>
                                                <p className="text-muted-foreground text-sm">
                                                    {item.desc}
                                                </p>
                                            </div>
                                            <Switch
                                                defaultChecked={item.checked}
                                            />
                                        </motion.div>
                                    ))}
                                </CardContent>
                                <CardFooter>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            onClick={handleSave}
                                            className="w-full gap-2 sm:w-auto"
                                        >
                                            <Save className="h-4 w-4" />{" "}
                                            Enregistrer
                                        </Button>
                                    </motion.div>
                                </CardFooter>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>

                    <TabsContent value="whatsapp">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <MessageCircle className="h-5 w-5 text-emerald-500" />
                                                WhatsApp & IA Hugging Face
                                            </CardTitle>
                                            <CardDescription>
                                                Configurez l&apos;automatisation
                                                Click-to-Chat 100% gratuite et
                                                le modèle d&apos;IA open source.
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
                                            Numéro WhatsApp Commercial / Support
                                        </Label>
                                        <Input
                                            id="whatsappNumber"
                                            defaultValue="+33 1 23 45 67 89"
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                        <p className="text-muted-foreground text-xs">
                                            Numéro d&apos;entreprise visible par
                                            les clients pour les échanges
                                            directs sur smartphone.
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Label htmlFor="hfModel">
                                            Modèle IA Open Source (Hugging Face)
                                        </Label>
                                        <Input
                                            id="hfModel"
                                            defaultValue="mistralai/Mistral-7B-Instruct-v0.3"
                                            placeholder="mistralai/Mistral-7B-Instruct-v0.3"
                                        />
                                        <p className="text-muted-foreground text-xs">
                                            Modèle utilisé via l&apos;API
                                            Hugging Face Inference pour générer
                                            et adapter le message de relance.
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
                                            defaultValue="Bonjour {client}, nous faisons suite à votre demande de transport #{id} ({type}). Votre dossier est pris en charge par notre équipe."
                                        />
                                        <p className="text-muted-foreground text-xs">
                                            Variables dynamiques :{" "}
                                            <code>&#123;client&#125;</code>,{" "}
                                            <code>&#123;id&#125;</code>,{" "}
                                            <code>&#123;type&#125;</code>,{" "}
                                            <code>&#123;pickup&#125;</code>,{" "}
                                            <code>&#123;dropoff&#125;</code>.
                                        </p>
                                    </motion.div>

                                    <div className="space-y-4 pt-2">
                                        <h4 className="text-sm font-semibold">
                                            Options d&apos;automatisation
                                        </h4>
                                        {[
                                            {
                                                label: "Génération IA 1-Clic via Hugging Face",
                                                desc: "Prépare automatiquement le message de relance personnalisé selon les spécificités du devis.",
                                                checked: true,
                                            },
                                            {
                                                label: "Historique automatique des échanges",
                                                desc: "Consigne une entrée dans le journal d'audit du devis à chaque ouverture de lien WhatsApp.",
                                                checked: true,
                                            },
                                            {
                                                label: "Recherche croisée par numéro de téléphone",
                                                desc: "Associe et affiche tous les devis d'un même client lors de la consultation d'un dossier.",
                                                checked: true,
                                            },
                                        ].map((item, index) => (
                                            <motion.div
                                                key={item.label}
                                                className="flex items-center justify-between space-x-2 rounded-lg border p-3"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: 0.35 + index * 0.05,
                                                }}
                                            >
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-medium">
                                                        {item.label}
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                                <Switch
                                                    defaultChecked={
                                                        item.checked
                                                    }
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            onClick={handleSave}
                                            className="w-full gap-2 sm:w-auto"
                                        >
                                            <Save className="h-4 w-4" />{" "}
                                            Enregistrer les paramètres WhatsApp
                                        </Button>
                                    </motion.div>
                                </CardFooter>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>

                    <TabsContent value="company">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Informations Entreprise
                                    </CardTitle>
                                    <CardDescription>
                                        Ces informations apparaissent sur les
                                        devis et factures.
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
                                            defaultValue="HBC Logistique"
                                        />
                                    </motion.div>
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Label htmlFor="address">
                                            Adresse du siège
                                        </Label>
                                        <Input
                                            id="address"
                                            defaultValue="123 Avenue du Transport, 75000 Paris"
                                        />
                                    </motion.div>
                                    <motion.div
                                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="siret">SIRET</Label>
                                            <Input
                                                id="siret"
                                                defaultValue="123 456 789 00012"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="tva">
                                                Numéro TVA
                                            </Label>
                                            <Input
                                                id="tva"
                                                defaultValue="FR 12 345678900"
                                            />
                                        </div>
                                    </motion.div>
                                </CardContent>
                                <CardFooter>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            onClick={handleSave}
                                            className="w-full gap-2 sm:w-auto"
                                        >
                                            <Save className="h-4 w-4" />{" "}
                                            Enregistrer
                                        </Button>
                                    </motion.div>
                                </CardFooter>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>

                    <TabsContent value="security">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sécurité</CardTitle>
                                    <CardDescription>
                                        Gérez votre mot de passe et la sécurité
                                        du compte.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <Label htmlFor="current">
                                            Mot de passe actuel
                                        </Label>
                                        <Input id="current" type="password" />
                                    </motion.div>
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Label htmlFor="new">
                                            Nouveau mot de passe
                                        </Label>
                                        <Input id="new" type="password" />
                                    </motion.div>
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Label htmlFor="confirm">
                                            Confirmer le mot de passe
                                        </Label>
                                        <Input id="confirm" type="password" />
                                    </motion.div>
                                </CardContent>
                                <CardFooter>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            onClick={handleSave}
                                            className="w-full gap-2 sm:w-auto"
                                        >
                                            <Save className="h-4 w-4" /> Mettre
                                            à jour
                                        </Button>
                                    </motion.div>
                                </CardFooter>
                            </Card>
                        </AnimatedCard>
                    </TabsContent>
                </Tabs>
            </FadeIn>
        </div>
    );
}
