"use client";

import { useState, useTransition } from "react";
import { type ContactMessageItem, ContactStatus } from "@/types/contact";
import {
    updateContactMessageStatusAction,
    deleteContactMessageAction,
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
    const [messages, setMessages] =
        useState<ContactMessageItem[]>(initialMessages);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | ContactStatus>(
        "ALL"
    );
    const [selectedMessage, setSelectedMessage] =
        useState<ContactMessageItem | null>(null);
    const [isPending, startTransition] = useTransition();

    // Comptage des non-lus
    const unreadCount = messages.filter(
        (m) => m.status === ContactStatus.UNREAD
    ).length;

    // Filtrage
    const filteredMessages = messages.filter((m) => {
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

    const handleStatusChange = (id: string, newStatus: ContactStatus) => {
        startTransition(async () => {
            const res = await updateContactMessageStatusAction(id, newStatus);
            if (res.error) {
                toast.error(res.error);
                return;
            }

            setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
            );

            if (selectedMessage?.id === id) {
                setSelectedMessage((prev) =>
                    prev ? { ...prev, status: newStatus } : null
                );
            }

            toast.success(
                newStatus === ContactStatus.READ
                    ? "Message marqué comme lu"
                    : newStatus === ContactStatus.ARCHIVED
                      ? "Message archivé"
                      : "Message marqué comme non lu"
            );
        });
    };

    const handleDelete = (id: string) => {
        if (
            !confirm(
                "Voulez-vous vraiment supprimer définitivement ce message ?"
            )
        ) {
            return;
        }

        startTransition(async () => {
            const res = await deleteContactMessageAction(id);
            if (res.error) {
                toast.error(res.error);
                return;
            }

            setMessages((prev) => prev.filter((m) => m.id !== id));
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
            toast.success("Message supprimé");
        });
    };

    const getStatusBadge = (status: ContactStatus) => {
        switch (status) {
            case ContactStatus.UNREAD:
                return (
                    <Badge className="bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700">
                        Non lu
                    </Badge>
                );
            case ContactStatus.READ:
                return (
                    <Badge
                        variant="outline"
                        className="text-muted-foreground text-xs"
                    >
                        Lu
                    </Badge>
                );
            case ContactStatus.ARCHIVED:
                return (
                    <Badge variant="secondary" className="text-xs">
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
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Inbox className="text-primary h-5 w-5" />
                            Boîte de Réception — Formulaire de Contact
                            {unreadCount > 0 && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                    {unreadCount} nouveau
                                    {unreadCount > 1 ? "x" : ""}
                                </span>
                            )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Messages envoyés par les prospects et clients depuis
                            la page de contact publique.
                        </CardDescription>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Rechercher expéditeur, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 pl-9"
                        />
                    </div>
                </div>

                {/* Filtres de statut */}
                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    <Button
                        variant={statusFilter === "ALL" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("ALL")}
                        className="h-8 text-xs"
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
                        className="h-8 text-xs"
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
                        className="h-8 text-xs"
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
                        className="h-8 text-xs"
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
            </CardHeader>

            <CardContent>
                {filteredMessages.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="text-muted-foreground/40 mb-3 h-12 w-12" />
                        <p className="text-base font-medium">
                            Aucun message trouvé
                        </p>
                        <p className="mt-1 text-xs">
                            {searchTerm || statusFilter !== "ALL"
                                ? "Modifiez vos filtres de recherche."
                                : "Aucun message reçu pour le moment."}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Vue Mobile (Cards) */}
                        <div className="space-y-3 md:hidden">
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
                                    className={`hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors ${
                                        msg.status === ContactStatus.UNREAD
                                            ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                                            : "bg-card"
                                    }`}
                                >
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {msg.firstName} {msg.lastName}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {msg.email}
                                            </p>
                                        </div>
                                        {getStatusBadge(msg.status)}
                                    </div>
                                    <p className="text-foreground/80 my-2 line-clamp-2 text-xs leading-relaxed">
                                        {msg.message}
                                    </p>
                                    <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
                                        <span>{msg.phone}</span>
                                        <span>
                                            {format(
                                                new Date(msg.createdAt),
                                                "dd MMM yyyy à HH:mm",
                                                {
                                                    locale: fr,
                                                }
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vue Desktop (Tableau structuré) */}
                        <div className="hidden overflow-hidden rounded-md border md:block">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
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
                                            className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                                                msg.status ===
                                                ContactStatus.UNREAD
                                                    ? "bg-emerald-50/20 font-medium dark:bg-emerald-950/10"
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
                                        >
                                            <TableCell>
                                                {getStatusBadge(msg.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                                                        {msg.firstName.charAt(
                                                            0
                                                        )}
                                                        {msg.lastName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold">
                                                            {msg.firstName}{" "}
                                                            {msg.lastName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-muted-foreground space-y-0.5 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        <span className="truncate">
                                                            {msg.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        <span>{msg.phone}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-muted-foreground line-clamp-2 text-xs">
                                                    {msg.message}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                                {format(
                                                    new Date(msg.createdAt),
                                                    "dd MMM yyyy, HH:mm",
                                                    {
                                                        locale: fr,
                                                    }
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
                                                            className="h-8 w-8"
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
                                                            Ouvrir le message
                                                        </DropdownMenuItem>
                                                        {msg.status ===
                                                        ContactStatus.UNREAD ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        msg.id,
                                                                        ContactStatus.READ
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                Marquer comme lu
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        msg.id,
                                                                        ContactStatus.UNREAD
                                                                    )
                                                                }
                                                            >
                                                                <Inbox className="mr-2 h-4 w-4" />
                                                                Marquer comme
                                                                non lu
                                                            </DropdownMenuItem>
                                                        )}
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
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() =>
                                                                handleDelete(
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
                    </>
                )}
            </CardContent>

            {/* Modal de détail du message */}
            <Dialog
                open={!!selectedMessage}
                onOpenChange={(open) => {
                    if (!open) setSelectedMessage(null);
                }}
            >
                <DialogContent className="sm:max-w-[550px]">
                    {selectedMessage && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between gap-2 pr-6">
                                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                        <User className="text-primary h-5 w-5" />
                                        {selectedMessage.firstName}{" "}
                                        {selectedMessage.lastName}
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

                            <div className="space-y-4 py-2">
                                {/* Coordonnées de contact */}
                                <div className="bg-muted/40 grid grid-cols-1 gap-3 rounded-lg p-3 text-xs sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground font-medium">
                                            Adresse email
                                        </span>
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            <Mail className="text-primary h-3.5 w-3.5" />
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
                                            <Phone className="text-primary h-3.5 w-3.5" />
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

                            <DialogFooter className="flex flex-col items-center gap-2 border-t pt-4 sm:flex-row sm:justify-between">
                                <div className="flex w-full items-center gap-2 sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
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
                                        className="text-xs"
                                        disabled={isPending}
                                        onClick={() =>
                                            handleDelete(selectedMessage.id)
                                        }
                                    >
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        Supprimer
                                    </Button>
                                </div>

                                <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="text-xs"
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
        </Card>
    );
}
