"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ShieldCheck,
    AlertCircle,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    Truck,
    ShieldAlert,
    UserCheck,
    KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import {
    verifyResetTokenAction,
    resetPasswordWithTokenAction,
} from "@/app/actions/auth-actions";

interface ResetPasswordFormProps {
    token?: string;
    context?: "admin" | "user" | "auto";
}

type PageState =
    "verifying" | "invalid" | "authorized" | "submitting" | "success";

export function ResetPasswordForm({
    token,
    context = "auto",
}: ResetPasswordFormProps) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const [status, setStatus] = useState<PageState>(
        token ? "verifying" : "invalid"
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(
        token
            ? null
            : "Jeton de réinitialisation manquant dans l'adresse. Veuillez utiliser le lien sécurisé envoyé par email."
    );

    // Données du compte vérifié
    const [accountRole, setAccountRole] = useState<string>(
        context === "admin" ? "admin" : "user"
    );
    const [accountName, setAccountName] = useState<string>("");
    const [accountEmail, setAccountEmail] = useState<string>("");

    // Formulaire de saisie du mot de passe
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Compte à rebours de redirection après succès
    const [countdown, setCountdown] = useState<number>(5);

    // 1. Détection et validation automatique du jeton au chargement
    useEffect(() => {
        if (!token) return;

        let isMounted = true;

        async function verifyToken() {
            try {
                const result = await verifyResetTokenAction({ token });

                if (!isMounted) return;

                if (result.error || !result.data) {
                    setStatus("invalid");
                    setErrorMessage(
                        result.error ||
                            "Le lien de réinitialisation est invalide ou a expiré."
                    );
                    return;
                }

                // Succès : Passage immédiat au statut "Modification autorisée"
                setAccountRole(result.data.role);
                setAccountName(result.data.name);
                setAccountEmail(result.data.maskedEmail);
                setStatus("authorized");
                toast.success("Jeton vérifié : Modification autorisée");
            } catch (err: unknown) {
                if (!isMounted) return;
                console.error("Erreur de vérification du jeton:", err);
                setStatus("invalid");
                setErrorMessage(
                    "Une erreur est survenue lors de la validation du lien."
                );
            }
        }

        verifyToken();

        return () => {
            isMounted = false;
        };
    }, [token]);

    // 2. Compte à rebours en cas de succès
    useEffect(() => {
        if (status !== "success") return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    startTransition(() => {
                        if (accountRole === "admin") {
                            router.push("/admin/login");
                        } else {
                            router.push("/");
                        }
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, accountRole, router]);

    // Évaluation de la robustesse du mot de passe
    const isAdmin = accountRole === "admin";
    const minLength = isAdmin ? 12 : 8;

    const hasMinLength = password.length >= minLength;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const score = [
        hasMinLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
    ].filter(Boolean).length;

    const getStrengthLabel = () => {
        if (password.length === 0) return { label: "", color: "bg-muted" };
        if (score <= 2)
            return {
                label: "Faible",
                color: "bg-red-500",
                text: "text-red-500",
            };
        if (score <= 3)
            return {
                label: "Moyen",
                color: "bg-amber-500",
                text: "text-amber-500",
            };
        if (score <= 4)
            return {
                label: "Bon",
                color: "bg-sky-500",
                text: "text-sky-500",
            };
        return {
            label: "Excellent",
            color: "bg-emerald-500",
            text: "text-emerald-500",
        };
    };

    const strength = getStrengthLabel();

    // 3. Soumission du nouveau mot de passe
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!token) {
            setErrorMessage("Jeton invalide.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Les deux mots de passe ne correspondent pas.");
            toast.error("Mots de passe non identiques");
            return;
        }

        if (!hasMinLength) {
            setErrorMessage(
                `Le mot de passe doit comporter au moins ${minLength} caractères.`
            );
            return;
        }

        setStatus("submitting");

        try {
            const result = await resetPasswordWithTokenAction({
                token,
                password,
                confirmPassword,
            });

            if (result.error || !result.data) {
                setStatus("authorized");
                setErrorMessage(result.error || "Échec de la modification.");
                toast.error(result.error || "Erreur de modification");
                return;
            }

            setStatus("success");
            toast.success("Mot de passe mis à jour avec succès !");
        } catch (err: unknown) {
            console.error("Erreur reset password submit:", err);
            setStatus("authorized");
            setErrorMessage(
                "Une erreur inattendue est survenue. Veuillez réessayer."
            );
            toast.error("Erreur serveur");
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
                        <KeyRound className="h-3.5 w-3.5" />
                        Gestion Sécurisée des Identifiants
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Authentification &amp; Réinitialisation
                    </h2>
                    <p className="text-sm leading-relaxed text-zinc-300">
                        La modification de votre mot de passe invalide
                        instantanément les anciennes sessions actives sur tous
                        vos appareils afin d&apos;empêcher toute utilisation non
                        autorisée.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-zinc-400">
                    &copy; {new Date().getFullYear()} HBC Service Cash
                    Logistique Immobilière. Tous droits réservés.
                </div>
            </div>

            {/* Colonne droite - Contenu réactif selon le statut */}
            <div className="bg-background flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6">
                    {/* ÉTAT 1 : VÉRIFICATION EN COURS */}
                    {status === "verifying" && (
                        <div className="border-border bg-card space-y-4 rounded-xl border p-8 text-center shadow-sm">
                            <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-full">
                                <Loader2 className="h-7 w-7 animate-spin" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold tracking-tight">
                                    Vérification du lien sécurisé
                                </h3>
                                <p className="text-muted-foreground text-xs">
                                    Validation cryptographique du jeton de
                                    réinitialisation...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ÉTAT 2 : JETON INVALIDE OU EXPIRÉ */}
                    {status === "invalid" && (
                        <div className="border-destructive/30 bg-card animate-in fade-in zoom-in-95 space-y-6 rounded-xl border p-6 shadow-sm duration-300">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                <ShieldAlert className="h-6 w-6" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-destructive text-xl font-bold tracking-tight">
                                    Lien invalide ou expiré
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {errorMessage ||
                                        "Ce lien de réinitialisation ne peut plus être utilisé. Par mesure de sécurité, les liens expirent au bout de 60 minutes."}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <Link
                                    href="/auth/forgot-password"
                                    className="w-full"
                                >
                                    <Button className="h-11 w-full font-medium">
                                        Demander un nouveau lien
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>

                                <Link
                                    href={isAdmin ? "/admin/login" : "/"}
                                    className="w-full"
                                >
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs"
                                    >
                                        {isAdmin
                                            ? "Retour à la connexion Admin"
                                            : "Retour à l'accueil"}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* ÉTAT 3 : STATUT "MODIFICATION AUTORISÉE" */}
                    {(status === "authorized" || status === "submitting") && (
                        <>
                            {/* Bannière de statut d'autorisation */}
                            <div className="animate-in fade-in rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 duration-500">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                            ✓ Statut : Modification autorisée
                                        </div>
                                        <p className="text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-300/80">
                                            Accès validé pour{" "}
                                            <strong>
                                                {accountName || "le compte"}
                                            </strong>{" "}
                                            ({accountEmail}).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Titre & Sous-titre */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    {isAdmin ? (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                            Compte Administrateur
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                                            Compte Client / Utilisateur
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Nouveau mot de passe
                                </h1>
                                <p className="text-muted-foreground text-xs">
                                    {isAdmin
                                        ? "Définissez un mot de passe sécurisé d'au moins 12 caractères pour votre accès administrateur."
                                        : "Définissez un nouveau mot de passe d'au moins 8 caractères pour votre compte."}
                                </p>
                            </div>

                            {/* Formulaire de saisie */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">
                                        Nouveau mot de passe
                                    </Label>
                                    <div className="relative">
                                        <Lock className="text-muted-foreground absolute top-3.5 left-3.5 h-4 w-4" />
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            disabled={status === "submitting"}
                                            className="h-11 pr-10 pl-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="text-muted-foreground hover:text-foreground absolute top-3.5 right-3.5 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Jauge de force */}
                                {password.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                                Force du mot de passe :
                                            </span>
                                            <span
                                                className={`font-medium ${strength.text}`}
                                            >
                                                {strength.label}
                                            </span>
                                        </div>
                                        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                                            <div
                                                className={`h-full transition-all duration-300 ${strength.color}`}
                                                style={{
                                                    width: `${(score / 5) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        Confirmer le mot de passe
                                    </Label>
                                    <div className="relative">
                                        <Lock className="text-muted-foreground absolute top-3.5 left-3.5 h-4 w-4" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••••••"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            disabled={status === "submitting"}
                                            className="h-11 pr-10 pl-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="text-muted-foreground hover:text-foreground absolute top-3.5 right-3.5 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={
                                        status === "submitting" ||
                                        !hasMinLength ||
                                        password !== confirmPassword
                                    }
                                    className="h-11 w-full font-medium shadow transition-all"
                                >
                                    {status === "submitting" ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enregistrement sécurisé...
                                        </>
                                    ) : (
                                        <>
                                            Enregistrer le nouveau mot de passe
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    )}

                    {/* ÉTAT 4 : SUCCÈS & CONFIRMATION */}
                    {status === "success" && (
                        <div className="bg-card animate-in fade-in zoom-in-95 space-y-6 rounded-xl border border-emerald-500/30 p-6 shadow-sm duration-300">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <UserCheck className="h-6 w-6" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                                    Mot de passe mis à jour !
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Votre nouveau mot de passe est immédiatement
                                    actif. Toutes les anciennes sessions ont été
                                    invalidées par sécurité.
                                </p>
                            </div>

                            <div className="bg-muted/50 text-muted-foreground flex items-center justify-between rounded-lg p-3 text-xs">
                                <span>Redirection automatique dans :</span>
                                <span className="text-foreground text-sm font-bold">
                                    {countdown}s
                                </span>
                            </div>

                            <div className="pt-2">
                                <Link
                                    href={isAdmin ? "/admin/login" : "/"}
                                    className="w-full"
                                >
                                    <Button className="h-11 w-full font-medium">
                                        {isAdmin
                                            ? "Accéder à la connexion Administrateur"
                                            : "Accéder à l'accueil"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
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
