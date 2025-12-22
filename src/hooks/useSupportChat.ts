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
import { toast } from "sonner";
import { createQuoteAction } from "@/app/actions/quote-management";

export interface ChatItem {
    type: "message" | "options" | "tutorial" | "quote_options" | "quote_success";
    data: Message | FlowOption[] | Tutorial | { label: string; value: string }[] | { quoteId: string };
    id: string;
}

export function useSupportChat(onClose: () => void) {
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

    // Auto-scroll logic
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatItems]);

    // Reset when modal closes is handled by parent or effect in component, 
    // but here we provide a restart method.

    const restartChat = () => {
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
        const userMessage = createMessage(answer, "user");
        setChatItems(prev => [...prev, { type: "message", data: userMessage, id: userMessage.id }]);
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 300));

        const { newState, complete } = processFlowAnswer(quoteFlowState, answer);
        setQuoteFlowState(newState);

        if (complete) {
            try {
                const data = newState.data;
                const result = await createQuoteAction({
                    clientName: data.fullName || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    itemType: data.itemType || "",
                    pickupLocation: data.pickup || "",
                    dropoffLocation: data.dropoff || "",
                    transportDate: data.transportDate || new Date().toISOString(),
                    userNotes: data.userNotes,
                    supplementaryInfo: data.supplementaryInfo as any,
                    source: "chat",
                });

                if (!result.success || !result.quote) {
                    throw new Error(result.error || "Erreur lors de la création du devis");
                }

                await addTypingThenMessage(
                    `✅ **Votre demande de devis a été enregistrée !**\n\nNuméro de référence: **${result.quote.id}**\n\nNotre équipe vous contactera sous 24h pour vous proposer un tarif personnalisé.\n\nMerci de votre confiance ! 🚚`
                );

                setChatItems(prev => [...prev, {
                    type: "quote_success",
                    data: { quoteId: result.quote!.id },
                    id: `success_${Date.now()}`
                }]);

                toast.success("Devis créé avec succès !");
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Error creating quote:", error.message, error.stack);
                } else {
                    console.error("Error creating quote:", error);
                }
                await addTypingThenMessage(
                    "❌ Une erreur s'est produite lors de l'enregistrement. Veuillez réessayer ou utiliser notre formulaire."
                );
            }
        } else {
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

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        if (quoteFlowState.isActive) {
            await handleQuoteFlowAnswer(content);
            return;
        }

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
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error getting response:", error.message, error.stack);
            } else {
                console.error("Error getting response:", error);
            }
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

    const handleOptionSelect = (option: FlowOption | { label: string; value: string }) => {
        // Narrowing type
        const val = 'value' in option ? option.value : option.label;
        const label = option.label;

        // Check for quote specific options
        if (val === "guided") {
            const userMessage = createMessage(label, "user");
            setChatItems(prev => [...prev, { type: "message", data: userMessage, id: userMessage.id }]);
            handleStartQuoteFlow(true);
        } else if (val === "manual" || val === "open_form") {
            const userMessage = createMessage(label, "user");
            setChatItems(prev => [...prev, { type: "message", data: userMessage, id: userMessage.id }]);
            onClose();
            window.location.href = "/devis";
        } else if ('value' in option && option.value) { // It's a quote flow answer or simple option with value
            // If we are in quote flow or if the value matches a known quote flow answer
            if (quoteFlowState.isActive) {
                handleQuoteFlowAnswer(val);
            } else {
                // Regular option select that acts as sending a message
                sendMessage(label);
            }
        } else {
            sendMessage(label);
        }
    };

    // Compatibility wrapper for components that expect specific types
    const handleFlowOptionSelect = (option: FlowOption) => sendMessage(option.label);
    const handleQuoteOptionSelect = (option: { label: string; value: string }) => handleOptionSelect(option);


    return {
        chatItems,
        isLoading,
        currentQuickReplies,
        quoteFlowState,
        messagesEndRef,
        sendMessage,
        restartChat,
        handleOptionSelect,
        handleFlowOptionSelect,
        handleQuoteOptionSelect,
        setQuoteFlowState,
        setChatItems,
        setCurrentQuickReplies
    };
}
