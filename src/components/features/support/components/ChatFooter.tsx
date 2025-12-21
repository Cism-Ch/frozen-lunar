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
    placeholder
}: ChatFooterProps) {
    return (
        <>
            {/* Input Area */}
            <div className="p-4 border-t bg-background shrink-0 safe-area-bottom">
                <ChatInput
                    onSend={onSendMessage}
                    isLoading={isLoading}
                    quickReplies={quickReplies}
                    onQuickReply={onQuickReply}
                    placeholder={placeholder}
                />
            </div>

            {/* Footer Links */}
            <div className="px-4 py-2 border-t bg-muted/30 text-center shrink-0">
                <p className="text-[10px] text-muted-foreground">
                    Assistant HBC Logistique •
                    <Link href="/contact" className="hover:underline ml-1" onClick={onClose}>
                        Contacter un humain
                    </Link>
                </p>
            </div>
        </>
    );
}
