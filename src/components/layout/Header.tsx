"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Truck,
    Menu,
    Phone,
    Home,
    Info,
    Mail,
    Package,
    Handshake,
    Minimize2,
    Maximize2,
    LayoutGrid,
    List,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
    motion,
    AnimatePresence,
    usePrefersReducedMotion,
} from "@/components/ui/motion";
import { useHasMounted } from "@/hooks/useHasMounted";
import { UserAccountMenu } from "@/components/layout/UserAccountMenu";

const MotionLink = motion.create(Link);

const NAV_ITEMS = [
    { name: "Accueil", shortName: "Accueil", href: "/", icon: Home },
    { name: "Services", shortName: "Services", href: "/services", icon: Package },
    { name: "Flotte", shortName: "Flotte", href: "/flotte", icon: Truck },
    {
        name: "Partenaires",
        shortName: "Partenaires",
        href: "/partenaires",
        icon: Handshake,
    },
    { name: "À propos", shortName: "À propos", href: "/about", icon: Info },
    { name: "Contact", shortName: "Contact", href: "/contact", icon: Mail },
];

// Seuil de largeur (px) du conteneur header sous lequel la barre compresse automatiquement en icônes seules
const AUTO_COMPACT_ENTER_PX = 1040;
const AUTO_COMPACT_EXIT_PX = 1072; // Hystérésis +32px pour éviter tout scintillement

