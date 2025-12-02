"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Truck, ArrowRight, Loader2, Quote } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push("/admin/dashboard");
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left Side - Branding & Testimonial */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-zinc-900 z-0" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0" />

                <div className="relative z-10 flex items-center gap-2 text-lg font-medium">
                    <div className="p-2 rounded-lg bg-white/10 backdrop-blur">
                        <Truck className="h-6 w-6" />
                    </div>
                    HBC Logistique Admin
                </div>

                <div className="relative z-10 max-w-md space-y-4">
                    <Quote className="h-10 w-10 text-primary/50" />
                    <blockquote className="text-2xl font-medium leading-relaxed">
                        "La gestion logistique simplifiée. Une interface puissante pour piloter votre activité de transport avec précision."
                    </blockquote>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                            HB
                        </div>
                        <div>
                            <div className="font-semibold">Équipe Technique</div>
                            <div className="text-sm text-zinc-400">HBC Logistique</div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-zinc-400">
                    &copy; {new Date().getFullYear()} HBC Logistique. Tous droits réservés.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="mx-auto w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="flex flex-col space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight">Bon retour</h1>
                        <p className="text-muted-foreground">
                            Entrez vos identifiants pour accéder à votre espace.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={handleLogin}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="admin@hbclogistique.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        className="h-11 bg-muted/30"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Mot de passe</Label>
                                        <Link
                                            href="#"
                                            className="text-sm font-medium text-primary hover:underline"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            Mot de passe oublié ?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        disabled={isLoading}
                                        className="h-11 bg-muted/30"
                                        required
                                    />
                                </div>
                                <Button disabled={isLoading} className="h-11 font-semibold shadow-lg hover:shadow-primary/25 transition-all mt-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion...
                                        </>
                                    ) : (
                                        <>
                                            Se connecter <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Accès sécurisé
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
