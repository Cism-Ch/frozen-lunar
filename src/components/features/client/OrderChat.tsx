"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    Bot,
    Hand,
    Loader2,
    MessageSquare,
    RefreshCw,
    Send,
    ShieldCheck,
    User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { supabase } from "@/lib/supabase";
import {
    getOrCreateQuoteThreadAction,
    sendThreadMessageAction,
    toggleThreadHumanTakeoverAction,
    type SupportMessageDTO,
    type SupportThreadDTO,
} from "@/app/actions/thread-actions";

interface OrderChatProps {
    quoteId: string;
    viewerRole: "client" | "admin";
}

function formatMessageTime(iso: string): string {
    try {
        return new Intl.DateTimeFormat("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(iso));
    } catch {
        return "";
    }
}

export function OrderChat({ quoteId, viewerRole }: OrderChatProps) {
    const [thread, setThread] = useState<SupportThreadDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    const loadThread = useCallback(async () => {
        const res = await getOrCreateQuoteThreadAction(quoteId);
        if (res.data) {
            setThread(res.data);
            setTimeout(scrollToBottom, 50);
        }
        setLoading(false);
    }, [quoteId, scrollToBottom]);

    useEffect(() => {
        let active = true;
        async function initThread() {
            const res = await getOrCreateQuoteThreadAction(quoteId);
            if (!active) return;
            if (res.data) {
                setThread(res.data);
                setTimeout(scrollToBottom, 50);
            }
            setLoading(false);
        }
        void initThread();
        return () => {
            active = false;
        };
    }, [quoteId, scrollToBottom]);

    // Souscription Supabase Realtime sélective (colonnes spécifiques du fil)
    useEffect(() => {
        const sb = supabase;
        if (!sb || !thread?.id) return;

        const channel = sb
            .channel(`support-thread-${thread.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "support_message",
                    filter: `threadId=eq.${thread.id}`,
                },
                (payload) => {
                    const row = payload.new as {
                        id?: string;
                        threadId?: string;
                        senderRole?: "CLIENT" | "AI" | "ADMIN";
                        senderName?: string;
                        content?: string;
                        createdAt?: string;
                    };
                    if (!row?.id || !row.content) return;

                    setThread((prev) => {
                        if (!prev) return prev;
                        if (prev.messages.some((m) => m.id === row.id)) {
                            return prev;
                        }
                        return {
                            ...prev,
                            messages: [
                                ...prev.messages.filter(
                                    (m) => !m.id.startsWith("optimistic-")
                                ),
                                {
                                    id: row.id!,
                                    threadId: row.threadId || prev.id,
                                    senderRole: row.senderRole || "AI",
                                    senderName: row.senderName || "HBC",
                                    content: row.content!,
                                    createdAt:
                                        row.createdAt ||
                                        new Date().toISOString(),
                                },
                            ],
                        };
                    });
                    setTimeout(scrollToBottom, 50);
                }
            )
            .subscribe();

        return () => {
            void sb.removeChannel(channel);
        };
    }, [thread?.id, scrollToBottom]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || !thread) return;

        setInput("");
        setSending(true);

        // Optimistic UI update
        const optimisticMsg: SupportMessageDTO = {
            id: `optimistic-${Date.now()}`,
            threadId: thread.id,
            senderRole: viewerRole === "admin" ? "ADMIN" : "CLIENT",
            senderName: viewerRole === "admin" ? "Validateur HBC" : "Vous",
            content: text,
            createdAt: new Date().toISOString(),
        };

        setThread((prev) =>
            prev
                ? { ...prev, messages: [...prev.messages, optimisticMsg] }
                : prev
        );
        setTimeout(scrollToBottom, 30);

        try {
            const res = await sendThreadMessageAction({
                quoteId,
                content: text,
            });
            if (res.error || !res.data) {
                toast.error(res.error || "Impossible d'envoyer le message.");
                await loadThread();
                return;
            }
            setThread(res.data);
            setTimeout(scrollToBottom, 50);
        } finally {
            setSending(false);
        }
    };

    const handleToggleTakeover = async () => {
        if (!thread) return;
        const nextMode =
            thread.status === "HUMAN_TAKEOVER"
                ? "AI_ACTIVE"
                : "HUMAN_TAKEOVER";

        setToggling(true);
        try {
            const res = await toggleThreadHumanTakeoverAction({
                quoteId,
                mode: nextMode,
            });
            if (res.error || !res.data) {
                toast.error(
                    res.error || "Impossible de modifier le mode du fil."
                );
                return;
            }
            setThread(res.data);
            toast.success(
                nextMode === "HUMAN_TAKEOVER"
                    ? "Vous avez pris la main (Assistant IA en pause)"
                    : "Assistant IA réactivé sur ce dossier"
            );
            setTimeout(scrollToBottom, 50);
        } finally {
            setToggling(false);
        }
    };

    if (loading) {
        return <Skeleton className="h-96 w-full rounded-xl" />;
    }

    const isHumanTakeover = thread?.status === "HUMAN_TAKEOVER";

    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MessageSquare className="text-primary h-4 w-4" />
                            Chat Suivi Dossier (IA &amp; Validateur Humain)
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-xs">
                            {isHumanTakeover
                                ? "Un validateur humain HBC a pris le relais — l'IA est en pause."
                                : "L'assistant IA répond instantanément sous supervision d'un validateur humain."}
                        </CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                            variant="outline"
                            className={
                                isHumanTakeover
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    : "border-primary/40 bg-primary/10 text-primary"
                            }
                        >
                            {isHumanTakeover ? (
                                <span className="inline-flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    Validateur Humain Actif
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1">
                                    <Bot className="h-3 w-3" />
                                    IA + Supervision
                                </span>
                            )}
                        </Badge>

                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => void loadThread()}
                            aria-label="Actualiser la discussion"
                            className="h-8 w-8"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {viewerRole === "admin" && (
                    <div className="pt-2">
                        <Button
                            type="button"
                            size="sm"
                            variant={isHumanTakeover ? "outline" : "default"}
                            disabled={toggling}
                            onClick={() => setConfirmToggleOpen(true)}
                            className="min-h-[38px] w-full gap-1.5 text-xs"
                        >
                            {toggling ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Hand className="h-3.5 w-3.5" />
                            )}
                            {isHumanTakeover
                                ? "Rendre la main à l'Assistant IA"
                                : "Prendre la main (Mettre l'IA en pause)"}
                        </Button>
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0">
                <div
                    ref={scrollRef}
                    className="max-h-[360px] min-h-[260px] space-y-3 overflow-y-auto p-4"
                >
                    {thread?.messages.map((msg) => {
                        const isOwn =
                            (viewerRole === "client" &&
                                msg.senderRole === "CLIENT") ||
                            (viewerRole === "admin" &&
                                msg.senderRole === "ADMIN");

                        const RoleIcon =
                            msg.senderRole === "AI"
                                ? Bot
                                : msg.senderRole === "ADMIN"
                                  ? ShieldCheck
                                  : User;

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${
                                    isOwn ? "items-end" : "items-start"
                                }`}
                            >
                                <div className="text-muted-foreground mb-1 flex items-center gap-1.5 px-1 text-[11px]">
                                    <RoleIcon className="h-3 w-3" />
                                    <span className="font-medium">
                                        {msg.senderName}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {formatMessageTime(msg.createdAt)}
                                    </span>
                                </div>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                                        isOwn
                                            ? "bg-primary text-primary-foreground"
                                            : msg.senderRole === "ADMIN"
                                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                                              : "bg-muted text-foreground"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>

            <CardFooter className="border-t p-3">
                <form onSubmit={handleSend} className="flex w-full gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            viewerRole === "admin"
                                ? "Répondre au client en tant que validateur..."
                                : "Écrire à l'IA ou demander un validateur humain..."
                        }
                        disabled={sending}
                        className="min-h-[44px] flex-1 text-xs"
                    />
                    <Button
                        type="submit"
                        disabled={sending || !input.trim()}
                        className="min-h-[44px] shrink-0 gap-1.5"
                    >
                        {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Envoyer
                    </Button>
                </form>
            </CardFooter>

            <ConfirmDialog
                open={confirmToggleOpen}
                onOpenChange={setConfirmToggleOpen}
                title={
                    isHumanTakeover
                        ? "Rendre la main à l'Assistant IA ?"
                        : "Prendre la main sur cette discussion ?"
                }
                description={
                    isHumanTakeover
                        ? "L'Assistant IA HBC recommencera à répondre automatiquement aux prochains messages du client."
                        : "L'Assistant IA sera mis en pause et le client sera informé qu'un validateur humain prend le relais."
                }
                confirmLabel={
                    isHumanTakeover ? "Réactiver l'IA" : "Prendre la main"
                }
                onConfirm={() => {
                    setConfirmToggleOpen(false);
                    void handleToggleTakeover();
                }}
            />
        </Card>
    );
}
