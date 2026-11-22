import { describe, it, expect, vi, beforeEach } from "vitest";

const { getSessionMock } = vi.hoisted(() => ({
    getSessionMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    auth: {
        api: {
            getSession: getSessionMock,
        },
    },
}));

vi.mock("@/lib/prisma", () => ({
    default: {
        quote: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        quoteHistory: {
            create: vi.fn(),
        },
        supportThread: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        supportMessage: {
            create: vi.fn(),
        },
        $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    },
}));

import prisma from "@/lib/prisma";
import { requireQuoteOwnershipOrAdmin } from "@/lib/auth-guard";
import { getClientQuoteDetailAction } from "@/app/actions/client-space-actions";
import { sendThreadMessageAction } from "@/app/actions/thread-actions";

describe("Client Space Strict IDOR Isolation & Hybrid AI + Human Chat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("blocks IDOR access when User A attempts to read User B's quote", async () => {
        getSessionMock.mockResolvedValue({
            user: {
                id: "user-a",
                email: "usera@entreprise.ci",
                role: "user",
            },
        });

        await expect(
            requireQuoteOwnershipOrAdmin("user-b", "userb@autre.ci")
        ).rejects.toThrow(/IDOR/);

        vi.mocked(prisma.quote.findUnique).mockResolvedValue({
            id: "quote-b",
            userId: "user-b",
            email: "userb@autre.ci",
        } as never);

        const res = await getClientQuoteDetailAction("quote-b");
        expect(res.data).toBeNull();
        expect(res.error).toMatch(/IDOR/);
    });

    it("allows legitimate owner (userId === session.user.id) and admin role", async () => {
        getSessionMock.mockResolvedValue({
            user: {
                id: "user-a",
                email: "usera@entreprise.ci",
                role: "user",
            },
        });

        const ownerCheck = await requireQuoteOwnershipOrAdmin(
            "user-a",
            "usera@entreprise.ci"
        );
        expect(ownerCheck.isAdmin).toBe(false);
        expect(ownerCheck.user.id).toBe("user-a");

        getSessionMock.mockResolvedValue({
            user: {
                id: "admin-1",
                email: "admin@hbclogistique.ci",
                role: "admin",
            },
        });

        const adminCheck = await requireQuoteOwnershipOrAdmin(
            "user-b",
            "userb@autre.ci"
        );
        expect(adminCheck.isAdmin).toBe(true);
    });

    it("automatically transitions thread to HUMAN_TAKEOVER when an admin validator replies", async () => {
        getSessionMock.mockResolvedValue({
            user: {
                id: "admin-1",
                name: "Validateur Abidjan",
                email: "admin@hbclogistique.ci",
                role: "admin",
            },
        });

        vi.mocked(prisma.quote.findUnique).mockResolvedValue({
            id: "quote-1",
            userId: "user-a",
            clientName: "SOGB CI",
            email: "usera@entreprise.ci",
        } as never);

        vi.mocked(prisma.supportThread.findUnique)
            .mockResolvedValueOnce({
                id: "thread-1",
                quoteId: "quote-1",
                status: "AI_ACTIVE",
                assignedTo: null,
            } as never)
            .mockResolvedValueOnce({
                id: "thread-1",
                quoteId: "quote-1",
                status: "HUMAN_TAKEOVER",
                assignedTo: "Validateur Abidjan",
                messages: [
                    {
                        id: "msg-1",
                        threadId: "thread-1",
                        senderRole: "ADMIN",
                        senderName: "Validateur Abidjan (Validation)",
                        content: "Bonjour, votre porte-char est confirmé.",
                        createdAt: new Date("2026-11-22T12:00:00Z"),
                    },
                ],
            } as never);

        const res = await sendThreadMessageAction({
            quoteId: "quote-1",
            content: "Bonjour, votre porte-char est confirmé.",
        });

        expect(res.error).toBeNull();
        expect(res.data?.status).toBe("HUMAN_TAKEOVER");
        expect(prisma.supportThread.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "thread-1" },
                data: expect.objectContaining({
                    status: "HUMAN_TAKEOVER",
                }),
            })
        );
    });
});
