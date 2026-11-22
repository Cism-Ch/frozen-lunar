"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import {
    Activity,
    AlertTriangle,
    Bot,
    CheckCircle2,
    Clock,
    Database,
    HardDrive,
    Mail,
    MapPin,
    RefreshCw,
    Send,
    Server,
    ShieldCheck,
    XCircle,
    Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { motion, usePrefersReducedMotion } from "@/components/ui/motion";
import { fadeInUp, staggerContainer, transitions } from "@/lib/animations";
import type {
    HealthReport,
    ServiceCategory,
    ServiceHealthItem,
    ServiceStatus,
} from "@/lib/health-check";
import {
    getAdminHealthReportAction,
    sendTestAlertEmailAction,
    type AdminHealthSnapshot,
} from "@/app/actions/health-actions";

interface StatusDashboardProps {
    mode: "public" | "admin";
    initialReport: HealthReport;
    initialDiagnostics?: AdminHealthSnapshot["diagnostics"];
}

const STATUS_META: Record<
    ServiceStatus,
    {
        label: string;
        badgeClass: string;
        dotClass: string;
        icon: typeof CheckCircle2;
    }
> = {
    operational: {
        label: "Opérationnel",
        badgeClass:
            "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        dotClass: "bg-emerald-500",
        icon: CheckCircle2,
    },
    degraded: {
        label: "Dégradé",
        badgeClass:
            "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        dotClass: "bg-amber-500",
        icon: AlertTriangle,
    },
    outage: {
        label: "Indisponible",
        badgeClass:
            "border-destructive/30 bg-destructive/10 text-destructive",
        dotClass: "bg-destructive",
        icon: XCircle,
    },
    unconfigured: {
        label: "Non configuré",
        badgeClass: "border-border bg-muted text-muted-foreground",
        dotClass: "bg-muted-foreground",
        icon: Clock,
    },
};

const OVERALL_BANNER: Record<
    HealthReport["overallStatus"],
    {
        title: string;
        subtitle: string;
        cardClass: string;
        iconClass: string;
        icon: typeof CheckCircle2;
    }
> = {
    operational: {
        title: "Tous les systèmes essentiels sont opérationnels",
        subtitle:
            "Les services de devis, base de données, messagerie et cartographie répondent normalement.",
        cardClass:
            "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10",
        iconClass: "text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
    },
    degraded: {
        title: "Performance dégradée sur un ou plusieurs services",
        subtitle:
            "La plateforme reste accessible. Des mécanismes de secours (relais IA, Mode Robot) assurent la continuité.",
        cardClass: "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10",
        iconClass: "text-amber-600 dark:text-amber-400",
        icon: AlertTriangle,
    },
    outage: {
        title: "Incident critique détecté sur une dépendance",
        subtitle:
            "Nos équipes techniques ont été notifiées automatiquement pour rétablir le service au plus vite.",
        cardClass: "border-destructive/40 bg-destructive/5",
        iconClass: "text-destructive",
        icon: XCircle,
    },
};

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
    core: "Cœur & Données",
    infrastructure: "Infrastructure",
    messaging: "Messagerie",
    ai: "Intelligence Artificielle",
    maps: "Cartographie",
};

function getServiceIcon(service: ServiceHealthItem) {
    switch (service.id) {
        case "supabase-postgres":
            return Database;
        case "upstash-redis":
            return Zap;
        case "upstash-qstash":
            return Server;
        case "tigris-s3":
            return HardDrive;
        case "resend":
            return Mail;
        case "gemini-ai":
        case "openrouter-ai":
            return Bot;
        case "osm-geocoding":
            return MapPin;
        default:
            return Activity;
    }
}

