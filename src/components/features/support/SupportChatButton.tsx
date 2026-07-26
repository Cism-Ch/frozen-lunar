"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Headset } from "lucide-react";
import { SupportChatModal } from "./SupportChatModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/hooks/useHasMounted";

export function SupportChatButton() {
    const [isOpen, setIsOpen] = useState(false);
    const isMounted = useHasMounted();

    // Don't render anything until mounted (prevents SSR/client mismatch)
    if (!isMounted) {
        return null;
    }

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                        className="fixed bottom-6 left-6 z-50 lg:bottom-8 lg:left-8"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            size="icon"
                            className={cn(
                                "h-14 w-14 lg:h-16 lg:w-16",
                                "rounded-full",
                                "hover:shadow-3xl shadow-2xl",
                                "hover:scale-110",
                                "transition-all duration-300",
                                // Secondary color (Deep Blue) to differentiate from WhatsApp
                                "bg-secondary hover:bg-secondary/90",
                                "border-2 border-white/20",
                                "group"
                            )}
                            aria-label="Ouvrir le support client"
                        >
                            <Headset className="h-7 w-7 text-white transition-transform group-hover:scale-110 lg:h-8 lg:w-8" />

                            {/* Pulse animation */}
                            <span className="bg-secondary absolute inset-0 animate-ping rounded-full opacity-20" />

                            {/* Notification dot */}
                            <span className="bg-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white">
                                <span className="text-[8px] font-bold text-white">
                                    1
                                </span>
                            </span>
                        </Button>

                        {/* Tooltip */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute top-1/2 left-full ml-3 hidden -translate-y-1/2 lg:block"
                        >
                            <div className="bg-popover text-popover-foreground rounded-lg border px-3 py-1.5 text-sm whitespace-nowrap shadow-lg">
                                💬 Besoin d&apos;aide ?
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <SupportChatModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
