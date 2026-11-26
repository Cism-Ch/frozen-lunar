import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { NewsletterStatus } from "@prisma/client";

const {
    mockCheckRateLimit,
    mockRequireAdmin,
    mockFindUnique,
    mockCreate,
    mockUpdate,
    mockFindMany,
    mockRevalidatePath,
    mockSendTransactionalEmail,
    mockIsAnyEmailProviderConfigured,
} = vi.hoisted(() => ({
    mockCheckRateLimit: vi.fn(),
    mockRequireAdmin: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockFindMany: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockSendTransactionalEmail: vi.fn(),
    mockIsAnyEmailProviderConfigured: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/rate-limit", () => ({
    checkRateLimit: mockCheckRateLimit,
}));

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock("@/lib/prisma", () => {
    const prismaMock = {
        newsletterSubscriber: {
            findUnique: mockFindUnique,
            create: mockCreate,
            update: mockUpdate,
            findMany: mockFindMany,
        },
    };
    return { default: prismaMock, prisma: prismaMock };
});

vi.mock("@/lib/email", () => ({
    EMAIL_SENDER: "contact@hbc-logistique.com",
    isAnyEmailProviderConfigured: mockIsAnyEmailProviderConfigured,
    sendTransactionalEmail: mockSendTransactionalEmail,
}));

import {
    subscribeNewsletterAction,
    sendNewsletterCampaignAction,
} from "@/app/actions/newsletter-actions";
import { GET as unsubscribeGET } from "@/app/api/newsletter/unsubscribe/route";

describe("Sprint 44: End-to-End Newsletter System", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCheckRateLimit.mockResolvedValue({ allowed: true });
        mockIsAnyEmailProviderConfigured.mockReturnValue(true);
        mockSendTransactionalEmail.mockResolvedValue({
            data: { id: "em-1" },
            error: null,
            provider: "gmail_smtp",
        });
    });

    it("subscribes a new email and sends welcome email with 1-click unsubscribe link", async () => {
        mockFindUnique.mockResolvedValue(null);
        mockCreate.mockResolvedValue({
            id: "sub-1",
            email: "client@abidjan.ci",
            status: NewsletterStatus.ACTIVE,
            unsubscribeToken: "tok_1234567890abcdef1234567890",
        });

        const res = await subscribeNewsletterAction({
            email: "CLIENT@ABIDJAN.CI",
            source: "footer",
        });

        expect(res.error).toBeNull();
        expect(res.data?.subscribed).toBe(true);
        expect(res.data?.alreadySubscribed).toBe(false);
        expect(mockSendTransactionalEmail).toHaveBeenCalledTimes(1);
        const call = mockSendTransactionalEmail.mock.calls[0]?.[0];
        expect(call.to).toEqual(["client@abidjan.ci"]);
        expect(call.html).toContain("/api/newsletter/unsubscribe?token=tok_1234567890abcdef1234567890");
    });

    it("handles duplicate active subscription idempotently without re-sending welcome email", async () => {
        mockFindUnique.mockResolvedValue({
            id: "sub-1",
            email: "client@abidjan.ci",
            status: NewsletterStatus.ACTIVE,
            unsubscribeToken: "tok_existing",
        });

        const res = await subscribeNewsletterAction({
            email: "client@abidjan.ci",
        });

        expect(res.error).toBeNull();
        expect(res.data?.alreadySubscribed).toBe(true);
        expect(mockCreate).not.toHaveBeenCalled();
        expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
    });

    it("unsubscribes subscriber via GET /api/newsletter/unsubscribe with no-store header", async () => {
        mockFindUnique.mockResolvedValue({
            id: "sub-1",
            email: "client@abidjan.ci",
            status: NewsletterStatus.ACTIVE,
            unsubscribeToken: "valid_token_1234567890",
        });
        mockUpdate.mockResolvedValue({
            id: "sub-1",
            status: NewsletterStatus.UNSUBSCRIBED,
        });

        const req = new NextRequest(
            "http://localhost:3000/api/newsletter/unsubscribe?token=valid_token_1234567890"
        );
        const res = await unsubscribeGET(req);

        expect(res.status).toBe(200);
        expect(res.headers.get("cache-control")).toBe("no-store");
        expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it("sends a branded campaign to all active subscribers", async () => {
        mockRequireAdmin.mockResolvedValue({
            id: "admin-1",
            email: "admin@hbc-logistique.com",
        });
        mockFindMany.mockResolvedValue([
            {
                id: "sub-1",
                email: "a@ci.com",
                status: NewsletterStatus.ACTIVE,
                unsubscribeToken: "tok_a_1234567890123456",
            },
            {
                id: "sub-2",
                email: "b@ci.com",
                status: NewsletterStatus.ACTIVE,
                unsubscribeToken: "tok_b_1234567890123456",
            },
        ]);

        const res = await sendNewsletterCampaignAction({
            subject: "Nouveaux porte-chars disponibles",
            body: "Bonjour à tous, deux nouveaux porte-chars sont disponibles dès lundi à Abidjan.",
        });

        expect(res.error).toBeNull();
        expect(res.data).toEqual({
            sentCount: 2,
            failedCount: 0,
            totalActive: 2,
        });
        expect(mockSendTransactionalEmail).toHaveBeenCalledTimes(2);
    });
});
