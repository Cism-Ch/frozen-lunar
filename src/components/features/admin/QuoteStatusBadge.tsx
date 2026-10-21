import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuoteStatusType =
    | "Validé"
    | "VALIDATED"
    | "En attente"
    | "PENDING"
    | "Refusé"
    | "REJECTED"
    | string;

interface QuoteStatusBadgeProps {
    status: QuoteStatusType;
    className?: string;
    showIcon?: boolean;
}

/**
 * Composant de Badge de Statut Devis unifié
 * Utilisé uniformément sur le Dashboard, la liste des devis, les détails et les tiroirs.
 */
export function QuoteStatusBadge({
    status,
    className,
    showIcon = true,
}: QuoteStatusBadgeProps) {
    const normalized = String(status).trim();
    const isValide =
        normalized === "Validé" || normalized.toUpperCase() === "VALIDATED";
    const isRefuse =
        normalized === "Refusé" || normalized.toUpperCase() === "REJECTED";
    const isEnAttente =
        normalized === "En attente" || normalized.toUpperCase() === "PENDING";

    if (isValide) {
        return (
            <Badge
                variant="default"
                className={cn(
                    "bg-emerald-600 font-medium tracking-wide text-white shadow-2xs transition-colors hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700",
                    className
                )}
            >
                {showIcon && <CheckCircle className="mr-1 h-3 w-3 shrink-0" />}
                Validé
            </Badge>
        );
    }

    if (isRefuse) {
        return (
            <Badge
                variant="destructive"
                className={cn(
                    "bg-red-600 font-medium tracking-wide text-white shadow-2xs transition-colors hover:bg-red-700 dark:bg-red-700",
                    className
                )}
            >
                {showIcon && <XCircle className="mr-1 h-3 w-3 shrink-0" />}
                Refusé
            </Badge>
        );
    }

    if (isEnAttente) {
        return (
            <Badge
                variant="secondary"
                className={cn(
                    "border border-amber-500/20 bg-amber-500/10 font-medium tracking-wide text-amber-700 shadow-2xs transition-colors hover:bg-amber-500/20 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
                    className
                )}
            >
                {showIcon && <Clock className="mr-1 h-3 w-3 shrink-0" />}
                En attente
            </Badge>
        );
    }

    // Statut par défaut / Inconnu
    return (
        <Badge
            variant="outline"
            className={cn("text-muted-foreground", className)}
        >
            {status}
        </Badge>
    );
}
