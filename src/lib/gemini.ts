import { GoogleGenerativeAI } from "@google/generative-ai";
import { QueryCategory, Sentiment } from "./support-agent/types";
import { logger } from "@/lib/logger";
import {
    callOpenRouterChat,
    extractJsonFromAiText,
    isOpenRouterAvailable,
} from "@/lib/openrouter";

/**
 * Modèle Google Gemini par défaut (configurable via GEMINI_MODEL).
 */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Retourne le nom du modèle Gemini configuré (défaut : gemini-2.5-flash).
 */
export function getGeminiModel(): string {
    const configured = process.env.GEMINI_MODEL?.trim();
    return configured && configured.length > 0
        ? configured
        : DEFAULT_GEMINI_MODEL;
}

/**
 * Récupère et valide la clé API Gemini depuis les variables d'environnement.
 * Priorise GEMINI_API_KEY (secret serveur), puis NEXT_PUBLIC_GEMINI_API_KEY (compatibilité).
 * Détecte les placeholders ou les valeurs factices pour basculer automatiquement en mode résilient.
 */
export function getGeminiApiKey(): string | null {
    const key =
        process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        "";
    const trimmed = key.trim();

    // Détection des clés factices ou non initialisées
    if (
        !trimmed ||
        trimmed.toLowerCase().includes("your_") ||
        trimmed.toLowerCase().includes("your-") ||
        trimmed.toLowerCase().includes("placeholder") ||
        trimmed.toLowerCase() === "mock" ||
        trimmed.length < 15
    ) {
        return null;
    }
    return trimmed;
}

/**
 * Vérifie si une clé API Gemini opérationnelle est détectée.
 */
export function isGeminiAvailable(): boolean {
    return getGeminiApiKey() !== null;
}

let cachedClient: GoogleGenerativeAI | null = null;
let lastKeyUsed: string | null = null;

/**
 * Instance paresseuse (lazy singleton) du client Google Generative AI.
 */
function getGeminiClient(): GoogleGenerativeAI | null {
    const key = getGeminiApiKey();
    if (!key) return null;

    if (cachedClient && lastKeyUsed === key) {
        return cachedClient;
    }

    try {
        cachedClient = new GoogleGenerativeAI(key);
        lastKeyUsed = key;
        return cachedClient;
    } catch (error: unknown) {
        logger.warn("Échec d'initialisation du client GoogleGenerativeAI", {
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}

/**
 * Wrapper de timeout pour empêcher les requêtes de bloquer l'UI indéfiniment.
 */
async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs = 6000
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`Délai d'attente IA dépassé (${timeoutMs}ms)`));
        }, timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

export interface EstimationResult {
    price: string;
    distance: string;
    duration: string;
    confidence: string;
    reasoning: string;
    source?: "gemini" | "openrouter" | "heuristic";
}

interface FrenchCityCoord {
    name: string;
    aliases: string[];
    lat: number;
    lon: number;
}

// Référentiel des principaux nœuds logistiques français pour le calcul de distance heuristique
const NOTABLE_CITIES: FrenchCityCoord[] = [
    {
        name: "Paris",
        aliases: [
            "paris",
            "idf",
            "ile-de-france",
            "75",
            "92",
            "93",
            "94",
            "91",
            "77",
            "78",
            "95",
        ],
        lat: 48.8566,
        lon: 2.3522,
    },
    {
        name: "Lyon",
        aliases: ["lyon", "rhone", "rhône", "69"],
        lat: 45.764,
        lon: 4.8357,
    },
    {
        name: "Marseille",
        aliases: ["marseille", "bouches-du-rhone", "paca", "13"],
        lat: 43.2965,
        lon: 5.3698,
    },
    {
        name: "Toulouse",
        aliases: ["toulouse", "haute-garonne", "31"],
        lat: 43.6047,
        lon: 1.4442,
    },
    {
        name: "Nice",
        aliases: ["nice", "alpes-maritimes", "06"],
        lat: 43.7102,
        lon: 7.262,
    },
    {
        name: "Nantes",
        aliases: ["nantes", "loire-atlantique", "44"],
        lat: 47.2184,
        lon: -1.5536,
    },
    {
        name: "Strasbourg",
        aliases: ["strasbourg", "bas-rhin", "alsace", "67"],
        lat: 48.5734,
        lon: 7.7521,
    },
    {
        name: "Montpellier",
        aliases: ["montpellier", "herault", "hérault", "34"],
        lat: 43.6108,
        lon: 3.8767,
    },
    {
        name: "Bordeaux",
        aliases: ["bordeaux", "gironde", "33"],
        lat: 44.8378,
        lon: -0.5792,
    },
    {
        name: "Lille",
        aliases: ["lille", "nord", "59"],
        lat: 50.6292,
        lon: 3.0573,
    },
    {
        name: "Rennes",
        aliases: ["rennes", "ille-et-vilaine", "bretagne", "35"],
        lat: 48.1173,
        lon: -1.6778,
    },
    {
        name: "Reims",
        aliases: ["reims", "marne", "51"],
        lat: 49.2583,
        lon: 4.0317,
    },
    {
        name: "Le Havre",
        aliases: ["le havre", "seine-maritime", "normandie", "76"],
        lat: 49.4944,
        lon: 0.1079,
    },
    {
        name: "Saint-Étienne",
        aliases: ["saint-etienne", "saint-étienne", "loire", "42"],
        lat: 45.4397,
        lon: 4.3872,
    },
    {
        name: "Toulon",
        aliases: ["toulon", "var", "83"],
        lat: 43.1242,
        lon: 5.928,
    },
    {
        name: "Grenoble",
        aliases: ["grenoble", "isere", "isère", "38"],
        lat: 45.1885,
        lon: 5.7245,
    },
    {
        name: "Dijon",
        aliases: ["dijon", "cote-d-or", "côte-d-or", "21"],
        lat: 47.322,
        lon: 5.0415,
    },
    {
        name: "Angers",
        aliases: ["angers", "maine-et-loire", "49"],
        lat: 47.4784,
        lon: -0.5632,
    },
    {
        name: "Clermont-Ferrand",
        aliases: ["clermont", "clermont-ferrand", "puy-de-dome", "63"],
        lat: 45.7772,
        lon: 3.087,
    },
];

