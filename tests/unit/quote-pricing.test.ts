import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequireAdmin, mockQuoteFindUnique, mockQuoteUpdate, mockFleetFindMany, mockEstimate } =
    vi.hoisted(() => ({
        mockRequireAdmin: vi.fn(),
        mockQuoteFindUnique: vi.fn(),
        mockQuoteUpdate: vi.fn(),
        mockFleetFindMany: vi.fn(),
        mockEstimate: vi.fn(),
    }));

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
    default: {
        quote: {
            findUnique: mockQuoteFindUnique,
            update: mockQuoteUpdate,
        },
        vehicle: {
            findMany: mockFleetFindMany,
        },
    },
}));

vi.mock("@/lib/gemini", () => ({
    geminiService: {
        estimateTransport: mockEstimate,
    },
}));

import {
    assistQuotePricingAction,
    saveStructuredPricingAction,
} from "@/app/actions/quote-pricing-actions";

describe("Admin Quote AI Pricing Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireAdmin.mockResolvedValue({
            id: "admin-1",
            name: "Admin HBC",
            email: "admin@hbc.ci",
            role: "admin",
        });
    });

    it("refuse l'accès si l'utilisateur n'est pas administrateur", async () => {
        mockRequireAdmin.mockRejectedValueOnce(new Error("Accès refusé"));
        const res = await assistQuotePricingAction({ quoteId: "q-1" });
        expect(res.data).toBeNull();
        expect(res.error).toContain("Accès refusé");
    });

    it("génère une ventilation structurée en FCFA incluant la grue si requise", async () => {
        mockQuoteFindUnique.mockResolvedValueOnce({
            id: "q-1",
            trackingCode: "HBC-2026-1001",
            pickupLocation: "Port Autonome d'Abidjan",
            dropoffLocation: "Yamoussoukro",
            itemType: "Container 40ft",
            supplementaryInfo: {
                requiresCrane: true,
                urgency: "urgent",
            },
        });
        mockFleetFindMany.mockResolvedValueOnce([
            {
                id: "v-1",
                name: "Porte-Conteneur 40ft",
                category: "CONTAINER",
                dailyRateFcfa: 400000,
                isActive: true,
            },
        ]);
        mockEstimate.mockResolvedValueOnce({
            price: "1 200 000 FCFA",
            distance: "240 km",
            duration: "3h30",
            reasoning: "Axe Abidjan-Yamoussoukro autoroute du Nord.",
            confidence: "Haute",
            source: "gemini",
        });

        const res = await assistQuotePricingAction({ quoteId: "q-1" });
        expect(res.error).toBeNull();
        expect(res.data?.vehicleName).toBe("Porte-Conteneur 40ft");
        expect(res.data?.lines.length).toBeGreaterThanOrEqual(5);
        expect(res.data?.subtotalHt).toBeGreaterThan(1_000_000);
        expect(res.data?.aiSource).toBe("gemini");
    });

    it("sauvegarde le chiffrage structuré avec TVA 18% sans écraser supplementaryInfo", async () => {
        mockQuoteFindUnique.mockResolvedValueOnce({
            id: "q-2",
            trackingCode: "HBC-2026-2002",
            supplementaryInfo: {
                category: "materials",
                weight: "20 tonnes",
            },
        });
        mockQuoteUpdate.mockResolvedValueOnce({});

        const res = await saveStructuredPricingAction({
            quoteId: "q-2",
            vehicleName: "Plateau 30T",
            includeVat: true,
            lines: [
                {
                    id: "l1",
                    label: "Mobilisation",
                    category: "base",
                    amountFcfa: 500000,
                },
                {
                    id: "l2",
                    label: "Traction",
                    category: "distance",
                    amountFcfa: 500000,
                },
            ],
        });

        expect(res.error).toBeNull();
        expect(res.data?.amount).toContain("FCFA TTC");
        expect(res.data?.breakdown.subtotalHt).toBe(1_000_000);
        expect(res.data?.breakdown.vatAmount).toBe(180_000);

        const updatePayload = mockQuoteUpdate.mock.calls[0][0].data;
        expect(updatePayload.supplementaryInfo.category).toBe("materials");
        expect(updatePayload.supplementaryInfo.weight).toBe("20 tonnes");
        expect(updatePayload.supplementaryInfo.pricingBreakdown.lines).toHaveLength(2);
    });
});
