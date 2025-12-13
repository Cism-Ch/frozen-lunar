import { QuickReply, QueryCategory } from "./types";

/**
 * Support Agent Configuration
 * Optimized for token efficiency and intuitive SaaS integration
 */
export const AGENT_CONFIG = {
    // Model settings (for Phase 2 Gemini integration)
    model: "gemini-1.5-flash", // Fast & cost-effective
    maxInputTokens: 500,       // Limit user input to control costs
    maxOutputTokens: 300,      // Concise responses
    temperature: 0.3,          // Focused, consistent responses

    // Input limits for UI
    maxInputChars: 500,        // Character limit for input field

    // Response timing
    typingDelay: 800,          // Simulate typing delay (ms)
    minTypingTime: 500,        // Minimum typing indicator time (ms)

    // Quick replies for common questions
    quickReplies: [
        {
            id: "quote",
            label: "📋 Demander un devis",
            text: "Je souhaite demander un devis pour un transport",
            category: "quote" as QueryCategory,
        },
        {
            id: "status",
            label: "📦 Suivi de transport",
            text: "Je veux suivre l'état de mon transport",
            category: "transport" as QueryCategory,
        },
        {
            id: "contact",
            label: "📞 Contacter un humain",
            text: "Je voudrais parler à un conseiller",
            category: "general" as QueryCategory,
        },
    ] as QuickReply[],

    // System prompt for Phase 2 (kept minimal for token efficiency)
    systemPrompt: `Tu es l'assistant HBC Logistique, expert en transport de matériaux lourds.
Règles:
- Réponses courtes et précises (max 2-3 phrases)
- Toujours en français
- Guide vers le formulaire de devis pour les demandes de prix
- Escalade vers un humain si client insatisfait ou demande complexe
Services: transport de matériaux, containers, charpentes, machines industrielles.`,

    // Welcome message
    welcomeMessage: {
        id: "welcome",
        role: "assistant" as const,
        content: "Bonjour ! 👋 Je suis l'assistant HBC Logistique. Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date(),
    },

    // Categories for routing
    categories: {
        technical: ["technique", "problème", "erreur", "bug", "fonctionnement"],
        billing: ["facture", "paiement", "prix", "coût", "tarif"],
        quote: ["devis", "estimation", "transport", "livraison"],
        transport: ["suivi", "commande", "statut", "où en est"],
        general: ["information", "question", "aide", "contact"],
    },
};

// Phase 2: Keywords for quick categorization (token-saving approach)
export const CATEGORY_KEYWORDS: Record<QueryCategory, string[]> = {
    technical: ["technique", "problème", "erreur", "bug", "fonctionne pas", "marche pas"],
    billing: ["facture", "paiement", "prix", "coût", "tarif", "montant", "euros"],
    quote: ["devis", "estimation", "combien", "gratuit", "demande"],
    transport: ["suivi", "commande", "colis", "livraison", "où", "statut", "expédition"],
    general: ["information", "question", "aide", "bonjour", "merci", "contact"],
};

// Sentiment keywords for quick analysis
export const SENTIMENT_INDICATORS = {
    positive: ["merci", "super", "excellent", "parfait", "génial", "content", "satisfait"],
    negative: ["nul", "mauvais", "horrible", "inacceptable", "furieux", "colère", "plainte", "arnaque", "scandaleux"],
    neutral: [], // Default if no strong indicators
};
