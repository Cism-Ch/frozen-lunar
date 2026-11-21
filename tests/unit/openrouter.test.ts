import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    callOpenRouterChat,
    extractJsonFromAiText,
    getOpenRouterApiKey,
    getOpenRouterModel,
    DEFAULT_OPENROUTER_MODEL,
} from "@/lib/openrouter";
import {
    DEFAULT_GEMINI_MODEL,
    getGeminiModel,
    geminiService,
    generateSupportAiResponse,
} from "@/lib/gemini";

describe("OpenRouter & Gemini 2.5 Flash AI Resilience", () => {
    const originalFetch = global.fetch;
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    const originalPublicGeminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const originalGeminiModel = process.env.GEMINI_MODEL;
    const originalOpenRouterKey = process.env.OPENROUTER_API_KEY;
    const originalOpenRouterModel = process.env.OPENROUTER_MODEL;

    beforeEach(() => {
        vi.restoreAllMocks();
        delete process.env.GEMINI_API_KEY;
        delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        delete process.env.GEMINI_MODEL;
        delete process.env.OPENROUTER_API_KEY;
        delete process.env.OPENROUTER_MODEL;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        process.env.GEMINI_API_KEY = originalGeminiKey;
        process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalPublicGeminiKey;
        process.env.GEMINI_MODEL = originalGeminiModel;
        process.env.OPENROUTER_MODEL = originalOpenRouterModel;
        process.env.OPENROUTER_API_KEY = originalOpenRouterKey;
    });

    it("utilise gemini-2.5-flash et NVIDIA Nemotron par défaut", () => {
        expect(getGeminiModel()).toBe(DEFAULT_GEMINI_MODEL);
        expect(getGeminiModel()).toBe("gemini-2.5-flash");
        expect(getOpenRouterModel()).toBe(DEFAULT_OPENROUTER_MODEL);
    });

    it("rejette les clés OpenRouter absentes ou factices", () => {
        expect(getOpenRouterApiKey()).toBeNull();
        process.env.OPENROUTER_API_KEY = "placeholder";
        expect(getOpenRouterApiKey()).toBeNull();

        process.env.OPENROUTER_API_KEY =
            "sk-or-v1-test-valid-key-example-1234567890";
        expect(getOpenRouterApiKey()).toBe(
            "sk-or-v1-test-valid-key-example-1234567890"
        );
    });

    it("extrait proprement un objet JSON entouré de balises Markdown", () => {
        const parsed = extractJsonFromAiText<{ price: string }>(
            'Voici la réponse :\n```json\n{"price": "500€ HT"}\n```'
        );
        expect(parsed).toEqual({ price: "500€ HT" });
    });

    it("bascule automatiquement vers OpenRouter pour le chat support si Gemini est absent", async () => {
        process.env.OPENROUTER_API_KEY =
            "sk-or-v1-test-valid-key-example-1234567890";
        process.env.OPENROUTER_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct";

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                model: "nvidia/llama-3.1-nemotron-70b-instruct",
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                message:
                                    "Bonjour, votre devis est pris en charge par notre équipe HBC Logistique.",
                                category: "quote",
                                sentiment: "neutral",
                                shouldEscalate: false,
                            }),
                        },
                    },
                ],
            }),
        }) as unknown as typeof fetch;

        const res = await generateSupportAiResponse(
            "Je veux un devis container"
        );
        expect(res).not.toBeNull();
        expect(res?.source).toBe("openrouter");
        expect(res?.category).toBe("quote");
    });

    it("bascule automatiquement vers OpenRouter pour estimateTransport si Gemini est absent", async () => {
        process.env.OPENROUTER_API_KEY =
            "sk-or-v1-test-valid-key-example-1234567890";

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                model: "nvidia/llama-3.1-nemotron-70b-instruct",
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                price: "620 - 750€ HT",
                                distance: "Approx. 465 km",
                                duration: "Approx. 5h10",
                                reasoning:
                                    "Trajet routier longue distance avec semi-remorque.",
                            }),
                        },
                    },
                ],
            }),
        }) as unknown as typeof fetch;

        const estimate = await geminiService.estimateTransport(
            "Paris",
            "Lyon",
            "Semi-remorque"
        );
        expect(estimate.source).toBe("openrouter");
        expect(estimate.price).toBe("620 - 750€ HT");
    });

    it("retourne une erreur contrôlée quand OpenRouter renvoie HTTP 429", async () => {
        process.env.OPENROUTER_API_KEY =
            "sk-or-v1-test-valid-key-example-1234567890";

        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
        }) as unknown as typeof fetch;

        const result = await callOpenRouterChat({ userPrompt: "Bonjour" });
        expect(result.success).toBe(false);
    });
});
