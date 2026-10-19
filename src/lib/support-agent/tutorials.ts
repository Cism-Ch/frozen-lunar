import { QuickReply, QueryCategory } from "./types";

/**
 * Tutoriels et guides pour le support client HBC Logistique
 * Contenus adaptés selon les besoins détectés
 */

export interface Tutorial {
    id: string;
    title: string;
    category: QueryCategory;
    steps: TutorialStep[];
    estimatedTime: string;
    relatedActions?: string[];
}

export interface TutorialStep {
    order: number;
    title: string;
    content: string;
    tip?: string;
    imageUrl?: string;
}

export interface GuidedFlow {
    id: string;
    trigger: string[]; // Keywords that trigger this flow
    initialMessage: string;
    options: FlowOption[];
}

export interface FlowOption {
    id: string;
    label: string;
    icon?: string;
    response: string;
    followUpOptions?: FlowOption[];
    tutorialId?: string;
    action?: "quote_form" | "contact_human" | "track_order" | "show_services";
}

// ============================================
// TUTORIELS PRÉ-ENREGISTRÉS
// ============================================

export const TUTORIALS: Record<string, Tutorial> = {
    "quote-request": {
        id: "quote-request",
        title: "Comment demander un devis",
        category: "quote",
        estimatedTime: "2 min",
        steps: [
            {
                order: 1,
                title: "Accéder au formulaire",
                content:
                    "Cliquez sur le bouton 'Demander un devis' dans le menu ou sur la page d'accueil.",
                tip: "Le bouton est orange et bien visible en haut de chaque page.",
            },
            {
                order: 2,
                title: "Type de marchandise",
                content:
                    "Sélectionnez le type de matériel à transporter : matériaux de construction, containers, charpentes, machines industrielles, etc.",
                tip: "Plus vous êtes précis, plus votre devis sera exact.",
            },
            {
                order: 3,
                title: "Adresses de départ et d'arrivée",
                content:
                    "Indiquez l'adresse de chargement et l'adresse de livraison. Précisez si des accès spéciaux sont nécessaires (grue, chariot élévateur).",
            },
            {
                order: 4,
                title: "Date souhaitée",
                content:
                    "Choisissez votre date de transport idéale. Plus vous anticipez, plus nous pourrons vous proposer des créneaux flexibles.",
                tip: "Prévoyez au moins 48h d'avance pour les transports standards.",
            },
            {
                order: 5,
                title: "Vos coordonnées",
                content:
                    "Remplissez vos informations de contact pour recevoir votre devis personnalisé par email.",
                tip: "Vous recevrez généralement une réponse sous 24h ouvrées.",
            },
        ],
        relatedActions: ["quote_form"],
    },

    "track-transport": {
        id: "track-transport",
        title: "Suivre mon transport",
        category: "transport",
        estimatedTime: "1 min",
        steps: [
            {
                order: 1,
                title: "Retrouver votre numéro de commande",
                content:
                    "Votre numéro de commande commence par 'HBC-' suivi de chiffres. Il figure sur votre confirmation par email.",
            },
            {
                order: 2,
                title: "Contacter notre équipe",
                content:
                    "Appelez notre service logistique au numéro indiqué sur votre confirmation ou envoyez un email avec votre numéro de commande.",
                tip: "Ayez votre numéro de commande sous la main avant d'appeler.",
            },
            {
                order: 3,
                title: "Informations de suivi",
                content:
                    "Notre équipe vous communiquera le statut actuel, l'heure estimée d'arrivée et les coordonnées du chauffeur si le transport est en cours.",
            },
        ],
        relatedActions: ["contact_human"],
    },

    "services-overview": {
        id: "services-overview",
        title: "Nos services de transport",
        category: "general",
        estimatedTime: "3 min",
        steps: [
            {
                order: 1,
                title: "Transport de matériaux",
                content:
                    "Nous transportons tous types de matériaux de construction : parpaings, briques, sable, gravier, plaques de plâtre, isolants, etc.",
            },
            {
                order: 2,
                title: "Transport de containers",
                content:
                    "Déplacement de containers maritimes, containers de stockage et conteneurs spéciaux pour chantiers.",
            },
            {
                order: 3,
                title: "Transport de charpentes",
                content:
                    "Charpentes bois ou métalliques, poutres, structures préfabriquées. Nous disposons de véhicules adaptés aux charges longues.",
            },
            {
                order: 4,
                title: "Machines industrielles",
                content:
                    "Engins de chantier, machines-outils, équipements lourds. Transport sécurisé avec arrimage professionnel.",
                tip: "Pour les charges exceptionnelles, nous organisons les autorisations préfectorales.",
            },
        ],
        relatedActions: ["show_services", "quote_form"],
    },

    "billing-help": {
        id: "billing-help",
        title: "Questions de facturation",
        category: "billing",
        estimatedTime: "2 min",
        steps: [
            {
                order: 1,
                title: "Retrouver votre facture",
                content:
                    "Vos factures vous sont envoyées par email après chaque prestation. Vérifiez aussi vos spams.",
            },
            {
                order: 2,
                title: "Modes de paiement",
                content:
                    "Nous acceptons les virements bancaires, les chèques et les paiements par carte. Les professionnels peuvent bénéficier d'un compte avec délai de paiement.",
            },
            {
                order: 3,
                title: "Contestation ou question",
                content:
                    "Pour toute question sur un montant facturé, contactez notre service comptabilité par email avec votre numéro de facture.",
                tip: "Notre équipe répond sous 48h ouvrées.",
            },
        ],
        relatedActions: ["contact_human"],
    },
};

