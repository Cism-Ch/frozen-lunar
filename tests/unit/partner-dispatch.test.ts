import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerApplicationStatus } from "@prisma/client";

const {
    mockRequireAdmin,
    mockRequireQuoteOwnershipOrAdmin,
    mockQuoteFindUnique,
    mockQuoteUpdate,
    mockPartnerFindUnique,
    mockRevalidatePath,
} = vi.hoisted(() => ({
    mockRequireAdmin: vi.fn(),
    mockRequireQuoteOwnershipOrAdmin: vi.fn(),
    mockQuoteFindUnique: vi.fn(),
    mockQuoteUpdate: vi.fn(),
    mockPartnerFindUnique: vi.fn(),
    mockRevalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: mockRequireAdmin,
    requireAuth: vi.fn(),
    requireQuoteOwnershipOrAdmin: mockRequireQuoteOwnershipOrAdmin,
}));

vi.mock("@/lib/prisma", () => {
    const prismaMock = {
        quote: {
            findUnique: mockQuoteFindUnique,
            update: mockQuoteUpdate,
        },
        partnerApplication: {
            findUnique: mockPartnerFindUnique,
        },
    };
    return {
        default: prismaMock,
        prisma: prismaMock,
    };
});

vi.mock("@/lib/redis", () => ({
    redis: null,
}));

vi.mock("@/lib/health-check", () => ({
    isAnyEmailProviderConfigured: vi.fn(() => false),
}));

vi.mock("@/lib/email", () => ({
    sendTransactionalEmail: vi.fn(),
    EMAIL_SENDER: "test@hbc-logistique.com",
}));

import { assignPartnerToQuoteAction } from "@/app/actions/partner-actions";
import { getClientQuoteDetailAction } from "@/app/actions/client-space-actions";

describe("assignPartnerToQuoteAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireAdmin.mockResolvedValue({
            id: "admin-1",
            name: "Admin HBC",
            email: "admin@hbc-logistique.com",
        });
    });

    it("rejects assigning a partner whose status is not APPROVED", async () => {
        mockQuoteFindUnique.mockResolvedValue({
            id: "quote-1",
            supplementaryInfo: {},
        });
        mockPartnerFindUnique.mockResolvedValue({
            id: "partner-pending",
            companyName: "TransIvoire SARL",
            contactName: "Kouassi Yao",
            phone: "0700000000",
            whatsapp: null,
            email: "contact@transivoire.ci",
            city: "Abidjan",
            status: PartnerApplicationStatus.PENDING,
        });

        const res = await assignPartnerToQuoteAction({
            quoteId: "quote-1",
            partnerId: "partner-pending",
            partnerNetFcfa: 750_000,
            clientPriceFcfa: 1_000_000,
        });

        expect(res.data).toBeNull();
        expect(res.error).toContain("APPROVED");
        expect(mockQuoteUpdate).not.toHaveBeenCalled();
    });

    it("computes exact HBC margin and preserves existing pricingBreakdown and attachments", async () => {
        const existingSupplementaryInfo = {
            attachments: ["quotes/bl-2026.pdf"],
            pricingBreakdown: {
                subtotalHt: 1_000_000,
                tvaRate: 18,
                totalTtc: 1_180_000,
                items: [],
            },
        };

        mockQuoteFindUnique.mockResolvedValue({
            id: "quote-2",
            supplementaryInfo: existingSupplementaryInfo,
        });
        mockPartnerFindUnique.mockResolvedValue({
            id: "partner-approved",
            companyName: "Abidjan Fret Express",
            contactName: "Koné Bakary",
            phone: "+2250701020304",
            whatsapp: "+2250701020304",
            email: "ops@afret.ci",
            city: "San-Pédro",
            status: PartnerApplicationStatus.APPROVED,
        });
        mockQuoteUpdate.mockResolvedValue({ id: "quote-2" });

        const res = await assignPartnerToQuoteAction({
            quoteId: "quote-2",
            partnerId: "partner-approved",
            partnerNetFcfa: 750_000,
            clientPriceFcfa: 1_000_000,
            missionNotes: "Arrivée 07h30 au port",
        });

        expect(res.error).toBeNull();
        expect(res.data).not.toBeNull();
        expect(res.data?.hbcMarginFcfa).toBe(250_000);
        expect(res.data?.partnerName).toBe("Abidjan Fret Express");

        expect(mockQuoteUpdate).toHaveBeenCalledTimes(1);
        const updatePayload = mockQuoteUpdate.mock.calls[0]?.[0]?.data;
        expect(updatePayload.supplementaryInfo.attachments).toEqual([
            "quotes/bl-2026.pdf",
        ]);
        expect(updatePayload.supplementaryInfo.pricingBreakdown).toEqual(
            existingSupplementaryInfo.pricingBreakdown
        );
        expect(
            updatePayload.supplementaryInfo.partnerAssignment.hbcMarginFcfa
        ).toBe(250_000);
        expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/quotes/quote-2");
    });

    it("hides internal partner margin and dispatch audit entries from client quote detail", async () => {
        mockRequireQuoteOwnershipOrAdmin.mockResolvedValue({
            user: { id: "client-1", email: "client@example.com" },
        });
        mockQuoteFindUnique.mockResolvedValue({
            id: "quote-3",
            trackingCode: "HBC-2026-0001",
            userId: "client-1",
            date: new Date("2026-11-25T10:00:00Z"),
            clientName: "Client Test",
            email: "client@example.com",
            phone: "+2250700000000",
            itemType: "Conteneur 40 pieds",
            pickupLocation: "Port d'Abidjan",
            dropoffLocation: "Yopougon",
            transportDate: new Date("2026-11-27T08:00:00Z"),
            status: "VALIDATED",
            amount: "1 000 000 FCFA",
            userNotes: null,
            cancellationReason: null,
            cancelledAt: null,
            vehicleQuantity: 1,
            vehicle: null,
            supportThread: null,
            history: [
                {
                    id: "h-1",
                    action: "Création",
                    description: "Devis créé via le formulaire web",
                    timestamp: new Date("2026-11-25T10:00:00Z"),
                    user: "Système",
                },
                {
                    id: "h-2",
                    action: "Partenaire affecté",
                    description:
                        "Abidjan Fret Express — Net partenaire : 750 000 FCFA • Marge HBC : 250 000 FCFA",
                    timestamp: new Date("2026-11-25T10:30:00Z"),
                    user: "Admin HBC",
                },
                {
                    id: "h-3",
                    action: "Fiche mission envoyée au partenaire",
                    description:
                        "Ordre de mission transmis à Abidjan Fret Express (ops@afret.ci)",
                    timestamp: new Date("2026-11-25T10:35:00Z"),
                    user: "Admin HBC",
                },
            ],
        });

        const res = await getClientQuoteDetailAction("quote-3");

        expect(res.error).toBeNull();
        expect(res.data?.history).toHaveLength(1);
        expect(res.data?.history[0]?.action).toBe("Création");
    });
});
