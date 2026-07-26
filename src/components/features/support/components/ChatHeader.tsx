import { QuoteFlowState } from "@/lib/support-agent/quote-flow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Headset, Minimize2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ChatHeaderProps {
    quoteFlowState: QuoteFlowState;
    onRestart: () => void;
    onClose: () => void;
}

export function ChatHeader({
    quoteFlowState,
    onRestart,
    onClose,
}: ChatHeaderProps) {
    // Determine progress if active
    const getFlowProgress = (state: QuoteFlowState): string => {
        const steps = [
            "itemType",
            "pickup",
            "dropoff",
            "date",
            "contact_name",
            "contact_email",
            "contact_phone",
            "category_questions",
            "notes",
            "confirm",
        ];
        const currentIndex = steps.indexOf(state.currentStep);
        return `Étape ${Math.max(1, currentIndex + 1)}/${steps.length}`;
    };

    const getFlowProgressPercent = (state: QuoteFlowState): number => {
        const steps = [
            "itemType",
            "pickup",
            "dropoff",
            "date",
            "contact_name",
            "contact_email",
            "contact_phone",
            "category_questions",
            "notes",
            "confirm",
        ];
        const currentIndex = steps.indexOf(state.currentStep);
        return Math.max(10, ((currentIndex + 1) / steps.length) * 100);
    };

    return (
        <DialogHeader className="from-secondary to-secondary/80 text-secondary-foreground relative shrink-0 overflow-hidden border-b bg-gradient-to-r p-4">
            {/* Background pattern or effect could go here */}

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm">
                        <AvatarImage src="/support-avatar.png" alt="Support" />
                        <AvatarFallback className="bg-white/10 text-white backdrop-blur-sm">
                            <Headset className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <DialogTitle className="text-base leading-tight font-semibold text-white">
                            Support HBC
                        </DialogTitle>
                        <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-white/80">
                                {quoteFlowState.isActive
                                    ? "Création de devis"
                                    : "En ligne"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRestart}
                        className="h-9 w-9 rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        title="Nouvelle conversation"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-9 w-9 rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Quote Flow Progress Bar - Mobile optimized visibility */}
            {quoteFlowState.isActive && (
                <div className="mt-4 border-t border-white/10 pt-3">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/80">
                        <span>Progression</span>
                        <span>{getFlowProgress(quoteFlowState)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-black/20 backdrop-blur-sm">
                        <motion.div
                            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            initial={{ width: 0 }}
                            animate={{
                                width: `${getFlowProgressPercent(quoteFlowState)}%`,
                            }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    </div>
                </div>
            )}
        </DialogHeader>
    );
}
