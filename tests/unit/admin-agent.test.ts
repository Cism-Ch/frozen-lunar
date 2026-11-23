import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

const { requireAdminMock } = vi.hoisted(() => ({
    requireAdminMock: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: requireAdminMock,
}));

vi.mock("@/lib/prisma", () => ({
    default: {
        quote: {
            findMany: vi.fn().mockResolvedValue([
                {
                    id: "q-1",
                    trackingCode: "HBC-2026-4K8M",
                    clientName: "Client Test",
                    itemType: "Containers",
                    pickupLocation: "Abidjan",
                    dropoffLocation: "San-Pédro",
                    status: "PENDING",
                    amount: "À calculer",
                    cancellationReason: null,
                },
            ]),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        quoteHistory: {
            create: vi.fn(),
        },
        vehicle: {
            findMany: vi.fn().mockResolvedValue([
                {
                    id: "v-1",
                    slug: "bus-64-places",
                    name: "Bus 64 places Grand Tourisme",
                    availableQuantity: 2,
                    totalQuantity: 3,
                    dailyRateFcfa: 250000,
                },
            ]),
            findUnique: vi.fn().mockResolvedValue({
                id: "v-1",
                name: "Bus 64 places Grand Tourisme",
                availableQuantity: 2,
                totalQuantity: 3,
            }),
            update: vi.fn().mockResolvedValue({
                id: "v-1",
                name: "Bus 64 places Grand Tourisme",
                availableQuantity: 3,
                totalQuantity: 3,
            }),
        },
        partnerApplication: {
            findMany: vi.fn().mockResolvedValue([]),
            update: vi.fn(),
        },
    },
}));

import prisma from "@/lib/prisma";
import {
    askAdminCopilotAction,
    executeAdminCopilotAction,
} from "@/app/actions/admin-agent-actions";

describe("Admin AI Copilot Security & Execution", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        requireAdminMock.mockResolvedValue({
            id: "admin-1",
            name: "Admin HBC",
            email: "admin@hbclogistique.ci",
            role: "admin",
        });
    });

    it("blocks non-admin callers on both ask and execute endpoints", async () => {
        requireAdminMock.mockRejectedValueOnce(
            new Error("Accès refusé. Rôle administrateur requis.")
        );

        const res = await askAdminCopilotAction({
            prompt: "Fais-moi un résumé du jour",
        });
        expect(res.data).toBeNull();
        expect(res.error).toContain("administrateur");
    });

    it("returns an instant operational summary without mutating the database", async () => {
        const res = await askAdminCopilotAction({
            prompt: "Fais-moi un résumé du jour",
        });

        expect(res.error).toBeNull();
        expect(res.data?.reply).toContain("1 devis en attente");
        expect(res.data?.proposedAction).toBeNull();
        expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it("executes a confirmed write action via executeAdminCopilotAction after Zod validation", async () => {
        const res = await executeAdminCopilotAction({
            tool: "update_vehicle_stock",
            vehicleId: "v-1",
            availableQuantity: 3,
            summary: "Passer le stock du Bus 64 places à 3",
        });

        expect(res.error).toBeNull();
        expect(res.data?.message).toContain("Qté: 03 disponibles");
        expect(prisma.vehicle.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "v-1" },
                data: expect.objectContaining({ availableQuantity: 3 }),
            })
        );
    });
});
