import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPresignedUploadUrlAction } from "@/app/actions/upload-management";

describe("Upload Management Server Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should generate a presigned upload URL for valid file input", async () => {
        const input = {
            fileName: "plan-chantier.pdf",
            fileType: "application/pdf",
            fileSize: 1024 * 1024, // 1 MB
            folder: "attachments",
        };

        const result = await getPresignedUploadUrlAction(input);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.uploadUrl).toBeDefined();
            expect(result.publicUrl).toBeDefined();
            expect(result.key).toContain("attachments/");
            expect(result.key).toContain("plan-chantier.pdf");
        }
    });

    it("should reject files with unallowed MIME types (e.g. exe)", async () => {
        const input = {
            fileName: "malware.exe",
            fileType: "application/x-msdownload",
            fileSize: 5000,
        };

        const result = await getPresignedUploadUrlAction(input);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain("Format de fichier non autorisé");
        }
    });

    it("should reject files exceeding max file size limit (10MB)", async () => {
        const input = {
            fileName: "large-video.mp4",
            fileType: "image/png",
            fileSize: 15 * 1024 * 1024, // 15 MB
        };

        const result = await getPresignedUploadUrlAction(input);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain("dépasser 10 Mo");
        }
    });
});
