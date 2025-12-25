"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function AdminInitPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [hasAdmin, setHasAdmin] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        /**
         * Vérifie au chargement si un administrateur existe déjà
         * Cette vérification permet d'afficher le bon écran (init ou redirection)
         */
        const checkAdmin = async () => {
            try {
                const response = await fetch("/api/admin/check");
                const data = await response.json();
                
                // Afficher les erreurs de configuration au lieu de les masquer
                if (!response.ok && data.error) {
                    console.error("❌ Erreur de configuration:", data.error);
                    if (data.details) {
                        console.error("Détails:", data.details);
                    }
                    toast.error(data.error + (data.details ? ": " + data.details : ""));
                }
                
                setHasAdmin(data.hasAdmin);
            } catch (err: unknown) {
                console.error("❌ Erreur lors de la vérification admin:", err);
                // Afficher une erreur utilisateur si la vérification échoue
                toast.error("Impossible de vérifier la configuration. Voir la console pour les détails.");
            } finally {
                setIsChecking(false);
            }
        };
        checkAdmin();
    }, []);

    const handleInit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        // Validation des champs requis
        if (!name || !email || !password || !confirmPassword) {
            setError("Tous les champs sont requis");
            setIsLoading(false);
            return;
        }

        // Validation côté client
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            setIsLoading(false);
            return;
        }

        if ((password as string).length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
            setIsLoading(false);
            return;
        }

        try {
            // Créer le compte administrateur via l'API
            const response = await fetch("/api/admin/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name: name as string, 
                    email: email as string, 
                    password: password as string 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Construire le message d'erreur de manière structurée
                const errorMsg = data.error || "Erreur lors de la création du compte";
                const errorWithDetails = data.details ? `${errorMsg}. ${data.details}` : errorMsg;
                throw new Error(errorWithDetails);
            }

            toast.success("Compte administrateur créé avec succès");
            
            // Tentative de connexion automatique
            const loginResult = await authClient.signIn.email({
                email: email as string,
                password: password as string,
            });

            if (loginResult.error) {
                toast.error("Compte créé mais échec de la connexion automatique");
                router.push("/admin/login");
            } else {
                toast.success("Connexion automatique réussie");
                router.push("/admin/dashboard");
            }
        } catch (err: unknown) {
            console.error("❌ Erreur lors de l'initialisation:", err);
            const errorMessage = err instanceof Error ? err.message : "Une erreur s'est produite";
            setError(errorMessage);
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Vérification du système...</p>
                </div>
            </div>
        );
    }

    if (hasAdmin) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background p-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-3 rounded-full bg-amber-100 dark:bg-amber-950 w-fit">
                            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <CardTitle>Compte administrateur déjà configuré</CardTitle>
                        <CardDescription>
                            Un compte administrateur existe déjà sur ce système.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={() => router.push("/admin/login")}>
                            Aller à la page de connexion
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Initialisation du système</CardTitle>
                    <CardDescription>
                        Créez le premier compte administrateur pour accéder au dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleInit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Admin Principal"
                                required
                                minLength={2}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Adresse email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@hbclogistique.com"
                                autoComplete="email"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Minimum 8 caractères"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Répétez le mot de passe"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Créer le compte administrateur
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
