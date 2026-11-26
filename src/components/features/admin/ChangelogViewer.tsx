"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    History,
    Search,
    Settings,
    Shield,
    Sparkles,
    Wrench,
    Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeFormatDate } from "@/lib/date-utils";
import type { ChangelogCategory, ChangelogEntry } from "@/lib/changelog";

interface ChangelogViewerProps {
    entries: ChangelogEntry[];
    freshnessWindowDays: number;
    notifySystemUpdatesEnabled: boolean;
}

const CATEGORY_META: Record<
    ChangelogCategory,
    { label: string; badgeClass: string; icon: typeof Sparkles }
> = {
    feature: {
        label: "Nouveauté",
        badgeClass:
            "border-primary/30 bg-primary/10 text-primary",
        icon: Sparkles,
    },
    security: {
        label: "Sécurité",
        badgeClass:
            "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        icon: Shield,
    },
    performance: {
        label: "Performance",
        badgeClass:
            "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
        icon: Zap,
    },
    improvement: {
        label: "Amélioration",
        badgeClass:
            "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
        icon: Sparkles,
    },
    fix: {
        label: "Correctif",
        badgeClass:
            "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        icon: Wrench,
    },
};

const FILTER_OPTIONS: Array<{ value: "all" | ChangelogCategory; label: string }> = [
    { value: "all", label: "Tout" },
    { value: "feature", label: "Nouveautés" },
    { value: "security", label: "Sécurité" },
    { value: "performance", label: "Performance" },
    { value: "improvement", label: "Améliorations" },
    { value: "fix", label: "Correctifs" },
];

/**
 * Vue structurée du changelog JSON (`src/data/changelog.json`) pour la console admin.
 */
export function ChangelogViewer({
    entries,
    freshnessWindowDays,
    notifySystemUpdatesEnabled,
}: ChangelogViewerProps) {
    const [selectedCategory, setSelectedCategory] = useState<
        "all" | ChangelogCategory
    >("all");
    const [search, setSearch] = useState("");

    const filteredEntries = useMemo(() => {
        const q = search.trim().toLowerCase();
        return entries.filter((entry) => {
            if (
                selectedCategory !== "all" &&
                entry.category !== selectedCategory
            ) {
                return false;
            }
            if (!q) return true;
            return (
                entry.title.toLowerCase().includes(q) ||
                entry.summary.toLowerCase().includes(q) ||
                entry.version.toLowerCase().includes(q) ||
                entry.key.toLowerCase().includes(q) ||
                entry.sprint.toLowerCase().includes(q) ||
                entry.highlights.some((h) => h.toLowerCase().includes(q))
            );
        });
    }, [entries, selectedCategory, search]);

    const latest = entries[0] ?? null;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* En-tête exécutif */}
            <div className="from-card via-card to-primary/5 flex flex-col justify-between gap-4 rounded-2xl border bg-linear-to-r p-6 shadow-xs sm:flex-row sm:items-center">
                <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className="gap-1 bg-[#001F3D] text-white">
                            <History className="h-3 w-3 text-[#FF7C24]" />
                            Journal des évolutions
                        </Badge>
                        {latest && (
                            <Badge variant="outline" className="font-mono text-xs">
                                v{latest.version} • {latest.key}
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Nouveautés &amp; Changelog Plateforme
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Suivi synthétique des évolutions majeures issues des
                        sprints HBC Logistique (fenêtre What&apos;s New :{" "}
                        {freshnessWindowDays} jours).
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        variant={
                            notifySystemUpdatesEnabled ? "default" : "secondary"
                        }
                        className={
                            notifySystemUpdatesEnabled
                                ? "bg-emerald-600 text-white"
                                : ""
                        }
                    >
                        {notifySystemUpdatesEnabled
                            ? "Alertes What's New actives"
                            : "Alertes What's New désactivées"}
                    </Badge>
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                        <Link href="/admin/settings?tab=notifications">
                            <Settings className="h-4 w-4" />
                            Configurer
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filtres & Recherche */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                    {FILTER_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSelectedCategory(opt.value)}
                            className={`min-h-[38px] rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                                selectedCategory === opt.value
                                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                                    : "border-border bg-card hover:border-primary/40"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher une version, clé..."
                        className="min-h-[40px] pl-9 text-xs"
                    />
                </div>
            </div>

            {/* Timeline des évolutions */}
            {filteredEntries.length === 0 ? (
                <Card>
                    <CardContent className="text-muted-foreground py-12 text-center text-sm">
                        Aucune évolution ne correspond à votre filtre.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredEntries.map((entry, idx) => {
                        const meta = CATEGORY_META[entry.category];
                        const Icon = meta.icon;
                        return (
                            <Card
                                key={entry.key}
                                className={
                                    idx === 0 && selectedCategory === "all" && !search
                                        ? "border-primary/35 shadow-sm"
                                        : ""
                                }
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`gap-1 text-xs ${meta.badgeClass}`}
                                            >
                                                <Icon className="h-3 w-3" />
                                                {meta.label}
                                            </Badge>
                                            <Badge className="font-mono text-xs">
                                                v{entry.version}
                                            </Badge>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {entry.sprint}
                                            </Badge>
                                            <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[11px]">
                                                {entry.key}
                                            </code>
                                        </div>
                                        <span className="text-muted-foreground font-mono text-xs">
                                            {safeFormatDate(
                                                entry.publishedAt,
                                                "dd MMM yyyy"
                                            )}
                                        </span>
                                    </div>
                                    <CardTitle className="mt-2 text-lg">
                                        {entry.title}
                                    </CardTitle>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {entry.summary}
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <ul className="bg-muted/25 space-y-1.5 rounded-xl border p-3.5 text-sm">
                                        {entry.highlights.map((hl) => (
                                            <li
                                                key={hl}
                                                className="flex items-start gap-2 leading-snug"
                                            >
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                <span>{hl}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
