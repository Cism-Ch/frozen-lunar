"use client";

import { FlowOption } from "@/lib/support-agent/tutorials";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, Package, FileText, Truck, Phone } from "lucide-react";

interface ChatOptionsProps {
    options: FlowOption[];
    onSelect: (option: FlowOption) => void;
    isLoading?: boolean;
    className?: string;
}

function stripEmojis(text: string): string {
    return text
        .replace(
            /[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\uFE0F]/gu,
            ""
        )
        .replace(/^[^\wÀ-ÿ]+\s*/, "")
        .trim();
}

function getOptionIcon(option: FlowOption) {
    const id = option.id.toLowerCase();
    const action = option.action || "";

    if (id.includes("track") || id.includes("number") || id.includes("order")) {
        return (
            <Package className="text-primary mr-2.5 h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
        );
    }
    if (id.includes("quote") || action === "quote_form") {
        return (
            <FileText className="text-primary mr-2.5 h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
        );
    }
    if (id.includes("service") || action === "show_services") {
        return (
            <Truck className="text-primary mr-2.5 h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
        );
    }
    if (
        id.includes("human") ||
        id.includes("dispatcher") ||
        action === "contact_human"
    ) {
        return (
            <Phone className="text-primary mr-2.5 h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
        );
    }
    return (
        <ChevronRight className="text-primary/70 mr-2.5 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
    );
}

export function ChatOptions({
    options,
    onSelect,
    isLoading,
    className,
}: ChatOptionsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("flex w-full max-w-[90%] flex-col gap-2", className)}
        >
            {options.map((option, index) => (
                <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.08 }}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelect(option)}
                        disabled={isLoading}
                        className={cn(
                            "h-auto w-full justify-start rounded-xl px-3.5 py-2.5 text-left",
                            "bg-muted/50 hover:bg-primary/10 hover:border-primary/40",
                            "border-border/60 shadow-2xs",
                            "transition-all duration-200 active:scale-[0.99]",
                            "group touch-manipulation"
                        )}
                    >
                        {getOptionIcon(option)}
                        <span className="text-sm font-medium">
                            {stripEmojis(option.label)}
                        </span>
                    </Button>
                </motion.div>
            ))}
        </motion.div>
    );
}
