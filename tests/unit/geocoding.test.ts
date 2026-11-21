import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchAddresses, reverseGeocode } from "@/lib/geocoding";

describe("Open-Source Geocoding Service (Photon + Nominatim)", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe("searchAddresses (Photon)", () => {
        it("retourne une liste vide si la requête fait moins de 3 caractères", async () => {
            const fetchSpy = vi.fn();
            global.fetch = fetchSpy as unknown as typeof fetch;

            const result = await searchAddresses("Ab");
            expect(result).toEqual({ success: true, data: [] });
            expect(fetchSpy).not.toHaveBeenCalled();
        });

        it("formate et déduplique correctement les suggestions Photon", async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    features: [
                        {
                            geometry: { coordinates: [-4.0083, 5.36] },
                            properties: {
                                osm_id: 101,
                                name: "Cocody Riviera",
                                city: "Abidjan",
                                country: "Côte d'Ivoire",
                            },
                        },
                        {
                            geometry: { coordinates: [-4.0083, 5.36] },
                            properties: {
                                osm_id: 102,
                                name: "Cocody Riviera",
                                city: "Abidjan",
                                country: "Côte d'Ivoire",
                            },
                        },
                    ],
                }),
            }) as unknown as typeof fetch;

            const result = await searchAddresses("Cocody");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toHaveLength(1);
                expect(result.data[0].label).toBe(
                    "Cocody Riviera, Abidjan, Côte d'Ivoire"
                );
                expect(result.data[0].lat).toBe(5.36);
                expect(result.data[0].lon).toBe(-4.0083);
            }
        });

        it("gère proprement une erreur HTTP du service Photon", async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 503,
            }) as unknown as typeof fetch;

            const result = await searchAddresses("Yopougon");
            expect(result.success).toBe(false);
        });
    });

    describe("reverseGeocode (Nominatim)", () => {
        it("construit une adresse structurée depuis la réponse Nominatim", async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    display_name: "Boulevard Latrille, Cocody, Abidjan",
                    address: {
                        road: "Boulevard Latrille",
                        suburb: "Cocody",
                        city: "Abidjan",
                        country: "Côte d'Ivoire",
                    },
                }),
            }) as unknown as typeof fetch;

            const result = await reverseGeocode(5.35, -3.99);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.label).toBe(
                    "Boulevard Latrille, Cocody, Abidjan, Côte d'Ivoire"
                );
            }
        });

        it("retourne une erreur contrôlée en cas de panne réseau", async () => {
            global.fetch = vi
                .fn()
                .mockRejectedValue(
                    new Error("Network error")
                ) as unknown as typeof fetch;

            const result = await reverseGeocode(5.35, -3.99);
            expect(result.success).toBe(false);
        });
    });
});
