"use client";

import { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Columns2,
    Columns3,
    Rows3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FleetGridColumns = 1 | 2 | 3;

const ROWS_PER_PAGE = 6;

/**
 * Hook responsive mobile-first pour gérer les grilles flotte 1×6, 2×6 et 3×6 :
 * - Mobile (< 640px) : 1×6 (6 véhicules/page)
 * - Tablette (640px–1023px) : 2×6 (12 véhicules/page)
 * - Desktop (>= 1024px) : 3×6 (18 véhicules/page)
 * L'utilisateur peut ajuster manuellement sur tablette/desktop sans jamais casser l'affichage mobile.
 */
export function useFleetGridLayout() {
    const [viewportMaxCols, setViewportMaxCols] = useState<FleetGridColumns>(3);
    const [preferredCols, setPreferredCols] = useState<FleetGridColumns | null>(
        null
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        const update = () => {
            const w = window.innerWidth;
            if (w < 640) setViewportMaxCols(1);
            else if (w < 1024) setViewportMaxCols(2);
            else setViewportMaxCols(3);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const activeColumns: FleetGridColumns = preferredCols
        ? (Math.min(preferredCols, viewportMaxCols) as FleetGridColumns)
        : viewportMaxCols;

    const pageSize = activeColumns * ROWS_PER_PAGE;

    const gridClassName =
        activeColumns === 1
            ? "grid grid-cols-1 gap-6"
            : activeColumns === 2
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2"
              : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

    return {
        activeColumns,
        viewportMaxCols,
        pageSize,
        gridClassName,
        setColumns: setPreferredCols,
    };
}

interface FleetLayoutToggleProps {
    activeColumns: FleetGridColumns;
    viewportMaxCols: FleetGridColumns;
    onSelect: (cols: FleetGridColumns) => void;
}

/**
 * Sélecteur d'affichage compact 1×6 / 2×6 / 3×6 (mobile-first).
 */
export function FleetLayoutToggle({
    activeColumns,
    viewportMaxCols,
    onSelect,
}: FleetLayoutToggleProps) {
    return (
        <div
            className="bg-muted/60 inline-flex items-center gap-1 rounded-xl border p-1"
            role="group"
            aria-label="Disposition de la grille flotte"
        >
            <Button
                type="button"
                size="sm"
                variant={activeColumns === 1 ? "default" : "ghost"}
                onClick={() => onSelect(1)}
                className="h-8 gap-1.5 px-2.5 text-xs font-semibold"
                title="Affichage 1 colonne × 6 lignes (6 par page)"
            >
                <Rows3 className="h-3.5 w-3.5" />
                <span>1×6</span>
            </Button>

            <Button
                type="button"
                size="sm"
                variant={activeColumns === 2 ? "default" : "ghost"}
                onClick={() => onSelect(2)}
                disabled={viewportMaxCols < 2}
                className={cn(
                    "hidden h-8 gap-1.5 px-2.5 text-xs font-semibold sm:inline-flex"
                )}
                title="Affichage 2 colonnes × 6 lignes (12 par page)"
            >
                <Columns2 className="h-3.5 w-3.5" />
                <span>2×6</span>
            </Button>

            <Button
                type="button"
                size="sm"
                variant={activeColumns === 3 ? "default" : "ghost"}
                onClick={() => onSelect(3)}
                disabled={viewportMaxCols < 3}
                className={cn(
                    "hidden h-8 gap-1.5 px-2.5 text-xs font-semibold lg:inline-flex"
                )}
                title="Affichage 3 colonnes × 6 lignes (18 par page)"
            >
                <Columns3 className="h-3.5 w-3.5" />
                <span>3×6</span>
            </Button>
        </div>
    );
}

interface FleetPaginationBarProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

/**
 * Barre de pagination responsive pour les grilles flotte 1×6, 2×6 et 3×6.
 */
export function FleetPaginationBar({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
}: FleetPaginationBarProps) {
    if (totalItems === 0) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-5 sm:flex-row">
            <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                Affichage{" "}
                <span className="text-foreground font-semibold">
                    {start}–{end}
                </span>{" "}
                sur{" "}
                <span className="text-foreground font-semibold">
                    {totalItems}
                </span>{" "}
                véhicule{totalItems > 1 ? "s" : ""}
            </p>

            {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="h-9 gap-1 px-3 text-xs font-semibold"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                    </Button>
                    <span className="text-muted-foreground px-2.5 font-mono text-xs font-semibold">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="h-9 gap-1 px-3 text-xs font-semibold"
                    >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
