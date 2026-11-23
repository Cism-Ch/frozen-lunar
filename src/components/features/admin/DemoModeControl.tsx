"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Sparkles, Trash2, Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    injectDemoDataAction,
    clearDemoDataAction,
} from "@/app/actions/demo-actions";

export function DemoModeControl() {
    const [loadingInject, setLoadingInject] = useState(false);
    const [loadingClear, setLoadingClear] = useState(false);
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);

    const handleInject = async () => {
        setLoadingInject(true);
        try {
            const res = await injectDemoDataAction();
            if (res.error) {
                toast.error("Erreur lors de l'injection : " + res.error);
            } else if (res.data?.insertedCount === 0) {
                toast.info(
                    "Les 8 devis de démo sont déjà présents en base de données."
                );
            } else {
                toast.success(
                    `${res.data?.insertedCount} devis de démo (Côte d'Ivoire, HBC-YYYY-XXXX) injectés.`
                );
            }
        } catch {
            toast.error("Une erreur réseau s'est produite.");
        } finally {
            setLoadingInject(false);
        }
    };

    const handleClear = async () => {
        setLoadingClear(true);
        try {
            const res = await clearDemoDataAction();
            if (res.error) {
                toast.error("Erreur lors du nettoyage : " + res.error);
            } else {
                toast.info(
                    `Purge démo terminée : ${res.data?.deletedCount} devis supprimés de la base.`
                );
                setConfirmClearOpen(false);
            }
        } catch {
            toast.error("Une erreur réseau s'est produite.");
        } finally {
            setLoadingClear(false);
        }
    };

    return (
        <>
            <Card className="border-primary/20 bg-card shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Database className="text-primary h-5 w-5" />
                        <CardTitle className="text-lg font-bold">
                            Mode Démo & Données Test
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Injectez 8 demandes de devis réalistes en Côte
                        d&apos;Ivoire (tous statuts, dates dynamiques et codes
                        HBC) pour tester l&apos;interface admin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={handleInject}
                        disabled={loadingInject || loadingClear}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                        {loadingInject ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Injecter 8 Devis de Démo
                    </Button>

                    <Button
                        onClick={() => setConfirmClearOpen(true)}
                        disabled={loadingInject || loadingClear}
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                        {loadingClear ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Purger Devis Démo
                    </Button>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmClearOpen}
                onOpenChange={setConfirmClearOpen}
                title="Purger tous les devis de démonstration ?"
                description="Cette action supprimera les 8 devis de démonstration (ainsi que les anciens devis démo obsolètes) de la base PostgreSQL sans toucher aux vrais dossiers clients."
                confirmLabel="Purger les données démo"
                cancelLabel="Annuler"
                variant="destructive"
                isLoading={loadingClear}
                onConfirm={handleClear}
            />
        </>
    );
}
