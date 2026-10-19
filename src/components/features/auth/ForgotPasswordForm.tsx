"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Mail,
    ArrowLeft,
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Shield,
    Truck,
    User,
} from "lucide-react";
import { toast } from "sonner";
import { requestPasswordResetAction } from "@/app/actions/auth-actions";

interface ForgotPasswordFormProps {
    context?: "admin" | "user" | "auto";
}

export function ForgotPasswordForm({
    context = "auto",
}: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [detectedRole, setDetectedRole] = useState<string | null>(null);

    const isAdminContext = context === "admin";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!email.trim()) {
            setError("Veuillez saisir votre adresse email");
            setIsLoading(false);
            return;
        }

        try {
            const result = await requestPasswordResetAction({
                email,
                context,
            });

            if (result.error) {
                setError(result.error);
                toast.error(result.error);
                setIsLoading(false);
                return;
            }

            if (result.data) {
                setIsSubmitted(true);
                if (result.data.role) {
                    setDetectedRole(result.data.role);
                }
                toast.success("Demande prise en compte");
            }
        } catch (err: unknown) {
            console.error("Erreur handleSubmit forgot password:", err);
            setError("Une erreur inattendue est survenue. Veuillez réessayer.");
            toast.error("Échec de la demande");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Colonne gauche - Branding visuel HBC Logistique */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-900 p-10 text-white lg:flex">
                <div className="from-primary/40 absolute inset-0 z-0 bg-gradient-to-br to-zinc-950" />
                <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] opacity-20" />

                <div className="relative z-10 flex items-center gap-2 text-lg font-medium">
                    <div className="rounded-lg bg-white/10 p-2 backdrop-blur">
                        <Truck className="h-6 w-6 text-sky-400" />
                    </div>
                    <span>HBC Logistique</span>
                </div>

                <div className="relative z-10 max-w-md space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                        <Shield className="h-3.5 w-3.5" />
                        Sécurité & Intégrité des Accès
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Récupération Sécurisée de Mot de Passe
                    </h2>
                    <p className="text-sm leading-relaxed text-zinc-300">
                        La réinitialisation est protégée par un jeton à usage
                        unique expirant sous 60 minutes. Vos données et
                        autorisations demeurent sous haute protection.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-zinc-400">
                    &copy; {new Date().getFullYear()} HBC Service Cash
                    Logistique Immobilière. Tous droits réservés.
                </div>
            </div>

            {/* Colonne droite - Formulaire */}
            <div className="bg-background flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6">
                    {/* Badge contextuel rôle */}
                    <div className="flex items-center justify-between">
                        <div className="border-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                            {isAdminContext || detectedRole === "admin" ? (
                                <>
                                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Espace Administration</span>
                                </>
                            ) : (
                                <>
                                    <User className="h-3.5 w-3.5 text-sky-500" />
                                    <span>Espace Compte</span>
                                </>
                            )}
                        </div>

                        <Link
                            href={isAdminContext ? "/admin/login" : "/"}
                            className="text-muted-foreground hover:text-foreground inline-flex items-center text-xs transition-colors"
                        >
                            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                            {isAdminContext ? "Connexion Admin" : "Accueil"}
                        </Link>
                    </div>

                    {!isSubmitted ? (
                        <>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Mot de passe oublié ?
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Saisissez votre adresse email. Nous vous
                                    ferons parvenir un lien de réinitialisation
                                    sécurisé pour débloquer votre accès.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse email</Label>
                                    <div className="relative">
                                        <Mail className="text-muted-foreground absolute top-3.5 left-3.5 h-4 w-4" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder={
                                                isAdminContext
                                                    ? "admin@hbc-logistique.fr"
                                                    : "utilisateur@exemple.com"
                                            }
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            disabled={isLoading}
                                            className="h-11 pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-11 w-full font-medium shadow transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            Envoyer le lien de réinitialisation
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        /* Écran de confirmation de l'envoi */
                        <div className="border-border bg-card animate-in fade-in zoom-in-95 space-y-6 rounded-xl border p-6 shadow-sm duration-300">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold tracking-tight">
                                    Vérifiez votre boîte de réception
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Si un compte est associé à{" "}
                                    <strong className="text-foreground">
                                        {email}
                                    </strong>
                                    , un email contenant votre lien sécurisé de
                                    réinitialisation a été envoyé.
                                </p>
                            </div>

                            <div className="bg-muted/50 text-muted-foreground space-y-1 rounded-lg p-3.5 text-xs">
                                <p className="text-foreground font-semibold">
                                    💡 Prochaine étape :
                                </p>
                                <p>
                                    Cliquez sur le lien dans l&apos;email pour
                                    ouvrir la page de réinitialisation dans
                                    votre navigateur. La page activera
                                    immédiatement votre{" "}
                                    <strong className="text-emerald-600 dark:text-emerald-400">
                                        statut de modification autorisée
                                    </strong>
                                    .
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        setEmail("");
                                    }}
                                    className="w-full text-xs"
                                >
                                    Renvoyer avec une autre adresse
                                </Button>

                                <Link
                                    href={isAdminContext ? "/admin/login" : "/"}
                                    className="w-full"
                                >
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs"
                                    >
                                        {isAdminContext
                                            ? "Retour à la page de connexion"
                                            : "Retour à l'accueil"}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
