"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LogOut,
    Menu,
    Truck,
    Search,
    Users,
    Settings,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminNotifications } from "@/components/features/AdminNotifications";
import { AdminWhatsNew } from "@/components/features/admin/AdminWhatsNew";
import { SidebarContent } from "@/components/features/admin/SidebarContent";
import { AdminCommandPalette } from "@/components/features/admin/AdminCommandPalette";
import {
    motion,
    AnimatePresence,
    usePrefersReducedMotion,
} from "@/components/ui/motion";
import { transitions } from "@/lib/animations";
import { authClient, UserWithRole } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState, useEffect, useSyncExternalStore } from "react";
import { logger } from "@/lib/logger";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const prefersReducedMotion = usePrefersReducedMotion();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isMac = useSyncExternalStore(
        () => () => {},
        () =>
            typeof window !== "undefined" &&
            /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent),
        () => false
    );

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setCommandOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    // Fermeture automatique du tiroir mobile lors d'un changement de route (idiomatique React sans effet en cascade)
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        setSidebarOpen(false);
    }

    const isAuthRoute =
        pathname === "/admin/login" || pathname === "/admin/init";

    const { data: session, isPending } = authClient.useSession();
    const userRole = (session?.user as unknown as UserWithRole | undefined)
        ?.role;

    useEffect(() => {
        if (!isPending && !isAuthRoute) {
            if (!session || userRole !== "admin") {
                const loginUrl = `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`;
                router.push(loginUrl);
            }
        }
    }, [session, isPending, isAuthRoute, userRole, pathname, router]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authClient.signOut();
            toast.success("Déconnexion réussie");
            router.push("/admin/login");
            router.refresh();
        } catch (error: unknown) {
            logger.error("Logout error", error);
            toast.error("Erreur lors de la déconnexion");
            setIsLoggingOut(false);
        }
    };

    // Les routes d'authentification s'affichent sans le layout dashboard
    if (isAuthRoute) {
        return <>{children}</>;
    }

    // Affichage d'un état de chargement sécurisé pendant la validation de la session
    if (isPending || !session || userRole !== "admin") {
        return (
            <div className="bg-background flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground text-sm font-medium">
                        Vérification des autorisations administrateur...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-muted/10 flex h-screen">
            {/* Desktop Sidebar */}
            <motion.aside
                className="bg-background/95 fixed inset-y-0 z-50 hidden w-64 flex-col border-r backdrop-blur md:flex"
                initial={prefersReducedMotion ? {} : { x: -100, opacity: 0 }}
                animate={prefersReducedMotion ? {} : { x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <SidebarContent
                    pathname={pathname}
                    isLoggingOut={isLoggingOut}
                    onLogout={handleLogout}
                />
            </motion.aside>

            {/* Main Content Wrapper */}
            <div className="flex min-h-screen flex-1 flex-col md:ml-64">
                {/* Header */}
                <motion.header
                    className="bg-background/95 sticky top-0 z-40 flex h-16 items-center gap-2 border-b px-3 shadow-sm backdrop-blur sm:gap-4 sm:px-6"
                    initial={prefersReducedMotion ? {} : { y: -20, opacity: 0 }}
                    animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center gap-1.5 sm:gap-2 md:hidden">
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] p-0">
                                <SheetTitle className="sr-only">
                                    Menu Admin
                                </SheetTitle>
                                <SidebarContent
                                    pathname={pathname}
                                    isLoggingOut={isLoggingOut}
                                    onLogout={handleLogout}
                                    onNavigate={() => setSidebarOpen(false)}
                                />
                            </SheetContent>
                        </Sheet>
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-1.5 text-base font-bold sm:gap-2 sm:text-lg"
                        >
                            <div className="bg-primary/10 shrink-0 rounded-md p-1">
                                <Truck className="text-primary h-4 w-4" />
                            </div>
                            <span className="hidden sm:inline-block">
                                HBC Admin
                            </span>
                        </Link>
                    </div>

                    <div className="w-auto flex-1 sm:w-auto sm:flex-none">
                        <button
                            type="button"
                            onClick={() => setCommandOpen(true)}
                            className="bg-background/80 hover:bg-muted/60 text-muted-foreground border-border/80 focus-visible:ring-primary flex w-full max-w-[200px] cursor-pointer items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs shadow-2xs transition-colors focus-visible:ring-2 focus-visible:outline-hidden sm:w-[240px] sm:max-w-none sm:px-3 sm:py-1.5 md:w-[270px] lg:w-[340px]"
                            aria-label={
                                isMac
                                    ? "Rechercher (⌘ + K)"
                                    : "Rechercher (Ctrl + K)"
                            }
                        >
                            <span className="flex items-center gap-2 truncate">
                                <Search className="h-4 w-4 shrink-0 opacity-70" />
                                <span className="hidden truncate sm:inline-block">
                                    Rechercher un devis, client...
                                </span>
                                <span className="truncate sm:hidden">
                                    Rechercher...
                                </span>
                            </span>
                            <span className="hidden shrink-0 items-center gap-1 sm:flex">
                                <kbd className="bg-muted text-muted-foreground border-border/80 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                                    {isMac ? "⌘" : "Ctrl"}
                                </kbd>
                                <kbd className="bg-muted text-muted-foreground border-border/80 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                                    K
                                </kbd>
                            </span>
                        </button>
                    </div>

                    <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
                        <AdminWhatsNew />
                        <AdminNotifications />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.div
                                    whileHover={
                                        prefersReducedMotion
                                            ? {}
                                            : { scale: 1.05 }
                                    }
                                    whileTap={
                                        prefersReducedMotion
                                            ? {}
                                            : { scale: 0.95 }
                                    }
                                >
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 rounded-full"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src="/avatars/01.png"
                                                alt="Admin"
                                            />
                                            <AvatarFallback>AD</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                                forceMount
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm leading-none font-medium">
                                            Admin
                                        </p>
                                        <p className="text-muted-foreground text-xs leading-none">
                                            admin@hbclogistique.com
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/admin/contacts"
                                        className="flex w-full cursor-pointer"
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Carnet d&apos;adresses</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/admin/settings"
                                        className="flex w-full cursor-pointer"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Paramètres</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-500 focus:text-red-500"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>
                                        {isLoggingOut
                                            ? "Déconnexion..."
                                            : "Déconnexion"}
                                    </span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.header>

                {/* Page Content with Animation */}
                <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            className="w-full space-y-6 sm:space-y-8"
                            initial={
                                prefersReducedMotion
                                    ? {}
                                    : { opacity: 0, y: 20 }
                            }
                            animate={
                                prefersReducedMotion ? {} : { opacity: 1, y: 0 }
                            }
                            exit={
                                prefersReducedMotion
                                    ? {}
                                    : { opacity: 0, y: -10 }
                            }
                            transition={transitions.smooth}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Modale de Commande Globale (Ctrl + K) */}
            <AdminCommandPalette
                open={commandOpen}
                onOpenChange={setCommandOpen}
            />
        </div>
    );
}
