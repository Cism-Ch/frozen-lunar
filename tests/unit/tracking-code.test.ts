import { describe, it, expect } from "vitest";
import {
    formatQuoteReference,
    generateTrackingCode,
} from "@/lib/tracking-code";

describe("Timestamped Quote Tracking Codes (HBC-YYYY-HHMMSS-XXXXXX)", () => {
    it("generates unambiguous HBC-YYYY-HHMMSS-XXXXXX codes without 0/O/1/I/L", () => {
        const fixedDate = new Date("2026-11-25T14:05:09Z");
        for (let i = 0; i < 25; i++) {
            const code = generateTrackingCode(fixedDate);
            expect(code).toMatch(
                /^HBC-2026-140509-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/
            );
        }
    });

    it("returns trackingCode when present and clean HBC fallback for legacy quotes", () => {
        expect(
            formatQuoteReference({
                id: "cm3x9a8b123456",
                trackingCode: "HBC-2026-140509-4K8M2P",
            })
        ).toBe("HBC-2026-140509-4K8M2P");

        expect(
            formatQuoteReference({
                id: "cm3x9a8b123456",
                trackingCode: null,
            })
        ).toBe("HBC-123456");
    });
});
