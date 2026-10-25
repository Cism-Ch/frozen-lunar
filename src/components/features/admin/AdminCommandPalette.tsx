"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/features/admin/QuoteStatusBadge";
import {
    Search,
    Truck,
    MessageSquare,
    LayoutDashboard,
    Users,
    Settings,
    ExternalLink,
    CornerDownLeft,
    Loader2,
    X,
    Command,
} from "lucide-react";
import {
    searchAdminAction,
    GlobalSearchData,
} from "@/app/actions/search-actions";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface AdminCommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdminCommandPalette({
    open,
    onOpenChange,
}: AdminCommandPaletteProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GlobalSearchData>({
        quotes: [],
        contacts: [],
        navigation: [],
    });
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Collecte plate des éléments sélectionnables au clavier
    type FlattenedItem =
        | { type: "quote"; id: string; href: string }
        | { type: "contact"; id: string; href: string }
        | { type: "navigation"; id: string; href: string };

    const flatItems: FlattenedItem[] = [
        ...results.navigation.map((nav) => ({
            type: "navigation" as const,
            id: nav.id,
            href: nav.href,
        })),
        ...results.quotes.map((q) => ({
            type: "quote" as const,
            id: q.id,
            href: `/admin/quotes/${encodeURIComponent(q.id)}`,
        })),
        ...results.contacts.map((c) => ({
            type: "contact" as const,
            id: c.id,
            href: `/admin/contacts?q=${encodeURIComponent(c.email)}`,
        })),
    ];

    // Recherche asynchrone avec debounce
    const executeSearch = useCallback(async (searchTerm: string) => {
        setIsSearching(true);
        try {
            const res = await searchAdminAction(searchTerm);
            if (res.data) {
                setResults(res.data);
                setSelectedIndex(0);
            }
        } catch (err: unknown) {
            logger.error("Erreur de recherche Omnibar", err);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuery("");
            setResults({ quotes: [], contacts: [], navigation: [] });
            return;
        }

        // Chargement initial des raccourcis
        void executeSearch("");
    }, [open, executeSearch]);

    useEffect(() => {
        if (!open) return;

        const timer = setTimeout(() => {
            void executeSearch(query);
        }, 180);

        return () => clearTimeout(timer);
    }, [query, open, executeSearch]);

    // Auto-scroll pour garantir que l'élément sélectionné reste toujours visible
    useEffect(() => {
        const el = itemRefs.current.get(selectedIndex);
        if (el) {
            el.scrollIntoView({
                block: "nearest",
            });
        }
    }, [selectedIndex]);

    // Navigation clavier (↑, ↓, Enter, Escape)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape" && query.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            setQuery("");
            return;
        }

        if (flatItems.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % flatItems.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev - 1 < 0 ? flatItems.length - 1 : prev - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            const activeItem = flatItems[selectedIndex];
            if (activeItem) {
                navigateTo(activeItem.href);
            }
        }
    };

    const navigateTo = (href: string) => {
        onOpenChange(false);
        router.push(href);
    };

    const getNavIcon = (icon: string) => {
        switch (icon) {
            case "dashboard":
                return <LayoutDashboard className="h-4 w-4" />;
            case "quotes":
                return <Truck className="h-4 w-4" />;
            case "contacts":
                return <MessageSquare className="h-4 w-4" />;
            case "users":
                return <Users className="h-4 w-4" />;
            case "settings":
                return <Settings className="h-4 w-4" />;
            case "home":
            default:
                return <ExternalLink className="h-4 w-4" />;
        }
    };

    const totalResults =
        results.quotes.length +
        results.contacts.length +
        results.navigation.length;

    let currentIndexCounter = -1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* showCloseButton={false} empêche l'injection automatique du X qui se superposait au badge ÉCHAP */}
            <DialogContent
                showCloseButton={false}
                className="border-border/80 bg-background/98 w-[calc(100vw-1.5rem)] max-w-2xl gap-0 overflow-hidden p-0 shadow-2xl backdrop-blur-xl sm:w-full"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>
                        Recherche Rapide & Command Palette
                    </DialogTitle>
                    <DialogDescription>
                        Recherchez instantanément un devis, un client ou
                        naviguez dans l&apos;espace administrateur.
                    </DialogDescription>
                </DialogHeader>

                {/* Champ de recherche principal avec boutons d'actions bien espacés */}
                <div className="bg-muted/20 flex items-center gap-2.5 border-b px-3.5 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
                    <Search className="text-muted-foreground h-4 w-4 shrink-0 opacity-70 sm:h-5 sm:w-5" />
                    <Input
                        ref={inputRef}
                        type="text"
                        role="searchbox"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Rechercher par n° de devis, client, ville, téléphone..."
                        className="placeholder:text-muted-foreground/60 h-8 w-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-9 sm:text-base"
                        autoFocus
                    />
                    <div className="flex shrink-0 items-center gap-1.5">
                        {isSearching ? (
                            <Loader2 className="text-muted-foreground h-4 w-4 shrink-0 animate-spin" />
                        ) : query.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1 transition-colors"
                                aria-label="Effacer la recherche"
                                title="Effacer la recherche"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        ) : null}

                        {/* Raccourci ÉCHAP desktop sans collision */}
                        <span className="bg-muted/60 text-muted-foreground hidden items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium sm:flex">
                            <kbd>ÉCHAP</kbd>
                        </span>

                        {/* Bouton Fermer dédié sur mobile / petit écran */}
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground flex rounded-md p-1 transition-colors sm:hidden"
                            aria-label="Fermer la boîte de dialogue"
                            title="Fermer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Zone de résultats défilable avec espacements responsives */}
                <div className="max-h-[60vh] space-y-3.5 overflow-y-auto p-2.5 sm:space-y-4 sm:p-3">
                    {/* Section 1 : Raccourcis de Navigation */}
                    {results.navigation.length > 0 && (
                        <div>
                            <div className="text-muted-foreground px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                                Navigation & Raccourcis
                            </div>
                            <div className="mt-1 space-y-1">
                                {results.navigation.map((item) => {
                                    currentIndexCounter++;
                                    const indexForElement = currentIndexCounter;
                                    const isSelected =
                                        selectedIndex === indexForElement;
                                    return (
                                        <div
                                            key={item.id}
                                            ref={(el) => {
                                                if (el) {
                                                    itemRefs.current.set(
                                                        indexForElement,
                                                        el
                                                    );
                                                } else {
                                                    itemRefs.current.delete(
                                                        indexForElement
                                                    );
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() =>
                                                navigateTo(item.href)
                                            }
                                            onMouseEnter={() =>
                                                setSelectedIndex(
                                                    indexForElement
                                                )
                                            }
                                            className={cn(
                                                "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-2 text-sm transition-colors sm:px-3 sm:py-2.5",
                                                isSelected
                                                    ? "bg-accent/80 text-foreground border-border/80 font-medium shadow-2xs"
                                                    : "hover:bg-muted/60 text-foreground border-transparent"
                                            )}
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                                                <div
                                                    className={cn(
                                                        "shrink-0 rounded-md p-1.5 transition-colors",
                                                        isSelected
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    {getNavIcon(item.icon)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-foreground block truncate font-medium">
                                                        {item.title}
                                                    </span>
                                                    <p className="text-muted-foreground truncate text-xs">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CornerDownLeft className="text-muted-foreground hidden h-4 w-4 shrink-0 sm:block" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Section 2 : Devis Trouvés */}
                    {results.quotes.length > 0 && (
                        <div>
                            <div className="text-muted-foreground flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                                <span>
                                    Dossiers de Devis ({results.quotes.length})
                                </span>
                                <span className="hidden text-[10px] normal-case opacity-70 sm:inline-block">
                                    Aller au dossier ↵
                                </span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {results.quotes.map((q) => {
                                    currentIndexCounter++;
                                    const indexForElement = currentIndexCounter;
                                    const isSelected =
                                        selectedIndex === indexForElement;
                                    return (
                                        <div
                                            key={q.id}
                                            ref={(el) => {
                                                if (el) {
                                                    itemRefs.current.set(
                                                        indexForElement,
                                                        el
                                                    );
                                                } else {
                                                    itemRefs.current.delete(
                                                        indexForElement
                                                    );
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() =>
                                                navigateTo(
                                                    `/admin/quotes/${encodeURIComponent(q.id)}`
                                                )
                                            }
                                            onMouseEnter={() =>
                                                setSelectedIndex(
                                                    indexForElement
                                                )
                                            }
                                            className={cn(
                                                "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-2 text-sm transition-colors sm:px-3 sm:py-2.5",
                                                isSelected
                                                    ? "bg-accent/80 text-foreground border-border/80 font-medium shadow-2xs"
                                                    : "hover:bg-muted/60 text-foreground border-transparent"
                                            )}
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                                                <div
                                                    className={cn(
                                                        "shrink-0 rounded-md p-1.5 transition-colors",
                                                        isSelected
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    <Truck className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span className="text-foreground truncate font-semibold">
                                                            {q.client}
                                                        </span>
                                                        <span className="text-muted-foreground shrink-0 font-mono text-xs">
                                                            #{q.id.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground truncate text-xs">
                                                        {q.pickup} ➔ {q.dropoff}{" "}
                                                        • {q.itemType}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="ml-1.5 flex shrink-0 items-center gap-1.5 sm:ml-2 sm:gap-2">
                                                <QuoteStatusBadge
                                                    status={q.status}
                                                    className="px-1.5 py-0 text-[10px]"
                                                />
                                                {isSelected && (
                                                    <CornerDownLeft className="text-muted-foreground hidden h-4 w-4 sm:block" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Section 3 : Contacts & Messages */}
                    {results.contacts.length > 0 && (
                        <div>
                            <div className="text-muted-foreground flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                                <span>
                                    Messages & Demandes (
                                    {results.contacts.length})
                                </span>
                                <span className="hidden text-[10px] normal-case opacity-70 sm:inline-block">
                                    Voir le message ↵
                                </span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {results.contacts.map((c) => {
                                    currentIndexCounter++;
                                    const indexForElement = currentIndexCounter;
                                    const isSelected =
                                        selectedIndex === indexForElement;
                                    return (
                                        <div
                                            key={c.id}
                                            ref={(el) => {
                                                if (el) {
                                                    itemRefs.current.set(
                                                        indexForElement,
                                                        el
                                                    );
                                                } else {
                                                    itemRefs.current.delete(
                                                        indexForElement
                                                    );
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() =>
                                                navigateTo(
                                                    `/admin/contacts?q=${encodeURIComponent(c.email)}`
                                                )
                                            }
                                            onMouseEnter={() =>
                                                setSelectedIndex(
                                                    indexForElement
                                                )
                                            }
                                            className={cn(
                                                "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-2 text-sm transition-colors sm:px-3 sm:py-2.5",
                                                isSelected
                                                    ? "bg-accent/80 text-foreground border-border/80 font-medium shadow-2xs"
                                                    : "hover:bg-muted/60 text-foreground border-transparent"
                                            )}
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                                                <div
                                                    className={cn(
                                                        "shrink-0 rounded-md p-1.5 transition-colors",
                                                        isSelected
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span className="text-foreground truncate font-semibold">
                                                            {c.name}
                                                        </span>
                                                        <span className="text-muted-foreground truncate text-xs">
                                                            {c.email}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground truncate text-xs">
                                                        {c.messageSnippet}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="ml-1.5 flex shrink-0 items-center gap-1.5 sm:ml-2 sm:gap-2">
                                                <Badge
                                                    variant={
                                                        c.status === "Non lu"
                                                            ? "destructive"
                                                            : "secondary"
                                                    }
                                                    className="px-1.5 py-0 text-[10px]"
                                                >
                                                    {c.status}
                                                </Badge>
                                                {isSelected && (
                                                    <CornerDownLeft className="text-muted-foreground hidden h-4 w-4 sm:block" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* État vide si aucune correspondance */}
                    {query.trim().length > 0 &&
                        !isSearching &&
                        totalResults === 0 && (
                            <div className="text-muted-foreground flex flex-col items-center justify-center p-6 text-center sm:p-8">
                                <Search className="text-muted-foreground/40 mb-2 h-7 w-7 sm:h-8 sm:w-8" />
                                <p className="text-foreground text-sm font-semibold">
                                    Aucun résultat pour « {query} »
                                </p>
                                <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
                                    Vérifiez l&apos;orthographe ou essayez avec
                                    un numéro de téléphone, une ville ou un nom
                                    de client.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="mt-4 text-xs"
                                >
                                    Effacer la recherche
                                </Button>
                            </div>
                        )}
                </div>

                {/* Footer avec repères clavier desktop et hint mobile */}
                <div className="bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-xs sm:px-4 sm:py-2.5">
                    <div className="hidden items-center gap-3 sm:flex">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-background rounded border px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
                                ↑
                            </kbd>
                            <kbd className="bg-background rounded border px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
                                ↓
                            </kbd>
                            <span>Naviguer</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-background rounded border px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
                                ↵
                            </kbd>
                            <span>Ouvrir</span>
                        </span>
                    </div>

                    <div className="text-muted-foreground flex items-center text-[11px] sm:hidden">
                        <span>Touchez pour ouvrir</span>
                    </div>

                    <div className="text-primary flex items-center gap-1 text-[11px] font-medium">
                        <span>HBC Command Palette</span>
                        <Command className="h-3.5 w-3.5" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
