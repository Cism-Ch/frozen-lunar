import { describe, expect, it } from "vitest";
import {
    canSendKycReminder,
    computeOverallKycStatus,
    parseProfileStorage,
    serializeProfileStorage,
    type ClientKycState,
} from "@/lib/client-kyc";

describe("Client KYC Domain Logic (Sprint 37)", () => {
    it("reads legacy address arrays and enriched address+kyc envelopes cleanly", () => {
        const legacy = parseProfileStorage([
            { label: "Dépôt Vridi", address: "Zone Industrielle Vridi, Abidjan" },
        ]);
        expect(legacy.addresses).toHaveLength(1);
        expect(legacy.kyc.documents).toHaveLength(0);

        const serialized = serializeProfileStorage(legacy.addresses, {
            documents: [
                {
                    docType: "identity_card",
                    fileKey: "partners-kyc/1700_cni.pdf",
                    fileName: "cni.pdf",
                    status: "PENDING",
                    uploadedAt: "2026-11-25T08:00:00.000Z",
                },
            ],
            lastReminderAt: null,
        });
        const reparsed = parseProfileStorage(serialized);
        expect(reparsed.addresses).toHaveLength(1);
        expect(reparsed.kyc.documents[0]?.docType).toBe("identity_card");
    });

    it("enforces strict 1/day (24h) cooldown on KYC validation reminders", () => {
        const now = new Date("2026-11-25T12:00:00.000Z");

        // No pending doc -> blocked
        expect(
            canSendKycReminder({ documents: [], lastReminderAt: null }, now)
                .allowed
        ).toBe(false);

        const pendingKyc: ClientKycState = {
            documents: [
                {
                    docType: "identity_card",
                    fileKey: "partners-kyc/1700_cni.pdf",
                    fileName: "cni.pdf",
                    status: "PENDING",
                    uploadedAt: "2026-11-25T08:00:00.000Z",
                },
            ],
            lastReminderAt: null,
        };

        // First reminder -> allowed
        expect(canSendKycReminder(pendingKyc, now).allowed).toBe(true);

        // 5 hours later -> blocked (19h remaining)
        const recentCheck = canSendKycReminder(
            { ...pendingKyc, lastReminderAt: "2026-11-25T07:00:00.000Z" },
            now
        );
        expect(recentCheck.allowed).toBe(false);
        expect(recentCheck.remainingHours).toBe(19);

        // 25 hours later -> allowed again
        const afterCooldown = canSendKycReminder(
            { ...pendingKyc, lastReminderAt: "2026-11-24T11:00:00.000Z" },
            now
        );
        expect(afterCooldown.allowed).toBe(true);
    });

    it("computes overall KYC status per profile type (INDIVIDUAL vs COMPANY)", () => {
        expect(
            computeOverallKycStatus("INDIVIDUAL", [
                {
                    docType: "identity_card",
                    fileKey: "partners-kyc/cni.pdf",
                    fileName: "cni.pdf",
                    status: "APPROVED",
                    uploadedAt: "2026-11-25T08:00:00.000Z",
                },
            ])
        ).toBe("VERIFIED");

        // Company requires manager_id + rccm + dfe_ncc
        expect(
            computeOverallKycStatus("COMPANY", [
                {
                    docType: "manager_id",
                    fileKey: "partners-kyc/cni.pdf",
                    fileName: "cni.pdf",
                    status: "APPROVED",
                    uploadedAt: "2026-11-25T08:00:00.000Z",
                },
                {
                    docType: "rccm",
                    fileKey: "partners-kyc/rccm.pdf",
                    fileName: "rccm.pdf",
                    status: "PENDING",
                    uploadedAt: "2026-11-25T08:00:00.000Z",
                },
            ])
        ).toBe("PENDING");
    });
});
