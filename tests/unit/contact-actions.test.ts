import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    contactFormSchema,
    sendContactMessageAction,
} from "@/app/actions/contact";
import prisma from "@/lib/prisma";

import type { ContactMessage } from "@prisma/client";

// Mock de Prisma Client
vi.mock("@/lib/prisma", () => ({
    default: {
        contactMessage: {
            create: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        quote: {
            findMany: vi.fn(),
        },
    },
}));

// Mock de revalidatePath
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("Contact System & Validation Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("contactFormSchema validation", () => {
        it("should accept valid contact form payload", () => {
            const valid = {
                firstName: "Alexandre",
                lastName: "Durand",
                email: "alexandre.durand@entreprise.fr",
                phone: "0612345678",
                message:
                    "Demande d'information pour transport de machines lourdes sur chantier.",
            };

            const result = contactFormSchema.parse(valid);
            expect(result.firstName).toBe("Alexandre");
            expect(result.lastName).toBe("Durand");
            expect(result.email).toBe("alexandre.durand@entreprise.fr");
        });

        it("should reject message shorter than 10 characters", () => {
            const short = {
                firstName: "Alexandre",
                lastName: "Durand",
                email: "alexandre.durand@entreprise.fr",
                phone: "0612345678",
                message: "Bonjour",
            };

            expect(() => contactFormSchema.parse(short)).toThrow(
                "Votre message doit contenir au moins 10 caractères"
            );
        });

        it("should reject invalid email", () => {
            const invalid = {
                firstName: "Alexandre",
                lastName: "Durand",
                email: "not-an-email",
                phone: "0612345678",
                message:
                    "Demande d'information pour transport de machines lourdes.",
            };

            expect(() => contactFormSchema.parse(invalid)).toThrow(
                "Veuillez saisir une adresse email valide"
            );
        });

        it("should reject phone number shorter than 8 digits", () => {
            const invalidPhone = {
                firstName: "Alexandre",
                lastName: "Durand",
                email: "alexandre.durand@entreprise.fr",
                phone: "0612",
                message:
                    "Demande d'information pour transport de machines lourdes.",
            };

            expect(() => contactFormSchema.parse(invalidPhone)).toThrow(
                "Le numéro de téléphone doit contenir au moins 8 chiffres"
            );
        });
    });

    describe("sendContactMessageAction", () => {
        it("should reject invalid inputs with { data: null, error: message }", async () => {
            const result = await sendContactMessageAction({
                firstName: "A",
                lastName: "D",
                email: "invalid",
                phone: "123",
                message: "court",
            });

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(prisma.contactMessage.create).not.toHaveBeenCalled();
        });

        it("should successfully persist message to database and return { data, error: null }", async () => {
            const mockCreated: ContactMessage = {
                id: "msg_test_123",
                firstName: "Sophie",
                lastName: "Laurent",
                email: "sophie.l@domaine.com",
                phone: "0789123456",
                message:
                    "Besoin urgent d'un convoi exceptionnel pour structure modulaire.",
                status: "UNREAD",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            vi.mocked(prisma.contactMessage.create).mockResolvedValueOnce(
                mockCreated
            );

            const result = await sendContactMessageAction({
                firstName: "Sophie",
                lastName: "Laurent",
                email: "sophie.l@domaine.com",
                phone: "0789123456",
                message:
                    "Besoin urgent d'un convoi exceptionnel pour structure modulaire.",
            });

            expect(result.error).toBeNull();
            expect(result.data?.success).toBe(true);
            expect(result.data?.id).toBe("msg_test_123");
            expect(prisma.contactMessage.create).toHaveBeenCalledWith({
                data: {
                    firstName: "Sophie",
                    lastName: "Laurent",
                    email: "sophie.l@domaine.com",
                    phone: "0789123456",
                    message:
                        "Besoin urgent d'un convoi exceptionnel pour structure modulaire.",
                    status: "UNREAD",
                },
            });
        });
    });
});
