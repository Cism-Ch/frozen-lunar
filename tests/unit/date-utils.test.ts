import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { safeFormatDate, safeParseDate } from "@/lib/date-utils";

describe("Date Utilities (date-utils.ts)", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    describe("safeFormatDate", () => {
        it("should correctly format valid date strings into French locale format", () => {
            const formatted = safeFormatDate(
                "2026-07-25T10:00:00Z",
                "dd MMMM yyyy"
            );
            expect(formatted).toBe("25 juillet 2026");
        });

        it("should return fallback text when date string is undefined or null", () => {
            expect(safeFormatDate(undefined)).toBe("Date invalide");
            expect(safeFormatDate(null, "dd/MM/yyyy", "Date manquante")).toBe(
                "Date manquante"
            );
        });

        it("should return fallback text when date string is invalid", () => {
            expect(safeFormatDate("not-a-date")).toBe("Date invalide");
            expect(warnSpy).toHaveBeenCalled();
        });
    });

    describe("safeParseDate", () => {
        it("should parse a valid ISO date string into a Date object", () => {
            const date = safeParseDate("2026-07-25T10:00:00Z");
            expect(date).toBeInstanceOf(Date);
            expect(date?.getFullYear()).toBe(2026);
        });

        it("should return null for invalid date strings or null input", () => {
            expect(safeParseDate(null)).toBeNull();
            expect(safeParseDate("invalid-date-string")).toBeNull();
            expect(warnSpy).toHaveBeenCalled();
        });
    });
});
