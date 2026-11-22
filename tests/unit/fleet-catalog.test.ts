import { describe, it, expect } from "vitest";
import {
    AFRICAN_FLEET_CATALOG,
    formatFcfaRate,
    formatQuantityBadge,
    resolveVehicleImageUrl,
} from "@/lib/fleet-catalog";

describe("African Fleet Catalog & Formatting", () => {
    it("includes required West African fleet models including Bus 64 places and Porte-char with online illustrations", () => {
        const names = AFRICAN_FLEET_CATALOG.map((v) => v.name.toLowerCase());
        expect(AFRICAN_FLEET_CATALOG.length).toBeGreaterThanOrEqual(10);
        expect(names.some((n) => n.includes("bus 64 places"))).toBe(true);
        expect(names.some((n) => n.includes("porte-char"))).toBe(true);
        expect(names.some((n) => n.includes("porte-conteneur"))).toBe(true);
        expect(names.some((n) => n.includes("benne"))).toBe(true);
        expect(names.some((n) => n.includes("hiab"))).toBe(true);

        for (const v of AFRICAN_FLEET_CATALOG) {
            expect(v.imageUrl).toMatch(/^https:\/\//);
            expect(v.description).not.toMatch(/ohada|cedeao|mali|burkina|ghana/i);
            for (const spec of v.specs) {
                expect(spec).not.toMatch(/ohada|cedeao|mali|burkina|ghana/i);
            }
            expect(
                resolveVehicleImageUrl({
                    slug: v.slug,
                    category: v.category,
                    imageUrl: null,
                })
            ).toBe(v.imageUrl);
        }
    });

    it("ensures availableQuantity never exceeds totalQuantity in default catalog", () => {
        for (const v of AFRICAN_FLEET_CATALOG) {
            expect(v.availableQuantity).toBeGreaterThanOrEqual(0);
            expect(v.availableQuantity).toBeLessThanOrEqual(v.totalQuantity);
            expect(v.slug).toMatch(/^[a-z0-9-]+$/);
        }
    });

    it("formats stock badges with 2-digit padding (Qté: 02 disponibles)", () => {
        expect(formatQuantityBadge(2)).toBe("Qté: 02 disponibles");
        expect(formatQuantityBadge(1)).toBe("Qté: 01 disponible");
        expect(formatQuantityBadge(0)).toBe("Qté: 00 • Sur demande");
        expect(formatQuantityBadge(12)).toBe("Qté: 12 disponibles");
    });

    it("formats daily rates in FCFA or fallback to Sur devis", () => {
        expect(formatFcfaRate(250000)).toContain("250");
        expect(formatFcfaRate(250000)).toContain("FCFA / jour");
        expect(formatFcfaRate(null)).toBe("Sur devis");
        expect(formatFcfaRate(0)).toBe("Sur devis");
    });
});
