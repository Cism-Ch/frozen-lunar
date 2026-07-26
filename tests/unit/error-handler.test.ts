import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import {
    handlePrismaError,
    isPrismaKnownError,
    isPrismaInitError,
    isPrismaValidationError,
    handleError,
} from "@/lib/error-handler";
import { DB_ERRORS, GENERAL_ERRORS } from "@/lib/error-codes";
import { logger } from "@/lib/logger";

vi.mock("@/lib/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

describe("Error Handler System", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Type Guards", () => {
        it("should correctly identify PrismaClientKnownRequestError", () => {
            const knownError = new Prisma.PrismaClientKnownRequestError(
                "Unique constraint failed",
                {
                    code: "P2002",
                    clientVersion: "6.19.1",
                    meta: { target: ["email"] },
                }
            );

            expect(isPrismaKnownError(knownError)).toBe(true);
            expect(isPrismaInitError(knownError)).toBe(false);
            expect(isPrismaValidationError(knownError)).toBe(false);
        });

        it("should correctly identify PrismaClientInitializationError", () => {
            const initError = new Prisma.PrismaClientInitializationError(
                "Cannot connect to DB",
                "6.19.1"
            );

            expect(isPrismaInitError(initError)).toBe(true);
            expect(isPrismaKnownError(initError)).toBe(false);
        });
    });

    describe("handlePrismaError", () => {
        it("should handle P2002 unique constraint violation with field details", () => {
            const error = new Prisma.PrismaClientKnownRequestError(
                "Unique constraint failed",
                {
                    code: "P2002",
                    clientVersion: "6.19.1",
                    meta: { target: ["email"] },
                }
            );

            const response = handlePrismaError(error);

            expect(response.code).toBe(DB_ERRORS.UNIQUE_CONSTRAINT.code);
            expect(response.details).toContain("Champ en conflit: email");
            expect(response.httpStatus).toBe(409);
        });

        it("should handle P2025 record not found", () => {
            const error = new Prisma.PrismaClientKnownRequestError(
                "Record not found",
                {
                    code: "P2025",
                    clientVersion: "6.19.1",
                }
            );

            const response = handlePrismaError(error);
            expect(response.code).toBe(DB_ERRORS.RECORD_NOT_FOUND.code);
            expect(response.httpStatus).toBe(404);
        });
    });

    describe("handleError (Unified Error Handler)", () => {
        it("should handle generic Javascript Error with details", () => {
            const error = new Error("Custom business error");
            const response = handleError(error);

            expect(response.code).toBe(
                GENERAL_ERRORS.INTERNAL_SERVER_ERROR.code
            );
            expect(response.details).toContain("Custom business error");
            expect(response.httpStatus).toBe(500);
            expect(logger.error).toHaveBeenCalledWith(
                "Error handled in application",
                error
            );
        });

        it("should handle unknown errors gracefully without leaking sensitive info", () => {
            const error = "unexpected string error";
            const response = handleError(error);

            expect(response.code).toBe(
                GENERAL_ERRORS.INTERNAL_SERVER_ERROR.code
            );
            expect(response.httpStatus).toBe(500);
            expect(response.message).toBe("Erreur interne du serveur");
            expect(logger.error).toHaveBeenCalledWith(
                "Error handled in application",
                error
            );
        });
    });
});
