"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Settings,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { safeFormatDate } from "@/lib/date-utils";
import {
    acknowledgeChangelogUpdateAction,
    getAdminWhatsNewAction,
    type AdminWhatsNewState,
} from "@/app/actions/notification-management";

/**
 * Indicateur `!` ("What's New") dans la barre d'en-tête admin + modale de nouveautés.
 * Piloté en direct par le paramètre `notifySystemUpdates` et la période de fraîcheur du changelog JSON.
 */
export function AdminWhatsNew() {
    const [state, setState] = useState<AdminWhatsNewState | null>(null);
    const [open, setOpen] = useState(false);
    const [acknowledging, setAcknowledging] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            const res = await getAdminWhatsNewAction();
            if (!active || !res.data) return;
            setState(res.data);

            // Affiche automatiquement la modale une seule fois par session si une mise à jour est non lue
            if (
                res.data.enabled &&
                res.data.isFresh &&
                res.data.hasUnreadUpdate &&
                res.data.latest &&
                typeof window !== "undefined"
            ) {
                const sessionKey = `hbc_whats_new_prompted_${res.data.latest.key}`;
                if (!window.sessionStorage.getItem(sessionKey)) {
                    window.sessionStorage.setItem(sessionKey, "1");
                    setOpen(true);
                }
            }
        };
        void load();
        return () => {
            active = false;
        };
    }, []);

    if (!state || !state.enabled || !state.isFresh || !state.latest) {
        return null;
    }

    const latest = state.latest;

    const handleAcknowledge = async () => {
        if (!state.hasUnreadUpdate) {
            setOpen(false);
            return;
        }
        setAcknowledging(true);
        try {
            const res = await acknowledgeChangelogUpdateAction(latest.key);
            if (res.data?.acknowledged) {
                setState((prev) =>
                    prev ? { ...prev, hasUnreadUpdate: false } : prev
                );
            }
        } finally {
            setAcknowledging(false);
            setOpen(false);
        }
    };

    return (
        <>
            <div className="group relative flex items-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(true)}
                    aria-label={`What's New : Mise à jour v${latest.version}`}
                    className="relative h-9 w-9 rounded-full border border-amber-500/35 bg-amber-500/10 text-amber-600 transition-colors hover:bg-amber-500/20 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                    <AlertCircle className="h-4.5 w-4.5" />
                    {state.hasUnreadUpdate && (
                        <span className="ring-background absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-[#FF7C24] ring-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF7C24] opacity-70 motion-reduce:hidden" />
                        </span>
                    )}
                </Button>

                {/* Tooltip What's New au survol / focus */}
                <span
                    role="tooltip"
                    className="bg-popover text-popover-foreground pointer-events-none absolute top-full right-0 z-50 mt-2 hidden w-max max-w-[220px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-lg group-focus-within:block group-hover:block"
                >
                    What&apos;s New • v{latest.version}
                </span>
            </div>

            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen && state.hasUnreadUpdate) {
                        void handleAcknowledge();
                    } else {
                        setOpen(nextOpen);
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="gap-1 bg-[#001F3D] text-white">
                                <Sparkles className="h-3 w-3 text-[#FF7C24]" />
                                What&apos;s New • v{latest.version}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {latest.sprint}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="font-mono text-[10px]"
                            >
                                {latest.key}
                            </Badge>
                        </div>
                        <DialogTitle className="text-xl leading-snug">
                            {latest.title}
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed">
                            {latest.summary}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted/35 space-y-2.5 rounded-xl border p-4">
                        <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                            Points clés de cette mise à jour (
                            {safeFormatDate(latest.publishedAt, "dd MMM yyyy")})
                        </p>
                        <ul className="space-y-2 text-sm">
                            {latest.highlights.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-2 leading-snug"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground gap-1.5 text-xs"
                                asChild
                                onClick={() => setOpen(false)}
                            >
                                <Link href="/admin/settings?tab=notifications">
                                    <Settings className="h-3.5 w-3.5" />
                                    Alertes
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs"
                                asChild
                                onClick={() => {
                                    void handleAcknowledge();
                                }}
                            >
                                <Link href="/admin/changelog">
                                    Tout le changelog
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            onClick={handleAcknowledge}
                            disabled={acknowledging}
                            className="min-h-[40px] gap-1.5"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Compris
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
