"use client";

import { useRef, useState } from "react";
import {
    Activity,
    Bot,
    CheckCircle2,
    FileText,
    Handshake,
    Loader2,
    Play,
    Send,
    ShieldAlert,
    Sparkles,
    Truck,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
    askAdminCopilotAction,
    executeAdminCopilotAction,
    type AdminCopilotDataItem,
    type AdminProposedAction,
} from "@/app/actions/admin-agent-actions";

interface CopilotMessage {
    id: string;
    role: "admin" | "assistant";
    text: string;
    dataItems?: AdminCopilotDataItem[];
    proposedAction?: AdminProposedAction | null;
    actionExecuted?: boolean;
    source?: string;
}

const QUICK_PROMPTS = [
    {
        label: "Résumé du jour",
        prompt: "Fais-moi un résumé opérationnel du jour",
        icon: Sparkles,
    },
    {
        label: "Devis en attente",
        prompt: "Liste les devis en attente de validation",
        icon: FileText,
    },
    {
        label: "Stock de la flotte",
        prompt: "Affiche l'état des stocks et tarifs de la flotte",
        icon: Truck,
    },
    {
        label: "Partenaires en étude",
        prompt: "Liste les candidatures partenaires en attente",
        icon: Handshake,
    },
    {
        label: "Santé des services",
        prompt: "Vérifie la santé des services et d'Upstash Redis",
        icon: Activity,
    },
] as const;

