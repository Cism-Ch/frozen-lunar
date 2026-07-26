"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Dynamic singleton initialization with fallback guard
const supabase =
    supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey)
        : null;

interface RealtimeOptions {
    onQuoteInserted?: (newQuote: unknown) => void;
    onQuoteUpdated?: (updatedQuote: unknown) => void;
    onQuoteDeleted?: (deletedQuote: unknown) => void;
    enableToast?: boolean;
}

/**
 * Custom React Hook pour s'abonner aux changements Supabase Realtime sur la table quote.
 * Supporte les callbacks optimistes et les notifications de toast en direct.
 */
export function useRealtimeQuotes(options?: RealtimeOptions) {
    const router = useRouter();
    const [isConnected, setIsConnected] = useState(false);

    const onQuoteInserted = options?.onQuoteInserted;
    const onQuoteUpdated = options?.onQuoteUpdated;
    const onQuoteDeleted = options?.onQuoteDeleted;
    const enableToast = options?.enableToast ?? true;

    const handleRealtimeEvent = useCallback(
        (payload: { eventType: string; new: unknown; old: unknown }) => {
            console.log("⚡ Supabase Realtime Event:", payload.eventType, payload);

            if (payload.eventType === "INSERT") {
                if (enableToast) {
                    toast.info("⚡ Nouvelle demande de devis reçue !");
                }
                onQuoteInserted?.(payload.new);
            } else if (payload.eventType === "UPDATE") {
                if (enableToast) {
                    toast.info("⚡ Un devis a été mis à jour.");
                }
                onQuoteUpdated?.(payload.new);
            } else if (payload.eventType === "DELETE") {
                if (enableToast) {
                    toast.info("⚡ Devis supprimé.");
                }
                onQuoteDeleted?.(payload.old);
            }

            // Refresh Next.js Server Components if needed
            router.refresh();
        },
        [router, onQuoteInserted, onQuoteUpdated, onQuoteDeleted, enableToast]
    );

    useEffect(() => {
        if (!supabase) {
            console.warn(
                "⚠️ Supabase Realtime non initialisé. Variables NEXT_PUBLIC_SUPABASE_* manquantes."
            );
            return;
        }

        // Souscription sélective sur la table "quote" du schéma "public"
        const channel = supabase
            .channel("realtime-quotes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "quote",
                },
                (payload) => {
                    handleRealtimeEvent(
                        payload as unknown as { eventType: string; new: unknown; old: unknown }
                    );
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    setIsConnected(true);
                } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
                    setIsConnected(false);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [handleRealtimeEvent]);

    return { isConnected };
}
