"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Lock, User, Building, Save } from "lucide-react";
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
                    <h3 className="text-3xl font-bold tracking-tight">Paramètres</h3>
                    <p className="text-muted-foreground mt-2">
                        Gérez les préférences de votre compte et de l&apos;application.
                    </p>
                </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList className="w-full flex flex-wrap h-auto gap-1 sm:w-auto sm:inline-flex">
                        <TabsTrigger value="general" className="gap-2 flex-1 sm:flex-none"><User className="h-4 w-4" /> <span className="hidden sm:inline">Général</span></TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2 flex-1 sm:flex-none"><Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span></TabsTrigger>
                        <TabsTrigger value="company" className="gap-2 flex-1 sm:flex-none"><Building className="h-4 w-4" /> <span className="hidden sm:inline">Entreprise</span></TabsTrigger>
                        <TabsTrigger value="security" className="gap-2 flex-1 sm:flex-none"><Lock className="h-4 w-4" /> <span className="hidden sm:inline">Sécurité</span></TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <AnimatedCard hoverEffect="subtle">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profil Administrateur</CardTitle>
                                    <CardDescription>
                                        Modifiez vos informations personnelles et votre adresse email.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <Label htmlFor="name">Nom d&apos;affichage</Label>
                                        <Input id="name" defaultValue="Admin" />
                                    </motion.div>
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" defaultValue="admin@hbclogistique.com" />
                                    </motion.div>
                                </CardContent>
                                <CardFooter>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                                            <Save className="h-4 w-4" /> Enregistrer
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
                                    <CardTitle>Préférences de Notifications</CardTitle>
                                    <CardDescription>
                                        Choisissez comment vous souhaitez être informé.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { label: "Nouvelles demandes de devis", desc: "Recevoir un email instantané à chaque nouvelle demande.", checked: true },
                                        { label: "Rapport d'activité hebdomadaire", desc: "Recevoir un résumé des statistiques chaque lundi matin.", checked: true },
                                        { label: "Mises à jour système", desc: "Être informé des maintenances et nouvelles fonctionnalités.", checked: false },
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.label}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="space-y-0.5">
                                                <Label className="text-base">{item.label}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.desc}
                                                </p>
                                            </div>
                                            <Switch defaultChecked={item.checked} />
                                        </motion.div>
                                    ))}
                                </CardContent>
                                <CardFooter>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                                            <Save className="h-4 w-4" /> Enregistrer
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
                                    <CardTitle>Informations Entreprise</CardTitle>
                                    <CardDescription>
                                        Ces informations apparaissent sur les devis et factures.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
                                        <Input id="companyName" defaultValue="HBC Logistique" />
                                    </motion.div>
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Label htmlFor="address">Adresse du siège</Label>
                                        <Input id="address" defaultValue="123 Avenue du Transport, 75000 Paris" />
                                    </motion.div>
                                    <motion.div
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="siret">SIRET</Label>
                                            <Input id="siret" defaultValue="123 456 789 00012" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="tva">Numéro TVA</Label>
                                            <Input id="tva" defaultValue="FR 12 345678900" />
                                        </div>
                                    </motion.div>
                                </CardContent>
                                <CardFooter>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                                            <Save className="h-4 w-4" /> Enregistrer
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
                                        Gérez votre mot de passe et la sécurité du compte.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <Label htmlFor="current">Mot de passe actuel</Label>
                                        <Input id="current" type="password" />
                                    </motion.div>
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Label htmlFor="new">Nouveau mot de passe</Label>
                                        <Input id="new" type="password" />
                                    </motion.div>
                                    <motion.div
                                        className="grid gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                                        <Input id="confirm" type="password" />
                                    </motion.div>
                                </CardContent>
                                <CardFooter>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                                            <Save className="h-4 w-4" /> Mettre à jour
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
