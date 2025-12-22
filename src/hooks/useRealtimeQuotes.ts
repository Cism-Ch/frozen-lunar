import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Initialisation unique du client client-side
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export function useRealtimeQuotes() {
    const router = useRouter();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const channel = supabase
            .channel("realtime-quotes")
            .on(
                "postgres_changes",
                {
                    event: "*", // Écoute INSERT, UPDATE, DELETE
                    schema: "public",
                    table: "quote",
                },
                (payload) => {
                    // Lors d'un changement, on peut soit mettre à jour le state local directement,
                    // soit invalider le cache Next.js pour recharger les données.
                    // Ici, on opte pour un refresh router pour garantir la fraîcheur des données.
                    console.log("Realtime change detected:", payload);
                    router.refresh();

                    if (payload.eventType === "INSERT") {
                        toast.info("Nouvelle demande de devis reçue !");
                    }
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    setIsConnected(true);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    return { isConnected };
}
