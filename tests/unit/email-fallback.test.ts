import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockResendSend, mockSendMail, mockCreateTransport } = vi.hoisted(() => {
    const mockSendMail = vi.fn();
    return {
        mockResendSend: vi.fn(),
        mockSendMail,
        mockCreateTransport: vi.fn(() => ({
            sendMail: mockSendMail,
        })),
    };
});

vi.mock("resend", () => ({
    Resend: class {
        emails = {
            send: mockResendSend,
        };
    },
}));

vi.mock("nodemailer", () => ({
    default: {
        createTransport: mockCreateTransport,
    },
}));

describe("Email Cascade (Resend -> Gmail SMTP Fallback)", () => {
    const origEnv = { ...process.env };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...origEnv };
    });

    afterEach(() => {
        process.env = origEnv;
    });

    it("envoie via Resend en priorité lorsque Resend réussit", async () => {
        process.env.RESEND_KEY = "re_live_valid_key_123456";
        process.env.GMAIL_USER = "test@gmail.com";
        process.env.GMAIL_APP_PASSWORD = "abcd efgh ijkl mnop";

        mockResendSend.mockResolvedValueOnce({
            data: { id: "re_msg_1" },
            error: null,
        });

        const { sendTransactionalEmail } = await import("@/lib/email");
        const res = await sendTransactionalEmail({
            to: "client@example.ci",
            subject: "Test Resend",
            html: "<p>Bonjour</p>",
        });

        expect(res.provider).toBe("resend");
        expect(res.data?.id).toBe("re_msg_1");
        expect(res.error).toBeNull();
        expect(mockCreateTransport).not.toHaveBeenCalled();
    });

    it("bascule automatiquement sur Gmail SMTP si Resend bloque (onboarding@resend.dev)", async () => {
        process.env.RESEND_KEY = "re_live_valid_key_123456";
        process.env.GMAIL_USER = "hbc.test@gmail.com";
        process.env.GMAIL_APP_PASSWORD = "abcd efgh ijkl mnop";

        mockResendSend.mockResolvedValueOnce({
            data: null,
            error: {
                message:
                    "You can only send testing emails to your own email address",
            },
        });
        mockSendMail.mockResolvedValueOnce({ messageId: "<gmail-123@gmail.com>" });

        const { sendTransactionalEmail } = await import("@/lib/email");
        const res = await sendTransactionalEmail({
            to: "premier.client@entreprise.ci",
            subject: "Confirmation devis HBC-2026-1001",
            html: "<p>Devis confirmé</p>",
        });

        expect(res.provider).toBe("gmail_smtp");
        expect(res.data?.id).toBe("<gmail-123@gmail.com>");
        expect(res.error).toBeNull();
        expect(mockCreateTransport).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledTimes(1);
    });
});