function formatTime(iso: string): string {
    try {
        return new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "short",
            timeStyle: "medium",
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export function StatusDashboard({
    mode,
    initialReport,
    initialDiagnostics,
}: StatusDashboardProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [report, setReport] = useState<HealthReport>(initialReport);
    const [diagnostics, setDiagnostics] = useState(initialDiagnostics);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // État du formulaire de test Resend (mode admin uniquement)
    const [testRecipient, setTestRecipient] = useState(
        initialDiagnostics?.defaultAlertRecipient || ""
    );
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [lastTestResult, setLastTestResult] = useState<{
        recipient: string;
        sender: string;
        sentAt: string;
    } | null>(null);

    const handleRefresh = useCallback(
        async (forceBypassCache = false) => {
            setIsRefreshing(true);
            try {
                if (mode === "admin") {
                    const res = await getAdminHealthReportAction(forceBypassCache);
                    if (res.error || !res.data) {
                        toast.error(
                            res.error ||
                                "Impossible d'actualiser l'état des services."
                        );
                        return;
                    }
                    setReport(res.data.report);
                    setDiagnostics(res.data.diagnostics);
                    toast.success(
                        forceBypassCache
                            ? "Sondes exécutées en direct (hors cache)"
                            : "État des services actualisé"
                    );
                } else {
                    const response = await fetch("/api/health", {
                        cache: "no-store",
                    });
                    if (response.status === 429) {
                        toast.error(
                            "Limite de rafraîchissement atteinte. Veuillez patienter quelques secondes."
                        );
                        return;
                    }
                    const json = (await response.json()) as HealthReport;
                    if (json && Array.isArray(json.services)) {
                        setReport(json);
                        toast.success("Statut actualisé");
                    }
                }
            } catch {
                toast.error("Erreur réseau lors de la vérification du statut.");
            } finally {
                setIsRefreshing(false);
            }
        },
        [mode]
    );

    const handleSendTestAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingTest(true);
        try {
            const res = await sendTestAlertEmailAction({
                recipientEmail: testRecipient.trim() || undefined,
            });
            if (res.error || !res.data) {
                toast.error(res.error || "Échec de l'envoi de l'email de test.");
                return;
            }
            setLastTestResult({
                recipient: res.data.recipient,
                sender: res.data.sender,
                sentAt: res.data.sentAt,
            });
            toast.success(
                `Email d'alerte de test envoyé à ${res.data.recipient}`
            );
        } catch {
            toast.error("Erreur inattendue lors du test Resend.");
        } finally {
            setIsSendingTest(false);
        }
    };

    const banner = OVERALL_BANNER[report.overallStatus];
    const BannerIcon = banner.icon;

    const dashboardContent = (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Activity className="text-primary h-5 w-5" />
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {mode === "admin"
                                ? "Supervision & Uptime"
                                : "Statut des Services"}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Disponibilité en temps réel des dépendances techniques
                        de HBC Logistique (Côte d&apos;Ivoire).
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleRefresh(false)}
                        disabled={isRefreshing}
                        className="min-h-[44px] gap-2"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                        Actualiser
                    </Button>

                    {mode === "admin" && (
                        <Button
                            onClick={() => handleRefresh(true)}
                            disabled={isRefreshing}
                            className="min-h-[44px] gap-2"
                        >
                            <Zap className="h-4 w-4" />
                            Sonder en direct
                        </Button>
                    )}
                </div>
            </div>

            {/* Bannière d'état global */}
            <Card className={banner.cardClass}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="bg-background/80 rounded-xl border p-3 shadow-xs">
                            <BannerIcon
                                className={`h-6 w-6 ${banner.iconClass}`}
                            />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold">
                                {banner.title}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {banner.subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="text-muted-foreground flex flex-col items-start gap-1 text-xs sm:items-end">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            Dernière vérification : {formatTime(report.checkedAt)}
                        </span>
                        <Badge variant="outline" className="text-[11px]">
                            {report.cached
                                ? "Cache Redis (TTL 30s)"
                                : "Sonde directe"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Indicateurs synthétiques */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Opérationnels
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {report.summary.operational} /{" "}
                            {report.summary.total}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Dégradés
                        </p>
                        <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {report.summary.degraded}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Indisponibles
                        </p>
                        <p className="text-destructive mt-1 text-2xl font-bold">
                            {report.summary.outage}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Latence moyenne
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {report.summary.averageLatencyMs !== null
                                ? `${report.summary.averageLatencyMs} ms`
                                : "—"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Grille des dépendances */}
            <motion.div
                className="grid gap-4 md:grid-cols-2"
                initial={prefersReducedMotion ? false : "hidden"}
                animate="visible"
                variants={staggerContainer}
            >
                {report.services.map((service) => {
                    const meta = STATUS_META[service.status];
                    const ServiceIcon = getServiceIcon(service);

                    return (
                        <motion.div
                            key={service.id}
                            variants={fadeInUp}
                            transition={transitions.smooth}
                        >
                            <Card className="h-full transition-shadow hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 text-primary rounded-lg p-2">
                                                <ServiceIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base leading-snug">
                                                    {service.name}
                                                </CardTitle>
                                                <CardDescription className="mt-0.5 flex items-center gap-2 text-xs">
                                                    <span>
                                                        {
                                                            CATEGORY_LABELS[
                                                                service.category
                                                            ]
                                                        }
                                                    </span>
                                                    {service.critical && (
                                                        <span className="text-foreground/80 font-medium">
                                                            • Critique
                                                        </span>
                                                    )}
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={`shrink-0 gap-1.5 ${meta.badgeClass}`}
                                        >
                                            <span
                                                className={`h-2 w-2 rounded-full ${meta.dotClass}`}
                                            />
                                            {meta.label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between gap-3 text-xs">
                                        <p className="text-muted-foreground">
                                            {service.message}
                                        </p>
                                        <span className="bg-muted text-foreground shrink-0 rounded-md px-2 py-1 font-mono text-[11px]">
                                            {service.latencyMs !== null
                                                ? `${service.latencyMs} ms`
                                                : "N/A"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Panneau Admin : Test Resend & Diagnostics */}
            {mode === "admin" && diagnostics && (
                <>
                    <Separator />
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-primary h-5 w-5" />
                                    <CardTitle className="text-lg">
                                        Test d&apos;alerte Resend &amp;
                                        Configuration
                                    </CardTitle>
                                </div>
                                <Badge
                                    variant={
                                        diagnostics.resendConfigured
                                            ? "default"
                                            : "destructive"
                                    }
                                >
                                    {diagnostics.resendConfigured
                                        ? "Resend configuré"
                                        : "Clé Resend manquante"}
                                </Badge>
                            </div>
                            <CardDescription>
                                Vérifiez la délivrabilité réelle des emails
                                d&apos;avertissement administrateur. En cas de
                                panne critique, un verrou Redis de 30 minutes
                                évite les envois répétés.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted/40 grid gap-3 rounded-lg border p-4 text-xs sm:grid-cols-3">
                                <div>
                                    <span className="text-muted-foreground block">
                                        Expéditeur (EMAIL_FROM)
                                    </span>
                                    <span className="font-mono font-medium">
                                        {diagnostics.emailSender}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">
                                        Destinataire par défaut
                                    </span>
                                    <span className="font-mono font-medium">
                                        {diagnostics.defaultAlertRecipient}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">
                                        Environnement / Verrou Redis
                                    </span>
                                    <span className="font-mono font-medium">
                                        {diagnostics.environment} •{" "}
                                        {diagnostics.redisConfigured
                                            ? "Redis actif"
                                            : "Mémoire locale"}
                                    </span>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSendTestAlert}
                                className="flex flex-col gap-3 sm:flex-row"
                            >
                                <Input
                                    type="email"
                                    value={testRecipient}
                                    onChange={(e) =>
                                        setTestRecipient(e.target.value)
                                    }
                                    placeholder="Email destinataire (optionnel)"
                                    aria-label="Adresse email destinataire pour le test Resend"
                                    className="min-h-[44px] flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={
                                        isSendingTest ||
                                        !diagnostics.resendConfigured
                                    }
                                    className="min-h-[44px] shrink-0 gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    {isSendingTest
                                        ? "Envoi en cours..."
                                        : "Envoyer un email test"}
                                </Button>
                            </form>

                            {lastTestResult && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                    Dernier test envoyé avec succès à{" "}
                                    <span className="font-mono font-medium">
                                        {lastTestResult.recipient}
                                    </span>{" "}
                                    depuis{" "}
                                    <span className="font-mono">
                                        {lastTestResult.sender}
                                    </span>{" "}
                                    ({formatTime(lastTestResult.sentAt)}).
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Pied de page public */}
            {mode === "public" && (
                <div className="text-muted-foreground flex flex-col items-center justify-between gap-2 border-t pt-6 text-center text-xs sm:flex-row sm:text-left">
                    <p>
                        Point de contrôle JSON disponible sur{" "}
                        <code className="bg-muted rounded px-1.5 py-0.5">
                            /api/health
                        </code>
                        .
                    </p>
                    <Link
                        href="/contact"
                        className="text-primary font-medium hover:underline"
                    >
                        Signaler un incident au support HBC Logistique
                    </Link>
                </div>
            )}
        </div>
    );

    if (mode === "public") {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                    <SectionContainer className="bg-background pt-12 md:pt-16">
                        <div className="mx-auto max-w-5xl">
                            {dashboardContent}
                        </div>
                    </SectionContainer>
                </main>
                <Footer />
            </div>
        );
    }

    return dashboardContent;
}
