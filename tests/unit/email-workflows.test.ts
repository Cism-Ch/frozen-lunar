import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@react-email/render";
import { AdminAlertEmail } from "@/components/emails/AdminAlertEmail";
import { PartnerApplicationEmail } from "@/components/emails/PartnerApplicationEmail";
import { QuoteStatusUpdateEmail } from "@/components/emails/QuoteStatusUpdateEmail";

describe("Resend Configuration & Operational Email Templates", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("détecte les clés Resend absentes ou factices et accepte une vraie clé", async () => {
        delete process.env.RESEND_KEY;
        delete process.env.AUTH_RESEND_KEY;
        let emailMod = await import("@/lib/email");
        expect(emailMod.isResendConfigured()).toBe(false);

        vi.resetModules();
        process.env.RESEND_KEY = "re_live_example_key_1234567890";
        process.env.EMAIL_FROM = "alertes@hbc-logistique.ci";
        emailMod = await import("@/lib/email");
        expect(emailMod.isResendConfigured()).toBe(true);
        expect(emailMod.EMAIL_SENDER).toBe("alertes@hbc-logistique.ci");
    });

    it("rend correctement le template AdminAlertEmail pour un avertissement critique", async () => {
        const html = await render(
            AdminAlertEmail({
                title: "Indisponibilité Supabase détectée",
                severity: "critical",
                source: "Health Monitor /api/health",
                summary:
                    "La base de données ne répond plus depuis plus de 3 secondes.",
                details: "Timeout 3000ms",
                timestamp: "2026-11-22T02:00:00Z",
            })
        );

        expect(html).toContain("ALERTE CRITIQUE");
        expect(html).toContain("Indisponibilité Supabase détectée");
        expect(html).toContain("Health Monitor /api/health");
        expect(html).toContain("Abidjan");
    });

    it("rend correctement le template PartnerApplicationEmail (copie client & admin)", async () => {
        const html = await render(
            PartnerApplicationEmail({
                companyName: "Transports Ivoire Express",
                contactName: "Konan Kouadio",
                country: "Côte d'Ivoire",
                city: "Abidjan",
                category: "Propriétaire de flotte",
                fleetSummary: "2 Bus 64 places, 1 Porte-char 50T",
                isAdminCopy: false,
            })
        );

        expect(html).toContain("Transports Ivoire Express");
        expect(html).toContain("Konan Kouadio");
        expect(html).toContain("2 Bus 64 places");
    });

    it("rend correctement le template QuoteStatusUpdateEmail en FCFA", async () => {
        const html = await render(
            QuoteStatusUpdateEmail({
                clientName: "PFO Africa",
                quoteId: "HBC-CI-042",
                status: "VALIDATED",
                amount: "1 450 000 FCFA HT",
                pickup: "Port Autonome d'Abidjan",
                dropoff: "Yamoussoukro",
            })
        );

        expect(html).toContain("HBC-CI-042");
        expect(html).toContain("1 450 000 FCFA HT");
        expect(html).toContain("Port Autonome d&#x27;Abidjan");
    });
});
