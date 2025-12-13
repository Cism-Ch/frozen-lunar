"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Headset } from "lucide-react";
import { SupportChatModal } from "./SupportChatModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function SupportChatButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

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
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="fixed bottom-6 left-6 lg:bottom-8 lg:left-8 z-50"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            size="icon"
                            className={cn(
                                "h-14 w-14 lg:h-16 lg:w-16",
                                "rounded-full",
                                "shadow-2xl hover:shadow-3xl",
                                "hover:scale-110",
                                "transition-all duration-300",
                                // Secondary color (Deep Blue) to differentiate from WhatsApp
                                "bg-secondary hover:bg-secondary/90",
                                "border-2 border-white/20",
                                "group"
                            )}
                            aria-label="Ouvrir le support client"
                        >
                            <Headset className="h-7 w-7 lg:h-8 lg:w-8 text-white group-hover:scale-110 transition-transform" />

                            {/* Pulse animation */}
                            <span className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-20" />

                            {/* Notification dot */}
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">1</span>
                            </span>
                        </Button>

                        {/* Tooltip */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden lg:block"
                        >
                            <div className="bg-popover text-popover-foreground px-3 py-1.5 rounded-lg shadow-lg text-sm whitespace-nowrap border">
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
