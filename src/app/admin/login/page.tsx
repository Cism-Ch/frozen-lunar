"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, ArrowRight, Loader2, Quote, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        // Validation des champs requis
        if (!email || !password) {
            const errorMessage = "L'email et le mot de passe sont requis";
            setError(errorMessage);
            toast.error(errorMessage);
            setIsLoading(false);
            return;
        }

        try {
            const result = await authClient.signIn.email({
                email: email as string,
                password: password as string,
            });

            if (result.error) {
                setError(result.error.message || "Identifiants incorrects");
                toast.error("Échec de la connexion");
                setIsLoading(false);
                return;
            }

            // Vérifier le rôle de l'utilisateur
            interface UserWithRole {
                role?: string;
                [key: string]: unknown;
            }
            const user = result.data?.user as UserWithRole;
            if (user?.role === "user") {
                setError(
                    "Accès refusé. Vous devez avoir un rôle administrateur."
                );
                toast.error("Accès refusé");
                await authClient.signOut();
                setIsLoading(false);
                return;
            }

            toast.success("Connexion réussie");
            router.push(callbackUrl);
            router.refresh();
        } catch (err: unknown) {
            console.error("Login error:", err);
            setError("Une erreur s'est produite lors de la connexion");
            toast.error("Erreur de connexion");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left Side - Branding & Testimonial */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-900 p-10 text-white lg:flex">
                <div className="from-primary/40 absolute inset-0 z-0 bg-gradient-to-br to-zinc-900" />
                <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] opacity-20" />

                <div className="relative z-10 flex items-center gap-2 text-lg font-medium">
                    <div className="rounded-lg bg-white/10 p-2 backdrop-blur">
                        <Truck className="h-6 w-6" />
                    </div>
                    HBC Logistique Admin
                </div>

                <div className="relative z-10 max-w-md space-y-4">
                    <Quote className="text-primary/50 h-10 w-10" />
                    <blockquote className="text-2xl leading-relaxed font-medium">
                        &ldquo;La gestion logistique simplifiée. Une interface
                        puissante pour piloter votre activité de transport avec
                        précision.&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold">
                            HB
                        </div>
                        <div>
                            <div className="font-semibold">
                                Équipe Technique
                            </div>
                            <div className="text-sm text-zinc-400">
                                HBC Logistique
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-zinc-400">
                    &copy; {new Date().getFullYear()} HBC Logistique. Tous
                    droits réservés.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-background flex items-center justify-center p-8">
                <div className="animate-in fade-in slide-in-from-right-8 mx-auto w-full max-w-sm space-y-8 duration-700">
                    <div className="flex flex-col space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Bon retour
                        </h1>
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
                                        name="email"
                                        placeholder="admin@hbclogistique.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        className="bg-muted/30 h-11"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">
                                            Mot de passe
                                        </Label>
                                        <Link
                                            href="#"
                                            className="text-primary text-sm font-medium hover:underline"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            Mot de passe oublié ?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        disabled={isLoading}
                                        className="bg-muted/30 h-11"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button
                                    disabled={isLoading}
                                    className="hover:shadow-primary/25 mt-2 h-11 font-semibold shadow-lg transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                            Connexion...
                                        </>
                                    ) : (
                                        <>
                                            Se connecter{" "}
                                            <ArrowRight className="ml-2 h-4 w-4" />
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
                                <span className="bg-background text-muted-foreground px-2">
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

export default function AdminLoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
