"use client";

import { FlowOption } from "@/lib/support-agent/tutorials";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ChatOptionsProps {
    options: FlowOption[];
    onSelect: (option: FlowOption) => void;
    isLoading?: boolean;
    className?: string;
}

export function ChatOptions({ options, onSelect, isLoading, className }: ChatOptionsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "flex flex-col gap-2 w-full max-w-[90%]",
                className
            )}
        >
            {options.map((option, index) => (
                <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelect(option)}
                        disabled={isLoading}
                        className={cn(
                            "w-full justify-start text-left h-auto py-2.5 px-3",
                            "bg-muted/50 hover:bg-primary/10 hover:border-primary/30",
                            "border-muted-foreground/20",
                            "transition-all duration-200",
                            "group"
                        )}
                    >
                        {option.icon && (
                            <span className="text-base mr-2 group-hover:scale-110 transition-transform">
                                {option.icon}
                            </span>
                        )}
                        <span className="text-sm font-medium">
                            {option.label.replace(/^[^\w\s]+\s*/, "")}
                        </span>
                    </Button>
                </motion.div>
            ))}
        </motion.div>
    );
}
