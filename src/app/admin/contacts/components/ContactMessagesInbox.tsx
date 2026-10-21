"use client";

import {
    useState,
    useTransition,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { type ContactMessageItem, ContactStatus } from "@/types/contact";
import {
    updateContactMessageStatusAction,
    deleteContactMessageAction,
    bulkUpdateContactMessagesStatusAction,
    bulkDeleteContactMessagesAction,
} from "@/app/actions/contact";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRealtimeContacts } from "@/hooks/useRealtimeContacts";
import {
    Mail,
    Phone,
    Search,
    MoreHorizontal,
    CheckCircle2,
    Archive,
    Trash2,
    Inbox,
    MessageSquare,
    User,
    X,
    CheckSquare,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface ContactMessagesInboxProps {
    initialMessages: ContactMessageItem[];
}

export function ContactMessagesInbox({
    initialMessages,
}: ContactMessagesInboxProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Initialisation de l'état depuis l'URL (Norme 2026 : URL comme source de vérité partagée)
    const initialStatusParam = searchParams.get("status");
    const initialStatus: "ALL" | ContactStatus =
        initialStatusParam === ContactStatus.UNREAD ||
        initialStatusParam === ContactStatus.READ ||
        initialStatusParam === ContactStatus.ARCHIVED
            ? initialStatusParam
            : "ALL";

    const initialQuery = searchParams.get("q") ?? "";

    const [messages, setMessages] =
        useState<ContactMessageItem[]>(initialMessages);
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [statusFilter, setStatusFilter] = useState<"ALL" | ContactStatus>(
        initialStatus
    );
    const [selectedMessage, setSelectedMessage] =
        useState<ContactMessageItem | null>(null);

    // Sélection multiple pour actions par lot (Bulk)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Modales de confirmation accessibles
    const [messageIdToDelete, setMessageIdToDelete] = useState<string | null>(
        null
    );
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    const [isPending, startTransition] = useTransition();

    // 2. Synchronisation de l'URL lors du changement de filtre ou de recherche (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (statusFilter !== "ALL") {
                params.set("status", statusFilter);
            } else {
                params.delete("status");
            }

            if (searchTerm.trim()) {
                params.set("q", searchTerm.trim());
            } else {
                params.delete("q");
            }

            const newQuery = params.toString();
            const currentQuery = searchParams.toString();

            if (newQuery !== currentQuery) {
                router.replace(
                    newQuery ? `${pathname}?${newQuery}` : pathname,
                    { scroll: false }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, pathname, router, searchParams]);

    // 3. Souscription Supabase Realtime pour mises à jour instantanées
    useRealtimeContacts({
        onMessageInserted: useCallback((newMessage: ContactMessageItem) => {
            setMessages((prev) => {
                if (prev.some((m) => m.id === newMessage.id)) return prev;
                return [newMessage, ...prev];
            });
        }, []),
        onMessageUpdated: useCallback((updatedMessage: ContactMessageItem) => {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === updatedMessage.id ? updatedMessage : m
                )
            );
            setSelectedMessage((current) =>
                current?.id === updatedMessage.id ? updatedMessage : current
            );
        }, []),
        onMessageDeleted: useCallback((deletedId: string) => {
            setMessages((prev) => prev.filter((m) => m.id !== deletedId));
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(deletedId);
                return next;
            });
            setSelectedMessage((current) =>
                current?.id === deletedId ? null : current
            );
        }, []),
    });

    // Comptage des non-lus
    const unreadCount = useMemo(
        () => messages.filter((m) => m.status === ContactStatus.UNREAD).length,
        [messages]
    );

    // Filtrage dynamique
    const filteredMessages = useMemo(() => {
        return messages.filter((m) => {
            const matchesStatus =
                statusFilter === "ALL" ? true : m.status === statusFilter;
            const q = searchTerm.toLowerCase().trim();
            const matchesSearch =
                !q ||
                m.firstName.toLowerCase().includes(q) ||
                m.lastName.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                m.phone.toLowerCase().includes(q) ||
                m.message.toLowerCase().includes(q);

            return matchesStatus && matchesSearch;
        });
    }, [messages, statusFilter, searchTerm]);

    // Gestion de la sélection par lot
    const allFilteredSelected =
        filteredMessages.length > 0 &&
        filteredMessages.every((m) => selectedIds.has(m.id));

    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            setSelectedIds(new Set());
        } else {
            const next = new Set(selectedIds);
            for (const m of filteredMessages) {
                next.add(m.id);
            }
            setSelectedIds(next);
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Actions unitaires
    const handleStatusChange = (id: string, newStatus: ContactStatus) => {
        // Optimistic UI update
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );

        if (selectedMessage?.id === id) {
            setSelectedMessage((prev) =>
                prev ? { ...prev, status: newStatus } : null
            );
        }

        startTransition(async () => {
            const res = await updateContactMessageStatusAction(id, newStatus);
            if (res.error) {
                toast.error(res.error);
                // Rollback
                setMessages(initialMessages);
            } else {
                toast.success(
                    newStatus === ContactStatus.READ
                        ? "Marqué comme lu"
                        : newStatus === ContactStatus.ARCHIVED
                          ? "Message archivé"
                          : "Marqué comme non lu"
                );
            }
        });
    };

    const handleConfirmDeleteSingle = () => {
        if (!messageIdToDelete) return;
        const targetId = messageIdToDelete;
        setMessageIdToDelete(null);

        // Optimistic delete
        setMessages((prev) => prev.filter((m) => m.id !== targetId));
        if (selectedMessage?.id === targetId) {
            setSelectedMessage(null);
        }
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(targetId);
            return next;
        });

        startTransition(async () => {
            const res = await deleteContactMessageAction(targetId);
            if (res.error) {
                toast.error(res.error);
                setMessages(initialMessages);
            } else {
                toast.success("Message supprimé avec succès.");
            }
        });
    };

    // Actions par lot (Bulk)
    const handleBulkStatusChange = (newStatus: ContactStatus) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        // Optimistic bulk update
        setMessages((prev) =>
            prev.map((m) =>
                selectedIds.has(m.id) ? { ...m, status: newStatus } : m
            )
        );
        setSelectedIds(new Set());

        startTransition(async () => {
            const res = await bulkUpdateContactMessagesStatusAction(
                ids,
                newStatus
            );
            if (res.error) {
                toast.error(res.error);
                setMessages(initialMessages);
            } else {
                toast.success(
                    `${ids.length} message(s) mis à jour avec succès.`
                );
            }
        });
    };

    const handleConfirmBulkDelete = () => {
        const ids = Array.from(selectedIds);
        setIsBulkDeleteOpen(false);
        if (ids.length === 0) return;

        // Optimistic bulk delete
        setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)));
        setSelectedIds(new Set());
        if (selectedMessage && selectedIds.has(selectedMessage.id)) {
            setSelectedMessage(null);
        }

        startTransition(async () => {
            const res = await bulkDeleteContactMessagesAction(ids);
            if (res.error) {
                toast.error(res.error);
                setMessages(initialMessages);
            } else {
                toast.success(
                    `${ids.length} message(s) supprimé(s) définitivement.`
                );
            }
        });
    };

    const getStatusBadge = (status: ContactStatus) => {
        switch (status) {
            case ContactStatus.UNREAD:
                return (
                    <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary text-xs font-semibold shadow-xs">
                        Non lu
                    </Badge>
                );
            case ContactStatus.READ:
                return (
                    <Badge
                        variant="outline"
                        className="text-muted-foreground border-border text-xs font-medium"
                    >
                        Lu
                    </Badge>
                );
            case ContactStatus.ARCHIVED:
                return (
                    <Badge
                        variant="secondary"
                        className="bg-muted text-muted-foreground text-xs font-medium"
                    >
                        Archivé
                    </Badge>
                );
        }
    };

    return (
        <Card className="border-border border shadow-sm">
            <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Inbox className="text-primary h-5 w-5" />
                            Boîte de Réception ({filteredMessages.length})
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs sm:text-sm">
                            Messages envoyés par les prospects et clients depuis
                            la page de contact publique.
                        </CardDescription>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Rechercher nom, email, tél..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 pr-8 pl-9"
                            aria-label="Rechercher dans les messages"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 p-1"
                                aria-label="Effacer la recherche"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filtres de statut avec hauteurs conformes tactile >= 44px (ou h-9 avec padding) */}
                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    <Button
                        variant={statusFilter === "ALL" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("ALL")}
                        className="h-9 min-h-[36px] px-3.5 text-xs font-medium"
                    >
                        Tous ({messages.length})
                    </Button>
                    <Button
                        variant={
                            statusFilter === ContactStatus.UNREAD
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() => setStatusFilter(ContactStatus.UNREAD)}
                        className="h-9 min-h-[36px] px-3.5 text-xs font-medium"
                    >
                        Non lus ({unreadCount})
                    </Button>
                    <Button
                        variant={
                            statusFilter === ContactStatus.READ
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() => setStatusFilter(ContactStatus.READ)}
                        className="h-9 min-h-[36px] px-3.5 text-xs font-medium"
                    >
                        Lus (
                        {
                            messages.filter(
                                (m) => m.status === ContactStatus.READ
                            ).length
                        }
                        )
                    </Button>
                    <Button
                        variant={
                            statusFilter === ContactStatus.ARCHIVED
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() => setStatusFilter(ContactStatus.ARCHIVED)}
                        className="h-9 min-h-[36px] px-3.5 text-xs font-medium"
                    >
                        Archivés (
                        {
                            messages.filter(
                                (m) => m.status === ContactStatus.ARCHIVED
                            ).length
                        }
                        )
                    </Button>
                </div>

                {/* Barre d'actions par lot (Bulk Action Bar) si au moins 1 message sélectionné */}
                {selectedIds.size > 0 && (
                    <div className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="text-primary h-4 w-4" />
                            <span className="text-xs font-semibold sm:text-sm">
                                {selectedIds.size} message
                                {selectedIds.size > 1 ? "s" : ""} sélectionné
                                {selectedIds.size > 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                                onClick={() =>
                                    handleBulkStatusChange(ContactStatus.READ)
                                }
                                className="h-8 text-xs font-medium"
                            >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                                Marquer comme lu
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                                onClick={() =>
                                    handleBulkStatusChange(
                                        ContactStatus.ARCHIVED
                                    )
                                }
                                className="h-8 text-xs font-medium"
                            >
                                <Archive className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                                Archiver
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={isPending}
                                onClick={() => setIsBulkDeleteOpen(true)}
                                className="h-8 text-xs font-medium"
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Supprimer
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIds(new Set())}
                                className="h-8 text-xs"
                            >
                                Tout désélectionner
                            </Button>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                            <Inbox className="text-muted-foreground h-6 w-6" />
                        </div>
                        <h3 className="mt-3 text-sm font-semibold">
                            Aucun message trouvé
                        </h3>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {searchTerm || statusFilter !== "ALL"
                                ? "Aucun message ne correspond à vos critères de recherche."
                                : "Votre boîte de réception est actuellement vide."}
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Vue Mobile & Tablette (Cartes responsives < 1024px) */}
                        <div className="block space-y-3 lg:hidden">
                            {/* Sélecteur global mobile */}
                            <div className="flex items-center justify-between px-1 text-xs">
                                <label className="flex cursor-pointer items-center gap-2 font-medium">
                                    <Checkbox
                                        checked={allFilteredSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Sélectionner tous les messages affichés"
                                    />
                                    <span>Sélectionner tout</span>
                                </label>
                                <span className="text-muted-foreground text-[11px]">
                                    {filteredMessages.length} message(s)
                                </span>
                            </div>

                            {filteredMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    onClick={() => {
                                        setSelectedMessage(msg);
                                        if (
                                            msg.status === ContactStatus.UNREAD
                                        ) {
                                            handleStatusChange(
                                                msg.id,
                                                ContactStatus.READ
                                            );
                                        }
                                    }}
                                    className={`bg-card hover:border-primary/50 relative cursor-pointer space-y-3 rounded-lg border p-4 shadow-2xs transition-all duration-200 ${
                                        msg.status === ContactStatus.UNREAD
                                            ? "border-primary/40 bg-primary/[0.02]"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="pt-0.5"
                                            >
                                                <Checkbox
                                                    checked={selectedIds.has(
                                                        msg.id
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelectOne(msg.id)
                                                    }
                                                    aria-label={`Sélectionner message de ${msg.firstName} ${msg.lastName}`}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">
                                                    {msg.firstName}{" "}
                                                    {msg.lastName}
                                                </div>
                                                <div className="text-muted-foreground text-[11px]">
                                                    {format(
                                                        new Date(msg.createdAt),
                                                        "dd MMM yyyy à HH:mm",
                                                        { locale: fr }
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {getStatusBadge(msg.status)}
                                        </div>
                                    </div>

                                    <div className="text-muted-foreground space-y-1 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                            <a
                                                href={`mailto:${msg.email}`}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="text-primary truncate hover:underline"
                                            >
                                                {msg.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 shrink-0" />
                                            <a
                                                href={`tel:${msg.phone}`}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="hover:underline"
                                            >
                                                {msg.phone}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="bg-muted/40 text-foreground/90 line-clamp-2 rounded-md p-2.5 text-xs">
                                        {msg.message}
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-2">
                                        <span className="text-muted-foreground text-[11px]">
                                            Cliquer pour lire le détail
                                        </span>
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9"
                                                        aria-label="Actions sur le message"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedMessage(
                                                                msg
                                                            );
                                                            if (
                                                                msg.status ===
                                                                ContactStatus.UNREAD
                                                            ) {
                                                                handleStatusChange(
                                                                    msg.id,
                                                                    ContactStatus.READ
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Voir le message
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                msg.id,
                                                                msg.status ===
                                                                    ContactStatus.READ
                                                                    ? ContactStatus.UNREAD
                                                                    : ContactStatus.READ
                                                            )
                                                        }
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        {msg.status ===
                                                        ContactStatus.READ
                                                            ? "Marquer non lu"
                                                            : "Marquer lu"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                msg.id,
                                                                msg.status ===
                                                                    ContactStatus.ARCHIVED
                                                                    ? ContactStatus.READ
                                                                    : ContactStatus.ARCHIVED
                                                            )
                                                        }
                                                    >
                                                        <Archive className="mr-2 h-4 w-4" />
                                                        {msg.status ===
                                                        ContactStatus.ARCHIVED
                                                            ? "Désarchiver"
                                                            : "Archiver"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            setMessageIdToDelete(
                                                                msg.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vue Desktop Large (Tableau avec overflow-x-auto garanti >= 1024px) */}
                        <div className="hidden overflow-x-auto rounded-md border lg:block">
                            <Table className="min-w-[850px]">
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className="w-[48px] px-3">
                                            <Checkbox
                                                checked={allFilteredSelected}
                                                onCheckedChange={
                                                    toggleSelectAll
                                                }
                                                aria-label="Sélectionner tous les messages du tableau"
                                            />
                                        </TableHead>
                                        <TableHead className="w-[110px]">
                                            Statut
                                        </TableHead>
                                        <TableHead className="w-[180px]">
                                            Expéditeur
                                        </TableHead>
                                        <TableHead className="w-[220px]">
                                            Coordonnées
                                        </TableHead>
                                        <TableHead>Aperçu du message</TableHead>
                                        <TableHead className="w-[150px]">
                                            Date de réception
                                        </TableHead>
                                        <TableHead className="w-[80px] text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMessages.map((msg) => (
                                        <TableRow
                                            key={msg.id}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`Lire le message de ${msg.firstName} ${msg.lastName}`}
                                            className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                                                msg.status ===
                                                ContactStatus.UNREAD
                                                    ? "bg-primary/[0.03] font-medium"
                                                    : ""
                                            }`}
                                            onClick={() => {
                                                setSelectedMessage(msg);
                                                if (
                                                    msg.status ===
                                                    ContactStatus.UNREAD
                                                ) {
                                                    handleStatusChange(
                                                        msg.id,
                                                        ContactStatus.READ
                                                    );
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === "Enter" ||
                                                    e.key === " "
                                                ) {
                                                    e.preventDefault();
                                                    setSelectedMessage(msg);
                                                    if (
                                                        msg.status ===
                                                        ContactStatus.UNREAD
                                                    ) {
                                                        handleStatusChange(
                                                            msg.id,
                                                            ContactStatus.READ
                                                        );
                                                    }
                                                }
                                            }}
                                        >
                                            <TableCell
                                                className="px-3"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Checkbox
                                                    checked={selectedIds.has(
                                                        msg.id
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelectOne(msg.id)
                                                    }
                                                    aria-label={`Sélectionner message de ${msg.firstName} ${msg.lastName}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(msg.status)}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {msg.firstName} {msg.lastName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-muted-foreground space-y-0.5 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        <a
                                                            href={`mailto:${msg.email}`}
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            className="text-primary truncate hover:underline"
                                                        >
                                                            {msg.email}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        <a
                                                            href={`tel:${msg.phone}`}
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            className="hover:underline"
                                                        >
                                                            {msg.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-muted-foreground max-w-[280px] truncate text-xs">
                                                    {msg.message}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                                {format(
                                                    new Date(msg.createdAt),
                                                    "dd MMM yyyy à HH:mm",
                                                    { locale: fr }
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className="text-right"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9"
                                                            aria-label="Actions"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedMessage(
                                                                    msg
                                                                );
                                                                if (
                                                                    msg.status ===
                                                                    ContactStatus.UNREAD
                                                                ) {
                                                                    handleStatusChange(
                                                                        msg.id,
                                                                        ContactStatus.READ
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <MessageSquare className="mr-2 h-4 w-4" />
                                                            Voir le message
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    msg.id,
                                                                    msg.status ===
                                                                        ContactStatus.READ
                                                                        ? ContactStatus.UNREAD
                                                                        : ContactStatus.READ
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            {msg.status ===
                                                            ContactStatus.READ
                                                                ? "Marquer non lu"
                                                                : "Marquer lu"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    msg.id,
                                                                    msg.status ===
                                                                        ContactStatus.ARCHIVED
                                                                        ? ContactStatus.READ
                                                                        : ContactStatus.ARCHIVED
                                                                )
                                                            }
                                                        >
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            {msg.status ===
                                                            ContactStatus.ARCHIVED
                                                                ? "Désarchiver"
                                                                : "Archiver"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() =>
                                                                setMessageIdToDelete(
                                                                    msg.id
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Modale de Détail Responsive conforme 2026 (max-h clampé avec overflow-y scrollable) */}
            <Dialog
                open={!!selectedMessage}
                onOpenChange={(open) => {
                    if (!open) setSelectedMessage(null);
                }}
            >
                <DialogContent className="flex max-h-[88dvh] flex-col overflow-hidden p-0 sm:max-w-[550px]">
                    {selectedMessage && (
                        <>
                            <DialogHeader className="shrink-0 border-b p-5 pb-3">
                                <div className="flex items-center justify-between gap-2 pr-6">
                                    <DialogTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
                                        <User className="text-primary h-5 w-5 shrink-0" />
                                        <span>
                                            {selectedMessage.firstName}{" "}
                                            {selectedMessage.lastName}
                                        </span>
                                    </DialogTitle>
                                    {getStatusBadge(selectedMessage.status)}
                                </div>
                                <DialogDescription className="text-xs">
                                    Message reçu le{" "}
                                    {format(
                                        new Date(selectedMessage.createdAt),
                                        "EEEE d MMMM yyyy à HH:mm",
                                        { locale: fr }
                                    )}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Corps défilable sans déborder de la modale */}
                            <div className="flex-1 space-y-4 overflow-y-auto p-5">
                                {/* Coordonnées de contact */}
                                <div className="bg-muted/40 grid grid-cols-1 gap-3 rounded-lg p-3 text-xs sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground font-medium">
                                            Adresse email
                                        </span>
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            <Mail className="text-primary h-3.5 w-3.5 shrink-0" />
                                            <a
                                                href={`mailto:${selectedMessage.email}`}
                                                className="text-primary truncate hover:underline"
                                            >
                                                {selectedMessage.email}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground font-medium">
                                            Téléphone
                                        </span>
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            <Phone className="text-primary h-3.5 w-3.5 shrink-0" />
                                            <a
                                                href={`tel:${selectedMessage.phone}`}
                                                className="text-primary hover:underline"
                                            >
                                                {selectedMessage.phone}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenu du message */}
                                <div className="space-y-1.5">
                                    <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                        Message
                                    </span>
                                    <div className="bg-card rounded-lg border p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </div>
                                </div>
                            </div>

                            {/* Footer toujours accessible et sticky en bas */}
                            <DialogFooter className="bg-muted/20 flex shrink-0 flex-col items-center gap-2 border-t p-4 pt-3 sm:flex-row sm:justify-between">
                                <div className="flex w-full items-center gap-2 sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10 flex-1 text-xs sm:flex-initial"
                                        disabled={isPending}
                                        onClick={() =>
                                            handleStatusChange(
                                                selectedMessage.id,
                                                selectedMessage.status ===
                                                    ContactStatus.ARCHIVED
                                                    ? ContactStatus.READ
                                                    : ContactStatus.ARCHIVED
                                            )
                                        }
                                    >
                                        <Archive className="mr-1.5 h-3.5 w-3.5" />
                                        {selectedMessage.status ===
                                        ContactStatus.ARCHIVED
                                            ? "Désarchiver"
                                            : "Archiver"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-10 flex-1 text-xs sm:flex-initial"
                                        disabled={isPending}
                                        onClick={() =>
                                            setMessageIdToDelete(
                                                selectedMessage.id
                                            )
                                        }
                                    >
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        Supprimer
                                    </Button>
                                </div>

                                <div className="flex w-full items-center justify-end sm:w-auto">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="h-10 w-full text-xs sm:w-auto"
                                        asChild
                                    >
                                        <a
                                            href={`mailto:${selectedMessage.email}?subject=Réponse à votre demande HBC Logistique`}
                                        >
                                            <Mail className="mr-1.5 h-3.5 w-3.5" />
                                            Répondre par email
                                        </a>
                                    </Button>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Boîte de confirmation accessible unitaire */}
            <ConfirmDialog
                open={!!messageIdToDelete}
                onOpenChange={(open) => {
                    if (!open) setMessageIdToDelete(null);
                }}
                title="Supprimer ce message ?"
                description="Cette action est irréversible. Le message sera définitivement supprimé de la base de données."
                confirmLabel="Supprimer"
                variant="destructive"
                isLoading={isPending}
                onConfirm={handleConfirmDeleteSingle}
            />

            {/* Boîte de confirmation accessible groupée (Bulk) */}
            <ConfirmDialog
                open={isBulkDeleteOpen}
                onOpenChange={setIsBulkDeleteOpen}
                title={`Supprimer ${selectedIds.size} message(s) ?`}
                description="Cette action est irréversible. Tous les messages sélectionnés seront définitivement supprimés."
                confirmLabel="Supprimer tout"
                variant="destructive"
                isLoading={isPending}
                onConfirm={handleConfirmBulkDelete}
            />
        </Card>
    );
}
