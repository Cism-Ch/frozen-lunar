import { describe, it, expect, beforeEach } from "vitest";
import {
    generateMockResponse,
    resetConversation,
} from "@/lib/support-agent/mock-responses";
import {
    findGuidedFlow,
    GUIDED_FLOWS,
    CONTEXTUAL_QUICK_REPLIES,
} from "@/lib/support-agent/tutorials";
import { AGENT_CONFIG } from "@/lib/support-agent/config";

describe("Support Chat Tracking & Emojis Sanity", () => {
    beforeEach(() => {
        resetConversation();
    });

    it("should correctly route 'Je veux suivre l'état de mon transport' to tracking", async () => {
        const flow = findGuidedFlow("Je veux suivre l'état de mon transport");
        expect(flow).not.toBeNull();
        expect(flow?.id).toBe("tracking-flow");

        const response = await generateMockResponse(
            "Je veux suivre l'état de mon transport"
        );
        expect(response.category).toBe("transport");
        // Must NOT respond with the old generic fallback
        expect(response.message).not.toContain(
            "Que souhaitez-vous savoir sur nos services de transport"
        );
        expect(response.message.toLowerCase()).toContain("suivre");
        expect(response.options).toBeDefined();
        expect(response.options!.length).toBeGreaterThan(0);
        expect(response.showTutorial).toBe(true);
    });

    it("should correctly route 'Je veux suivre mon transport' to tracking", async () => {
        const flow = findGuidedFlow("Je veux suivre mon transport");
        expect(flow).not.toBeNull();
        expect(flow?.id).toBe("tracking-flow");

        const response = await generateMockResponse(
            "Je veux suivre mon transport"
        );
        expect(response.category).toBe("transport");
        expect(response.message).not.toContain(
            "Que souhaitez-vous savoir sur nos services de transport"
        );
        expect(response.options).toBeDefined();
    });

    it("should recognize an HBC reference like 'HBC-98765' and confirm order status", async () => {
        const response = await generateMockResponse(
            "Voici mon numéro HBC-98765"
        );
        expect(response.category).toBe("transport");
        expect(response.message).toContain("HBC-98765");
        expect(response.message).toContain("Statut estimé");
    });

    it("should not contain raw emojis in quick replies labels", () => {
        const emojiRegex =
            /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

        // Check AGENT_CONFIG default quick replies
        for (const reply of AGENT_CONFIG.quickReplies) {
            expect(reply.label).not.toMatch(emojiRegex);
        }

        // Check CONTEXTUAL_QUICK_REPLIES
        for (const [context, replies] of Object.entries(
            CONTEXTUAL_QUICK_REPLIES
        )) {
            for (const reply of replies) {
                expect(
                    reply.label,
                    `Context ${context} reply ${reply.id} contains emoji`
                ).not.toMatch(emojiRegex);
            }
        }
    });

    it("should not contain raw emojis in guided flows options labels", () => {
        const emojiRegex =
            /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

        for (const flow of GUIDED_FLOWS) {
            for (const option of flow.options) {
                expect(
                    option.label,
                    `Flow ${flow.id} option ${option.id} contains emoji`
                ).not.toMatch(emojiRegex);
            }
        }
    });
});
