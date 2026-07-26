import { Message, QueryCategory, Sentiment, SupportApiResponse } from "./types";
import {
    AGENT_CONFIG,
    CATEGORY_KEYWORDS,
    SENTIMENT_INDICATORS,
} from "./config";
import {
    findGuidedFlow,
    getTutorial,
    formatTutorialAsMessage,
    GuidedFlow,
    FlowOption,
    CONTEXTUAL_QUICK_REPLIES,
} from "./tutorials";

/**
 * Enhanced Mock Responses for Phase 1
 * Now with guided flows and tutorials
 */

// Conversation state tracker
interface ConversationState {
    currentFlow: GuidedFlow | null;
    currentOptions: FlowOption[] | null;
    awaitingSelection: boolean;
    context: string;
    lastCategory: QueryCategory | null;
}

let conversationState: ConversationState = {
    currentFlow: null,
    currentOptions: null,
    awaitingSelection: false,
    context: "initial",
    lastCategory: null,
};

/**
 * Reset conversation state
 */
export function resetConversation(): void {
    conversationState = {
        currentFlow: null,
        currentOptions: null,
        awaitingSelection: false,
        context: "initial",
        lastCategory: null,
    };
}

/**
 * Format options as clickable message
 */
function formatOptionsMessage(options: FlowOption[]): string {
    return options
        .map((opt) => `${opt.icon || "•"} **${opt.label}**`)
        .join("\n");
}

/**
 * Find selected option from user message
 */
function findSelectedOption(
    message: string,
    options: FlowOption[]
): FlowOption | null {
    const lowerMessage = message.toLowerCase();

    for (const option of options) {
        // Check if message matches option label or related keywords
        const labelLower = option.label.toLowerCase();

        // Extract key terms from label (remove emoji)
        const labelTerms = labelLower
            .replace(/[^\w\sàâäéèêëïîôùûüÿç]/g, "")
            .trim()
            .split(/\s+/);

        // Check for matches
        if (
            labelTerms.some(
                (term) => term.length > 3 && lowerMessage.includes(term)
            )
        ) {
            return option;
        }

        // Check for number selection (1, 2, 3, etc.)
        const optionIndex = options.indexOf(option) + 1;
        if (
            lowerMessage === optionIndex.toString() ||
            lowerMessage.includes(`option ${optionIndex}`)
        ) {
            return option;
        }
    }

    return null;
}

/**
 * Detect category from message (enhanced)
 */
function detectCategory(message: string): QueryCategory {
    const lowerMessage = message.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
            return category as QueryCategory;
        }
    }

    return "general";
}

/**
 * Detect sentiment from message
 */
function detectSentiment(message: string): Sentiment {
    const lowerMessage = message.toLowerCase();

    if (
        SENTIMENT_INDICATORS.negative.some((word) =>
            lowerMessage.includes(word)
        )
    ) {
        return "negative";
    }
    if (
        SENTIMENT_INDICATORS.positive.some((word) =>
            lowerMessage.includes(word)
        )
    ) {
        return "positive";
    }

    return "neutral";
}

/**
 * Generate enhanced response with guided flows
 */
export async function generateMockResponse(userMessage: string): Promise<
    SupportApiResponse & {
        options?: FlowOption[];
        showTutorial?: boolean;
        tutorialContent?: string;
        quickReplyContext?: string;
    }
