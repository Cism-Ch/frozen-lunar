import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuoteSource, QuoteStatus } from "@prisma/client";

const {
    mockRequireAdmin,
    mockQuoteFindUnique,
    mockQuoteUpdate,
    mockVehicleFindMany,
    mockEstimateTransport,
} = vi.hoisted(() => ({
    mockRequireAdmin: vi.fn(),
    mockQuoteFindUnique: vi.fn(),
    mockQuoteUpdate: vi.fn(),
    mockVehicleFindMany: vi.fn(),
    mockEstimateTransport: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: mockRequireAdmin,
    getOptionalUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
    default: {
        quote: {
            findUnique: mockQuoteFindUnique,
            update: mockQuoteUpdate,
        },
        quoteHistory: {
            create: vi.fn(),
        },
        vehicle: {
            findMany: mockVehicleFindMany,
        },
    },
}));

vi.mock("@/lib/gemini", () => ({
    geminiService: {
        estimateTransport: mockEstimateTransport,
    },
}));

vi.mock("@/lib/qstash", () => ({
    emailQueue: { sendQuoteConfirmation: vi.fn() },
    pdfQueue: { generateQuotePDF: vi.fn() },
}));

vi.mock("@/lib/rate-limit", () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

import {
    assistQuotePricingAction,
    parseEstimatedAmountFcfa,
} from "@/app/actions/quote-pricing-actions";
import {
    getQuoteByIdAction,
    updateQuoteStatusAction,
} from "@/app/actions/quote-management";

describe("Sprint 28 — Quote Workspace & Pricing Studio", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireAdmin.mockResolvedValue({
            id: "admin-1",
            name: "Admin HBC",
            email: "admin@hbc.ci",
            role: "ADMIN",
        });
    });

    it("parses FCFA amounts with spaces, dots, commas, and range midpoints", async () => {
        expect(await parseEstimatedAmountFcfa("1 200 000 FCFA HT")).toBe(
            1_200_000
        );
        expect(await parseEstimatedAmountFcfa("1.250.000 FCFA")).toBe(1_250_000);
        expect(await parseEstimatedAmountFcfa("1,350,000 FCFA")).toBe(1_350_000);
        expect(
            await parseEstimatedAmountFcfa("450 000 - 550 000 FCFA HT")
        ).toBe(500_000);
        expect(await parseEstimatedAmountFcfa("Sur devis")).toBe(450_000);
    });

    it("factors selected quote vehicle dailyRateFcfa × vehicleQuantity and hazardous fee", async () => {
        mockQuoteFindUnique.mockResolvedValue({
            id: "q-1",
            pickupLocation: "Abidjan Vridi",
            dropoffLocation: "Yamoussoukro",
            itemType: "Transport engin",
            vehicleId: "veh-1",
            vehicleQuantity: 3,
            vehicle: {
                id: "veh-1",
                name: "Porte-char 40T",
                category: "HEAVY_HAUL",
                dailyRateFcfa: 200_000,
                capacityLabel: "40 Tonnes",
            },
            supplementaryInfo: {
                hazardous: true,
            },
        });
        mockEstimateTransport.mockResolvedValue({
            price: "1 000 000 FCFA HT",
            distance: "Approx. 240 km",
            duration: "Approx. 4h30",
            confidence: "Élevée",
            reasoning: "Trajet autoroute du Nord.",
            source: "gemini",
        });

        const res = await assistQuotePricingAction({ quoteId: "q-1" });

        expect(res.error).toBeNull();
        expect(res.data?.vehicleName).toBe("3× Porte-char 40T");
        const baseLine = res.data?.lines.find((l) => l.id === "line-base");
        expect(baseLine?.amountFcfa).toBe(600_000);
        const hazardousLine = res.data?.lines.find(
            (l) => l.id === "line-hazardous"
        );
        expect(hazardousLine?.amountFcfa).toBe(120_000);
    });

    it("returns trackingCode, cancellationReason, and vehicle metadata in getQuoteByIdAction", async () => {
        const now = new Date("2026-11-24T12:00:00.000Z");
        mockQuoteFindUnique.mockResolvedValue({
            id: "q-2",
            trackingCode: "HBC-2026-8842",
            date: now,
            clientName: "Koné BTP",
            email: "kone@btp.ci",
            phone: "0700000000",
            itemType: "Container 40 pieds",
            pickupLocation: "Port d'Abidjan",
            dropoffLocation: "Bouaké",
            transportDate: now,
            status: QuoteStatus.CANCELLED,
            amount: "À calculer",
            userNotes: "Accès chantier nord",
            cancellationReason: "Chantier reporté",
            cancelledAt: now,
            vehicleId: "veh-2",
            vehicleQuantity: 2,
            vehicle: {
                id: "veh-2",
                name: "Porte-conteneur 40T",
                category: "CONTAINERS",
                dailyRateFcfa: 250_000,
                capacityLabel: "40 Pieds",
            },
            source: QuoteSource.FORM,
            supplementaryInfo: null,
            history: [],
        });

        const res = await getQuoteByIdAction("q-2");

        expect(res.success).toBe(true);
        expect(res.quote?.trackingCode).toBe("HBC-2026-8842");
        expect(res.quote?.cancellationReason).toBe("Chantier reporté");
        expect(res.quote?.vehicleQuantity).toBe(2);
        expect(res.quote?.vehicle?.name).toBe("Porte-conteneur 40T");
    });

    it("blocks status transitions on CANCELLED quotes", async () => {
        mockQuoteFindUnique.mockResolvedValue({
            status: QuoteStatus.CANCELLED,
        });

        const res = await updateQuoteStatusAction("q-cancelled", "Validé");

        expect(res.success).toBe(false);
        expect(res.error).toContain("annulé");
        expect(mockQuoteUpdate).not.toHaveBeenCalled();
    });
});
