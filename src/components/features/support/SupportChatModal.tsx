"use client";

import { useState, useRef, useEffect } from "react";
import { Message, QuickReply } from "@/lib/support-agent/types";
import { AGENT_CONFIG } from "@/lib/support-agent/config";
import {
    generateMockResponse,
    createMessage,
    createTypingMessage,
    getCurrentQuickReplies,
    resetConversation
} from "@/lib/support-agent/mock-responses";
import { FlowOption, getTutorial, Tutorial } from "@/lib/support-agent/tutorials";
import {
    QuoteFlowState,
    startQuoteFlow,
    processFlowAnswer,
    getStepMessage,
    getStepOptions,
    createInitialFlowState,
} from "@/lib/support-agent/quote-flow";
import { quoteStorage } from "@/lib/quote-storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatOptions } from "./ChatOptions";
import { ChatTutorial } from "./ChatTutorial";
import { Headset, Minimize2, RotateCcw, FileText, ExternalLink, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

interface SupportChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ChatItem {
    type: "message" | "options" | "tutorial" | "quote_options" | "quote_success";
    data: Message | FlowOption[] | Tutorial | { label: string; value: string }[] | { quoteId: string };
    id: string;
}

export function SupportChatModal({ isOpen, onClose }: SupportChatModalProps) {
    const [chatItems, setChatItems] = useState<ChatItem[]>([
        {
            type: "message",
            data: AGENT_CONFIG.welcomeMessage,
            id: "welcome"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuickReplies, setCurrentQuickReplies] = useState<QuickReply[]>(
        AGENT_CONFIG.quickReplies
    );
    const [quoteFlowState, setQuoteFlowState] = useState<QuoteFlowState>(createInitialFlowState());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new items arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatItems]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                resetConversation();
                setChatItems([
                    { type: "message", data: AGENT_CONFIG.welcomeMessage, id: "welcome" }
                ]);
                setCurrentQuickReplies(AGENT_CONFIG.quickReplies);
                setQuoteFlowState(createInitialFlowState());
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleRestart = () => {
        resetConversation();
        setChatItems([
            { type: "message", data: AGENT_CONFIG.welcomeMessage, id: "welcome" }
        ]);
        setCurrentQuickReplies(AGENT_CONFIG.quickReplies);
        setQuoteFlowState(createInitialFlowState());
    };

    const addTypingThenMessage = async (content: string, delay = 800) => {
        const typingMessage = createTypingMessage();
        setChatItems(prev => [...prev, { type: "message", data: typingMessage, id: typingMessage.id }]);

        await new Promise(resolve => setTimeout(resolve, delay));

        setChatItems(prev => {
            const filtered = prev.filter(item =>
                !(item.type === "message" && (item.data as Message).isTyping)
            );
            const assistantMessage = createMessage(content, "assistant");
            return [...filtered, { type: "message", data: assistantMessage, id: assistantMessage.id }];
        });
    };

    const handleStartQuoteFlow = async (guided: boolean) => {
        if (guided) {
            const newState = startQuoteFlow();
            setQuoteFlowState(newState);

            await addTypingThenMessage(getStepMessage(newState));

            const options = getStepOptions(newState);
            if (options) {
                setChatItems(prev => [...prev, {
                    type: "quote_options",
                    data: options,
                    id: `quote_opts_${Date.now()}`
                }]);
            }
        } else {
            // Redirect to form
            await addTypingThenMessage(
                "Je vous redirige vers notre formulaire de devis. 📋\n\nVous pourrez y renseigner toutes les informations nécessaires."
            );
            // Add link button
            setChatItems(prev => [...prev, {
                type: "quote_options",
                data: [{ label: "📋 Ouvrir le formulaire", value: "open_form" }],
                id: `form_link_${Date.now()}`
            }]);
        }
    };

    const handleQuoteFlowAnswer = async (answer: string) => {
        // Add user message
        const userMessage = createMessage(answer, "user");
        setChatItems(prev => [...prev, { type: "message", data: userMessage, id: userMessage.id }]);
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 300));

        const { newState, complete } = processFlowAnswer(quoteFlowState, answer);
        setQuoteFlowState(newState);

        if (complete) {
            // Submit the quote
            try {
                const data = newState.data;
                const newQuote = quoteStorage.add({
                    client: data.fullName || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    type: data.itemType || "",
                    pickup: data.pickup || "",
                    dropoff: data.dropoff || "",
                    transportDate: data.transportDate || new Date().toISOString(),
                    userNotes: data.userNotes,
                    supplementaryInfo: data.supplementaryInfo as any,
                    source: "chat",
                });

                await addTypingThenMessage(
                    `✅ **Votre demande de devis a été enregistrée !**\n\nNuméro de référence: **${newQuote.id}**\n\nNotre équipe vous contactera sous 24h pour vous proposer un tarif personnalisé.\n\nMerci de votre confiance ! 🚚`
                );

                setChatItems(prev => [...prev, {
                    type: "quote_success",
                    data: { quoteId: newQuote.id },
                    id: `success_${Date.now()}`
                }]);

                toast.success("Devis créé avec succès !");
            } catch (error) {
                console.error("Error creating quote:", error);
                await addTypingThenMessage(
                    "❌ Une erreur s'est produite lors de l'enregistrement. Veuillez réessayer ou utiliser notre formulaire."
                );
            }
        } else {
            // Continue flow
            await addTypingThenMessage(getStepMessage(newState));

            const options = getStepOptions(newState);
            if (options) {
                setChatItems(prev => [...prev, {
                    type: "quote_options",
                    data: options,
                    id: `quote_opts_${Date.now()}`
                }]);
            }
        }

        setIsLoading(false);
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        // Check if we're in quote flow mode
        if (quoteFlowState.isActive) {
            await handleQuoteFlowAnswer(content);
            return;
        }

        // Check for quote-related triggers
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes("devis") || lowerContent.includes("prix") || lowerContent.includes("tarif")) {
            const userMessage = createMessage(content, "user");
            setChatItems(prev => [...prev, { type: "message", data: userMessage, id: userMessage.id }]);
            setIsLoading(true);

            await addTypingThenMessage(
                "Je peux vous aider à créer votre demande de devis ! 📋\n\nComment souhaitez-vous procéder ?"
            );

            setChatItems(prev => [...prev, {
                type: "quote_options",
                data: [
                    { label: "💬 Création guidée (je réponds aux questions)", value: "guided" },
                    { label: "📝 Remplir le formulaire moi-même", value: "manual" },
                ],
                id: `quote_choice_${Date.now()}`
            }]);

            setIsLoading(false);
            return;
        }

        // Normal chat flow
        const userMessage = createMessage(content, "user");
        setChatItems(prev => [...prev, { type: "message", data: userMessage, id: userMessage.id }]);
        setIsLoading(true);

        const typingMessage = createTypingMessage();
        setChatItems(prev => [...prev, { type: "message", data: typingMessage, id: typingMessage.id }]);

        try {
            const response = await generateMockResponse(content);

            setChatItems(prev => prev.filter(item =>
                !(item.type === "message" && (item.data as Message).isTyping)
            ));

            const assistantMessage = createMessage(
                response.message,
                "assistant",
                response.category,
                response.sentiment
            );
            setChatItems(prev => [...prev, {
                type: "message",
                data: assistantMessage,
                id: assistantMessage.id
            }]);

            if (response.options && response.options.length > 0) {
                setChatItems(prev => [...prev, {
                    type: "options",
                    data: response.options!,
                    id: `options_${Date.now()}`
                }]);
            }

            if (response.showTutorial && response.tutorialContent) {
                const tutorialId = response.options?.find(o => o.tutorialId)?.tutorialId;
                if (tutorialId) {
                    const tutorial = getTutorial(tutorialId);
                    if (tutorial) {
                        setChatItems(prev => [...prev, {
                            type: "tutorial",
                            data: tutorial,
                            id: `tutorial_${Date.now()}`
                        }]);
                    }
                }
            }

            if (response.quickReplyContext) {
                setCurrentQuickReplies(getCurrentQuickReplies());
            }
        } catch (error) {
            console.error("Error getting response:", error);
            setChatItems(prev => {
                const filtered = prev.filter(item =>
                    !(item.type === "message" && (item.data as Message).isTyping)
                );
                const errorMessage = createMessage(
                    "Désolé, une erreur s'est produite. Veuillez réessayer.",
                    "assistant"
                );
                return [...filtered, { type: "message", data: errorMessage, id: errorMessage.id }];
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (option: FlowOption) => {
        handleSendMessage(option.label);
    };

    const handleQuoteOptionSelect = (option: { label: string; value: string }) => {
        if (option.value === "guided") {
            const userMessage = createMessage(option.label, "user");
            setChatItems(prev => [...prev, { type: "message", data: userMessage, id: userMessage.id }]);
            handleStartQuoteFlow(true);
        } else if (option.value === "manual" || option.value === "open_form") {
            const userMessage = createMessage(option.label, "user");
            setChatItems(prev => [...prev, { type: "message", data: userMessage, id: userMessage.id }]);
            // Close modal and open devis page
            onClose();
            window.location.href = "/devis";
        } else {
            // It's a quote flow answer
            handleQuoteFlowAnswer(option.value);
        }
    };

    const handleQuickReply = (reply: QuickReply) => {
        handleSendMessage(reply.text);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={cn(
                    "p-0 gap-0 overflow-hidden",
                    "sm:max-w-[420px] sm:h-[650px] sm:max-h-[85vh]",
                    "max-sm:w-screen max-sm:h-screen max-sm:max-w-none max-sm:max-h-none max-sm:rounded-none",
                    "flex flex-col"
                )}
            >
                {/* Header */}
                <DialogHeader className="p-4 border-b bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white/20">
                                <AvatarImage src="/support-avatar.png" alt="Support" />
                                <AvatarFallback className="bg-white/10 text-white">
                                    <Headset className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-base font-semibold text-white">
                                    Support HBC
                                </DialogTitle>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-xs text-white/70">
                                        {quoteFlowState.isActive ? "Création de devis" : "Assistant virtuel"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleRestart}
                                className="text-white/70 hover:text-white hover:bg-white/10"
                                title="Nouvelle conversation"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onClose}
                                className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                                <Minimize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Quote Flow Progress */}
                    {quoteFlowState.isActive && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                                <span>Création de devis</span>
                                <span>{getFlowProgress(quoteFlowState)}</span>
                            </div>
                            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getFlowProgressPercent(quoteFlowState)}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}
                </DialogHeader>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                    <AnimatePresence mode="popLayout">
                        {chatItems.map((item) => {
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
                                        onSelect={handleOptionSelect}
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
                                        options={item.data as { label: string; value: string }[]}
                                        onSelect={handleQuoteOptionSelect}
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
                                        className="flex flex-col items-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20"
                                    >
                                        <CheckCircle className="h-12 w-12 text-green-500" />
                                        <div className="text-center">
                                            <p className="font-semibold text-green-700 dark:text-green-400">
                                                Devis enregistré !
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Référence: {successData.quoteId}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            }
                            return null;
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-background shrink-0">
                    <ChatInput
                        onSend={handleSendMessage}
                        isLoading={isLoading}
                        quickReplies={chatItems.length <= 3 && !quoteFlowState.isActive ? currentQuickReplies : []}
                        onQuickReply={handleQuickReply}
                        placeholder={quoteFlowState.isActive ? "Votre réponse..." : undefined}
                    />
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t bg-muted/30 text-center shrink-0">
                    <p className="text-[10px] text-muted-foreground">
                        Assistant HBC Logistique •
                        <Link href="/contact" className="hover:underline ml-1" onClick={onClose}>
                            Contacter un humain
                        </Link>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper Components
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
            className="flex flex-col gap-2 w-full max-w-[90%]"
        >
            {options.map((option, index) => (
                <motion.div
                    key={option.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelect(option)}
                        disabled={isLoading}
                        className={cn(
                            "w-full justify-start text-left h-auto py-2.5 px-3",
                            "bg-primary/5 hover:bg-primary/10 hover:border-primary/30",
                            "border-primary/20",
                            "transition-all duration-200"
                        )}
                    >
                        <span className="text-sm">{option.label}</span>
                    </Button>
                </motion.div>
            ))}
        </motion.div>
    );
}

// Helper functions
function getFlowProgress(state: QuoteFlowState): string {
    const steps = ["itemType", "category_questions", "pickup", "dropoff", "date", "contact_name", "contact_email", "contact_phone", "notes", "confirm"];
    const currentIndex = steps.indexOf(state.currentStep);
    return `Étape ${Math.max(1, currentIndex + 1)}/${steps.length}`;
}

function getFlowProgressPercent(state: QuoteFlowState): number {
    const steps = ["itemType", "category_questions", "pickup", "dropoff", "date", "contact_name", "contact_email", "contact_phone", "notes", "confirm"];
    const currentIndex = steps.indexOf(state.currentStep);
    return Math.max(10, ((currentIndex + 1) / steps.length) * 100);
}