> {
    const category = detectCategory(userMessage);
    const sentiment = detectSentiment(userMessage);
    const shouldEscalate = sentiment === "negative";

    // Simulate API delay
    await new Promise((resolve) =>
        setTimeout(resolve, AGENT_CONFIG.typingDelay)
    );

    let message: string;
    let options: FlowOption[] | undefined;
    let showTutorial = false;
    let tutorialContent: string | undefined;
    let quickReplyContext = "initial";
    let suggestedActions: string[] | undefined;

    // Check if user selected from current options
    if (
        conversationState.awaitingSelection &&
        conversationState.currentOptions
    ) {
        const selectedOption = findSelectedOption(
            userMessage,
            conversationState.currentOptions
        );

        if (selectedOption) {
            message = selectedOption.response;

            // Handle actions
            if (selectedOption.action) {
                suggestedActions = [selectedOption.action];

                if (selectedOption.action === "contact_human") {
                    message +=
                        "\n\n📞 Notre équipe vous contactera sous 24h. Vous pouvez aussi nous appeler directement au numéro indiqué sur notre site.";
                    quickReplyContext = "satisfaction";
                } else if (selectedOption.action === "quote_form") {
                    message +=
                        "\n\n👆 Cliquez sur 'Remplir le formulaire' ci-dessous pour démarrer votre demande de devis.";
                    quickReplyContext = "afterQuoteInfo";
                } else if (selectedOption.action === "show_services") {
                    message +=
                        "\n\n🚚 Consultez notre page 'Services' pour découvrir toutes nos prestations.";
                    quickReplyContext = "initial";
                }
            }

            // Show tutorial if available
            if (selectedOption.tutorialId) {
                const tutorial = getTutorial(selectedOption.tutorialId);
                if (tutorial) {
                    showTutorial = true;
                    tutorialContent = formatTutorialAsMessage(tutorial);
                }
            }

            // Set follow-up options if available
            if (
                selectedOption.followUpOptions &&
                selectedOption.followUpOptions.length > 0
            ) {
                options = selectedOption.followUpOptions;
                conversationState.currentOptions =
                    selectedOption.followUpOptions;
                conversationState.awaitingSelection = true;
                message +=
                    "\n\n" +
                    formatOptionsMessage(selectedOption.followUpOptions);
            } else {
                conversationState.awaitingSelection = false;
                conversationState.currentOptions = null;
            }

            conversationState.lastCategory = category;

            return {
                message,
                category,
                sentiment,
                shouldEscalate: false,
                suggestedActions,
                options,
                showTutorial,
                tutorialContent,
                quickReplyContext,
            };
        }
    }

    // Handle escalation (negative sentiment)
    if (shouldEscalate) {
        message =
            "Je comprends votre frustration et je suis vraiment désolé pour cette situation. 🙏\n\nJe vais immédiatement transmettre votre demande à un conseiller qui vous contactera dans les plus brefs délais.\n\nEn attendant, puis-je faire autre chose pour vous ?";
        quickReplyContext = "afterProblem";
        suggestedActions = ["contact_human"];
        conversationState.awaitingSelection = false;

        return {
            message,
            category,
            sentiment,
            shouldEscalate: true,
            suggestedActions,
            quickReplyContext,
        };
    }

    // Try to find a guided flow
    const guidedFlow = findGuidedFlow(userMessage);

    if (guidedFlow) {
        conversationState.currentFlow = guidedFlow;
        conversationState.currentOptions = guidedFlow.options;
        conversationState.awaitingSelection = true;

        message =
            guidedFlow.initialMessage +
            "\n\n" +
            formatOptionsMessage(guidedFlow.options);
        options = guidedFlow.options;
        quickReplyContext = "initial";
    } else {
        // Default category-based response with guidance
        const categoryResponses: Record<
            QueryCategory,
            { message: string; context: string }
        > = {
            quote: {
                message:
                    "Je vois que vous vous intéressez à nos tarifs ! 📋\n\nPour vous fournir un devis précis, j'aurais besoin de quelques informations. Quel type de transport vous intéresse ?",
                context: "afterQuoteInfo",
            },
            transport: {
                message:
                    "Vous souhaitez suivre un transport ! 📦\n\nPour vous aider, j'ai besoin de votre numéro de commande (format HBC-XXXXX). Vous le trouverez dans l'email de confirmation.",
                context: "afterTrackingHelp",
            },
            billing: {
                message:
                    "Je vais vous aider avec votre question de facturation. 💰\n\nDe quoi avez-vous besoin exactement ?",
                context: "initial",
            },
            technical: {
                message:
                    "Je suis là pour vous aider à résoudre ce problème technique. 🔧\n\nPouvez-vous me décrire ce qui se passe ? Plus vous me donnez de détails, mieux je pourrai vous assister.",
                context: "afterProblem",
            },
            general: {
                message:
                    "Je suis là pour vous aider ! 😊\n\nQue souhaitez-vous savoir sur nos services de transport spécialisé ?",
                context: "initial",
            },
        };

        const response = categoryResponses[category];
        message = response.message;
        quickReplyContext = response.context;
    }

    conversationState.lastCategory = category;
    conversationState.context = quickReplyContext;

    return {
        message,
        category,
        sentiment,
        shouldEscalate,
        suggestedActions,
        options,
        showTutorial,
        tutorialContent,
        quickReplyContext,
    };
}

/**
 * Get current quick replies based on context
 */
export function getCurrentQuickReplies(): typeof CONTEXTUAL_QUICK_REPLIES.initial {
    return (
        CONTEXTUAL_QUICK_REPLIES[conversationState.context] ||
        CONTEXTUAL_QUICK_REPLIES.initial
    );
}

/**
 * Create a message object
 */
export function createMessage(
    content: string,
    role: "user" | "assistant",
    category?: QueryCategory,
    sentiment?: Sentiment
): Message {
    return {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role,
        content,
        timestamp: new Date(),
        category,
        sentiment,
    };
}

/**
 * Create a typing indicator message
 */
export function createTypingMessage(): Message {
    return {
        id: `typing_${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
    };
}
