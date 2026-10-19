import { QuoteFlowState } from "@/lib/support-agent/quote-flow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Headset, X, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ChatHeaderProps {
    quoteFlowState: QuoteFlowState;
    aiMode?: "gemini" | "resilient_local";
    onRestart: () => void;
    onClose: () => void;
}

export function ChatHeader({
    quoteFlowState,
    aiMode = "resilient_local",
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
        <DialogHeader className="from-secondary to-secondary/90 text-secondary-foreground relative shrink-0 overflow-hidden border-b bg-gradient-to-r p-3.5 sm:p-4">
            <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                    <Avatar className="h-9 w-9 shrink-0 border-2 border-white/20 shadow-xs sm:h-10 sm:w-10">
                        <AvatarImage src="/support-avatar.png" alt="Support" />
                        <AvatarFallback className="bg-white/10 text-white backdrop-blur-sm">
                            <Headset className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                        <DialogTitle className="truncate text-sm leading-tight font-semibold text-white sm:text-base">
                            Support HBC
                        </DialogTitle>
                        <div className="mt-0.5 flex items-center gap-1.5 truncate">
                            {quoteFlowState.isActive ? (
                                <>
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                                    </span>
                                    <span className="truncate text-[11px] font-medium text-amber-200 sm:text-xs">
                                        Création de devis
                                    </span>
                                </>
                            ) : aiMode === "gemini" ? (
                                <>
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                                    </span>
                                    <span className="truncate text-[11px] font-medium text-emerald-200 sm:text-xs">
                                        IA Gemini Active
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300"></span>
                                    </span>
                                    <span
                                        className="truncate text-[11px] font-medium text-sky-100 sm:text-xs"
                                        title="Moteur déterministe autonome actif : guidage devis, FAQ transport et suivi disponibles"
                                    >
                                        Mode Autonome
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRestart}
                        className="h-8 w-8 rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:h-9 sm:w-9"
                        title="Nouvelle conversation"
                        aria-label="Nouvelle conversation"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:h-9 sm:w-9"
                        title="Fermer le support"
                        aria-label="Fermer le support"
                    >
                        <X className="h-4 w-4" />
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
