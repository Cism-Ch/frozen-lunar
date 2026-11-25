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

export type ItemCategory =
    "materials" | "container" | "machinery" | "structure" | "other";

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
                { label: "Parpaings / Briques", value: "parpaings" },
                { label: "Sable / Gravier", value: "agregats" },
                { label: "Bois de construction", value: "bois" },
                { label: "Métal / Aciers", value: "metal" },
                { label: "Autre matériau", value: "autre" },
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
                { label: "Palettes", value: "palettes" },
                { label: "Big bags", value: "bigbags" },
                { label: "Vrac", value: "vrac" },
                { label: "Autre conditionnement", value: "autre" },
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
                { label: "Accès facile", value: "facile" },
                { label: "Accès restreint", value: "restreint" },
                { label: "Nécessite une grue", value: "grue" },
                { label: "Chariot élévateur disponible", value: "chariot" },
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
                { label: "20 pieds (6m)", value: "20ft" },
                { label: "40 pieds (12m)", value: "40ft" },
                { label: "40 pieds High Cube", value: "40hc" },
                { label: "Autre taille", value: "autre" },
            ],
        },
        {
            id: "cont_type",
            question: "Quel type de container ?",
            field: "containerType",
            type: "select",
            options: [
                { label: "Standard (Dry)", value: "dry" },
                { label: "Réfrigéré (Reefer)", value: "reefer" },
                { label: "Open Top", value: "opentop" },
                { label: "Flat Rack", value: "flatrack" },
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
                { label: "Grue nécessaire", value: "grue" },
                { label: "Chariot élévateur", value: "chariot" },
                { label: "Side-loader", value: "sideloader" },
                { label: "À définir", value: "unknown" },
            ],
        },
        {
            id: "cont_access",
            question: "Contraintes d'accès au site de livraison ?",
            field: "accessInfo",
            type: "select",
            options: [
                { label: "Accès camion standard", value: "facile" },
                { label: "Rue étroite", value: "etroit" },
                { label: "Restrictions horaires", value: "horaires" },
                { label: "Zone urbaine dense", value: "urbain" },
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
                { label: "Engin de chantier", value: "engin" },
                { label: "Machine-outil", value: "machine_outil" },
                { label: "Équipement industriel", value: "industriel" },
                { label: "Autre équipement", value: "autre" },
            ],
        },
        {
            id: "mach_dimensions",
            question: "Dimensions approximatives (LxlxH) ?",
            field: "dimensions",
            type: "select",
            options: [
                { label: "Petit (< 2m)", value: "petit" },
                { label: "Moyen (2 à 5m)", value: "moyen" },
                { label: "Grand (5 à 10m)", value: "grand" },
                { label: "Très grand (> 10m)", value: "tres_grand" },
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
                { label: "Aucune contrainte spécifique", value: "aucune" },
                { label: "Convoi exceptionnel", value: "convoi" },
                {
                    label: "Autorisation préfectorale",
                    value: "autorisation",
                },
                { label: "Transport sécurisé", value: "securise" },
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
                { label: "Charpente bois", value: "bois" },
                { label: "Charpente métallique", value: "metal" },
                { label: "Poutres / IPN", value: "poutres" },
                { label: "Structure préfabriquée", value: "prefab" },
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
                { label: "Accès facile", value: "facile" },
                { label: "Chemin de terre", value: "terre" },
                { label: "Zone difficile d'accès", value: "difficile" },
                { label: "Centre-ville", value: "centre_ville" },
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
                { label: "Petit (< 2m)", value: "petit" },
                { label: "Moyen (2 à 6m)", value: "moyen" },
                { label: "Grand (> 6m)", value: "grand" },
            ],
        },
        {
            id: "other_urgency",
            question: "Niveau d'urgence ?",
            field: "urgency",
            type: "select",
            options: [
                { label: "Standard (sous 1 semaine)", value: "standard" },
                { label: "Urgent (48-72h)", value: "urgent" },
                { label: "Très urgent (< 24h)", value: "very_urgent" },
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
    Container: "container",
    "Machine industrielle": "machinery",
    "Charpente/Structure": "structure",
    Autre: "other",
};

export const ITEM_TYPE_OPTIONS = [
    {
        label: "Matériaux de construction",
        value: "Matériaux de construction",
    },
    { label: "Container", value: "Container" },
    {
        label: "Machine industrielle",
        value: "Machine industrielle",
    },
    {
        label: "Charpente / Structure",
        value: "Charpente/Structure",
    },
    { label: "Autre chargement", value: "Autre" },
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
    "confirm",
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
            return "Commençons votre demande de devis.\n\nQuel type de marchandise souhaitez-vous transporter ?";

        case "pickup":
            return "Quelle est l'adresse ou la ville de **chargement** (départ) ?";

        case "dropoff":
            return "Quelle est l'adresse ou la ville de **livraison** (arrivée) ?";

        case "date":
            return 'Quelle est votre **date de transport souhaitée** ?\n\n(Exemple: 25/12/2026 ou "dans 2 semaines")';

        case "contact_name":
            return "Quel est votre **nom complet** (ou nom d'entreprise) ?";

        case "contact_email":
            return "Quelle est votre **adresse email** de contact ?";

        case "contact_phone":
            return "Quel est votre **numéro de téléphone** pour le suivi ?";

        case "category_questions":
            const question =
                state.categoryQuestions[state.currentQuestionIndex];
            if (question) {
                const current = state.currentQuestionIndex + 1;
                const total = state.categoryQuestions.length;
                return `**Détails de votre chargement** (${current}/${total})\n\n${question.question}`;
            }
            return "";

        case "notes":
            return 'Avez-vous d\'autres **précisions** ou contraintes particulières à ajouter ?\n\n(Optionnel - répondez "non" ou cliquez sur Passer)';

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

    if (
        data.supplementaryInfo &&
        Object.keys(data.supplementaryInfo).length > 0
    ) {
        // Only show relevant info keys (exclude internal ones if any)
        const info = data.supplementaryInfo;
        const relevantKeys = Object.keys(info).filter((k) => k !== "category");
        if (relevantKeys.length > 0) {
            lines.push("\n**Détails techniques:**");
            if (info.weight) lines.push(`  • Poids: ${info.weight}`);
            if (info.dimensions)
                lines.push(`  • Dimensions: ${info.dimensions}`);
            if (info.accessInfo) lines.push(`  • Accès: ${info.accessInfo}`);
            if (info.specialRequirements)
                lines.push(`  • Autres: ${info.specialRequirements}`);
            if (info.materialType)
                lines.push(`  • Matériau: ${info.materialType}`);
            if (info.containerSize)
                lines.push(`  • Taille: ${info.containerSize}`);
            if (info.containerType)
                lines.push(`  • Type: ${info.containerType}`);
        }
    }

    if (data.userNotes) {
        lines.push(`\n📝 **Notes:** ${data.userNotes}`);
    }

    lines.push("\n✅ **Confirmez-vous ces informations ?**");

    return lines.join("\n");
}

/**
 * Normalise une date saisie en langage naturel / format FR (`15/12/2026`, `demain`, `2026-12-15`)
 * en chaîne ISO 8601 valide (heure par défaut 08:00 GMT+0) pour `createQuoteAction`.
 */
export function parseFlowDateToIso(raw: string): string | null {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return null;

    const now = new Date();
    if (trimmed.includes("demain")) {
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() + 1);
        d.setUTCHours(8, 0, 0, 0);
        return d.toISOString();
    }
    if (trimmed.includes("aujourd")) {
        const d = new Date(now);
        d.setUTCHours(10, 0, 0, 0);
        return d.toISOString();
    }
    const weeksMatch = trimmed.match(/(\d+)\s*semaine/);
    if (weeksMatch) {
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() + parseInt(weeksMatch[1], 10) * 7);
        d.setUTCHours(8, 0, 0, 0);
        return d.toISOString();
    }
    const daysMatch = trimmed.match(/(\d+)\s*jour/);
    if (daysMatch) {
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() + parseInt(daysMatch[1], 10));
        d.setUTCHours(8, 0, 0, 0);
        return d.toISOString();
    }

    // Format FR JJ/MM/AAAA ou JJ-MM-AAAA
    const frMatch = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
    if (frMatch) {
        const day = parseInt(frMatch[1], 10);
        const month = parseInt(frMatch[2], 10);
        const rawYear = parseInt(frMatch[3], 10);
        const year = rawYear < 100 ? 2000 + rawYear : rawYear;
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const d = new Date(Date.UTC(year, month - 1, day, 8, 0, 0));
            if (!Number.isNaN(d.getTime())) return d.toISOString();
        }
    }

    const parsed = new Date(raw.trim());
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
    }
    return null;
}

