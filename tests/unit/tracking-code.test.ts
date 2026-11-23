import { describe, it, expect } from "vitest";
import {
    formatQuoteReference,
    generateTrackingCode,
} from "@/lib/tracking-code";

describe("Readable Quote Tracking Codes (HBC-YYYY-XXXX)", () => {
    it("generates unambiguous HBC-YYYY-XXXX tracking codes without 0/O/1/I/L", () => {
        for (let i = 0; i < 20; i++) {
            const code = generateTrackingCode(new Date("2026-11-23T00:00:00Z"));
            expect(code).toMatch(/^HBC-2026-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
        }
    });

    it("returns trackingCode when present and clean HBC fallback for legacy quotes", () => {
        expect(
            formatQuoteReference({
                id: "cm3x9a8b123456",
                trackingCode: "HBC-2026-4K8M",
            })
        ).toBe("HBC-2026-4K8M");

        expect(
            formatQuoteReference({
                id: "cm3x9a8b123456",
                trackingCode: null,
            })
        ).toBe("HBC-123456");
    });
});
