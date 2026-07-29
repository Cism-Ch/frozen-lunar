"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Trash2, Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { injectDemoDataAction, clearDemoDataAction } from "@/app/actions/demo-actions";

export function DemoModeControl() {
    const [loadingInject, setLoadingInject] = useState(false);
    const [loadingClear, setLoadingClear] = useState(false);

    const handleInject = async () => {
        setLoadingInject(true);
        try {
            const res = await injectDemoDataAction();
            if (res.error) {
                toast.error("Erreur lors de l'injection : " + res.error);
            } else {
                toast.success(
                    `Succès ! ${res.data?.insertedCount} devis de démo insérés en base de données.`
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
                    `Purger démo : ${res.data?.deletedCount} devis supprimés de la base.`
                );
            }
        } catch {
            toast.error("Une erreur réseau s'est produite.");
        } finally {
            setLoadingClear(false);
        }
    };

    return (
        <Card className="border-primary/20 bg-card shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Database className="text-primary h-5 w-5" />
                    <CardTitle className="text-lg font-bold">Mode Démo & Données Test</CardTitle>
                </div>
                <CardDescription>
                    Injectez des demandes de devis réalistes (compagnies du BTP, fret lourd, transport spécialisé) directement en base PostgreSQL pour tester l&apos;interface admin.
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
                    onClick={handleClear}
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
    );
}
