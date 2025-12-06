"use client";

import { useState } from "react";
import { Bell, Check, Clock, Info, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Mock data type
type Notification = {
    id: string;
    title: string;
    description: string;
    type: "info" | "warning" | "success" | "message";
    read: boolean;
    timestamp: Date;
};

// Initial mock data
const initialNotifications: Notification[] = [
    {
        id: "1",
        title: "Nouveau devis reçu",
        description: "Un client a demandé un devis pour un transport Paris-Lyon.",
        type: "info",
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    },
    {
        id: "2",
        title: "Paiement confirmé",
        description: "Le paiement pour la commande #INV-2024-001 a été reçu.",
        type: "success",
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
        id: "3",
        title: "Maintenance système",
        description: "Une maintenance est prévue ce soir à 23h00.",
        type: "warning",
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
        id: "4",
        title: "Nouveau message",
        description: "Sophie Martin vous a envoyé un message concernant sa commande.",
        type: "message",
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
];

export function AdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "info": return <Info className="h-4 w-4 text-blue-500" />;
            case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case "success": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "message": return <MessageSquare className="h-4 w-4 text-purple-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden border-border/50 shadow-xl bg-background/95 backdrop-blur-md">
                <div className="flex items-center justify-between p-4 border-b bg-muted/10">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-primary"
                            onClick={markAllAsRead}
                        >
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Aucune notification</p>
                        </div>
                    ) : (
                        <div className="flex flex-col p-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-muted/50",
                                        !notification.read && "bg-muted/30 border-l-2 border-primary"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start justify-between w-full gap-2">
                                        <div className="flex items-center gap-2 font-medium text-sm">
                                            {getIcon(notification.type)}
                                            <span className={cn(!notification.read && "text-foreground")}>
                                                {notification.title}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: fr })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                                        {notification.description}
                                    </p>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-2 border-t bg-muted/10 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                        Voir tout l'historique
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
