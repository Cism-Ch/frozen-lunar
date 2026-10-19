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
    TUTORIALS,
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
    return options.map((opt) => `• **${opt.label}**`).join("\n");
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
        tutorialId?: string;
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
    let tutorialId: string | undefined;
    let quickReplyContext = "initial";
    let suggestedActions: string[] | undefined;

    // Direct check for tracking reference (e.g. HBC-12345)
    const hbcMatch = userMessage.match(/hbc[-\s]?[0-9a-zA-Z]+/i);
    if (hbcMatch) {
        const orderRef = hbcMatch[0].toUpperCase().replace(/\s+/, "-");
        message = `Votre référence **${orderRef}** a bien été prise en compte.\n\nStatut estimé : Convoi planifié et en cours de coordination avec notre transporteur partenaire. Vous pouvez contacter directement notre service d'exploitation pour obtenir la position GPS en temps réel du véhicule.`;
        conversationState.awaitingSelection = false;
        conversationState.lastCategory = "transport";
        conversationState.context = "afterTrackingHelp";

        return {
            message,
            category: "transport",
            sentiment: "positive",
            shouldEscalate: false,
            suggestedActions: ["contact_human"],
            options: [
                {
                    id: "speak-dispatcher",
                    label: "Contacter le service exploitation",
                    response:
                        "Notre régulation logistique est disponible pour vous renseigner en direct sur la position du chauffeur et le délai d'arrivée.",
                    action: "contact_human",
                },
                {
                    id: "quote-another",
                    label: "Demander un autre devis",
                    response:
                        "Vous pouvez lancer une nouvelle demande de devis à tout moment.",
                    action: "quote_form",
                },
            ],
            quickReplyContext: "afterTrackingHelp",
        };
    }

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
                        "\n\nNotre équipe logistique vous contactera sous 24h ouvrées. Vous pouvez également joindre directement notre standard via notre formulaire de contact.";
                    quickReplyContext = "satisfaction";
                } else if (selectedOption.action === "quote_form") {
                    message +=
                        "\n\nVous pouvez renseigner votre demande détaillée via notre wizard de devis interactif.";
                    quickReplyContext = "afterQuoteInfo";
                } else if (selectedOption.action === "show_services") {
                    message +=
                        "\n\nConsultez notre catalogue de services pour découvrir l'ensemble de nos capacités de transport lourd.";
                    quickReplyContext = "initial";
                }
            }

            // Show tutorial if available
            if (selectedOption.tutorialId) {
                const tutorial = getTutorial(selectedOption.tutorialId);
                if (tutorial) {
                    showTutorial = true;
                    tutorialId = selectedOption.tutorialId;
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
                tutorialId,
                quickReplyContext,
            };
        }
    }

    // Handle escalation (negative sentiment)
    if (shouldEscalate) {
        message =
            "Je comprends votre préoccupation et je regrette ce désagrément.\n\nJe transmets immédiatement votre demande à un responsable d'exploitation qui vous contactera dans les plus brefs délais.\n\nSouhaitez-vous préciser d'autres éléments ?";
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

        if (guidedFlow.id === "tracking-flow") {
            quickReplyContext = "afterTrackingHelp";
            const trackTutorial = getTutorial("track-transport");
            if (trackTutorial) {
                showTutorial = true;
                tutorialId = "track-transport";
                tutorialContent = formatTutorialAsMessage(trackTutorial);
            }
        } else if (guidedFlow.id === "quote-details") {
            quickReplyContext = "afterQuoteInfo";
        } else if (guidedFlow.id === "problem") {
            quickReplyContext = "afterProblem";
        } else {
            quickReplyContext = "initial";
        }
    } else {
        // Default category-based response with guidance
        const categoryResponses: Record<
            QueryCategory,
            {
                message: string;
                context: string;
                options?: FlowOption[];
                showTutorial?: boolean;
                tutorialId?: string;
                tutorialContent?: string;
            }
        > = {
            quote: {
                message:
                    "Je vois que vous vous intéressez à nos prestations de transport.\n\nPour vous fournir un devis précis et sans engagement, quel type de matériel ou marchandise souhaitez-vous déplacer ?",
                context: "afterQuoteInfo",
                options: [
                    {
                        id: "materials",
                        label: "Matériaux de construction",
                        response:
                            "Parfait. Vous pouvez indiquer vos adresses pour obtenir une estimation tarifaire rapide.",
                        action: "quote_form",
                    },
                    {
                        id: "containers",
                        label: "Container (20 ou 40 pieds)",
                        response:
                            "Nos semi-remorques avec plateau ou bras de grue sont prévues pour le transport de containers.",
                        action: "quote_form",
                    },
                    {
                        id: "machinery",
                        label: "Machine industrielle ou engin",
                        response:
                            "Nos équipes organisent l'acheminement sécurisé avec plan de calage et arrimage professionnel.",
                        action: "quote_form",
                    },
                ],
            },
            transport: {
                message:
                    "Vous souhaitez suivre l'état de votre transport.\n\nPour localiser votre convoi et connaître le statut exact, vous pouvez renseigner votre référence de commande (format HBC-XXXXX) ou consulter le guide ci-dessous :",
                context: "afterTrackingHelp",
                showTutorial: true,
                tutorialId: "track-transport",
                tutorialContent: formatTutorialAsMessage(
                    TUTORIALS["track-transport"]
                ),
                options: [
                    {
                        id: "have-number",
                        label: "J'ai mon numéro de dossier (HBC-XXXXX)",
                        response:
                            "Indiquez votre numéro (format HBC-XXXXX) et notre équipe d'exploitation vérifiera instantanément le statut du convoi.",
                        tutorialId: "track-transport",
                    },
                    {
                        id: "no-number",
                        label: "Je n'ai pas mon numéro de dossier",
                        response:
                            "Votre référence figure dans l'email de confirmation envoyé lors de la réservation. Vous pouvez également nous préciser votre nom ou entreprise.",
                        action: "contact_human",
                        tutorialId: "track-transport",
                    },
                    {
                        id: "speak-dispatcher",
                        label: "Contacter le service exploitation",
                        response:
                            "Notre service d'exploitation logistique est joignable pour vous renseigner en direct sur la position du chauffeur et l'heure estimée d'arrivée.",
                        action: "contact_human",
                    },
                ],
            },
            billing: {
                message:
                    "Je vais vous aider avec votre question de facturation.\n\nDe quoi avez-vous besoin exactement ?",
                context: "initial",
            },
            technical: {
                message:
                    "Je suis là pour vous aider à résoudre ce problème technique.\n\nPouvez-vous me décrire ce qui se passe ? Plus vous me donnez de détails, mieux je pourrai vous assister.",
                context: "afterProblem",
            },
            general: {
                message:
                    "Je suis là pour vous aider.\n\nQue souhaitez-vous savoir sur nos services de transport spécialisé ?",
                context: "initial",
            },
        };

        const response = categoryResponses[category];
        message = response.message;
        quickReplyContext = response.context;

        if (response.options) {
            options = response.options;
            conversationState.currentOptions = response.options;
            conversationState.awaitingSelection = true;
            message += "\n\n" + formatOptionsMessage(response.options);
        }

        if (response.showTutorial && response.tutorialContent) {
            showTutorial = true;
            tutorialContent = response.tutorialContent;
            tutorialId = response.tutorialId;
        }
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
        tutorialId,
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
