import { describe, it, expect } from "vitest";
import demoQuotes from "../../prisma/demo-data.json";

describe("Demo Data Structure (TASK-018)", () => {
    it("should contain a valid array of demo quotes", () => {
        expect(Array.isArray(demoQuotes)).toBe(true);
        expect(demoQuotes.length).toBeGreaterThan(0);
    });

    it("should have all mandatory fields for each quote item", () => {
        for (const item of demoQuotes) {
            expect(item).toHaveProperty("clientName");
            expect(item).toHaveProperty("email");
            expect(item).toHaveProperty("phone");
            expect(item).toHaveProperty("itemType");
            expect(item).toHaveProperty("pickupLocation");
            expect(item).toHaveProperty("dropoffLocation");
            expect(item).toHaveProperty("status");
            expect(item).toHaveProperty("source");
            expect(["PENDING", "VALIDATED", "REJECTED"]).toContain(item.status);
            expect(["FORM", "CHAT"]).toContain(item.source);
        }
    });
});
