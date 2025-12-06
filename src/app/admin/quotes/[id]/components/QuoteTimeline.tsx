"use client";

import { Quote } from "@/lib/quote-storage";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Circle, Clock, FileText, MessageSquare, ShieldAlert, User } from "lucide-react";

interface QuoteTimelineProps {
    quote: Quote;
}

export function QuoteTimeline({ quote }: QuoteTimelineProps) {
    const history = quote.history || [];

    const getIcon = (action: string) => {
        if (action.includes("Création")) return <Clock className="h-4 w-4 text-blue-500" />;
        if (action.includes("Statut")) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (action.includes("Note")) return <MessageSquare className="h-4 w-4 text-orange-500" />;
        if (action.includes("Mise à jour")) return <FileText className="h-4 w-4 text-purple-500" />;
        return <Circle className="h-3 w-3 text-muted-foreground" />;
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                Aucun historique disponible pour ce dossier.
            </div>
        );
    }

    return (
        <div className="space-y-6 relative pl-2">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

            {history.map((event, index) => (
                <div key={event.id || index} className="relative pl-8 group">
                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full border bg-background flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors z-10">
                        {getIcon(event.action)}
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{event.action}</span>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(event.timestamp), "dd MMM à HH:mm", { locale: fr })}
                            </span>
                        </div>
                        <p className="text-sm text-foreground/80 bg-muted/20 p-2 rounded-md border inline-block">
                            {event.description}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                            <User className="h-3 w-3" />
                            {event.user}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
