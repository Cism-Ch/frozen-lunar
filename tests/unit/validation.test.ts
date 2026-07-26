import { describe, it, expect } from "vitest";
import {
    emailSchema,
    passwordSchema,
    simplePasswordSchema,
    nameSchema,
    roleSchema,
    createUserSchema,
    validateData,
} from "@/lib/validation";

describe("Validation Schemas (Zod)", () => {
    describe("emailSchema", () => {
        it("should accept valid emails and transform to lowercase and trim spaces", () => {
            const result = emailSchema.parse("Test.User@Domain.COM");
            expect(result).toBe("test.user@domain.com");
        });

        it("should reject invalid email formats", () => {
            expect(() => emailSchema.parse("invalid-email")).toThrow(
                "Format d'email invalide"
            );
            expect(() => emailSchema.parse("user@")).toThrow(
                "Format d'email invalide"
            );
            expect(() => emailSchema.parse("")).toThrow(
                "L'adresse email ne peut pas être vide"
            );
        });
    });

    describe("passwordSchema (OWASP)", () => {
        it("should accept compliant passwords with min 12 chars, uppercase, lowercase, digit and symbol", () => {
            const valid = "SecurePass123!";
            expect(passwordSchema.parse(valid)).toBe(valid);
        });

        it("should reject passwords shorter than 12 characters", () => {
            expect(() => passwordSchema.parse("Short1!")).toThrow(
                "Le mot de passe doit contenir au moins 12 caractères"
            );
        });

        it("should reject passwords lacking uppercase letters", () => {
            expect(() => passwordSchema.parse("securepass123!")).toThrow(
                "Le mot de passe doit contenir au moins une majuscule"
            );
        });

        it("should reject passwords lacking digits", () => {
            expect(() => passwordSchema.parse("SecurePassword!")).toThrow(
                "Le mot de passe doit contenir au moins un chiffre"
            );
        });

        it("should reject passwords lacking special characters", () => {
            expect(() => passwordSchema.parse("SecurePassword123")).toThrow(
                "Le mot de passe doit contenir au moins un caractère spécial"
            );
        });
    });

    describe("simplePasswordSchema", () => {
        it("should accept passwords with at least 8 characters", () => {
            expect(simplePasswordSchema.parse("12345678")).toBe("12345678");
        });

        it("should reject passwords shorter than 8 characters", () => {
            expect(() => simplePasswordSchema.parse("1234567")).toThrow(
                "Le mot de passe doit contenir au moins 8 caractères"
            );
        });
    });

    describe("nameSchema", () => {
        it("should accept valid names and trim whitespace", () => {
            expect(nameSchema.parse("  Jean Dupont  ")).toBe("Jean Dupont");
        });

        it("should reject names shorter than 2 characters", () => {
            expect(() => nameSchema.parse("A")).toThrow(
                "Le nom doit contenir au moins 2 caractères"
            );
        });
    });

    describe("roleSchema", () => {
        it("should accept valid user roles", () => {
            expect(roleSchema.parse("admin")).toBe("admin");
            expect(roleSchema.parse("moderator")).toBe("moderator");
            expect(roleSchema.parse("developer")).toBe("developer");
            expect(roleSchema.parse("user")).toBe("user");
        });

        it("should reject invalid roles", () => {
            expect(() => roleSchema.parse("superuser")).toThrow(
                "Rôle invalide"
            );
        });
    });

    describe("validateData helper", () => {
        it("should return success object with parsed data for valid input", () => {
            const result = validateData(createUserSchema, {
                email: "Admin@Hbc.com",
                name: "Admin User",
                password: "SuperSecretPassword123!",
                role: "admin",
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.email).toBe("admin@hbc.com");
                expect(result.data.role).toBe("admin");
            }
        });

        it("should return error object with message for invalid input", () => {
            const result = validateData(createUserSchema, {
                email: "bad-email",
                name: "A",
                password: "123",
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Format d'email invalide");
            }
        });
    });
});
