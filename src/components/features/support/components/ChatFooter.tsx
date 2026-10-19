import Link from "next/link";
import { ChatInput } from "../ChatInput"; // Relative to sub-folder: ../../ChatInput but file is in ../ChatInput.ts
// Wait, SupportChatModal is in features/support/SupportChatModal.tsx
// ChatInput is in features/support/ChatInput.tsx
// Components are in features/support/components/
// So import is ../ChatInput

import { QuickReply } from "@/lib/support-agent/types";

interface ChatFooterProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    quickReplies: QuickReply[];
    onQuickReply: (reply: QuickReply) => void;
    onClose: () => void;
    placeholder?: string;
}

export function ChatFooter({
    onSendMessage,
    isLoading,
    quickReplies,
    onQuickReply,
    onClose,
    placeholder,
}: ChatFooterProps) {
    return (
        <>
            {/* Input Area */}
            <div className="bg-background shrink-0 border-t p-3 sm:p-4">
                <ChatInput
                    onSend={onSendMessage}
                    isLoading={isLoading}
                    quickReplies={quickReplies}
                    onQuickReply={onQuickReply}
                    placeholder={placeholder}
                />
            </div>

            {/* Footer Links */}
            <div className="bg-muted/40 shrink-0 border-t px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] text-center">
                <p className="text-muted-foreground text-[10px]">
                    Assistant HBC Logistique •
                    <Link
                        href="/contact"
                        className="text-primary/90 ml-1 font-medium hover:underline"
                        onClick={onClose}
                    >
                        Contacter un conseiller
                    </Link>
                </p>
            </div>
        </>
    );
}
