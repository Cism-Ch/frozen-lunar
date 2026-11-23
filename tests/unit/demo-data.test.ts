import { describe, it, expect } from "vitest";
import demoQuotes from "../../prisma/demo-data.json";

describe("Patched Demo Data (Côte d'Ivoire)", () => {
    it("contient exactement 8 devis de démonstration avec tous les statuts clés", () => {
        expect(demoQuotes).toHaveLength(8);
        const statuses = new Set(demoQuotes.map((q) => q.status));
        expect(statuses.has("PENDING")).toBe(true);
        expect(statuses.has("VALIDATED")).toBe(true);
        expect(statuses.has("REJECTED")).toBe(true);
        expect(statuses.has("CANCELLED")).toBe(true);
    });

    it("utilise des offsets de dates dynamiques et des numéros +225 Côte d'Ivoire", () => {
        for (const q of demoQuotes) {
            expect(typeof q.daysOffset).toBe("number");
            expect(q.phone.startsWith("+225")).toBe(true);
            expect(q.email.endsWith(".demo.ci")).toBe(true);
            if (q.status === "CANCELLED") {
                expect(q.cancellationReason).toBeTruthy();
            }
        }
    });
});
