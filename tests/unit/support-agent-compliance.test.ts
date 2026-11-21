import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildCompliantSupportSystemPrompt } from "@/lib/support-agent/knowledge";
import { COMPANY_CONFIG } from "@/lib/company-config";

vi.mock("@/lib/prisma", () => ({
    default: {
        quote: {
            findFirst: vi.fn(),
        },
        systemSettings: {
            findUnique: vi.fn(),
        },
        contactMessage: {
            create: vi.fn(),
        },
    },
}));

import prisma from "@/lib/prisma";
import {
    lookupQuoteStatusTool,
    getCompanyInfoTool,
    escalateSupportTicketTool,
} from "@/lib/support-agent/tools";

describe("Compliant Support Agent (Côte d'Ivoire - ARTCI / OHADA)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("injecte les coordonnées Côte d'Ivoire, la devise FCFA et les garde-fous ARTCI/OHADA", () => {
        const prompt = buildCompliantSupportSystemPrompt();

        expect(prompt).toContain("Côte d'Ivoire");
        expect(prompt).toContain("FCFA");
        expect(prompt).toContain("ARTCI");
        expect(prompt).toContain("OHADA");
        expect(prompt).toContain("2013-450");
        expect(prompt).toContain(COMPANY_CONFIG.address.city);
    });

    it("refuse de divulguer un devis si l'email ou le téléphone ne correspond pas (anti-fuite PII)", async () => {
        vi.mocked(prisma.quote.findFirst).mockResolvedValue({
            id: "HBC-2026-001",
            email: "vrai.client@entreprise.ci",
            phone: "+225 07 11 22 33 44",
            status: "VALIDATED",
            itemType: "Container 40ft",
            pickupLocation: "Port Autonome d'Abidjan",
            dropoffLocation: "Yamoussoukro",
            transportDate: new Date("2026-08-10T08:00:00.000Z"),
        } as never);

        const result = await lookupQuoteStatusTool({
            reference: "HBC-2026-001",
            emailOrPhone: "intrus@autre.ci",
        });

        expect(result.success).toBe(false);
    });

    it("retourne le statut du devis après vérification d'identité réussie", async () => {
        vi.mocked(prisma.quote.findFirst).mockResolvedValue({
            id: "HBC-2026-001",
            email: "vrai.client@entreprise.ci",
            phone: "+225 07 11 22 33 44",
            status: "VALIDATED",
            itemType: "Container 40ft",
            pickupLocation: "Port Autonome d'Abidjan",
            dropoffLocation: "Yamoussoukro",
            transportDate: new Date("2026-08-10T08:00:00.000Z"),
        } as never);

        const result = await lookupQuoteStatusTool({
            reference: "HBC-2026-001",
            emailOrPhone: "07 11 22 33 44",
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.status).toBe("VALIDATED");
            expect(result.data.pickupLocation).toBe("Port Autonome d'Abidjan");
        }
    });

    it("retourne les infos Côte d'Ivoire par défaut si SystemSettings est indisponible", async () => {
        vi.mocked(prisma.systemSettings.findUnique).mockRejectedValue(
            new Error("DB offline")
        );

        const info = await getCompanyInfoTool();
        expect(info.success).toBe(true);
        if (info.success) {
            expect(info.data.currency).toContain("FCFA");
            expect(info.data.phone).toContain("+225");
        }
    });

    it("crée un vrai ticket d'escalade dans ContactMessage", async () => {
        vi.mocked(prisma.contactMessage.create).mockResolvedValue({
            id: "msg-ci-999",
        } as never);

        const ticket = await escalateSupportTicketTool({
            clientName: "Kouassi Yao",
            email: "k.yao@btp-ci.example.ci",
            phone: "+225 07 99 88 77 66",
            summary:
                "Demande d'escorte pour convoi exceptionnel Abidjan vers Korhogo.",
        });

        expect(ticket.success).toBe(true);
        if (ticket.success) {
            expect(ticket.data.ticketId).toBe("msg-ci-999");
        }
    });
});
