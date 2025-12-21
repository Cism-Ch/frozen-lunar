import { QuoteSupplementaryInfo } from "@/lib/quote-storage";

/**
 * Quote Creation Flow for Support Chat
 * Guides users through quote creation with category-specific questions
 */

export type QuoteFlowStep =
    | "start"
    | "itemType"
    | "pickup"
    | "dropoff"
    | "date"
    | "contact_name"
    | "contact_email"
    | "contact_phone"
    | "category_questions"
    | "notes"
    | "confirm"
    | "complete";

export type ItemCategory = "materials" | "container" | "machinery" | "structure" | "other";

export interface QuoteFlowData {
    itemType: string;
    itemCategory: ItemCategory;
    pickup: string;
    dropoff: string;
    transportDate: string;
    fullName: string;
    email: string;
    phone: string;
    userNotes?: string;
    supplementaryInfo: Partial<QuoteSupplementaryInfo>;
}

export interface QuoteFlowState {
    isActive: boolean;
    currentStep: QuoteFlowStep;
    currentQuestionIndex: number;
    data: Partial<QuoteFlowData>;
    categoryQuestions: CategoryQuestion[];
}

export interface CategoryQuestion {
    id: string;
    question: string;
    field: keyof QuoteSupplementaryInfo;
    type: "text" | "select" | "boolean";
    options?: { label: string; value: string }[];
}

// ============================================
// QUESTIONS PAR CATÉGORIE (5 questions chacune)
// ============================================