// ============================================
// FLUX DE CONVERSATION GUIDÉS
// ============================================

export const GUIDED_FLOWS: GuidedFlow[] = [
    {
        id: "welcome",
        trigger: ["bonjour", "salut", "hello", "bonsoir", "aide", "help"],
        initialMessage:
            "Bonjour ! Je suis l'assistant HBC Logistique. Que souhaitez-vous faire ?",
        options: [
            {
                id: "want-quote",
                label: "Demander un devis",
                response:
                    "Parfait ! Je vais vous guider pour obtenir votre devis.",
                tutorialId: "quote-request",
                action: "quote_form",
            },
            {
                id: "track-order",
                label: "Suivre mon transport",
                response:
                    "Je comprends, vous souhaitez suivre l'état d'un transport ou d'une livraison.",
                tutorialId: "track-transport",
                followUpOptions: [
                    {
                        id: "have-number",
                        label: "J'ai mon numéro de dossier",
                        response:
                            "Parfait ! Envoyez-moi votre numéro de commande (format HBC-XXXXX) pour localiser votre convoi.",
                    },
                    {
                        id: "no-number",
                        label: "Je n'ai pas mon numéro",
                        response:
                            "Votre numéro de commande se trouve dans l'email de confirmation. Vous pouvez aussi contacter directement notre service d'exploitation.",
                        action: "contact_human",
                    },
                ],
            },
            {
                id: "discover-services",
                label: "Découvrir nos services",
                response:
                    "Excellente idée ! Laissez-moi vous présenter nos prestations spécialisées.",
                tutorialId: "services-overview",
                action: "show_services",
            },
            {
                id: "billing-question",
                label: "Question facturation",
                response:
                    "Je vais vous aider avec votre question de facturation.",
                tutorialId: "billing-help",
                followUpOptions: [
                    {
                        id: "find-invoice",
                        label: "Retrouver ma facture",
                        response:
                            "Vos factures sont envoyées par email après chaque prestation. Le numéro de facture commence par 'FAC-'.",
                    },
                    {
                        id: "payment-methods",
                        label: "Moyens de paiement",
                        response:
                            "Nous acceptons : virements bancaires, chèques et cartes bancaires. Les professionnels peuvent demander un compte avec délai de paiement.",
                    },
                    {
                        id: "dispute-invoice",
                        label: "Contester un montant",
                        response:
                            "Pour toute contestation, écrivez à notre service comptabilité avec votre numéro de facture. Réponse garantie sous 48h.",
                        action: "contact_human",
                    },
                ],
            },
            {
                id: "speak-human",
                label: "Parler à un conseiller",
                response:
                    "Bien sûr ! Je vous mets en relation avec notre équipe d'exploitation.",
                action: "contact_human",
            },
        ],
    },
    {
        id: "tracking-flow",
        trigger: [
            "suivre",
            "suivi",
            "suivre mon transport",
            "suivre l'état",
            "suivre l'etat",
            "état de mon transport",
            "etat de mon transport",
            "statut",
            "où est",
            "ou est",
            "où en est",
            "ou en est",
            "commande",
            "colis",
            "livraison",
            "expédition",
            "expedition",
            "acheminement",
        ],
        initialMessage:
            "Vous souhaitez suivre l'état de votre transport en cours. Voici la marche à suivre pour retrouver ou localiser votre convoi :",
        options: [
            {
                id: "have-number",
                label: "J'ai mon numéro de dossier (HBC-XXXXX)",
                response:
                    "Parfait ! Indiquez votre numéro de commande ou dossier (format HBC-XXXXX). Notre équipe d'exploitation localisera immédiatement votre chargement.",
                tutorialId: "track-transport",
            },
            {
                id: "no-number",
                label: "Je n'ai pas mon numéro de dossier",
                response:
                    "Pas d'inquiétude : votre référence figure sur l'email de confirmation. Vous pouvez aussi nous indiquer votre nom ou société pour retrouver votre expédition.",
                action: "contact_human",
                tutorialId: "track-transport",
            },
            {
                id: "speak-dispatcher",
                label: "Contacter le service exploitation",
                response:
                    "Notre service d'exploitation et de régulation des transports est joignable pour vous renseigner en direct sur la position du chauffeur et l'heure estimée d'arrivée.",
                action: "contact_human",
            },
        ],
    },
    {
        id: "quote-details",
        trigger: [
            "devis",
            "prix",
            "tarif",
            "combien",
            "coût",
            "cout",
            "estimation",
        ],
        initialMessage:
            "Pour votre devis, j'ai quelques questions pour vous orienter au mieux :",
        options: [
            {
                id: "materials",
                label: "Matériaux de construction",
                response:
                    "Transport de matériaux (parpaings, sable, gravier, etc.). Avez-vous une idée du poids ou volume approximatif ?",
                followUpOptions: [
                    {
                        id: "small-load",
                        label: "Petite charge (< 5 tonnes)",
                        response:
                            "Parfait ! Pour ce type de charge, nos tarifs débutent à partir de 150€ HT selon la distance. Je vous invite à remplir le formulaire pour un devis précis.",
                        action: "quote_form",
                    },
                    {
                        id: "medium-load",
                        label: "Charge moyenne (5-15 tonnes)",
                        response:
                            "Pour cette charge, nous mobilisons des semi-remorques adaptées. Remplissez le formulaire en ligne pour obtenir votre devis personnalisé.",
                        action: "quote_form",
                    },
                    {
                        id: "heavy-load",
                        label: "Charge lourde (> 15 tonnes)",
                        response:
                            "Pour les charges lourdes, nous proposons des solutions sur mesure avec véhicules spécialisés. Remplissez le formulaire pour une étude directe.",
                        action: "quote_form",
                    },
                ],
            },
            {
                id: "containers",
                label: "Container",
                response:
                    "Transport de container maritime ou de stockage. Quel format de container ?",
                followUpOptions: [
                    {
                        id: "container-20",
                        label: "Container 20 pieds",
                        response:
                            "Container 20 pieds - format standard. Transport possible sur toute la France. Remplissez le formulaire pour un chiffrage rapide.",
                        action: "quote_form",
                    },
                    {
                        id: "container-40",
                        label: "Container 40 pieds",
                        response:
                            "Container 40 pieds - nous vérifions l'accessibilité du site de livraison. Demandez votre devis en ligne.",
                        action: "quote_form",
                    },
                ],
            },
            {
                id: "machinery",
                label: "Machine industrielle",
                response:
                    "Transport de machines industrielles ou engins de chantier. Ces opérations font l'objet d'un plan d'arrimage dédié.",
                action: "quote_form",
            },
            {
                id: "other",
                label: "Autre chargement",
                response:
                    "Pas de problème ! Décrivez-moi ce que vous souhaitez transporter et nous trouverons le véhicule adapté.",
            },
        ],
    },
    {
        id: "problem",
        trigger: [
            "problème",
            "probleme",
            "souci",
            "erreur",
            "bug",
            "marche pas",
            "fonctionne pas",
        ],
        initialMessage:
            "Je suis désolé pour ce désagrément. De quoi s'agit-il ?",
        options: [
            {
                id: "website-issue",
                label: "Problème avec le site",
                response:
                    "Pouvez-vous préciser l'erreur rencontrée (formulaire, affichage, chargement) ?",
                followUpOptions: [
                    {
                        id: "form-error",
                        label: "Erreur dans le formulaire",
                        response:
                            "Essayez de rafraîchir la page (F5). Si le problème persiste, notre équipe technique intervient rapidement.",
                    },
                    {
                        id: "page-error",
                        label: "Page non affichée",
                        response:
                            "Essayez de vider le cache de votre navigateur. Si nécessaire, nos conseillers sont à votre disposition.",
                        action: "contact_human",
                    },
                ],
            },
            {
                id: "delivery-issue",
                label: "Problème de livraison",
                response:
                    "Je comprends votre préoccupation. Je transmets immédiatement votre dossier à l'équipe logistique qui vous contactera en priorité.",
                action: "contact_human",
            },
            {
                id: "billing-issue",
                label: "Problème de facturation",
                response:
                    "Nous allons vérifier cela avec la comptabilité. Un gestionnaire vous répondra sous 24h ouvrées.",
                action: "contact_human",
            },
        ],
    },
];