export function AdminCopilotClient() {
    const [messages, setMessages] = useState<CopilotMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            text: "Bonjour ! Je suis votre Copilote IA d'administration HBC Logistique. Vous pouvez me demander des synthèses (devis, flotte, partenaires, santé des services) ou me demander d'exécuter une action (ajuster un stock, modifier un tarif FCFA, valider un devis ou agréer un partenaire). Toute modification de données passe toujours par une confirmation explicite.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [confirmActionTarget, setConfirmActionTarget] = useState<{
        messageId: string;
        action: AdminProposedAction;
    } | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const msgCounterRef = useRef(0);
    const nextMsgId = (prefix: string) => {
        msgCounterRef.current += 1;
        return `${prefix}-${msgCounterRef.current}`;
    };

    const sendPrompt = async (promptText: string) => {
        const trimmed = promptText.trim();
        if (!trimmed || isSending) return;

        setInput("");
        const userMsg: CopilotMessage = {
            id: nextMsgId("u"),
            role: "admin",
            text: trimmed,
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsSending(true);

        try {
            const res = await askAdminCopilotAction({ prompt: trimmed });
            if (res.error || !res.data) {
                toast.error(res.error || "Le copilote n'a pas pu répondre.");
                return;
            }
            const botMsg: CopilotMessage = {
                id: nextMsgId("a"),
                role: "assistant",
                text: res.data.reply,
                dataItems: res.data.dataItems,
                proposedAction: res.data.proposedAction,
                source: res.data.source,
            };
            setMessages((prev) => [...prev, botMsg]);
        } finally {
            setIsSending(false);
        }
    };

    const handleConfirmExecute = async () => {
        if (!confirmActionTarget) return;
        setIsExecuting(true);
        try {
            const res = await executeAdminCopilotAction(
                confirmActionTarget.action
            );
            if (res.error || !res.data) {
                toast.error(res.error || "Échec de l'exécution de l'action.");
                return;
            }
            const executedMessage = res.data.message;
            toast.success(executedMessage);
            setMessages((prev) => [
                ...prev.map((m) =>
                    m.id === confirmActionTarget.messageId
                        ? { ...m, actionExecuted: true }
                        : m
                ),
                {
                    id: nextMsgId("exec"),
                    role: "assistant",
                    text: `Action exécutée avec succès : ${executedMessage}`,
                },
            ]);
        } finally {
            setIsExecuting(false);
            setConfirmActionTarget(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-primary h-5 w-5" />
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Copilote IA Admin
                    </h1>
                </div>
                <p className="text-muted-foreground text-sm">
                    Pilotez la plateforme par chat : consultez vos indicateurs
                    ou demandez une action sécurisée (stock, tarif FCFA, devis,
                    partenaire) avec validation par modale centrée.
                </p>
            </div>

            {/* Raccourcis rapides */}
            <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((item) => (
                    <Button
                        key={item.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSending}
                        onClick={() => void sendPrompt(item.prompt)}
                        className="min-h-[40px] gap-1.5 text-xs"
                    >
                        <item.icon className="text-primary h-3.5 w-3.5" />
                        {item.label}
                    </Button>
                ))}
            </div>

            {/* Fenêtre de chat */}
            <Card className="flex flex-col overflow-hidden border-2">
                <CardHeader className="bg-muted/30 border-b pb-3">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Bot className="text-primary h-4 w-4" />
                                Console Agent Opérationnel
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Exemple : « Passe le stock du Bus 64 places à 3
                                disponibles » ou « Valide le devis HBC-2026-... à
                                300 000 FCFA »
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="gap-1 text-[11px]">
                            <ShieldAlert className="text-primary h-3 w-3" />
                            Confirmation requise avant écriture
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="max-h-[480px] min-h-[340px] space-y-4 overflow-y-auto p-5">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col gap-2 ${
                                msg.role === "admin"
                                    ? "items-end"
                                    : "items-start"
                            }`}
                        >
                            <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                                {msg.role === "admin" ? (
                                    <>
                                        <User className="h-3 w-3" />
                                        <span>Administrateur</span>
                                    </>
                                ) : (
                                    <>
                                        <Bot className="text-primary h-3 w-3" />
                                        <span>Copilote IA HBC</span>
                                        {msg.source && (
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px]"
                                            >
                                                {msg.source}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </div>

                            <div
                                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%] ${
                                    msg.role === "admin"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                }`}
                            >
                                {msg.text}
                            </div>

                            {msg.dataItems && msg.dataItems.length > 0 && (
                                <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                                    {msg.dataItems.map((item, idx) => (
                                        <div
                                            key={`${item.label}-${idx}`}
                                            className="bg-background flex items-center justify-between gap-2 rounded-xl border p-3 text-xs"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold">
                                                    {item.label}
                                                </p>
                                                <p className="text-muted-foreground truncate">
                                                    {item.value}
                                                </p>
                                            </div>
                                            {item.badge && (
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0 text-[10px]"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {msg.proposedAction && (
                                <Card className="border-primary/40 bg-primary/5 w-full max-w-xl border-2">
                                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1 text-xs">
                                            <p className="text-primary font-semibold uppercase">
                                                Action proposée (
                                                {msg.proposedAction.tool})
                                            </p>
                                            <p className="text-foreground font-medium">
                                                {msg.proposedAction.summary}
                                            </p>
                                        </div>

                                        {msg.actionExecuted ? (
                                            <Badge className="shrink-0 gap-1 bg-emerald-600 text-white">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Exécutée
                                            </Badge>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() =>
                                                    setConfirmActionTarget({
                                                        messageId: msg.id,
                                                        action: msg.proposedAction!,
                                                    })
                                                }
                                                className="min-h-[40px] shrink-0 gap-1.5"
                                            >
                                                <Play className="h-3.5 w-3.5" />
                                                Exécuter...
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ))}

                    {isSending && (
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Le Copilote analyse votre demande...
                        </div>
                    )}
                </CardContent>

                <CardFooter className="border-t p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void sendPrompt(input);
                        }}
                        className="flex w-full gap-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Demandez une tâche ou un rapport au Copilote IA..."
                            disabled={isSending}
                            className="min-h-[44px] flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={isSending || !input.trim()}
                            className="min-h-[44px] shrink-0 gap-2"
                        >
                            {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            Envoyer
                        </Button>
                    </form>
                </CardFooter>
            </Card>

            {/* Modale centrée de confirmation obligatoire avant exécution d'une écriture DB */}
            <ConfirmDialog
                open={!!confirmActionTarget}
                onOpenChange={(open) => {
                    if (!open && !isExecuting) setConfirmActionTarget(null);
                }}
                title="Confirmer l'exécution de cette action ?"
                description={
                    confirmActionTarget
                        ? `${confirmActionTarget.action.summary} (Outil : ${confirmActionTarget.action.tool}). Cette modification sera immédiatement appliquée en base de données.`
                        : ""
                }
                confirmLabel={
                    isExecuting ? "Exécution..." : "Confirmer et exécuter"
                }
                onConfirm={() => {
                    void handleConfirmExecute();
                }}
            />
        </div>
    );
}
