"use client";

import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSupportChat } from "@/hooks/useSupportChat";

import { ChatHeader } from "./components/ChatHeader";
import { ChatMessagesList } from "./components/ChatMessagesList";
import { ChatFooter } from "./components/ChatFooter";

interface SupportChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SupportChatModal({ isOpen, onClose }: SupportChatModalProps) {
    const {
        chatItems,
        isLoading,
        currentQuickReplies,
        quoteFlowState,
        messagesEndRef,
        sendMessage,
        restartChat,
        handleOptionSelect,
    } = useSupportChat(onClose);

    // Reset conversation when modal closes with a slight delay for animation
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                restartChat();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, restartChat]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={cn(
                    "p-0 gap-0 overflow-hidden",
                    "sm:max-w-[420px] sm:h-[650px] sm:max-h-[85vh]",
                    "max-sm:w-screen max-sm:h-[100dvh] max-sm:max-w-none max-sm:max-h-none max-sm:rounded-none", // Mobile full screen with dvh
                    "flex flex-col border-none shadow-2xl",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
                    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
                )}
            >
                <ChatHeader
                    quoteFlowState={quoteFlowState}
                    onRestart={restartChat}
                    onClose={onClose}
                />

                <ChatMessagesList
                    items={chatItems}
                    isLoading={isLoading}
                    onOptionSelect={handleOptionSelect}
                    messagesEndRef={messagesEndRef}
                />

                <ChatFooter
                    onSendMessage={sendMessage}
                    isLoading={isLoading}
                    quickReplies={chatItems.length <= 3 && !quoteFlowState.isActive ? currentQuickReplies : []}
                    onQuickReply={(reply) => sendMessage(reply.text)}
                    onClose={onClose}
                    placeholder={quoteFlowState.isActive ? "Votre réponse..." : undefined}
                />
            </DialogContent>
        </Dialog>
    );
}