function findCityCoord(text: string): FrenchCityCoord | null {
    const lower = text.toLowerCase();
    for (const city of NOTABLE_CITIES) {
        if (city.aliases.some((alias) => lower.includes(alias))) {
            return city;
        }
    }
    return null;
}

function calculateHaversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Facteur d'itinéraire routier (~1.25x la distance à vol d'oiseau)
    return Math.round(R * c * 1.25);
}

/**
 * Tier 2 : Moteur de calcul heuristique et déterministe de transport
 * Utilisé si Gemini est absent ou inaccessible pour garantir la continuité de service.
 */
export function calculateHeuristicEstimate(
    pickup: string,
    dropoff: string,
    type: string
): EstimationResult {
    const cityA = findCityCoord(pickup);
    const cityB = findCityCoord(dropoff);
    let distanceKm = 320; // Distance moyenne par défaut

    if (cityA && cityB) {
        if (cityA.name === cityB.name) {
            distanceKm = 45; // Déplacement intra-urbain ou périphérique
        } else {
            distanceKm = Math.max(
                50,
                calculateHaversineKm(cityA.lat, cityA.lon, cityB.lat, cityB.lon)
            );
        }
    } else {
        // Variation déterministe basée sur les noms pour éviter une valeur statique uniforme
        const hash = Math.abs(
            (pickup + dropoff)
                .split("")
                .reduce((acc, c) => acc + c.charCodeAt(0), 0)
        );
        distanceKm = 180 + (hash % 340); // 180 à 520 km
    }

    const lowerType = type.toLowerCase();
    let baseFee = 160;
    let ratePerKm = 2.1;
    let vehicleLabel = "Semi-remorque standard";

    if (lowerType.includes("grue") || lowerType.includes("manutention")) {
        baseFee = 280;
        ratePerKm = 2.8;
        vehicleLabel = "Camion avec bras de grue";
    } else if (
        lowerType.includes("convoi") ||
        lowerType.includes("lourd") ||
        lowerType.includes("porte-char")
    ) {
        baseFee = 420;
        ratePerKm = 3.8;
        vehicleLabel = "Convoi exceptionnel / Porte-char";
    } else if (
        lowerType.includes("container") ||
        lowerType.includes("conteneur")
    ) {
        baseFee = 220;
        ratePerKm = 2.4;
        vehicleLabel = "Porte-conteneur";
    } else if (lowerType.includes("benne") || lowerType.includes("vrac")) {
        baseFee = 140;
        ratePerKm = 1.9;
        vehicleLabel = "Camion benne TP";
    } else if (
        lowerType.includes("plateau") ||
        lowerType.includes("charpente")
    ) {
        baseFee = 190;
        ratePerKm = 2.2;
        vehicleLabel = "Plateau bâché / extensible";
    }

    const calculatedTotal = baseFee + distanceKm * ratePerKm;
    const minPrice = Math.round((calculatedTotal * 0.92) / 10) * 10;
    const maxPrice = Math.round((calculatedTotal * 1.08) / 10) * 10;

    const drivingHours = distanceKm / 70;
    const totalHours = Math.floor(drivingHours + 1); // 1h forfait chargement/déchargement
    const minutes = Math.round((drivingHours % 1) * 60);

    return {
        price: `${minPrice} - ${maxPrice} € HT`,
        distance: `Approx. ${distanceKm} km`,
        duration: `Approx. ${totalHours}h${minutes.toString().padStart(2, "0")}`,
        confidence: "Moyenne (Moteur heuristique de secours)",
        reasoning: `Estimation calculée par l'algorithme résilient : barème ${vehicleLabel} (${baseFee}€ forfait fixe + ${ratePerKm.toFixed(2)}€/km) pour un trajet routier estimé de ${distanceKm} km.`,
        source: "heuristic",
    };
}

