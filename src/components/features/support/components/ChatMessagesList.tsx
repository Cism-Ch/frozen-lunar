import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Message } from "@/lib/support-agent/types";
import { FlowOption, Tutorial } from "@/lib/support-agent/tutorials";
import { ChatItem } from "@/hooks/useSupportChat";

import { ChatMessage } from "../ChatMessage";
import { ChatOptions } from "../ChatOptions";
import { ChatTutorial } from "../ChatTutorial";

interface ChatMessagesListProps {
    items: ChatItem[];
    isLoading: boolean;
    onOptionSelect: (
        option: FlowOption | { label: string; value: string }
    ) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessagesList({
    items,
    isLoading,
    onOptionSelect,
    messagesEndRef,
}: ChatMessagesListProps) {
    return (
        <div className="bg-background/50 flex-1 space-y-4 overflow-y-auto scroll-smooth p-4">
            <AnimatePresence mode="popLayout">
                {items.map((item) => {
                    if (item.type === "message") {
                        return (
                            <ChatMessage
                                key={item.id}
                                message={item.data as Message}
                            />
                        );
                    }
                    if (item.type === "options") {
                        return (
                            <ChatOptions
                                key={item.id}
                                options={item.data as FlowOption[]}
                                onSelect={onOptionSelect}
                                isLoading={isLoading}
                            />
                        );
                    }
                    if (item.type === "tutorial") {
                        return (
                            <ChatTutorial
                                key={item.id}
                                tutorial={item.data as Tutorial}
                            />
                        );
                    }
                    if (item.type === "quote_options") {
                        return (
                            <QuoteOptionsButtons
                                key={item.id}
                                options={
                                    item.data as {
                                        label: string;
                                        value: string;
                                    }[]
                                }
                                onSelect={onOptionSelect}
                                isLoading={isLoading}
                            />
                        );
                    }
                    if (item.type === "quote_success") {
                        const successData = item.data as { quoteId: string };
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mx-4 my-2 flex flex-col items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-6"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                                    <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-center">
                                    <p className="mb-1 text-lg font-bold text-green-800 dark:text-green-300">
                                        Devis enregistré !
                                    </p>
                                    <p className="text-sm text-green-700/80 dark:text-green-400/80">
                                        Référence:{" "}
                                        <span className="font-mono font-medium select-all">
                                            {successData.quoteId}
                                        </span>
                                    </p>
                                </div>
                            </motion.div>
                        );
                    }
                    return null;
                })}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-1" />
        </div>
    );
}

// Local Helper Component for Quote Options
function QuoteOptionsButtons({
    options,
    onSelect,
    isLoading,
}: {
    options: { label: string; value: string }[];
    onSelect: (option: { label: string; value: string }) => void;
    isLoading: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-auto flex w-full max-w-[90%] flex-col gap-2 sm:ml-0"
        >
            {options.map((option, index) => (
                <motion.div
                    key={option.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Button
                        variant="outline"
                        onClick={() => onSelect(option)}
                        disabled={isLoading}
                        className={cn(
                            "h-auto w-full justify-start rounded-xl px-4 py-3 text-left",
                            "bg-background hover:bg-primary/5 hover:border-primary/30",
                            "border-input/60 shadow-sm",
                            "transition-all duration-200 active:scale-[0.98]",
                            "touch-manipulation" // Better for mobile touch
                        )}
                    >
                        <span className="text-sm font-medium">
                            {option.label}
                        </span>
                    </Button>
                </motion.div>
            ))}
        </motion.div>
    );
}