export const CATEGORY_QUESTIONS: Record<ItemCategory, CategoryQuestion[]> = {
    materials: [
        {
            id: "mat_type",
            question: "Quel type de matériaux transportez-vous ?",
            field: "materialType",
            type: "select",
            options: [
                { label: "🧱 Parpaings/Briques", value: "parpaings" },
                { label: "🏖️ Sable/Gravier", value: "agregats" },
                { label: "🪵 Bois", value: "bois" },
                { label: "🔩 Métal", value: "metal" },
                { label: "📦 Autre", value: "autre" },
            ],
        },
        {
            id: "mat_weight",
            question: "Quel est le poids approximatif ?",
            field: "weight",
            type: "select",
            options: [
                { label: "Moins de 1 tonne", value: "<1t" },
                { label: "1 à 5 tonnes", value: "1-5t" },
                { label: "5 à 15 tonnes", value: "5-15t" },
                { label: "Plus de 15 tonnes", value: ">15t" },
                { label: "Je ne sais pas", value: "unknown" },
            ],
        },
        {
            id: "mat_packaging",
            question: "Comment sont conditionnés les matériaux ?",
            field: "packaging",
            type: "select",
            options: [
                { label: "📦 Palettes", value: "palettes" },
                { label: "🎒 Big bags", value: "bigbags" },
                { label: "🔓 Vrac", value: "vrac" },
                { label: "📋 Autre", value: "autre" },
            ],
        },
        {
            id: "mat_hazardous",
            question: "S'agit-il de matières dangereuses ou spéciales ?",
            field: "hazardous",
            type: "boolean",
        },
        {
            id: "mat_access",
            question: "Y a-t-il des contraintes d'accès sur le site ?",
            field: "accessInfo",
            type: "select",
            options: [
                { label: "✅ Accès facile", value: "facile" },
                { label: "🚧 Accès restreint", value: "restreint" },
                { label: "🏗️ Nécessite grue", value: "grue" },
                { label: "🚜 Chariot élévateur sur place", value: "chariot" },
            ],
        },
    ],

    container: [
        {
            id: "cont_size",
            question: "Quelle taille de container ?",
            field: "containerSize",
            type: "select",
            options: [
                { label: "📦 20 pieds (6m)", value: "20ft" },
                { label: "📦 40 pieds (12m)", value: "40ft" },
                { label: "📦 40 pieds High Cube", value: "40hc" },
                { label: "❓ Autre taille", value: "autre" },
            ],
        },
        {
            id: "cont_type",
            question: "Quel type de container ?",
            field: "containerType",
            type: "select",
            options: [
                { label: "📦 Standard (Dry)", value: "dry" },
                { label: "❄️ Réfrigéré (Reefer)", value: "reefer" },
                { label: "🔓 Open Top", value: "opentop" },
                { label: "🚪 Flat Rack", value: "flatrack" },
            ],
        },
        {
            id: "cont_empty",
            question: "Le container est-il vide ou chargé ?",
            field: "isEmpty",
            type: "boolean",
        },
        {
            id: "cont_loading",
            question: "Type de chargement/déchargement ?",
            field: "loadingType",
            type: "select",
            options: [
                { label: "🏗️ Grue nécessaire", value: "grue" },
                { label: "🚜 Chariot élévateur", value: "chariot" },
                { label: "🚛 Side-loader", value: "sideloader" },
                { label: "❓ À définir", value: "unknown" },
            ],
        },
        {
            id: "cont_access",
            question: "Contraintes d'accès au site de livraison ?",
            field: "accessInfo",
            type: "select",
            options: [
                { label: "✅ Accès camion facile", value: "facile" },
                { label: "🚧 Rue étroite", value: "etroit" },
                { label: "⛔ Restrictions horaires", value: "horaires" },
                { label: "📍 Zone urbaine dense", value: "urbain" },
            ],
        },
    ],

    machinery: [
        {
            id: "mach_type",
            question: "Quel type de machine/engin ?",
            field: "machineType",
            type: "select",
            options: [
                { label: "🚜 Engin de chantier", value: "engin" },
                { label: "⚙️ Machine-outil", value: "machine_outil" },
                { label: "🏭 Équipement industriel", value: "industriel" },
                { label: "🔧 Autre équipement", value: "autre" },
            ],
        },
        {
            id: "mach_dimensions",
            question: "Dimensions approximatives (LxlxH) ?",
            field: "dimensions",
            type: "select",
            options: [
                { label: "Petit (<2m)", value: "petit" },
                { label: "Moyen (2-5m)", value: "moyen" },
                { label: "Grand (5-10m)", value: "grand" },
                { label: "Très grand (>10m)", value: "tres_grand" },
            ],
        },
        {
            id: "mach_weight",
            question: "Poids approximatif de la machine ?",
            field: "weight",
            type: "select",
            options: [
                { label: "Moins de 5 tonnes", value: "<5t" },
                { label: "5 à 20 tonnes", value: "5-20t" },
                { label: "20 à 50 tonnes", value: "20-50t" },
                { label: "Plus de 50 tonnes", value: ">50t" },
            ],
        },
        {
            id: "mach_crane",
            question: "Une grue est-elle nécessaire pour le chargement ?",
            field: "requiresCrane",
            type: "boolean",
        },
        {
            id: "mach_special",
            question: "Exigences spéciales pour le transport ?",
            field: "specialRequirements",
            type: "select",
            options: [
                { label: "✅ Aucune", value: "aucune" },
                { label: "🚨 Convoi exceptionnel", value: "convoi" },
                { label: "📋 Autorisation préfectorale", value: "autorisation" },
                { label: "🔒 Transport sécurisé", value: "securise" },
            ],
        },
    ],

    structure: [
        {
            id: "struct_type",
            question: "Quel type de structure/charpente ?",
            field: "structureType",
            type: "select",
            options: [
                { label: "🪵 Charpente bois", value: "bois" },
                { label: "🔩 Charpente métallique", value: "metal" },
                { label: "🏗️ Poutres/IPN", value: "poutres" },
                { label: "🏠 Structure préfabriquée", value: "prefab" },
            ],
        },
        {
            id: "struct_length",
            question: "Longueur maximale des éléments ?",
            field: "length",
            type: "select",
            options: [
                { label: "Moins de 6m", value: "<6m" },
                { label: "6 à 12m", value: "6-12m" },
                { label: "12 à 18m", value: "12-18m" },
                { label: "Plus de 18m", value: ">18m" },
            ],
        },
        {
            id: "struct_weight",
            question: "Poids total approximatif ?",
            field: "weight",
            type: "select",
            options: [
                { label: "Moins de 5 tonnes", value: "<5t" },
                { label: "5 à 15 tonnes", value: "5-15t" },
                { label: "15 à 30 tonnes", value: "15-30t" },
                { label: "Plus de 30 tonnes", value: ">30t" },
            ],
        },
        {
            id: "struct_crane",
            question: "Besoin d'une grue pour le déchargement ?",
            field: "requiresCrane",
            type: "boolean",
        },
        {
            id: "struct_access",
            question: "Conditions d'accès au chantier ?",
            field: "accessInfo",
            type: "select",
            options: [
                { label: "✅ Accès facile", value: "facile" },
                { label: "🚧 Chemin de terre", value: "terre" },
                { label: "🏔️ Zone difficile", value: "difficile" },
                { label: "🏙️ Centre-ville", value: "centre_ville" },
            ],
        },
    ],

    other: [
        {
            id: "other_desc",
            question: "Pouvez-vous décrire ce que vous transportez ?",
            field: "specialRequirements",
            type: "text",
        },
        {
            id: "other_weight",
            question: "Poids approximatif ?",
            field: "weight",
            type: "select",
            options: [
                { label: "Moins de 1 tonne", value: "<1t" },
                { label: "1 à 10 tonnes", value: "1-10t" },
                { label: "10 à 30 tonnes", value: "10-30t" },
                { label: "Plus de 30 tonnes", value: ">30t" },
            ],
        },
        {
            id: "other_dimensions",
            question: "Dimensions approximatives ?",
            field: "dimensions",
            type: "select",
            options: [
                { label: "Petit (<2m)", value: "petit" },
                { label: "Moyen (2-6m)", value: "moyen" },
                { label: "Grand (>6m)", value: "grand" },
            ],
        },
        {
            id: "other_urgency",
            question: "Niveau d'urgence ?",
            field: "urgency",
            type: "select",
            options: [
                { label: "📅 Standard (sous 1 semaine)", value: "standard" },
                { label: "⚡ Urgent (48-72h)", value: "urgent" },
                { label: "🚨 Très urgent (<24h)", value: "very_urgent" },
            ],
        },
        {
            id: "other_access",
            question: "Contraintes particulières ?",
            field: "accessInfo",
            type: "text",
        },
    ],
};

