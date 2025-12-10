"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Lock, User, Building, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const handleSave = () => {
        toast.success("Paramètres enregistrés avec succès");
    };

    return (
        <div className="space-y-6">
            <div className="text-center sm:text-left">
                <h3 className="text-3xl font-bold tracking-tight">Paramètres</h3>
                <p className="text-muted-foreground mt-2">
                    Gérez les préférences de votre compte et de l'application.
                </p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="w-full flex flex-wrap h-auto gap-1 sm:w-auto sm:inline-flex">
                    <TabsTrigger value="general" className="gap-2 flex-1 sm:flex-none"><User className="h-4 w-4" /> <span className="hidden sm:inline">Général</span></TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2 flex-1 sm:flex-none"><Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span></TabsTrigger>
                    <TabsTrigger value="company" className="gap-2 flex-1 sm:flex-none"><Building className="h-4 w-4" /> <span className="hidden sm:inline">Entreprise</span></TabsTrigger>
                    <TabsTrigger value="security" className="gap-2 flex-1 sm:flex-none"><Lock className="h-4 w-4" /> <span className="hidden sm:inline">Sécurité</span></TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profil Administrateur</CardTitle>
                            <CardDescription>
                                Modifiez vos informations personnelles et votre adresse email.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom d'affichage</Label>
                                <Input id="name" defaultValue="Admin" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue="admin@hbclogistique.com" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                                <Save className="h-4 w-4" /> Enregistrer
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Préférences de Notifications</CardTitle>
                            <CardDescription>
                                Choisissez comment vous souhaitez être informé.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Nouvelles demandes de devis</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Recevoir un email instantané à chaque nouvelle demande.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Rapport d'activité hebdomadaire</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Recevoir un résumé des statistiques chaque lundi matin.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Mises à jour système</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Être informé des maintenances et nouvelles fonctionnalités.
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                                <Save className="h-4 w-4" /> Enregistrer
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="company">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations Entreprise</CardTitle>
                            <CardDescription>
                                Ces informations apparaissent sur les devis et factures.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="companyName">Nom de l'entreprise</Label>
                                <Input id="companyName" defaultValue="HBC Logistique" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Adresse du siège</Label>
                                <Input id="address" defaultValue="123 Avenue du Transport, 75000 Paris" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="siret">SIRET</Label>
                                    <Input id="siret" defaultValue="123 456 789 00012" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tva">Numéro TVA</Label>
                                    <Input id="tva" defaultValue="FR 12 345678900" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                                <Save className="h-4 w-4" /> Enregistrer
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sécurité</CardTitle>
                            <CardDescription>
                                Gérez votre mot de passe et la sécurité du compte.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current">Mot de passe actuel</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new">Nouveau mot de passe</Label>
                                <Input id="new" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                                <Input id="confirm" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
                                <Save className="h-4 w-4" /> Mettre à jour
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
