import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCheckRateLimit, mockQuoteFindFirst } = vi.hoisted(() => ({
    mockCheckRateLimit: vi.fn(),
    mockQuoteFindFirst: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
    checkRateLimit: mockCheckRateLimit,
}));

vi.mock("@/lib/prisma", () => {
    const prismaMock = {
        quote: {
            findFirst: mockQuoteFindFirst,
        },
        systemSettings: {
            findUnique: vi.fn().mockResolvedValue(null),
        },
    };
    return { default: prismaMock, prisma: prismaMock };
});

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { recoverSupportPayloadFromRawText } from "@/lib/gemini";
import { generateMockResponse } from "@/lib/support-agent/mock-responses";
import { lookupSupportQuoteAction } from "@/app/actions/ai-actions";

describe("Sprint 43: Human-First Support Agent & Anti-Hallucination Tracking", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCheckRateLimit.mockResolvedValue({ allowed: true });
    });

    it("recovers valid JSON wrapped in <think> tags without falling back to robot mode", () => {
        const raw = `<think>Je dois répondre chaleureusement au client et joindre la fiche devis.</think>
        \`\`\`json
        {
          "message": "Bonjour ! Je serais ravi de vous aider à organiser votre transport de conteneur vers Bouaké.",
          "category": "quote",
          "sentiment": "positive",
          "shouldEscalate": false,
          "suggestedAction": "start_quote_flow",
          "tutorialId": "quote-request"
        }
        \`\`\``;

        const recovered = recoverSupportPayloadFromRawText(raw) as Record<
            string,
            unknown
        >;
        expect(recovered).not.toBeNull();
        expect(recovered.message).toContain("Bouaké");
        expect(recovered.tutorialId).toBe("quote-request");
    });

    it("recovers truncated JSON message field instead of dropping into robot mode", () => {
        const truncated = `{"message": "Bonjour ! Nous desservons bien San-Pédro avec nos porte-conteneurs 40 pieds. Pourriez-vous me préciser la date souhaitée ?","category": "trans`;
        const recovered = recoverSupportPayloadFromRawText(truncated) as Record<
            string,
            unknown
        >;
        expect(recovered).not.toBeNull();
        expect(recovered.message).toContain("San-Pédro");
    });

    it("never fabricates a fake tracking status in Robot Mode for an unverified HBC reference", async () => {
        const res = await generateMockResponse("Où en est mon colis HBC-999999 ?");
        expect(res.message.toLowerCase()).not.toContain("convoi planifié");
        expect(res.message.toLowerCase()).toContain("email");
        expect(res.message.toLowerCase()).toContain("téléphone");
    });

    it("verifies real quote status in DB and rejects mismatched identity", async () => {
        mockQuoteFindFirst.mockResolvedValue({
            id: "q-1",
            trackingCode: "HBC-2026-4412",
            email: "client@entreprise.ci",
            phone: "+225 07 01 02 03 04",
            status: "VALIDATED",
            itemType: "Conteneur 40 pieds",
            pickupLocation: "Port d'Abidjan",
            dropoffLocation: "Yamoussoukro",
            transportDate: new Date("2026-12-01T08:00:00Z"),
        });

        const okRes = await lookupSupportQuoteAction({
            reference: "HBC-2026-4412",
            emailOrPhone: "client@entreprise.ci",
        });
        expect(okRes.error).toBeNull();
        expect(okRes.data?.status).toBe("VALIDATED");
        expect(okRes.data?.dropoffLocation).toBe("Yamoussoukro");

        const badRes = await lookupSupportQuoteAction({
            reference: "HBC-2026-4412",
            emailOrPhone: "intrus@autre.com",
        });
        expect(badRes.data).toBeNull();
        expect(badRes.error).toContain("Vérification d'identité échouée");
    });
});
