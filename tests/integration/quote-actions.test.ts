import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    createQuoteAction,
    getQuotesAction,
} from "@/app/actions/quote-management";
import prisma from "@/lib/prisma";
import type { Quote, QuoteHistory } from "@prisma/client";

// Mock next/cache revalidatePath
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

// Mock Prisma client
vi.mock("@/lib/prisma", () => ({
    default: {
        quote: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        quoteHistory: {
            create: vi.fn(),
        },
    },
}));

describe("Quote Management Server Actions", () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe("createQuoteAction", () => {
        it("should successfully validate data, call prisma.quote.create, and return formatted quote", async () => {
            const mockQuoteFromDb = {
                id: "quote-123",
                date: new Date("2026-07-25T10:00:00Z"),
                clientName: "HBC Client",
                email: "client@hbc.com",
                phone: "0102030405",
                itemType: "Container 20ft",
                pickupLocation: "Abidjan Port",
                dropoffLocation: "Bouaké Zone Industrielle",
                transportDate: new Date("2026-08-01T00:00:00Z"),
                status: "PENDING",
                amount: "À calculer",
                userNotes: "Fragile",
                source: "FORM",
                supplementaryInfo: null,
            };

            vi.mocked(prisma.quote.create).mockResolvedValue(
                mockQuoteFromDb as unknown as Quote
            );
            vi.mocked(prisma.quoteHistory.create).mockResolvedValue({} as unknown as QuoteHistory);

            const input = {
                clientName: "HBC Client",
                email: "client@hbc.com",
                phone: "0102030405",
                itemType: "Container 20ft",
                pickupLocation: "Abidjan Port",
                dropoffLocation: "Bouaké Zone Industrielle",
                transportDate: "2026-08-01T00:00:00Z",
                userNotes: "Fragile",
                source: "form" as const,
            };

            const result = await createQuoteAction(input);

            expect(result.success).toBe(true);
            if (result.success && result.quote) {
                expect(result.quote.id).toBe("quote-123");
                expect(result.quote.client).toBe("HBC Client");
                expect(result.quote.status).toBe("En attente");
                expect(result.quote.source).toBe("form");
            }
            expect(prisma.quote.create).toHaveBeenCalledOnce();
            expect(prisma.quoteHistory.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    quoteId: "quote-123",
                    action: "Création",
                }),
            });
        });

        it("should return error when input data fails Zod validation (e.g. short phone number)", async () => {
            const invalidInput = {
                clientName: "HBC Client",
                email: "client@hbc.com",
                phone: "123", // Short phone number
                itemType: "Container",
                pickupLocation: "Abidjan",
                dropoffLocation: "Bouaké",
                transportDate: "2026-08-01",
            };

            const result = await createQuoteAction(invalidInput as unknown as Parameters<typeof createQuoteAction>[0]);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBeDefined();
            }
            expect(prisma.quote.create).not.toHaveBeenCalled();
        });
    });

    describe("getQuotesAction", () => {
        it("should fetch quotes from database and convert statuses to frontend format", async () => {
            const mockQuotes = [
                {
                    id: "q-1",
                    date: new Date("2026-07-25"),
                    clientName: "Client A",
                    email: "a@hbc.com",
                    phone: "0102030405",
                    itemType: "Matériaux",
                    pickupLocation: "Abidjan",
                    dropoffLocation: "Yamoussoukro",
                    transportDate: new Date("2026-08-05"),
                    status: "VALIDATED",
                    amount: "500 000 FCFA",
                    userNotes: null,
                    source: "CHAT",
                    supplementaryInfo: null,
                    history: [],
                },
            ];

            vi.mocked(prisma.quote.findMany).mockResolvedValue(
                mockQuotes as unknown as (Quote & { history: QuoteHistory[] })[]
            );

            const result = await getQuotesAction({ status: "Validé" });

            expect(result.success).toBe(true);
            if (result.success && result.quotes) {
                expect(result.quotes).toHaveLength(1);
                expect(result.quotes[0].status).toBe("Validé");
                expect(result.quotes[0].source).toBe("chat");
            }
        });
    });
});
