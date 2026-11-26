"use client";

import { useMemo, useState } from "react";
import {
    Download,
    Loader2,
    Mail,
    Search,
    Send,
    Trash2,
    UserCheck,
    UserX,
} from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { safeFormatDate } from "@/lib/date-utils";
import {
    deleteNewsletterSubscriberAction,
    sendNewsletterCampaignAction,
    type NewsletterSubscriberDTO,
} from "@/app/actions/newsletter-actions";

interface NewsletterAdminPanelProps {
    initialSubscribers: NewsletterSubscriberDTO[];
}

/**
 * Console d'administration Newsletter : suivi des abonnés actifs/désinscrits,
 * export CSV et envoi de campagnes email brandées HBC Logistique.
 */
export function NewsletterAdminPanel({
    initialSubscribers,
}: NewsletterAdminPanelProps) {
    const [subscribers, setSubscribers] =
        useState<NewsletterSubscriberDTO[]>(initialSubscribers);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);

    const activeCount = useMemo(
        () => subscribers.filter((s) => s.status === "ACTIVE").length,
        [subscribers]
    );
    const unsubscribedCount = subscribers.length - activeCount;

    const filteredSubscribers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return subscribers;
        return subscribers.filter(
            (s) =>
                s.email.toLowerCase().includes(q) ||
                s.source.toLowerCase().includes(q)
        );
    }, [subscribers, search]);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await deleteNewsletterSubscriberAction(id);
            if (res.data?.deleted) {
                setSubscribers((prev) => prev.filter((s) => s.id !== id));
                toast.success("Abonné supprimé.");
            } else {
                toast.error(res.error || "Impossible de supprimer cet abonné.");
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleExportCsv = () => {
        const header = "email,status,source,subscribedAt\n";
        const rows = subscribers
            .map(
                (s) =>
                    `"${s.email.replace(/"/g, '""')}",${s.status},${s.source},${s.subscribedAt}`
            )
            .join("\n");
        const blob = new Blob([header + rows], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hbc-newsletter-abonnes-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export CSV téléchargé.");
    };

    const handleSendCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeCount === 0 || sending) return;

        setSending(true);
        try {
            const res = await sendNewsletterCampaignAction({ subject, body });
            if (res.error || !res.data) {
                toast.error(
                    res.error || "Impossible d'envoyer la campagne newsletter."
                );
            } else {
                toast.success(
                    `Campagne envoyée : ${res.data.sentCount}/${res.data.totalActive} email(s) livré(s).`
                );
                setSubject("");
                setBody("");
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">
                                Abonnés actifs
                            </p>
                            <p className="font-mono text-2xl font-bold">
                                {activeCount}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="bg-muted text-muted-foreground rounded-xl p-2.5">
                            <UserX className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">
                                Désinscrits
                            </p>
                            <p className="font-mono text-2xl font-bold">
                                {unsubscribedCount}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">
                                Total inscrits
                            </p>
                            <p className="font-mono text-2xl font-bold">
                                {subscribers.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Rédaction & Envoi de Campagne */}
                <Card className="lg:col-span-5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Send className="text-primary h-4 w-4" />
                            Envoyer une campagne Newsletter
                        </CardTitle>
                        <CardDescription>
                            Diffusée à tous les abonnés actifs ({activeCount})
                            avec charte HBC et lien de désinscription 1-clic.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSendCampaign}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="nws-subject">
                                    Objet de l&apos;email
                                </Label>
                                <Input
                                    id="nws-subject"
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Ex: Nouveaux porte-chars disponibles sur Abidjan & San-Pédro"
                                    className="min-h-[42px]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="nws-body">
                                    Message de la newsletter
                                </Label>
                                <Textarea
                                    id="nws-body"
                                    required
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Rédigez votre actualité logistique, vos offres spéciales ou disponibilités flotte..."
                                    className="min-h-[170px]"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={
                                    sending ||
                                    activeCount === 0 ||
                                    !subject.trim() ||
                                    body.trim().length < 20
                                }
                                className="min-h-[44px] w-full gap-2"
                            >
                                {sending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {sending
                                    ? "Envoi en cours..."
                                    : `Envoyer à ${activeCount} abonné(s) actif(s)`}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Liste des abonnés */}
                <Card className="lg:col-span-7">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-base">
                                Liste des abonnés ({filteredSubscribers.length})
                            </CardTitle>
                            <CardDescription>
                                Inscriptions collectées depuis le footer et le
                                site.
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleExportCsv}
                            disabled={subscribers.length === 0}
                            className="min-h-[40px] gap-1.5"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Filtrer par email ou source..."
                                className="min-h-[42px] pl-9"
                            />
                        </div>

                        {filteredSubscribers.length === 0 ? (
                            <p className="text-muted-foreground rounded-xl border border-dashed py-10 text-center text-sm">
                                Aucun abonné newsletter trouvé.
                            </p>
                        ) : (
                            <div className="divide-y rounded-xl border">
                                {filteredSubscribers.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 text-sm"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-xs font-semibold sm:text-sm">
                                                {sub.email}
                                            </p>
                                            <p className="text-muted-foreground text-[11px]">
                                                Inscrit le{" "}
                                                {safeFormatDate(
                                                    sub.subscribedAt,
                                                    "dd/MM/yyyy 'à' HH:mm"
                                                )}{" "}
                                                • source : {sub.source}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    sub.status === "ACTIVE"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className={
                                                    sub.status === "ACTIVE"
                                                        ? "bg-emerald-600 text-[10px] text-white"
                                                        : "text-[10px]"
                                                }
                                            >
                                                {sub.status === "ACTIVE"
                                                    ? "Actif"
                                                    : "Désinscrit"}
                                            </Badge>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-rose-600 hover:bg-rose-500/10"
                                                onClick={() =>
                                                    handleDelete(sub.id)
                                                }
                                                disabled={deletingId === sub.id}
                                                aria-label={`Supprimer ${sub.email}`}
                                            >
                                                {deletingId === sub.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