// ============================================
// RÉPONSES RAPIDES ENRICHIES
// ============================================

export const CONTEXTUAL_QUICK_REPLIES: Record<string, QuickReply[]> = {
    initial: [
        {
            id: "quote",
            label: "Demander un devis",
            text: "Je veux demander un devis",
            category: "quote",
        },
        {
            id: "track",
            label: "Suivre mon transport",
            text: "Je veux suivre mon transport",
            category: "transport",
        },
        {
            id: "services",
            label: "Voir les services",
            text: "Quels sont vos services ?",
            category: "general",
        },
        {
            id: "human",
            label: "Parler à un conseiller",
            text: "Je veux parler à un conseiller",
            category: "general",
        },
    ],
    afterQuoteInfo: [
        {
            id: "start-quote",
            label: "Remplir le formulaire",
            text: "Je veux remplir le formulaire de devis",
            category: "quote",
        },
        {
            id: "more-info",
            label: "Plus d'informations",
            text: "J'ai d'autres questions avant",
            category: "general",
        },
        {
            id: "call-back",
            label: "Être rappelé",
            text: "Je préfère être rappelé",
            category: "general",
        },
    ],
    afterTrackingHelp: [
        {
            id: "enter-number",
            label: "Renseigner mon numéro",
            text: "Mon numéro de commande est",
            category: "transport",
        },
        {
            id: "no-email",
            label: "Email non reçu",
            text: "Je n'ai pas reçu l'email de confirmation",
            category: "transport",
        },
        {
            id: "urgent",
            label: "Demande urgente",
            text: "C'est urgent, j'ai besoin d'une assistance immédiate",
            category: "transport",
        },
    ],
    afterProblem: [
        {
            id: "resolved",
            label: "C'est résolu",
            text: "Merci, c'est résolu !",
            category: "general",
        },
        {
            id: "still-issue",
            label: "Toujours bloqué",
            text: "Non, j'ai toujours le problème",
            category: "technical",
        },
        {
            id: "callback",
            label: "Demander un rappel",
            text: "Je souhaite qu'on me rappelle",
            category: "general",
        },
    ],
    satisfaction: [
        {
            id: "satisfied",
            label: "Satisfait",
            text: "Oui, merci pour votre aide !",
            category: "general",
        },
        {
            id: "more-help",
            label: "Autre question",
            text: "J'ai une autre question",
            category: "general",
        },
        {
            id: "feedback",
            label: "Donner mon avis",
            text: "Je veux donner mon avis",
            category: "general",
        },
    ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Find the appropriate guided flow based on user message
 */
export function findGuidedFlow(message: string): GuidedFlow | null {
    const lowerMessage = message.toLowerCase();

    for (const flow of GUIDED_FLOWS) {
        if (flow.trigger.some((trigger) => lowerMessage.includes(trigger))) {
            return flow;
        }
    }

    return null;
}

/**
 * Get tutorial by ID
 */
export function getTutorial(tutorialId: string): Tutorial | null {
    return TUTORIALS[tutorialId] || null;
}

/**
 * Format tutorial as chat message
 */
export function formatTutorialAsMessage(tutorial: Tutorial): string {
    let message = `📚 **${tutorial.title}** (${tutorial.estimatedTime})\n\n`;

    tutorial.steps.forEach((step, index) => {
        message += `**${index + 1}. ${step.title}**\n`;
        message += `${step.content}\n`;
        if (step.tip) {
            message += `💡 *${step.tip}*\n`;
        }
        message += "\n";
    });

    return message.trim();
}

/**
 * Get contextual quick replies based on conversation state
 */
export function getContextualQuickReplies(context: string): QuickReply[] {
    return (
        CONTEXTUAL_QUICK_REPLIES[context] || CONTEXTUAL_QUICK_REPLIES.initial
    );
}
