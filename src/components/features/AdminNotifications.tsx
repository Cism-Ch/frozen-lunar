"use client";

import { useState, useEffect, useCallback } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
    Bell,
    Info,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
    getNotificationsAction,
    markNotificationAsReadAction,
    markAllNotificationsAsReadAction,
    type Notification,
} from "@/app/actions/notification-management";
import { toast } from "sonner";

export function AdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadNotifications = useCallback(async () => {
        const result = await getNotificationsAction();
        if (result.success && result.notifications) {
            setNotifications(result.notifications);
        }
    }, []);

    const isMounted = useHasMounted();

    useEffect(() => {
        if (isMounted) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            void loadNotifications();
        }
    }, [isMounted, loadNotifications]);

    if (!isMounted) {
        return (
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="text-muted-foreground h-5 w-5" />
            </Button>
        );
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllAsRead = async () => {
        setIsLoading(true);
        const result = await markAllNotificationsAsReadAction();
        if (result.success) {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            toast.success("Toutes les notifications marquées comme lues");
        } else {
            toast.error(result.error || "Erreur");
        }
        setIsLoading(false);
    };

    const markAsRead = async (id: string) => {
        const result = await markNotificationAsReadAction(id);
        if (result.success) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        }
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "info":
                return <Info className="h-4 w-4 text-blue-500" />;
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case "success":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "message":
                return <MessageSquare className="h-4 w-4 text-purple-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="text-muted-foreground hover:text-foreground h-5 w-5 transition-colors" />
                    {unreadCount > 0 && (
                        <span className="ring-background absolute top-2 right-2 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 ring-2" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="border-border/50 bg-background/95 w-80 overflow-hidden p-0 shadow-xl backdrop-blur-md"
            >
                <div className="bg-muted/10 flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary h-auto px-2 py-1 text-xs"
                            onClick={markAllAsRead}
                            disabled={isLoading}
                        >
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-8">
                            <Bell className="mb-2 h-8 w-8 opacity-20" />
                            <p className="text-sm">Aucune notification</p>
                        </div>
                    ) : (
                        <div className="flex flex-col p-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "focus:bg-muted/50 flex cursor-pointer flex-col items-start gap-1 p-3",
                                        !notification.read &&
                                            "bg-muted/30 border-primary border-l-2"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex w-full items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            {getIcon(notification.type)}
                                            <span
                                                className={cn(
                                                    !notification.read &&
                                                        "text-foreground"
                                                )}
                                            >
                                                {notification.title}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                                            {formatDistanceToNow(
                                                new Date(
                                                    notification.timestamp
                                                ),
                                                { addSuffix: true, locale: fr }
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-2 pl-6 text-xs">
                                        {notification.description}
                                    </p>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="bg-muted/10 border-t p-2 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full text-xs"
                    >
                        Voir tout l&apos;historique
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