export function processFlowAnswer(
    state: QuoteFlowState,
    answer: string
): {
    newState: QuoteFlowState;
    complete: boolean;
    cancelled?: boolean;
    error?: string;
} {
    const trimmedAnswer = answer.trim();
    const lowerAnswer = trimmedAnswer.toLowerCase();

    // Échappatoire propre : permet à l'utilisateur d'annuler ou quitter le parcours à tout moment
    if (
        lowerAnswer === "annuler" ||
        lowerAnswer === "stop" ||
        lowerAnswer === "quitter" ||
        lowerAnswer === "abandonner"
    ) {
        return {
            newState: createInitialFlowState(),
            complete: false,
            cancelled: true,
        };
    }

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
            if (trimmedAnswer.length < 5) {
                return {
                    newState: state,
                    complete: false,
                    error: "Merci de préciser une adresse ou ville de départ d'au moins 5 caractères (ex: Zone Industrielle Yopougon, Abidjan).",
                };
            }
            newState.data.pickup = trimmedAnswer;
            newState.currentStep = "dropoff";
            break;

        case "dropoff":
            if (trimmedAnswer.length < 5) {
                return {
                    newState: state,
                    complete: false,
                    error: "Merci de préciser une adresse ou ville de livraison d'au moins 5 caractères (ex: Port de San-Pédro).",
                };
            }
            newState.data.dropoff = trimmedAnswer;
            newState.currentStep = "date";
            break;

        case "date": {
            const isoDate = parseFlowDateToIso(trimmedAnswer);
            if (!isoDate) {
                return {
                    newState: state,
                    complete: false,
                    error: 'Date non reconnue. Indiquez par exemple "15/12/2026", "demain" ou "dans 2 semaines".',
                };
            }
            newState.data.transportDate = isoDate;
            newState.currentStep = "contact_name";
            break;
        }

        case "contact_name":
            if (trimmedAnswer.length < 2) {
                return {
                    newState: state,
                    complete: false,
                    error: "Veuillez saisir votre nom complet ou le nom de votre entreprise.",
                };
            }
            newState.data.fullName = trimmedAnswer;
            newState.currentStep = "contact_email";
            break;

        case "contact_email": {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedAnswer)) {
                return {
                    newState: state,
                    complete: false,
                    error: "Veuillez saisir une adresse email valide (ex: nom@entreprise.ci).",
                };
            }
            newState.data.email = trimmedAnswer;
            newState.currentStep = "contact_phone";
            break;
        }

        case "contact_phone": {
            const digitsCount = trimmedAnswer.replace(/\D/g, "").length;
            if (digitsCount < 10) {
                return {
                    newState: state,
                    complete: false,
                    error: "Veuillez indiquer un numéro de téléphone valide (au moins 10 chiffres, ex: +225 07 00 00 00 00).",
                };
            }
            newState.data.phone = trimmedAnswer;
            // Now start the category specific questions
            newState.currentStep = "category_questions";
            newState.currentQuestionIndex = 0;
            break;
        }

        case "category_questions":
            const currentQ =
                state.categoryQuestions[state.currentQuestionIndex];
            if (currentQ) {
                const supplementaryInfo = {
                    ...newState.data.supplementaryInfo,
                };

                if (currentQ.type === "boolean") {
                    (supplementaryInfo as Record<string, unknown>)[
                        currentQ.field
                    ] =
                        answer.toLowerCase().includes("oui") ||
                        answer.toLowerCase() === "true";
                } else {
                    (supplementaryInfo as Record<string, unknown>)[
                        currentQ.field
                    ] = answer;
                }

                newState.data.supplementaryInfo = supplementaryInfo;
            }

            if (
                state.currentQuestionIndex <
                state.categoryQuestions.length - 1
            ) {
                newState.currentQuestionIndex = state.currentQuestionIndex + 1;
            } else {
                // After last specific question, go to generic notes
                newState.currentStep = "notes";
            }
            break;

        case "notes":
            if (
                answer.toLowerCase() !== "non" &&
                answer.toLowerCase() !== "passer"
            ) {
                newState.data.userNotes = answer;
            }
            newState.currentStep = "confirm";
            break;

        case "confirm":
            if (
                answer.toLowerCase().includes("oui") ||
                answer.toLowerCase().includes("confirm")
            ) {
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

export function getStepOptions(
    state: QuoteFlowState
): { label: string; value: string }[] | null {
    switch (state.currentStep) {
        case "itemType":
            return ITEM_TYPE_OPTIONS;

        case "category_questions":
            const question =
                state.categoryQuestions[state.currentQuestionIndex];
            if (question?.type === "select" && question.options) {
                return question.options;
            }
            if (question?.type === "boolean") {
                return [
                    { label: "Oui", value: "oui" },
                    { label: "Non", value: "non" },
                ];
            }
            return null;

        case "notes":
            return [{ label: "Passer (aucune note)", value: "non" }];

        case "confirm":
            return [
                { label: "Confirmer et envoyer", value: "oui" },
                { label: "Modifier", value: "modifier" },
            ];

        default:
            return null;
    }
}
