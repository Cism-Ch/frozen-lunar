import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    mockCheckRateLimit,
    mockContactCreate,
    mockRevalidatePath,
    mockSendTransactionalEmail,
    mockIsAnyEmailProviderConfigured,
    mockIsGmailFallbackConfigured,
    mockNodemailerVerify,
} = vi.hoisted(() => ({
    mockCheckRateLimit: vi.fn(),
    mockContactCreate: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockSendTransactionalEmail: vi.fn(),
    mockIsAnyEmailProviderConfigured: vi.fn(),
    mockIsGmailFallbackConfigured: vi.fn(),
    mockNodemailerVerify: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/rate-limit", () => ({
    checkRateLimit: mockCheckRateLimit,
}));

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
    const prismaMock = {
        contactMessage: {
            create: mockContactCreate,
        },
        $queryRaw: vi.fn(),
    };
    return { default: prismaMock, prisma: prismaMock };
});

vi.mock("@/lib/email", () => ({
    EMAIL_SENDER: "contact@hbc-logistique.com",
    isAnyEmailProviderConfigured: mockIsAnyEmailProviderConfigured,
    isGmailFallbackConfigured: mockIsGmailFallbackConfigured,
    isResendConfigured: vi.fn(() => false),
    sendTransactionalEmail: mockSendTransactionalEmail,
}));

vi.mock("nodemailer", () => ({
    default: {
        createTransport: vi.fn(() => ({
            verify: mockNodemailerVerify,
        })),
    },
}));

vi.mock("@/lib/redis", () => ({
    redis: {
        ping: vi.fn(),
        get: vi.fn(),
        set: vi.fn(),
    },
    resolveUpstashRedisConfig: vi.fn(() => ({ isConfigured: false })),
}));

vi.mock("@/lib/storage", () => ({
    s3Client: { send: vi.fn() },
}));

import { sendContactMessageAction } from "@/app/actions/contact";
import { getSystemHealthReport } from "@/lib/health-check";

describe("Sprint 42: Contact Email Delivery & Gmail SMTP Uptime Probe", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCheckRateLimit.mockResolvedValue({ allowed: true });
        mockIsAnyEmailProviderConfigured.mockReturnValue(true);
        mockSendTransactionalEmail.mockResolvedValue({
            data: { id: "msg-1" },
            error: null,
            provider: "gmail_smtp",
        });
    });

    it("persists contact message and sends both admin and visitor emails with escaped HTML", async () => {
        mockContactCreate.mockResolvedValue({ id: "cm-123" });

        const res = await sendContactMessageAction({
            firstName: "Awa",
            lastName: "Koné",
            email: "AWA@EXAMPLE.COM",
            phone: "+225 07 01 02 03 04",
            message: "Bonjour <script>alert(1)</script>, besoin d'un porte-char.",
        });

        expect(res.error).toBeNull();
        expect(res.data?.success).toBe(true);
        expect(res.data?.id).toBe("cm-123");

        expect(mockSendTransactionalEmail).toHaveBeenCalledTimes(2);
        const adminCall = mockSendTransactionalEmail.mock.calls[0]?.[0];
        const visitorCall = mockSendTransactionalEmail.mock.calls[1]?.[0];

        expect(adminCall.replyTo).toBe("awa@example.com");
        expect(adminCall.subject).toContain("Awa Koné");
        expect(adminCall.html).not.toContain("<script>");
        expect(adminCall.html).toContain("&lt;script&gt;");

        expect(visitorCall.to).toEqual(["awa@example.com"]);
        expect(visitorCall.subject).toContain("Accusé de réception");
    });

    it("includes live gmail-smtp service status in getSystemHealthReport", async () => {
        const prevUser = process.env.GMAIL_USER;
        const prevPass = process.env.GMAIL_APP_PASSWORD;
        process.env.GMAIL_USER = "alerts@gmail.com";
        process.env.GMAIL_APP_PASSWORD = "abcd efgh ijkl mnop";

        mockIsGmailFallbackConfigured.mockReturnValue(true);
        mockNodemailerVerify.mockResolvedValue(true);

        const report = await getSystemHealthReport({
            bypassCache: true,
            triggerAlerts: false,
        });

        const gmailSvc = report.services.find((s) => s.id === "gmail-smtp");
        expect(gmailSvc).toBeDefined();
        expect(gmailSvc?.status).toBe("operational");
        expect(gmailSvc?.category).toBe("messaging");
        expect(mockNodemailerVerify).toHaveBeenCalledTimes(1);

        process.env.GMAIL_USER = prevUser;
        process.env.GMAIL_APP_PASSWORD = prevPass;
    });
});
