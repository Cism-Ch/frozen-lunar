import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getGeminiApiKey,
    isGeminiAvailable,
    calculateHeuristicEstimate,
    generateFallbackEmail,
    geminiService,
} from "@/lib/gemini";

describe("AI Resilience & Fail-Safe Engine", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Gemini API Key Detection & Sanitization", () => {
        it("should detect when no API key is defined", () => {
            const originalServerKey = process.env.GEMINI_API_KEY;
            const originalClientKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

            delete process.env.GEMINI_API_KEY;
            delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;

            expect(getGeminiApiKey()).toBeNull();
            expect(isGeminiAvailable()).toBe(false);

            process.env.GEMINI_API_KEY = originalServerKey;
            process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalClientKey;
        });

        it("should reject dummy placeholder keys and treat them as absent", () => {
            const originalServerKey = process.env.GEMINI_API_KEY;

            process.env.GEMINI_API_KEY = "your_gemini_api_key";
            expect(getGeminiApiKey()).toBeNull();
            expect(isGeminiAvailable()).toBe(false);

            process.env.GEMINI_API_KEY = "placeholder";
            expect(getGeminiApiKey()).toBeNull();

            process.env.GEMINI_API_KEY = "mock";
            expect(getGeminiApiKey()).toBeNull();

            process.env.GEMINI_API_KEY = "   ";
            expect(getGeminiApiKey()).toBeNull();

            process.env.GEMINI_API_KEY = originalServerKey;
        });

        it("should accept valid realistic keys", () => {
            const originalServerKey = process.env.GEMINI_API_KEY;

            process.env.GEMINI_API_KEY =
                "AIzaSyD-ValidProductionKeyExample_123456";
            expect(getGeminiApiKey()).toBe(
                "AIzaSyD-ValidProductionKeyExample_123456"
            );
            expect(isGeminiAvailable()).toBe(true);

            process.env.GEMINI_API_KEY = originalServerKey;
        });
    });

    describe("Tier 2 Heuristic Transport Estimator (Fail-Safe)", () => {
        it("should calculate realistic distance and pricing for major French hubs", () => {
            const estimate = calculateHeuristicEstimate(
                "Paris (75)",
                "Lyon (69)",
                "Plateau semi-remorque"
            );

            expect(estimate.source).toBe("heuristic");
            expect(estimate.confidence).toContain("Moyenne");
            expect(estimate.distance).toMatch(/\d+\s*km/);
            expect(estimate.price).toMatch(/\d+.*€ HT/);
            expect(estimate.duration).toMatch(/\d+h\d+/);
            expect(estimate.reasoning).toContain("barème");
        });

        it("should adapt pricing based on vehicle specialization (grue vs standard)", () => {
            const standardEstimate = calculateHeuristicEstimate(
                "Paris",
                "Marseille",
                "Semi standard"
            );
            const craneEstimate = calculateHeuristicEstimate(
                "Paris",
                "Marseille",
                "Camion avec bras de grue"
            );

            // Extract numeric price
            const getPriceVal = (p: string) => {
                const match = p.match(/(\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            };

            expect(getPriceVal(craneEstimate.price)).toBeGreaterThan(
                getPriceVal(standardEstimate.price)
            );
        });

        it("should never throw an error even with weird or empty input", () => {
            expect(() => calculateHeuristicEstimate("", "", "")).not.toThrow();
            const result = calculateHeuristicEstimate("", "", "");
            expect(result.source).toBe("heuristic");
            expect(result.price).toBeDefined();
        });
    });

    describe("Tier 2 Parametric Email Generation (Fail-Safe)", () => {
        it("should generate structured professional French emails for validation", () => {
            const draft = generateFallbackEmail(
                "validation",
                "Entreprise Martin",
                "DEV-2026-0042"
            );

            expect(draft.subject).toContain("DEV-2026-0042");
            expect(draft.subject).toContain("Validation");
            expect(draft.body).toContain("Entreprise Martin");
            expect(draft.body).toContain("Votre sécurité, Notre priorité");
        });

        it("should generate polite refusal emails", () => {
            const draft = generateFallbackEmail(
                "refusal",
                "Société BTP",
                "DEV-2026-0099"
            );

            expect(draft.subject).toContain("DEV-2026-0099");
            expect(draft.body).toContain("Société BTP");
            expect(draft.body).toContain("ne pouvons répondre favorablement");
        });

        it("should generate inquiry emails for missing information", () => {
            const draft = generateFallbackEmail(
                "question",
                "Lucas Dupont",
                "DEV-2026-0105"
            );

            expect(draft.subject).toContain("Complément d'information");
            expect(draft.body).toContain("Lucas Dupont");
        });
    });

    describe("geminiService Autonomous Fallback Execution", () => {
        it("should automatically use the heuristic fallback when no Gemini key is set without crashing", async () => {
            const originalServerKey = process.env.GEMINI_API_KEY;
            const originalClientKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

            delete process.env.GEMINI_API_KEY;
            delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;

            const estimate = await geminiService.estimateTransport(
                "Bordeaux",
                "Toulouse",
                "Container 40ft"
            );
            expect(estimate).toBeDefined();
            expect(estimate.source).toBe("heuristic");
            expect(estimate.price).toContain("€ HT");

            const email = await geminiService.draftEmail(
                "validation",
                "Acme Logistics",
                "Q-999"
            );
            expect(email).toBeDefined();
            expect(email.subject).toContain("Q-999");

            process.env.GEMINI_API_KEY = originalServerKey;
            process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalClientKey;
        });
    });
});
