"use client";

import { Quote } from "@/lib/quote-storage";
import { safeFormatDate } from "@/lib/date-utils";
import {
    Clock,
    CheckCircle2,
    MessageSquare,
    FileText,
    Circle,
    User,
} from "lucide-react";

interface QuoteTimelineProps {
    quote: Quote;
}

export function QuoteTimeline({ quote }: QuoteTimelineProps) {
    const history = quote.history || [];

    const getIcon = (action: string) => {
        if (action.includes("Création"))
            return <Clock className="h-4 w-4 text-blue-500" />;
        if (action.includes("Statut"))
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (action.includes("Note"))
            return <MessageSquare className="h-4 w-4 text-orange-500" />;
        if (action.includes("Mise à jour"))
            return <FileText className="h-4 w-4 text-purple-500" />;
        return <Circle className="text-muted-foreground h-3 w-3" />;
    };

    if (history.length === 0) {
        return (
            <div className="text-muted-foreground py-8 text-center text-sm">
                Aucun historique disponible pour ce dossier.
            </div>
        );
    }

    return (
        <div className="relative space-y-6 pl-2">
            <div className="bg-border absolute top-2 bottom-2 left-[11px] w-px" />

            {history.map((event, index) => (
                <div key={event.id || index} className="group relative pl-8">
                    <div className="bg-background group-hover:border-primary/50 absolute top-1 left-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition-colors">
                        {getIcon(event.action)}
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                                {event.action}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {safeFormatDate(
                                    event.timestamp,
                                    "dd MMM à HH:mm"
                                )}
                            </span>
                        </div>
                        <p className="text-foreground/80 bg-muted/20 inline-block rounded-md border p-2 text-sm">
                            {event.description}
                        </p>
                        <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[10px] tracking-wider uppercase">
                            <User className="h-3 w-3" />
                            {event.user}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