/**
 * Modèles d'emails d'entreprise de secours garantissant 100% de fiabilité.
 */
export function generateFallbackEmail(
    type: "validation" | "refusal" | "question",
    clientName: string,
    quoteId: string
): { subject: string; body: string } {
    const cleanClient = clientName.trim() || "Client";
    const cleanId = quoteId.trim() || "N/A";

    const templates = {
        validation: {
            subject: `Validation de votre devis de transport N°${cleanId} — HBC Logistique`,
            body: `Bonjour ${cleanClient},\n\nNous avons le plaisir de vous informer que votre devis N°${cleanId} a été examiné et validé par notre équipe d'exploitation logistique.\n\nNos équipes préparent actuellement les modalités d'affectation du véhicule et de prise en charge de votre fret. Un chargé d'affaires va vous contacter sous 24h ouvrées pour convenir des créneaux précis de chargement.\n\nNous vous remercions pour votre confiance.\n\nBien cordialement,\nL'équipe HBC Service Cash Logistique Immobilière\n"Votre sécurité, Notre priorité"`,
        },
        refusal: {
            subject: `Concernant votre demande de transport N°${cleanId} — HBC Logistique`,
            body: `Bonjour ${cleanClient},\n\nNous faisons suite à votre demande de devis N°${cleanId} déposée auprès de nos services.\n\nAprès étude technique de faisabilité et vérification de la disponibilité de nos équipements spécialisés pour la date requise, nous sommes au regret de vous informer que nous ne pouvons répondre favorablement à cette demande spécifique pour le moment.\n\nNos conseillers restent disponibles par téléphone ou email pour étudier d'autres dates ou configurations de transport adaptées à vos besoins.\n\nBien cordialement,\nLe service d'exploitation HBC Logistique`,
        },
        question: {
            subject: `Complément d'information pour votre devis N°${cleanId} — HBC Logistique`,
            body: `Bonjour ${cleanClient},\n\nNous traitons actuellement l'étude de votre devis N°${cleanId} avec la plus grande attention.\n\nAfin d'ajuster précisément notre tarification et les moyens matériels nécessaires (accès chantier, manutention, contraintes de tonnage), pourriez-vous nous préciser les points suivants :\n- [PRÉCISEZ VOS QUESTIONS : ex. contraintes d'accès pour semi-remorque, présence d'un engin de déchargement sur site...]\n\nVous pouvez nous répondre directement à cet email ou nous contacter par téléphone.\n\nDans l'attente de votre retour,\n\nBien cordialement,\nL'équipe HBC Logistique`,
        },
    };

    return templates[type];
}

/**
 * Service Gemini avec résilience multi-niveaux (Cloud AI -> Heuristique Déterministe).
 */
