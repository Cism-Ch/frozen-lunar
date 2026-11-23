"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FileText,
    LayoutDashboard,
    LogIn,
    LogOut,
    Settings,
    User,
} from "lucide-react";
import { toast } from "sonner";
import { authClient, type UserWithRole } from "@/lib/auth-client";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface UserAccountMenuProps {
    compact?: boolean;
    variant?: "header" | "drawer";
    onNavigate?: () => void;
}

function getInitials(name?: string | null, email?: string | null): string {
    const source = (name || email || "U").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
}

/**
 * Composant d'affichage de l'état de connexion utilisateur (Better-Auth)
 * sur les interfaces client publiques et le drawer mobile.
 */
export function UserAccountMenu({
    compact = false,
    variant = "header",
    onNavigate,
}: UserAccountMenuProps) {
    const router = useRouter();
    const isMounted = useHasMounted();
    const { data: session, isPending } = authClient.useSession();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const user = session?.user as UserWithRole | undefined;
    const isAdmin =
        user?.role === "admin" ||
        user?.role === "superadmin" ||
        user?.role === "developer" ||
        user?.role === "moderator";

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authClient.signOut();
            toast.success("Déconnexion réussie.");
            setLogoutOpen(false);
            onNavigate?.();
            router.refresh();
        } catch {
            toast.error("Impossible de fermer la session.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    // État SSR / pré-hydratation neutre pour éviter tout mismatch sur les pages statiques
    if (!isMounted || isPending) {
        if (variant === "drawer") {
            return (
                <div className="bg-muted/40 h-14 w-full animate-pulse rounded-xl" />
            );
        }
        return (
            <div className="bg-muted/40 h-9 w-9 animate-pulse rounded-full" />
        );
    }

    // Variante Drawer Mobile
    if (variant === "drawer") {
        if (!user) {
            return (
                <div className="bg-secondary/5 dark:bg-secondary-steel/10 flex items-center justify-between gap-3 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-secondary-steel/15 text-secondary-steel flex h-10 w-10 items-center justify-center rounded-full">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-foreground text-sm font-semibold">
                                Espace Client
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Suivez vos devis et profil
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5"
                        asChild
                    >
                        <Link href="/espace-client" onClick={onNavigate}>
                            <LogIn className="h-3.5 w-3.5" />
                            Connexion
                        </Link>
                    </Button>
                </div>
            );
        }

        return (
            <>
                <div className="bg-secondary/5 dark:bg-secondary-steel/10 space-y-3 rounded-xl p-3.5">
                    <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                            <div className="bg-secondary text-secondary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
                                {getInitials(user.name, user.email)}
                            </div>
                            <span
                                className="border-background absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 bg-emerald-500"
                                title="Connecté"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <p className="text-foreground truncate text-sm font-semibold">
                                    {user.name || "Compte Client"}
                                </p>
                                <Badge
                                    variant="secondary"
                                    className="bg-secondary-steel/20 text-secondary dark:text-secondary-steel px-1.5 py-0 text-[10px]"
                                >
                                    {isAdmin ? "Admin" : "Connecté"}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground truncate text-xs">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 justify-start gap-1.5 text-xs"
                            asChild
                        >
                            <Link
                                href="/espace-client?tab=profile"
                                onClick={onNavigate}
                            >
                                <Settings className="h-3.5 w-3.5" />
                                Mon Profil
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 justify-start gap-1.5 text-xs"
                            asChild
                        >
                            <Link
                                href="/espace-client?tab=quotes"
                                onClick={onNavigate}
                            >
                                <FileText className="h-3.5 w-3.5" />
                                Mes Devis
                            </Link>
                        </Button>
                        {isAdmin && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="col-span-2 h-8 justify-start gap-1.5 text-xs"
                                asChild
                            >
                                <Link
                                    href="/admin/dashboard"
                                    onClick={onNavigate}
                                >
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                    Console Administration
                                </Link>
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="col-span-2 h-8 justify-start gap-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-rose-400 dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
                            onClick={() => setLogoutOpen(true)}
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Se déconnecter
                        </Button>
                    </div>
                </div>

                <ConfirmDialog
                    open={logoutOpen}
                    onOpenChange={setLogoutOpen}
                    title="Se déconnecter de votre compte ?"
                    description="Vous pourrez vous reconnecter à tout moment pour consulter vos devis et votre profil."
                    confirmLabel="Se déconnecter"
                    cancelLabel="Annuler"
                    variant="destructive"
                    isLoading={isLoggingOut}
                    onConfirm={handleConfirmLogout}
                />
            </>
        );
    }

    // Variante Header Desktop — Utilisateur déconnecté
    if (!user) {
        return (
            <Button
                asChild
                variant="ghost"
                size={compact ? "icon" : "sm"}
                className={cn(
                    "hover:bg-secondary-steel/15 text-foreground/80 hover:text-foreground rounded-full transition-all",
                    compact ? "h-9 w-9" : "h-9 gap-2 px-3"
                )}
                title="Connexion / Espace Client"
            >
                <Link href="/espace-client">
                    <LogIn className="h-4 w-4 shrink-0" />
                    {!compact && (
                        <span className="text-xs font-semibold">Connexion</span>
                    )}
                </Link>
            </Button>
        );
    }

    // Variante Header Desktop — Utilisateur connecté
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "hover:bg-secondary-steel/15 focus-visible:ring-primary/40 flex items-center rounded-full transition-all focus-visible:ring-2 focus-visible:outline-none",
                            compact ? "p-1" : "gap-2 py-1 pr-3 pl-1"
                        )}
                        title={`${user.name || user.email} — Connecté`}
                        aria-label="Menu du compte utilisateur"
                    >
                        <div className="relative">
                            <div className="bg-secondary text-secondary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-xs">
                                {getInitials(user.name, user.email)}
                            </div>
                            <span
                                className="border-background absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 bg-emerald-500"
                                aria-hidden="true"
                            />
                        </div>
                        {!compact && (
                            <div className="hidden max-w-[110px] flex-col items-start text-left xl:flex">
                                <span className="text-foreground w-full truncate text-xs leading-tight font-semibold">
                                    {user.name?.split(" ")[0] || "Profil"}
                                </span>
                                <span className="text-secondary-steel text-[10px] leading-tight font-medium">
                                    {isAdmin ? "Admin" : "En ligne"}
                                </span>
                            </div>
                        )}
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60 rounded-xl p-1.5">
                    <DropdownMenuLabel className="px-2.5 py-2 font-normal">
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold">
                                    {user.name || "Compte Client"}
                                </p>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Connecté
                                </span>
                            </div>
                            <p className="text-muted-foreground truncate text-xs">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                        <Link href="/espace-client?tab=profile">
                            <Settings className="mr-2 h-4 w-4" />
                            Mon Profil & Paramètres
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                        <Link href="/espace-client?tab=quotes">
                            <FileText className="mr-2 h-4 w-4" />
                            Mes Devis & Suivi
                        </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                asChild
                                className="cursor-pointer rounded-lg font-medium"
                            >
                                <Link href="/admin/dashboard">
                                    <LayoutDashboard className="text-primary mr-2 h-4 w-4" />
                                    Console Administration
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer rounded-lg font-medium text-red-600 focus:bg-red-500/10 focus:text-red-700 dark:text-rose-400 dark:focus:bg-rose-500/15 dark:focus:text-rose-300"
                        onClick={() => setLogoutOpen(true)}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDialog
                open={logoutOpen}
                onOpenChange={setLogoutOpen}
                title="Se déconnecter de votre compte ?"
                description="Vous pourrez vous reconnecter à tout moment pour consulter vos devis et votre profil."
                confirmLabel="Se déconnecter"
                cancelLabel="Annuler"
                variant="destructive"
                isLoading={isLoggingOut}
                onConfirm={handleConfirmLogout}
            />
        </>
    );
}