// ============================================
// ITEM TYPES MAPPING
// ============================================

export const ITEM_TYPE_CATEGORIES: Record<string, ItemCategory> = {
    "Matériaux de construction": "materials",
    "Container": "container",
    "Machine industrielle": "machinery",
    "Charpente/Structure": "structure",
    "Autre": "other",
};

export const ITEM_TYPE_OPTIONS = [
    { label: "🧱 Matériaux de construction", value: "Matériaux de construction", icon: "🧱" },
    { label: "📦 Container", value: "Container", icon: "📦" },
    { label: "⚙️ Machine industrielle", value: "Machine industrielle", icon: "⚙️" },
    { label: "🏗️ Charpente/Structure", value: "Charpente/Structure", icon: "🏗️" },
    { label: "📋 Autre", value: "Autre", icon: "📋" },
];

// ============================================
// FLOW STEPS DEFINITION (Aligned with QuoteWizard)
// ============================================

export const STEPS_ORDER: QuoteFlowStep[] = [
    "itemType",
    "pickup",
    "dropoff",
    "date",
    "contact_name",
    "contact_email",
    "contact_phone",
    "category_questions",
    "notes",
    "confirm"
];

// ============================================
// FLOW STATE MANAGEMENT
// ============================================

export function createInitialFlowState(): QuoteFlowState {
    return {
        isActive: false,
        currentStep: "start",
        currentQuestionIndex: 0,
        data: {},
        categoryQuestions: [],
    };
}

export function startQuoteFlow(): QuoteFlowState {
    return {
        isActive: true,
        currentStep: "itemType",
        currentQuestionIndex: 0,
        data: {
            supplementaryInfo: {},
        },
        categoryQuestions: [],
    };
}

export function getStepMessage(state: QuoteFlowState): string {
    switch (state.currentStep) {
        case "itemType":
            return "Parfait ! Commençons votre demande de devis. 📋\n\nQuel type de marchandise souhaitez-vous transporter ?";

        case "pickup":
            return "📍 Quelle est l'adresse de **chargement** (départ) ?";

        case "dropoff":
            return "📍 Quelle est l'adresse de **livraison** (arrivée) ?";

        case "date":
            return "📅 Quelle est votre **date de transport souhaitée** ?\n\n(Exemple: 25/12/2024 ou \"dans 2 semaines\")";

        case "contact_name":
            return "👤 Quel est votre **nom complet** ?";

        case "contact_email":
            return "📧 Quelle est votre **adresse email** ?";

        case "contact_phone":
            return "📱 Quel est votre **numéro de téléphone** ?";

        case "category_questions":
            const question = state.categoryQuestions[state.currentQuestionIndex];
            if (question) {
                // Determine if this is essentially part of the "notes" or "details" phase
                const current = state.currentQuestionIndex + 1;
                const total = state.categoryQuestions.length;
                return `📝 **Détails de votre chargement** (${current}/${total})\n\n${question.question}`;
            }
            return "";

        case "notes":
            return "📝 Avez-vous d'autres **précisions** ou **notes spéciales** à ajouter ?\n\n(Optionnel - répondez \"non\" pour passer)";

        case "confirm":
            return formatQuoteSummary(state.data);

        default:
            return "";
    }
}

