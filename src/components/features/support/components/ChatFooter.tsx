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
            <div className="bg-background safe-area-bottom shrink-0 border-t p-4">
                <ChatInput
                    onSend={onSendMessage}
                    isLoading={isLoading}
                    quickReplies={quickReplies}
                    onQuickReply={onQuickReply}
                    placeholder={placeholder}
                />
            </div>

            {/* Footer Links */}
            <div className="bg-muted/30 shrink-0 border-t px-4 py-2 text-center">
                <p className="text-muted-foreground text-[10px]">
                    Assistant HBC Logistique •
                    <Link
                        href="/contact"
                        className="ml-1 hover:underline"
                        onClick={onClose}
                    >
                        Contacter un humain
                    </Link>
                </p>
            </div>
        </>
    );
}