export const geminiService = {
    /**
     * Estime le coût, la distance et la durée d'un transport.
     * Chaîne de résilience : Google AI (Gemini 2.5 Flash) -> OpenRouter -> Moteur heuristique local.
     */
    async estimateTransport(
        pickup: string,
        dropoff: string,
        type: string
    ): Promise<EstimationResult> {
        const prompt = `
                Agis comme un expert en logistique et transport routier pour l'entreprise HBC Logistique.
                Estime le coût, la distance et la durée pour un transport avec les détails suivants :
                - Départ : ${pickup}
                - Arrivée : ${dropoff}
                - Véhicule / Matériel : ${type}
                
                Réponds UNIQUEMENT au format JSON strict suivant :
                {
                    "price": "Fourchette de prix en euros ex: 480 - 580€ HT",
                    "distance": "Distance en km ex: Approx. 380 km",
                    "duration": "Durée estimée ex: Approx. 4h45",
                    "reasoning": "Brève explication du calcul logistique (1 à 2 phrases max)"
                }
            `;

        // Niveau 1 : Google AI (Gemini 2.5 Flash)
        const key = getGeminiApiKey();
        if (key) {
            try {
                const client = getGeminiClient();
                if (client) {
                    const model = client.getGenerativeModel({
                        model: getGeminiModel(),
                    });

                    const call = async () => {
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        return extractJsonFromAiText<EstimationResult>(
                            response.text()
                        );
                    };

                    const parsed = await withTimeout(call(), 7000);
                    if (parsed && parsed.price && parsed.distance) {
                        return {
                            price: parsed.price,
                            distance: parsed.distance,
                            duration: parsed.duration || "Non spécifiée",
                            confidence: "Élevée (Gemini 2.5)",
                            reasoning:
                                parsed.reasoning ||
                                "Estimation calculée via le modèle logistique Gemini 2.5.",
                            source: "gemini",
                        };
                    }
                }
            } catch (error: unknown) {
                logger.warn(
                    "Gemini estimateTransport warning (basculement OpenRouter / Fail-Safe)",
                    {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    }
                );
            }
        }

        // Niveau 2 : OpenRouter (fallback multi-modèles)
        if (isOpenRouterAvailable()) {
            const orResult = await callOpenRouterChat({
                userPrompt: prompt,
                maxTokens: 350,
                temperature: 0.2,
                timeoutMs: 7000,
            });

            if (orResult.success) {
                const parsed = extractJsonFromAiText<EstimationResult>(
                    orResult.data.content
                );
                if (parsed && parsed.price && parsed.distance) {
                    return {
                        price: parsed.price,
                        distance: parsed.distance,
                        duration: parsed.duration || "Non spécifiée",
                        confidence: "Élevée (OpenRouter)",
                        reasoning:
                            parsed.reasoning ||
                            `Estimation calculée via OpenRouter (${orResult.data.model}).`,
                        source: "openrouter",
                    };
                }
            }
        }

        // Niveau 3 : Moteur heuristique déterministe local
        const fallback = calculateHeuristicEstimate(pickup, dropoff, type);
        if (key || isOpenRouterAvailable()) {
            fallback.reasoning +=
                " (Fail-safe activé : calcul heuristique appliqué)";
        }
        return fallback;
    },

    /**
     * Rédige un email professionnel pour les administrateurs.
     * Chaîne de résilience : Google AI (Gemini 2.5 Flash) -> OpenRouter -> Modèles métier locaux.
     */
    async draftEmail(
        type: "validation" | "refusal" | "question",
        clientName: string,
        quoteId: string
    ): Promise<{ subject: string; body: string }> {
        const prompt = `
                Rédige un email professionnel et courtois pour un client transport.
                Contexte : ${type === "validation" ? "Devis validé" : type === "refusal" ? "Devis refusé (capacité ou faisabilité)" : "Demande de précision"}
                Client : ${clientName}
                Devis : ${quoteId}
                Entreprise : HBC Service Cash Logistique Immobilière ("Votre sécurité, Notre priorité")
                Ton : Professionnel, chaleureux, rassurant.
                
                Réponds UNIQUEMENT au format JSON : { "subject": "Objet de l'email", "body": "Corps du message" }
            `;

        // Niveau 1 : Google AI (Gemini 2.5 Flash)
        const key = getGeminiApiKey();
        if (key) {
            try {
                const client = getGeminiClient();
                if (client) {
                    const model = client.getGenerativeModel({
                        model: getGeminiModel(),
                    });

                    const call = async () => {
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        return extractJsonFromAiText<{
                            subject: string;
                            body: string;
                        }>(response.text());
                    };

                    const result = await withTimeout(call(), 7000);
                    if (result && result.subject && result.body) {
                        return result;
                    }
                }
            } catch (error: unknown) {
                logger.warn(
                    "Gemini draftEmail warning (basculement OpenRouter / Fail-Safe)",
                    {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    }
                );
            }
        }

        // Niveau 2 : OpenRouter
        if (isOpenRouterAvailable()) {
            const orResult = await callOpenRouterChat({
                userPrompt: prompt,
                maxTokens: 450,
                temperature: 0.3,
                timeoutMs: 7000,
            });
            if (orResult.success) {
                const parsed = extractJsonFromAiText<{
                    subject: string;
                    body: string;
                }>(orResult.data.content);
                if (parsed && parsed.subject && parsed.body) {
                    return parsed;
                }
            }
        }

        // Niveau 3 : Modèle métier local déterministe
        return generateFallbackEmail(type, clientName, quoteId);
    },
};

/**
 * Normalise la réponse JSON structurée du support IA.
 */
