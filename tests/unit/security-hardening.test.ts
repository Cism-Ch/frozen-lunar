import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyFileMagicBytes } from "@/lib/file-signature";
import { resolveAttachmentProxyUrl } from "@/lib/attachment-url";

const { mockRequireAdmin } = vi.hoisted(() => ({
    mockRequireAdmin: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock("@/lib/rate-limit", () => ({
    checkRateLimit: vi.fn().mockResolvedValue({
        allowed: true,
        remaining: 20,
        retryAfterSeconds: 0,
    }),
}));

vi.mock("@/lib/storage", () => ({
    getUploadUrl: vi.fn().mockResolvedValue("https://s3.mock/upload"),
    getPublicUrl: vi.fn().mockReturnValue("https://s3.mock/public"),
    getPrivateDownloadUrl: vi.fn().mockResolvedValue("https://s3.mock/signed"),
}));

import {
    getPresignedUploadUrlAction,
    getKycDocumentSignedUrlAction,
} from "@/app/actions/upload-management";

describe("Defensive Security Hardening (Sprint 24)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Binary Magic-Byte Verification (Anti-MIME Spoofing)", () => {
        it("accepte un vrai PDF, PNG, JPEG et WEBP", () => {
            expect(
                verifyFileMagicBytes(Buffer.from("%PDF-1.7\n..."), "application/pdf")
            ).toBe(true);
            expect(
                verifyFileMagicBytes(
                    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
                    "image/png"
                )
            ).toBe(true);
            expect(
                verifyFileMagicBytes(
                    Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]),
                    "image/jpeg"
                )
            ).toBe(true);
            expect(
                verifyFileMagicBytes(
                    Buffer.from("RIFF1234WEBP...."),
                    "image/webp"
                )
            ).toBe(true);
        });

        it("rejette un fichier HTML/JS déguisé en image/png ou application/pdf", () => {
            const fakeHtml = Buffer.from("<html><script>alert(1)</script></html>");
            expect(verifyFileMagicBytes(fakeHtml, "image/png")).toBe(false);
            expect(verifyFileMagicBytes(fakeHtml, "application/pdf")).toBe(false);
            expect(verifyFileMagicBytes(fakeHtml, "image/jpeg")).toBe(false);
            expect(verifyFileMagicBytes(fakeHtml, "image/webp")).toBe(false);
        });
    });

    describe("Upload Authorization & Path Traversal Defenses", () => {
        it("bloque un non-admin tentant d'obtenir une URL presigned pour fleet-images", async () => {
            mockRequireAdmin.mockRejectedValueOnce(new Error("Accès administrateur requis"));
            const res = await getPresignedUploadUrlAction({
                fileName: "truck.png",
                fileType: "image/png",
                fileSize: 1024,
                folder: "fleet-images",
            });
            expect(res.success).toBe(false);
            expect(res.error).toContain("administrateur");
        });

        it("bloque toute tentative de path traversal sur getKycDocumentSignedUrlAction", async () => {
            mockRequireAdmin.mockResolvedValueOnce({ id: "adm-1", role: "admin" });
            const res = await getKycDocumentSignedUrlAction(
                "partners-kyc/../../etc/passwd"
            );
            expect(res.data).toBeNull();
            expect(res.error).toBeTruthy();
        });

        it("résout les pièces jointes via le proxy authentifié et rejette les traversées / préfixes interdits", () => {
            expect(
                resolveAttachmentProxyUrl(
                    "https://bucket.fly.storage.tigris.dev/quotes-uploads/1700_plan.pdf",
                    false
                )
            ).toBe("/api/attachments/quotes-uploads/1700_plan.pdf");

            expect(
                resolveAttachmentProxyUrl("attachments/doc_1.png", true)
            ).toBe("/api/attachments/attachments/doc_1.png?download=1");

            expect(
                resolveAttachmentProxyUrl("quotes-uploads/../secret.env", true)
            ).toBeNull();

            expect(
                resolveAttachmentProxyUrl("fleet-images/camion.webp", false)
            ).toBeNull();
        });
    });
});