export function formatQuoteSummary(data: Partial<QuoteFlowData>): string {
    const lines = [
        "📋 **Récapitulatif de votre demande**\n",
        `🚚 **Type:** ${data.itemType || "Non spécifié"}`,
        `📍 **Départ:** ${data.pickup || "Non spécifié"}`,
        `📍 **Arrivée:** ${data.dropoff || "Non spécifié"}`,
        `📅 **Date:** ${data.transportDate || "Non spécifié"}`,
        `👤 **Client:** ${data.fullName || "Non spécifié"}`,
        `📧 **Email:** ${data.email || "Non spécifié"}`,
        `📱 **Tél:** ${data.phone || "Non spécifié"}`,
    ];

    if (data.supplementaryInfo && Object.keys(data.supplementaryInfo).length > 0) {
        // Only show relevant info keys (exclude internal ones if any)
        const info = data.supplementaryInfo;
        const relevantKeys = Object.keys(info).filter(k => k !== 'category');
        if (relevantKeys.length > 0) {
            lines.push("\n**Détails techniques:**");
            if (info.weight) lines.push(`  • Poids: ${info.weight}`);
            if (info.dimensions) lines.push(`  • Dimensions: ${info.dimensions}`);
            if (info.accessInfo) lines.push(`  • Accès: ${info.accessInfo}`);
            if (info.specialRequirements) lines.push(`  • Autres: ${info.specialRequirements}`);
            if (info.materialType) lines.push(`  • Matériau: ${info.materialType}`);
            if (info.containerSize) lines.push(`  • Taille: ${info.containerSize}`);
            if (info.containerType) lines.push(`  • Type: ${info.containerType}`);
        }
    }

    if (data.userNotes) {
        lines.push(`\n📝 **Notes:** ${data.userNotes}`);
    }

    lines.push("\n✅ **Confirmez-vous ces informations ?**");

    return lines.join("\n");
}

export function processFlowAnswer(
    state: QuoteFlowState,
    answer: string
): { newState: QuoteFlowState; complete: boolean } {
    const newState = { ...state, data: { ...state.data } };

    switch (state.currentStep) {
        case "itemType":
            const category = ITEM_TYPE_CATEGORIES[answer] || "other";
            newState.data.itemType = answer;
            newState.data.itemCategory = category;
            newState.data.supplementaryInfo = { category };
            newState.categoryQuestions = CATEGORY_QUESTIONS[category];
            // Move directly to pickup, skip specific questions for now
            newState.currentStep = "pickup";
            break;

        case "pickup":
            newState.data.pickup = answer;
            newState.currentStep = "dropoff";
            break;

        case "dropoff":
            newState.data.dropoff = answer;
            newState.currentStep = "date";
            break;

        case "date":
            newState.data.transportDate = answer;
            newState.currentStep = "contact_name";
            break;

        case "contact_name":
            newState.data.fullName = answer;
            newState.currentStep = "contact_email";
            break;

        case "contact_email":
            newState.data.email = answer;
            newState.currentStep = "contact_phone";
            break;

        case "contact_phone":
            newState.data.phone = answer;
            // Now start the category specific questions
            newState.currentStep = "category_questions";
            newState.currentQuestionIndex = 0;
            break;

        case "category_questions":
            const currentQ = state.categoryQuestions[state.currentQuestionIndex];
            if (currentQ) {
                const supplementaryInfo = { ...newState.data.supplementaryInfo };

                if (currentQ.type === "boolean") {
                    (supplementaryInfo as any)[currentQ.field] =
                        answer.toLowerCase().includes("oui") || answer.toLowerCase() === "true";
                } else {
                    (supplementaryInfo as any)[currentQ.field] = answer;
                }

                newState.data.supplementaryInfo = supplementaryInfo;
            }

            if (state.currentQuestionIndex < state.categoryQuestions.length - 1) {
                newState.currentQuestionIndex = state.currentQuestionIndex + 1;
            } else {
                // After last specific question, go to generic notes
                newState.currentStep = "notes";
            }
            break;

        case "notes":
            if (answer.toLowerCase() !== "non" && answer.toLowerCase() !== "passer") {
                newState.data.userNotes = answer;
            }
            newState.currentStep = "confirm";
            break;

        case "confirm":
            if (answer.toLowerCase().includes("oui") || answer.toLowerCase().includes("confirm")) {
                newState.currentStep = "complete";
                newState.isActive = false;
                return { newState, complete: true };
            } else {
                // Reset to start for modifications
                newState.currentStep = "itemType";
                newState.currentQuestionIndex = 0;
            }
            break;
    }

    return { newState, complete: false };
}

export function getStepOptions(state: QuoteFlowState): { label: string; value: string }[] | null {
    switch (state.currentStep) {
        case "itemType":
            return ITEM_TYPE_OPTIONS;

        case "category_questions":
            const question = state.categoryQuestions[state.currentQuestionIndex];
            if (question?.type === "select" && question.options) {
                return question.options;
            }
            if (question?.type === "boolean") {
                return [
                    { label: "✅ Oui", value: "oui" },
                    { label: "❌ Non", value: "non" },
                ];
            }
            return null;

        case "notes":
            return [
                { label: "⏭️ Passer (pas de notes)", value: "non" },
            ];

        case "confirm":
            return [
                { label: "✅ Confirmer et envoyer", value: "oui" },
                { label: "✏️ Modifier", value: "modifier" },
            ];

        default:
            return null;
    }
}
