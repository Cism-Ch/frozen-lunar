"use client";

import { Message } from "@/lib/support-agent/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Headset, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

interface ChatMessageProps {
    message: Message;
    className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
    const isUser = message.role === "user";
    const isTyping = message.isTyping;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "flex gap-2.5",
                isUser ? "flex-row-reverse" : "flex-row",
                className
            )}
        >
            {/* Avatar */}
            {!isUser && (
                <Avatar className="border-secondary/20 h-8 w-8 shrink-0 border-2">
                    <AvatarImage src="/support-avatar.png" alt="Support" />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <Headset className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
            )}

            <div
                className={cn(
                    "flex max-w-[80%] flex-col gap-1",
                    isUser ? "items-end" : "items-start"
                )}
            >
                {/* Message Bubble */}
                <div
                    className={cn(
                        "rounded-2xl px-3.5 py-2.5",
                        "text-sm leading-relaxed",
                        isUser
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md",
                        isTyping && "min-w-[60px]"
                    )}
                >
                    {isTyping ? (
                        <TypingIndicator />
                    ) : (
                        <p className="break-words whitespace-pre-wrap">
                            {message.content}
                        </p>
                    )}
                </div>

                {/* Timestamp */}
                {!isTyping && message.timestamp && (
                    <span className="text-muted-foreground px-1 text-[10px]">
                        {format(message.timestamp, "HH:mm", { locale: fr })}
                    </span>
                )}
            </div>

            {/* User Avatar (optional) */}
            {isUser && (
                <Avatar className="border-primary/20 h-8 w-8 shrink-0 border-2">
                    <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 py-1">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="bg-muted-foreground/60 h-2 w-2 rounded-full"
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    );
}