export function Header() {
    const pathname = usePathname();
    const isMounted = useHasMounted();
    const prefersReducedMotion = usePrefersReducedMotion();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Mode adaptatif Header : auto via ResizeObserver ou forcé manuellement
    const headerBarRef = useRef<HTMLDivElement | null>(null);
    const [autoCompact, setAutoCompact] = useState(false);
    const [manualMode, setManualMode] = useState<"auto" | "icons" | "labels">(
        "auto"
    );

    // Mode de compression dans le Drawer mobile (liste complète vs grille compacte d'icônes)
    const [drawerCompact, setDrawerCompact] = useState(false);

    useEffect(() => {
        const el = headerBarRef.current;
        if (!el || typeof ResizeObserver === "undefined") return;

        const observer = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width;
            if (!width) return;
            setAutoCompact((prev) => {
                if (!prev && width < AUTO_COMPACT_ENTER_PX) return true;
                if (prev && width > AUTO_COMPACT_EXIT_PX) return false;
                return prev;
            });
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const isIconOnly =
        manualMode === "icons"
            ? true
            : manualMode === "labels"
              ? false
              : autoCompact;

    const handleToggleNavMode = () => {
        if (isIconOnly) {
            setManualMode(autoCompact ? "labels" : "auto");
        } else {
            setManualMode("icons");
        }
    };

    const desktopItems = NAV_ITEMS.filter((item) => item.href !== "/");

    return (
        <motion.header
            className="pointer-events-none sticky top-3 z-50 w-full px-3 sm:px-5"
            initial={prefersReducedMotion ? {} : { y: -40, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
            <div
                ref={headerBarRef}
                className="pointer-events-auto mx-auto flex h-15 max-w-6xl items-center justify-between gap-2 rounded-2xl bg-white/55 px-3 shadow-[0_8px_32px_rgba(0,31,61,0.10)] backdrop-blur-xl transition-all duration-300 sm:h-16 sm:px-4 dark:bg-[#001F3D]/55 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            >
                {/* Logo */}
                <MotionLink
                    href="/"
                    className="group flex shrink-0 items-center gap-2.5"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <motion.div
                        className="from-primary to-primary-accent flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md shadow-orange-500/25"
                        whileHover={prefersReducedMotion ? {} : { rotate: 8 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Truck className="h-5 w-5" />
                    </motion.div>
                    <div className="flex flex-col leading-none">
                        <span className="text-foreground text-sm font-extrabold tracking-tight sm:text-base">
                            HBC{" "}
                            <span className="text-primary">LOGISTIQUE</span>
                        </span>
                        <span className="text-secondary-steel hidden text-[10px] font-semibold tracking-widest uppercase sm:block">
                            Côte d&apos;Ivoire
                        </span>
                    </div>
                </MotionLink>

                {/* Desktop Nav Adaptatif (Titres + Icônes ↔ Icônes Seules) */}
                <nav
                    aria-label="Navigation principale"
                    className="hidden items-center gap-1 md:flex"
                >
                    {desktopItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <MotionLink
                                key={item.href}
                                href={item.href}
                                title={item.name}
                                aria-label={item.name}
                                className={cn(
                                    "group relative flex items-center rounded-xl text-sm font-semibold transition-all duration-200",
                                    isIconOnly
                                        ? "h-9 w-9 justify-center p-0"
                                        : "gap-2 px-3 py-2",
                                    isActive
                                        ? "bg-primary/12 text-primary"
                                        : "text-foreground/75 hover:bg-secondary-steel/12 hover:text-foreground"
                                )}
                                whileHover={
                                    prefersReducedMotion ? {} : { y: -1 }
                                }
                            >
                                <item.icon
                                    className={cn(
                                        "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                                        isActive
                                            ? "text-primary"
                                            : "text-secondary-steel group-hover:text-primary"
                                    )}
                                />
                                {!isIconOnly && (
                                    <span className="whitespace-nowrap">
                                        {item.name}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.span
                                        layoutId="floatingNavActive"
                                        className="from-primary to-primary-accent absolute right-2 bottom-0.5 left-2 h-0.5 rounded-full bg-linear-to-r"
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30,
                                        }}
                                    />
                                )}
                            </MotionLink>
                        );
                    })}

                    {/* Indicateur & Bouton de Bascule Titres ↔ Icônes */}
                    <button
                        type="button"
                        onClick={handleToggleNavMode}
                        title={
                            isIconOnly
                                ? "Afficher les titres du menu"
                                : "Compresser le menu en icônes"
                        }
                        aria-label={
                            isIconOnly
                                ? "Passer en mode titres et icônes"
                                : "Passer en mode icônes compact"
                        }
                        className="bg-secondary-steel/10 hover:bg-secondary-steel/20 text-secondary-steel hover:text-foreground ml-1 flex h-8 items-center gap-1 rounded-full px-2 text-[11px] font-semibold transition-colors"
                    >
                        {isIconOnly ? (
                            <Maximize2 className="h-3.5 w-3.5" />
                        ) : (
                            <Minimize2 className="h-3.5 w-3.5" />
                        )}
                        <span
                            className={cn(
                                "h-1.5 w-1.5 rounded-full transition-colors",
                                isIconOnly
                                    ? "bg-primary-accent"
                                    : "bg-emerald-500"
                            )}
                            title={
                                manualMode === "auto"
                                    ? isIconOnly
                                        ? "Compact automatique"
                                        : "Mode étendu"
                                    : isIconOnly
                                      ? "Compact manuel"
                                      : "Étendu manuel"
                            }
                        />
                    </button>
                </nav>

                {/* Actions Desktop : Compte Client + Thème + CTA Devis */}
                <div className="hidden items-center gap-1.5 md:flex">
                    <UserAccountMenu compact={isIconOnly} variant="header" />
                    <ThemeToggle />
                    <motion.div
                        whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    >
                        <Button
                            asChild
                            size={isIconOnly ? "sm" : "default"}
                            className="from-primary to-primary-accent hover:from-primary/90 hover:to-primary-accent/90 rounded-xl bg-linear-to-r font-semibold text-white shadow-md shadow-orange-500/25 transition-all"
                        >
                            <Link href="/devis">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span
                                    className={cn(
                                        "ml-2 whitespace-nowrap",
                                        isIconOnly && "hidden lg:inline"
                                    )}
                                >
                                    {isIconOnly ? "Devis" : "Demander un devis"}
                                </span>
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Actions Mobile : Statut rapide + Drawer Trigger */}
                <div className="flex items-center gap-1.5 md:hidden">
                    <UserAccountMenu compact variant="header" />
                    {isMounted && (
                        <Sheet
                            open={mobileMenuOpen}
                            onOpenChange={setMobileMenuOpen}
                        >
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Ouvrir le menu de navigation"
                                    className="hover:bg-primary/10 h-10 w-10 rounded-xl"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">
                                        Ouvrir le menu de navigation
                                    </span>
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="right"
                                className="flex w-[min(calc(100vw-1.25rem),360px)] flex-col border-0 bg-white/90 p-0 backdrop-blur-2xl sm:w-[390px] dark:bg-[#001F3D]/92"
                            >
                                <SheetTitle className="sr-only">
                                    Menu de navigation
                                </SheetTitle>

                                {/* Drawer Header avec Logo + Sélecteur de Compression */}
                                <div className="flex items-center justify-between px-5 pt-5 pb-3 pr-14">
                                    <Link
                                        href="/"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5"
                                    >
                                        <div className="from-primary to-primary-accent flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md">
                                            <Truck className="h-5 w-5" />
                                        </div>
                                        <span className="text-base font-extrabold tracking-tight">
                                            HBC{" "}
                                            <span className="text-primary">
                                                LOGISTIQUE
                                            </span>
                                        </span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDrawerCompact((prev) => !prev)
                                        }
                                        title={
                                            drawerCompact
                                                ? "Vue liste détaillée"
                                                : "Vue grille compacte"
                                        }
                                        className="bg-secondary-steel/15 text-foreground hover:bg-secondary-steel/25 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
                                    >
                                        {drawerCompact ? (
                                            <>
                                                <List className="h-3.5 w-3.5" />
                                                <span>Liste</span>
                                            </>
                                        ) : (
                                            <>
                                                <LayoutGrid className="h-3.5 w-3.5" />
                                                <span>Compact</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Statut Connexion Utilisateur dans le Drawer */}
                                <div className="px-5 pb-3">
                                    <UserAccountMenu
                                        variant="drawer"
                                        onNavigate={() =>
                                            setMobileMenuOpen(false)
                                        }
                                    />
                                </div>

                                <Separator className="bg-secondary-steel/15" />

                                {/* Liens du Drawer (Mode Liste ou Mode Grille Compressée) */}
                                <div className="flex-1 overflow-y-auto px-5 py-4">
                                    <div
                                        className={cn(
                                            drawerCompact
                                                ? "grid grid-cols-3 gap-2.5"
                                                : "flex flex-col gap-1.5"
                                        )}
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {NAV_ITEMS.map((item, index) => {
                                                const isActive =
                                                    pathname === item.href;
                                                return (
                                                    <motion.div
                                                        key={item.href}
                                                        layout
                                                        initial={{
                                                            opacity: 0,
                                                            y: 6,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: index * 0.04,
                                                        }}
                                                    >
                                                        <Link
                                                            href={item.href}
                                                            onClick={() =>
                                                                setMobileMenuOpen(
                                                                    false
                                                                )
                                                            }
                                                            className={cn(
                                                                "group flex transition-all",
                                                                drawerCompact
                                                                    ? "flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-center"
                                                                    : "min-h-[46px] items-center gap-3.5 rounded-xl px-3 py-2.5",
                                                                isActive
                                                                    ? "bg-primary/12 text-primary font-semibold"
                                                                    : "hover:bg-secondary-steel/10 text-foreground/80"
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    "flex items-center justify-center rounded-xl transition-colors",
                                                                    drawerCompact
                                                                        ? "h-10 w-10"
                                                                        : "h-9 w-9",
                                                                    isActive
                                                                        ? "bg-primary/20 text-primary"
                                                                        : "bg-secondary-steel/12 text-secondary-steel group-hover:text-primary"
                                                                )}
                                                            >
                                                                <item.icon className="h-5 w-5" />
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    drawerCompact
                                                                        ? "text-[11px] font-semibold"
                                                                        : "text-sm font-medium"
                                                                )}
                                                            >
                                                                {drawerCompact
                                                                    ? item.shortName
                                                                    : item.name}
                                                            </span>
                                                            {!drawerCompact &&
                                                                isActive && (
                                                                    <span className="bg-primary ml-auto h-2 w-2 rounded-full" />
                                                                )}
                                                        </Link>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>

                                    <Separator className="bg-secondary-steel/15 my-5" />

                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-muted-foreground text-sm font-medium">
                                            Apparence
                                        </span>
                                        <ThemeToggle />
                                    </div>
                                </div>

                                {/* Drawer Footer */}
                                <div className="bg-secondary/5 dark:bg-black/20 mt-auto p-5">
                                    <Button
                                        className="from-primary to-primary-accent h-11 w-full rounded-xl bg-linear-to-r text-sm font-semibold text-white shadow-lg shadow-orange-500/20"
                                        asChild
                                    >
                                        <Link
                                            href="/devis"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            <Phone className="mr-2 h-4 w-4" />
                                            Demander un devis gratuit
                                        </Link>
                                    </Button>
                                    <p className="text-muted-foreground mt-3 text-center text-xs">
                                        © {new Date().getFullYear()} HBC
                                        Logistique — Côte d&apos;Ivoire
                                    </p>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
