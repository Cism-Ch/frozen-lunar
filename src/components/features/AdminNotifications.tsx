"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
    Bell,
    Info,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Truck,
    Flame,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
    getNotificationsAction,
    markNotificationAsReadAction,
    markAllNotificationsAsReadAction,
    type Notification,
} from "@/app/actions/notification-management";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

export function AdminNotifications() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const isMounted = useHasMounted();

    const loadNotifications = useCallback(async () => {
        try {
            const result = await getNotificationsAction();
            if (result.success && result.notifications) {
                setNotifications(result.notifications);
            }
        } catch (err: unknown) {
            logger.error("Erreur chargement notifications", err);
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            void loadNotifications();
        }
    }, [isMounted, loadNotifications]);

    // Rafraîchir les notifications à l'ouverture du menu déroulant
    const handleOpenChange = (openState: boolean) => {
        setIsOpen(openState);
        if (openState) {
            void loadNotifications();
        }
    };

    if (!isMounted) {
        return (
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="text-muted-foreground h-5 w-5" />
            </Button>
        );
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
        try {
            const result = await markAllNotificationsAsReadAction();
            if (result.success) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true }))
                );
                toast.success("Messages et alertes marqués comme lus");
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour");
            }
        } catch (err: unknown) {
            logger.error("Erreur markAllNotificationsAsRead", err);
            toast.error("Impossible d'acquitter les alertes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemClick = async (notification: Notification) => {
        setIsOpen(false);
        try {
            await markNotificationAsReadAction(notification.id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, read: true } : n
                )
            );
        } catch (err: unknown) {
            logger.error("Erreur markNotificationAsRead", err);
        }

        if (notification.href) {
            router.push(notification.href);
        }
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "urgent":
                return (
                    <Flame className="h-4 w-4 animate-pulse text-rose-500 motion-reduce:animate-none" />
                );
            case "quote":
                return <Truck className="h-4 w-4 text-emerald-500" />;
            case "contact":
                return <MessageSquare className="h-4 w-4 text-blue-500" />;
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case "success":
                return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case "info":
            default:
                return <Info className="text-primary h-4 w-4" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-primary relative h-9 w-9 transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
                    aria-label={`Notifications (${unreadCount} en attente)`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="bg-destructive text-destructive-foreground ring-background absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] font-bold shadow-xs ring-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-40 motion-reduce:hidden" />
                            <span className="relative">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                collisionPadding={12}
                className="bg-background/98 border-border/80 w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden p-0 shadow-2xl backdrop-blur-md sm:w-96"
            >
                {/* En-tête du panneau de notifications */}
                <div className="bg-muted/20 flex items-center justify-between border-b px-3.5 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-bold">
                            Alertes & Activité
                        </span>
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="h-5 px-1.5 text-[10px] font-semibold"
                            >
                                {unreadCount} en attente
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            className="text-muted-foreground hover:text-primary h-auto cursor-pointer p-1 text-xs font-medium"
                            onClick={handleMarkAllAsRead}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : null}
                            Tout acquitter
                        </Button>
                    )}
                </div>

                {/* Liste des alertes réelles avec défilement fluide */}
                <ScrollArea className="max-h-[340px] overflow-y-auto sm:max-h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="text-muted-foreground flex h-44 flex-col items-center justify-center p-6 text-center sm:h-48">
                            <div className="bg-muted/40 mb-2 rounded-full p-3">
                                <Bell className="text-muted-foreground/30 h-6 w-6" />
                            </div>
                            <p className="text-foreground text-sm font-semibold">
                                Aucune alerte en attente
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Tous les devis et messages sont à jour.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-border/40 divide-y p-1 sm:p-1.5">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "focus:bg-muted/60 my-0.5 flex cursor-pointer flex-col items-start gap-1 rounded-lg px-2.5 py-2 transition-colors sm:px-3 sm:py-2.5",
                                        notification.isUrgent &&
                                            "border-l-2 border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-950/20",
                                        !notification.read &&
                                            !notification.isUrgent &&
                                            "bg-muted/30 border-primary border-l-2"
                                    )}
                                    onClick={() =>
                                        handleItemClick(notification)
                                    }
                                >
                                    <div className="flex w-full items-start justify-between gap-2">
                                        <div className="flex min-w-0 flex-1 items-start gap-2 text-xs font-semibold sm:text-sm">
                                            <div className="bg-muted/60 mt-0.5 shrink-0 rounded-md p-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="text-foreground truncate font-semibold">
                                                        {notification.title}
                                                    </span>
                                                    {notification.isUrgent && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="h-3.5 shrink-0 px-1 text-[9px] font-bold tracking-wider uppercase"
                                                        >
                                                            Urgent
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-muted-foreground shrink-0 pt-0.5 font-mono text-[10px] whitespace-nowrap">
                                            {formatDistanceToNow(
                                                new Date(
                                                    notification.timestamp
                                                ),
                                                { addSuffix: true, locale: fr }
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-2 pr-1 pl-7.5 text-xs leading-relaxed">
                                        {notification.description}
                                    </p>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer intelligent avec doubles raccourcis Devis & Contacts */}
                <div className="bg-muted/20 flex items-center justify-between gap-1.5 border-t p-1.5 sm:gap-2 sm:p-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-8 min-w-0 flex-1 justify-center text-xs font-medium"
                        asChild
                        onClick={() => setIsOpen(false)}
                    >
                        <Link href="/admin/quotes?status=En+attente">
                            <Truck className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Devis en attente</span>
                        </Link>
                    </Button>
                    <div className="bg-border h-4 w-px shrink-0" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-8 min-w-0 flex-1 justify-center text-xs font-medium"
                        asChild
                        onClick={() => setIsOpen(false)}
                    >
                        <Link href="/admin/contacts">
                            <MessageSquare className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Messages</span>
                        </Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
