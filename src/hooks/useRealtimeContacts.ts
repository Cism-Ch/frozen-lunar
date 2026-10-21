"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { ContactMessageItem } from "@/types/contact";

interface RealtimeContactsOptions {
    onMessageInserted?: (newMessage: ContactMessageItem) => void;
    onMessageUpdated?: (updatedMessage: ContactMessageItem) => void;
    onMessageDeleted?: (deletedMessageId: string) => void;
    enableToast?: boolean;
}

/**
 * Custom React Hook pour s'abonner en temps réel aux messages de contact Supabase.
 * Permet l'actualisation dynamique du centre de contact sans rafraîchissement de page.
 */
export function useRealtimeContacts(options?: RealtimeContactsOptions) {
    const [isConnected, setIsConnected] = useState(false);

    const onMessageInserted = options?.onMessageInserted;
    const onMessageUpdated = options?.onMessageUpdated;
    const onMessageDeleted = options?.onMessageDeleted;
    const enableToast = options?.enableToast ?? true;

    const handleRealtimeEvent = useCallback(
        (payload: {
            eventType: string;
            new: Record<string, unknown>;
            old: Record<string, unknown>;
        }) => {
            if (payload.eventType === "INSERT") {
                const raw = payload.new;
                const formatted: ContactMessageItem = {
                    id: String(raw.id ?? ""),
                    firstName: String(raw.firstName ?? ""),
                    lastName: String(raw.lastName ?? ""),
                    email: String(raw.email ?? ""),
                    phone: String(raw.phone ?? ""),
                    message: String(raw.message ?? ""),
                    status:
                        (raw.status as ContactMessageItem["status"]) ??
                        "UNREAD",
                    createdAt: String(
                        raw.createdAt ?? new Date().toISOString()
                    ),
                };

                if (enableToast) {
                    toast.info(
                        `⚡ Nouveau message reçu de ${formatted.firstName} ${formatted.lastName}`
                    );
                }
                onMessageInserted?.(formatted);
            } else if (payload.eventType === "UPDATE") {
                const raw = payload.new;
                const formatted: ContactMessageItem = {
                    id: String(raw.id ?? ""),
                    firstName: String(raw.firstName ?? ""),
                    lastName: String(raw.lastName ?? ""),
                    email: String(raw.email ?? ""),
                    phone: String(raw.phone ?? ""),
                    message: String(raw.message ?? ""),
                    status:
                        (raw.status as ContactMessageItem["status"]) ??
                        "UNREAD",
                    createdAt: String(
                        raw.createdAt ?? new Date().toISOString()
                    ),
                };

                onMessageUpdated?.(formatted);
            } else if (payload.eventType === "DELETE") {
                const deletedId = String(payload.old?.id ?? "");
                if (deletedId) {
                    onMessageDeleted?.(deletedId);
                }
            }
        },
        [onMessageInserted, onMessageUpdated, onMessageDeleted, enableToast]
    );

    useEffect(() => {
        if (!supabase) {
            return;
        }

        const channel = supabase
            .channel("contact_message_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "contact_message",
                },
                (payload) => {
                    handleRealtimeEvent(
                        payload as {
                            eventType: string;
                            new: Record<string, unknown>;
                            old: Record<string, unknown>;
                        }
                    );
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    setIsConnected(true);
                } else if (status === "CHANNEL_ERROR") {
                    setIsConnected(false);
                }
            });

        return () => {
            supabase?.removeChannel(channel);
        };
    }, [handleRealtimeEvent]);

    return { isConnected };
}
