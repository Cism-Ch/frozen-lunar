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
        aiMode,
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
                showCloseButton={false}
                className={cn(
                    "gap-0 overflow-hidden p-0",
                    "z-50 flex flex-col border-none shadow-2xl",
                    // Desktop: ancrage naturel en bas à gauche au-dessus du bouton support
                    "sm:fixed sm:top-auto sm:right-auto sm:bottom-6 sm:left-6 sm:translate-x-0 sm:translate-y-0",
                    "sm:border-border/60 sm:h-[650px] sm:max-h-[calc(100vh-3rem)] sm:w-[410px] sm:max-w-[420px] sm:rounded-2xl sm:border",
                    // Mobile: plein écran fluide avec dvh pour le clavier virtuel
                    "max-sm:fixed max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0",
                    "max-sm:h-[100dvh] max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:rounded-none max-sm:border-none",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                )}
            >
                <ChatHeader
                    quoteFlowState={quoteFlowState}
                    aiMode={aiMode}
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
                    quickReplies={
                        chatItems.length <= 3 && !quoteFlowState.isActive
                            ? currentQuickReplies
                            : []
                    }
                    onQuickReply={(reply) => sendMessage(reply.text)}
                    onClose={onClose}
                    placeholder={
                        quoteFlowState.isActive ? "Votre réponse..." : undefined
                    }
                />
            </DialogContent>
        </Dialog>
    );
}
