import { describe, it, expect } from "vitest";
import {
    normalizePhoneForWhatsApp,
    formatLocalWhatsAppMessage,
    generateWhatsAppMessage,
    type WhatsAppQuotePayload,
} from "@/lib/huggingface";

describe("Hugging Face & WhatsApp Utilities (huggingface.ts)", () => {
    describe("normalizePhoneForWhatsApp", () => {
        it("should normalize French 0X numbers to 33X international format", () => {
            expect(normalizePhoneForWhatsApp("06 12 34 56 78")).toBe(
                "33612345678"
            );
            expect(normalizePhoneForWhatsApp("07.98.76.54.32")).toBe(
                "33798765432"
            );
            expect(normalizePhoneForWhatsApp("01-40-50-60-70")).toBe(
                "33140506070"
            );
        });

        it("should strip leading + or 00 and preserve international codes", () => {
            expect(normalizePhoneForWhatsApp("+33 6 12 34 56 78")).toBe(
                "33612345678"
            );
            expect(normalizePhoneForWhatsApp("0033612345678")).toBe(
                "33612345678"
            );
            expect(normalizePhoneForWhatsApp("+225 07 08 09 10 11")).toBe(
                "2250708091011"
            );
        });

        it("should return empty string if no digits are present", () => {
            expect(normalizePhoneForWhatsApp("")).toBe("");
            expect(normalizePhoneForWhatsApp("   ")).toBe("");
            expect(normalizePhoneForWhatsApp("abc-def")).toBe("");
        });
    });

    describe("formatLocalWhatsAppMessage", () => {
        const mockPayload: WhatsAppQuotePayload = {
            id: "quote-12345678-abcd",
            client: "Jean Dupont",
            phone: "0612345678",
            email: "jean@example.com",
            pickup: "Paris",
            dropoff: "Lyon",
            type: "CONTAINER_20",
            date: "25 juillet 2026",
            amount: "1 500 €",
        };

        it("should generate a complete, professional French message with quote details", () => {
            const message = formatLocalWhatsAppMessage(mockPayload);

            expect(message).toContain("Bonjour *Jean Dupont*");
            expect(message).toContain(
                "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE"
            );
            expect(message).toContain("Paris");
            expect(message).toContain("Lyon");
            expect(message).toContain("1 500 €");
        });

        it("should include custom note when provided", () => {
            const message = formatLocalWhatsAppMessage(
                mockPayload,
                "Chariot élévateur requis sur place."
            );

            expect(message).toContain("Précision :");
            expect(message).toContain("Chariot élévateur requis sur place.");
        });
    });

    describe("generateWhatsAppMessage", () => {
        const mockPayload: WhatsAppQuotePayload = {
            id: "quote-9999",
            client: "Sophie Martin",
            phone: "+33 6 98 76 54 32",
            email: "sophie@example.com",
            pickup: "Marseille",
            dropoff: "Nice",
            type: "ENGIN_CHANTIER",
            date: "12 août 2026",
            amount: "2 200 €",
        };

        it("should produce a valid wa.me Click-to-Chat URL with normalized phone", async () => {
            const result = await generateWhatsAppMessage(mockPayload);

            expect(result.url).toContain("https://wa.me/33698765432?text=");
            expect(result.text).toContain("Sophie Martin");
            expect(["huggingface", "template_local"]).toContain(result.source);
        });
    });
});
