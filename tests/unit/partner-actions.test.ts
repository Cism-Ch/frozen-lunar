import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: vi.fn().mockResolvedValue({
        id: "admin-1",
        email: "admin@hbclogistique.ci",
        role: "admin",
    }),
}));

vi.mock("@/lib/prisma", () => ({
    default: {
        partnerApplication: {
            create: vi.fn().mockResolvedValue({
                id: "prt-123",
                companyName: "Ivoire Trans-BTP SARL",
            }),
            findMany: vi.fn().mockResolvedValue([]),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

import {
    resetPartnerRateLimitForTest,
    submitPartnerApplicationAction,
} from "@/app/actions/partner-actions";
import {
    getKycDocumentSignedUrlAction,
    getPresignedUploadUrlAction,
} from "@/app/actions/upload-management";

describe("Africa Partner Onboarding & Private KYC Security", () => {
    beforeEach(() => {
        resetPartnerRateLimitForTest();
    });

    it("accepts a valid UEMOA/CEDEAO partner application with private partners-kyc keys", async () => {
        const res = await submitPartnerApplicationAction({
            companyName: "Ivoire Trans-BTP SARL",
            rccmNumber: "CI-ABJ-03-2024-B12-00145",
            nccNumber: "2401589-K",
            country: "Côte d'Ivoire",
            city: "Abidjan - Yopougon",
            contactName: "Kouassi Yao",
            email: "exploitation@ivoiretrans.ci",
            phone: "+225 07 08 09 10 11",
            fleetCategories: ["Bennes & Matériaux BTP"],
            fleetSummary: "4 Camions Bennes Sinotruk 6x4 et 1 Porte-char 60T",
            totalVehicles: 5,
            operatingZones: ["Grand Abidjan & Zones Industrielles"],
            kycDocumentKeys: ["partners-kyc/1700000_rccm.pdf"],
            acceptOhadaCharter: true,
        });

        expect(res.error).toBeNull();
        expect(res.data?.id).toBe("prt-123");
    });

    it("rejects KYC document keys outside the private partners-kyc folder or containing path traversal", async () => {
        const res = await submitPartnerApplicationAction({
            companyName: "Ivoire Trans-BTP SARL",
            rccmNumber: "CI-ABJ-03-2024-B12-00145",
            country: "Côte d'Ivoire",
            city: "Abidjan",
            contactName: "Kouassi Yao",
            email: "exploitation@ivoiretrans.ci",
            phone: "+225 07 08 09 10 11",
            fleetCategories: ["Bennes & Matériaux BTP"],
            fleetSummary: "4 Camions Bennes Sinotruk 6x4",
            totalVehicles: 4,
            operatingZones: ["Grand Abidjan & Zones Industrielles"],
            kycDocumentKeys: ["attachments/../secret.pdf"],
            acceptOhadaCharter: true,
        });

        expect(res.data).toBeNull();
        expect(res.error).toContain("KYC");
    });

    it("never exposes a publicUrl when generating an upload URL for partners-kyc", async () => {
        const upload = await getPresignedUploadUrlAction({
            fileName: "rccm-ci.pdf",
            fileType: "application/pdf",
            fileSize: 250000,
            folder: "partners-kyc",
        });

        expect(upload.success).toBe(true);
        if (upload.success) {
            expect(upload.publicUrl).toBeNull();
            expect(upload.key).toMatch(/^partners-kyc\//);
        }
    });

    it("generates a 300s signed download URL for admin KYC review and blocks non-KYC keys", async () => {
        const valid = await getKycDocumentSignedUrlAction(
            "partners-kyc/1700000_rccm.pdf"
        );
        expect(valid.error).toBeNull();
        expect(valid.data?.expiresInSeconds).toBe(300);

        const invalid = await getKycDocumentSignedUrlAction(
            "attachments/public.pdf"
        );
        expect(invalid.data).toBeNull();
        expect(invalid.error).toContain("partners-kyc");
    });
});