function parseSupportAiPayload(
    raw: unknown,
    source: "gemini" | "openrouter"
): {
    message: string;
    category: QueryCategory;
    sentiment: Sentiment;
    shouldEscalate: boolean;
    source: "gemini" | "openrouter";
} | null {
    if (!raw || typeof raw !== "object") return null;
    const record = raw as Record<string, unknown>;
    if (typeof record.message !== "string" || !record.message.trim()) {
        return null;
    }

    const validCategories: QueryCategory[] = [
        "technical",
        "billing",
        "quote",
        "transport",
        "general",
    ];
    const validSentiments: Sentiment[] = ["positive", "neutral", "negative"];

    return {
        message: record.message.trim(),
        category: validCategories.includes(record.category as QueryCategory)
            ? (record.category as QueryCategory)
            : "general",
        sentiment: validSentiments.includes(record.sentiment as Sentiment)
            ? (record.sentiment as Sentiment)
            : "neutral",
        shouldEscalate: Boolean(record.shouldEscalate),
        source,
    };
}

/**
 * Génération de réponse IA pour le support conversationnel.
 * Chaîne de résilience : Google AI (Gemini 2.5 Flash) -> OpenRouter -> null (arbre de décision local).
 */
export async function generateSupportAiResponse(
    userMessage: string,
    history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<{
    message: string;
    category: QueryCategory;
    sentiment: Sentiment;
    shouldEscalate: boolean;
    source: "gemini" | "openrouter" | "resilient_local";
} | null> {
    const hasGemini = isGeminiAvailable();
    const hasOpenRouter = isOpenRouterAvailable();

    if (!hasGemini && !hasOpenRouter) return null;

    const historySnippet = history
        .slice(-4)
        .map(
            (h) =>
                `${h.role === "user" ? "Client" : "Assistant HBC"}: ${h.content}`
        )
        .join("\n");

    const prompt = `
            Tu es l'assistant virtuel intelligent de HBC Service Cash Logistique Immobilière ("Votre sécurité, Notre priorité").
            Spécialités : transport routier lourd, containers maritimes, charpentes, machines industrielles, convois exceptionnels, modules préfabriqués.
            
            Règles strictes :
            - Langue : Français impeccable, concis, professionnel et rassurant (max 2 à 3 phrases).
            - Ne jamais inventer de prix exacts : pour toute demande de devis/prix/tarif, invite le client à utiliser le formulaire ou le wizard devis interactif.
            - Pour tout suivi de transport ou de commande : indique que le suivi s'effectue via la référence de dossier (format HBC-XXXXX) communiquée par email ou en contactant notre service d'exploitation logistique. Règle la catégorie sur "transport".
            - Si l'utilisateur exprime de la colère ou une réclamation, réponds poliment et indique qu'un conseiller humain prendra le relais.
            - N'utilise aucun émoji brut dans le message afin de maintenir une charte graphique épurée.
            
            Historique récent :
            ${historySnippet}
            
            Message du client :
            "${userMessage}"
            
            Réponds UNIQUEMENT au format JSON strict :
            {
                "message": "Ta réponse au client en 2-3 phrases",
                "category": "technical" | "billing" | "quote" | "transport" | "general",
                "sentiment": "positive" | "neutral" | "negative",
                "shouldEscalate": true | false
            }
        `;

    // Niveau 1 : Google AI (Gemini 2.5 Flash)
    if (hasGemini) {
        try {
            const client = getGeminiClient();
            if (client) {
                const model = client.getGenerativeModel({
                    model: getGeminiModel(),
                    generationConfig: {
                        maxOutputTokens: 350,
                        temperature: 0.3,
                    },
                });

                const call = async () => {
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    return extractJsonFromAiText<unknown>(response.text());
                };

                const parsed = await withTimeout(call(), 7000);
                const normalized = parseSupportAiPayload(parsed, "gemini");
                if (normalized) return normalized;
            }
        } catch (error: unknown) {
            logger.warn(
                "Gemini support response warning (basculement OpenRouter / Fail-Safe)",
                {
                    error:
                        error instanceof Error ? error.message : String(error),
                }
            );
        }
    }

    // Niveau 2 : OpenRouter (fallback multi-modèles)
    if (hasOpenRouter) {
        const orResult = await callOpenRouterChat({
            userPrompt: prompt,
            maxTokens: 350,
            temperature: 0.3,
            timeoutMs: 7000,
        });

        if (orResult.success) {
            const parsed = extractJsonFromAiText<unknown>(
                orResult.data.content
            );
            const normalized = parseSupportAiPayload(parsed, "openrouter");
            if (normalized) return normalized;
        }
    }

    return null;
}
