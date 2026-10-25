import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchAdminAction } from "@/app/actions/search-actions";
import {
    getNotificationsAction,
    getUnreadNotificationCountAction,
    markAllNotificationsAsReadAction,
} from "@/app/actions/notification-management";
import prisma from "@/lib/prisma";
import { QuoteStatus, ContactStatus } from "@prisma/client";

// Mock auth-guard
vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: vi.fn().mockResolvedValue({
        user: {
            id: "admin-1",
            role: "admin",
            email: "admin@hbclogistique.com",
        },
    }),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
    default: {
        quote: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
        contactMessage: {
            findMany: vi.fn(),
            count: vi.fn(),
            updateMany: vi.fn(),
            update: vi.fn(),
        },
    },
}));

describe("Admin Search & Live Notifications Server Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("searchAdminAction", () => {
        it("should return default navigation shortcuts when query is empty", async () => {
            const result = await searchAdminAction("");

            expect(result.error).toBeNull();
            expect(result.data).toBeDefined();
            expect(result.data?.quotes).toEqual([]);
            expect(result.data?.contacts).toEqual([]);
            expect(result.data?.navigation.length).toBeGreaterThan(0);
            expect(result.data?.navigation[0].title).toBe("Tableau de bord");
        });

        it("should perform multi-table search across quotes and contacts", async () => {
            const mockQuotes = [
                {
                    id: "quote-cuid-12345678",
                    clientName: "BTP Construction Abidjan",
                    email: "contact@btp-ci.com",
                    phone: "+2250701020304",
                    pickupLocation: "Port d'Abidjan",
                    dropoffLocation: "Zone Industrielle Yopougon",
                    itemType: "Container",
                    status: QuoteStatus.PENDING,
                    source: "WEB",
                    date: new Date("2026-10-21T10:00:00Z"),
                },
            ];

            const mockContacts = [
                {
                    id: "contact-1",
                    firstName: "Kouassi",
                    lastName: "Konan",
                    email: "k.konan@gmail.com",
                    phone: "0102030405",
                    message: "Besoin urgent d'un devis pour transport de grue.",
                    status: ContactStatus.UNREAD,
                    createdAt: new Date("2026-10-21T11:00:00Z"),
                },
            ];

            vi.mocked(prisma.quote.findMany).mockResolvedValue(
                mockQuotes as unknown as Awaited<
                    ReturnType<typeof prisma.quote.findMany>
                >
            );
            vi.mocked(prisma.contactMessage.findMany).mockResolvedValue(
                mockContacts as unknown as Awaited<
                    ReturnType<typeof prisma.contactMessage.findMany>
                >
            );

            const result = await searchAdminAction("Abidjan");

            expect(result.error).toBeNull();
            expect(result.data?.quotes.length).toBe(1);
            expect(result.data?.quotes[0].client).toBe(
                "BTP Construction Abidjan"
            );
            expect(result.data?.quotes[0].status).toBe("En attente");

            expect(result.data?.contacts.length).toBe(1);
            expect(result.data?.contacts[0].name).toBe("Kouassi Konan");
            expect(result.data?.contacts[0].status).toBe("Non lu");
        });

        it("should filter navigation shortcuts by title or description", async () => {
            vi.mocked(prisma.quote.findMany).mockResolvedValue([]);
            vi.mocked(prisma.contactMessage.findMany).mockResolvedValue([]);

            const result = await searchAdminAction("utilisateurs");

            expect(result.error).toBeNull();
            expect(
                result.data?.navigation.some((n) =>
                    n.title.includes("utilisateurs")
                )
            ).toBe(true);
        });
    });

    describe("getNotificationsAction", () => {
        it("should return real pending quotes and unread contact messages", async () => {
            const mockQuotes = [
                {
                    id: "quote-1",
                    clientName: "Société Ivoirienne de Ciment",
                    pickupLocation: "San Pedro",
                    dropoffLocation: "Bouaké",
                    itemType: "Matériaux",
                    date: new Date("2026-10-21T14:00:00Z"),
                    supplementaryInfo: {
                        urgency: "very_urgent",
                        hazardous: true,
                    },
                },
            ];

            const mockMessages = [
                {
                    id: "msg-1",
                    firstName: "Moussa",
                    lastName: "Traoré",
                    email: "moussa@transport.ci",
                    message: "Demande de partenariat logistique.",
                    createdAt: new Date("2026-10-21T15:00:00Z"),
                },
            ];

            vi.mocked(prisma.quote.findMany).mockResolvedValue(
                mockQuotes as unknown as Awaited<
                    ReturnType<typeof prisma.quote.findMany>
                >
            );
            vi.mocked(prisma.contactMessage.findMany).mockResolvedValue(
                mockMessages as unknown as Awaited<
                    ReturnType<typeof prisma.contactMessage.findMany>
                >
            );

            const result = await getNotificationsAction();

            expect(result.success).toBe(true);
            expect(result.notifications.length).toBe(2);

            // Le message créé à 15h00 doit apparaître en premier (tri chronologique décroissant)
            expect(result.notifications[0].type).toBe("contact");
            expect(result.notifications[0].title).toBe(
                "Message • Moussa Traoré"
            );

            // Le devis urgent doit avoir le type "urgent" et isUrgent: true
            expect(result.notifications[1].type).toBe("urgent");
            expect(result.notifications[1].isUrgent).toBe(true);
            expect(result.notifications[1].title).toContain("Devis Urgent");
        });
    });

    describe("getUnreadNotificationCountAction", () => {
        it("should sum pending quotes count and unread contact messages count", async () => {
            vi.mocked(prisma.quote.count).mockResolvedValue(3);
            vi.mocked(prisma.contactMessage.count).mockResolvedValue(2);

            const result = await getUnreadNotificationCountAction();

            expect(result.success).toBe(true);
            expect(result.count).toBe(5);
        });
    });

    describe("markAllNotificationsAsReadAction", () => {
        it("should update all unread contact messages to READ", async () => {
            vi.mocked(prisma.contactMessage.updateMany).mockResolvedValue({
                count: 4,
            });

            const result = await markAllNotificationsAsReadAction();

            expect(result.success).toBe(true);
            expect(prisma.contactMessage.updateMany).toHaveBeenCalledWith({
                where: { status: ContactStatus.UNREAD },
                data: { status: ContactStatus.READ },
            });
        });
    });
});
