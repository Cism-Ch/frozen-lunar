"use client";

import { QuickReply } from "@/lib/support-agent/types";
import { AGENT_CONFIG } from "@/lib/support-agent/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
    quickReplies?: QuickReply[];
    onQuickReply?: (reply: QuickReply) => void;
    className?: string;
    placeholder?: string;
}

export function ChatInput({
    onSend,
    isLoading = false,
    quickReplies = AGENT_CONFIG.quickReplies,
    onQuickReply,
    className,
    placeholder = "Écrivez votre message...",
}: ChatInputProps) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const maxChars = AGENT_CONFIG.maxInputChars;
    const charCount = message.length;
    const isOverLimit = charCount > maxChars;
    const canSend = message.trim().length > 0 && !isOverLimit && !isLoading;

    const handleSend = () => {
        if (!canSend) return;
        onSend(message.trim());
        setMessage("");
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickReply = (reply: QuickReply) => {
        if (onQuickReply) {
            onQuickReply(reply);
        } else {
            onSend(reply.text);
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Quick Replies */}
            {quickReplies.length > 0 && (
                <div className="relative">
                    <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l to-transparent md:hidden" />
                    <div className="mask-linear-fade -mb-2 flex scrollbar-none gap-2 overflow-x-auto pb-2">
                        {quickReplies.map((reply) => (
                            <Button
                                key={reply.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickReply(reply)}
                                disabled={isLoading}
                                className="bg-muted/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 h-8 rounded-full px-3 text-xs whitespace-nowrap transition-colors"
                            >
                                {reply.icon && (
                                    <span className="mr-1">{reply.icon}</span>
                                )}
                                {reply.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="flex items-end gap-2">
                <div className="relative flex-1">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading}
                        className={cn(
                            "max-h-[120px] min-h-[44px] resize-none pr-12",
                            "bg-muted/30 border-muted-foreground/20",
                            "focus:border-primary focus:ring-primary/20",
                            isOverLimit &&
                                "border-destructive focus:border-destructive focus:ring-destructive/20"
                        )}
                        rows={1}
                    />

                    {/* Character Counter */}
                    <div
                        className={cn(
                            "absolute right-2 bottom-1.5 text-[10px] transition-colors",
                            isOverLimit
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        {charCount}/{maxChars}
                    </div>
                </div>

                <Button
                    onClick={handleSend}
                    disabled={!canSend}
                    size="icon"
                    className={cn(
                        "h-11 w-11 shrink-0 rounded-full",
                        "bg-primary hover:bg-primary/90",
                        "shadow-lg hover:shadow-xl",
                        "transition-all duration-200",
                        canSend && "hover:scale-105"
                    )}
                    aria-label="Envoyer le message"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </Button>
            </div>
        </div>
    );
}
