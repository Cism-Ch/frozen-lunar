import { describe, it, expect } from "vitest";
import {
    requestPasswordResetSchema,
    verifyResetTokenSchema,
    resetPasswordWithTokenSchema,
} from "@/lib/validation";
import { PasswordResetEmail } from "@/components/emails/PasswordResetEmail";
import { render } from "@react-email/render";

describe("Password Reset Validation & Template", () => {
    describe("requestPasswordResetSchema", () => {
        it("should accept valid email and default context to auto", () => {
            const result = requestPasswordResetSchema.parse({
                email: "Admin.Hbc@Transport.COM",
            });
            expect(result.email).toBe("admin.hbc@transport.com");
            expect(result.context).toBe("auto");
        });

        it("should accept explicit admin and user context", () => {
            const adminResult = requestPasswordResetSchema.parse({
                email: "admin@transport.com",
                context: "admin",
            });
            expect(adminResult.context).toBe("admin");

            const userResult = requestPasswordResetSchema.parse({
                email: "user@transport.com",
                context: "user",
            });
            expect(userResult.context).toBe("user");
        });

        it("should reject invalid email", () => {
            expect(() =>
                requestPasswordResetSchema.parse({ email: "invalid" })
            ).toThrow("Format d'email invalide");
        });
    });

    describe("verifyResetTokenSchema", () => {
        it("should accept valid non-empty tokens", () => {
            const result = verifyResetTokenSchema.parse({
                token: "secure-token-123456",
            });
            expect(result.token).toBe("secure-token-123456");
        });

        it("should reject empty token", () => {
            expect(() => verifyResetTokenSchema.parse({ token: "" })).toThrow(
                "Le jeton ne peut pas être vide"
            );
        });
    });

    describe("resetPasswordWithTokenSchema", () => {
        it("should accept matching passwords of valid length", () => {
            const result = resetPasswordWithTokenSchema.parse({
                token: "token-abc",
                password: "NewPassword123!",
                confirmPassword: "NewPassword123!",
            });
            expect(result.password).toBe("NewPassword123!");
            expect(result.confirmPassword).toBe("NewPassword123!");
        });

        it("should reject mismatching passwords", () => {
            expect(() =>
                resetPasswordWithTokenSchema.parse({
                    token: "token-abc",
                    password: "NewPassword123!",
                    confirmPassword: "DifferentPassword123!",
                })
            ).toThrow("Les deux mots de passe ne correspondent pas");
        });

        it("should reject passwords shorter than 8 characters", () => {
            expect(() =>
                resetPasswordWithTokenSchema.parse({
                    token: "token-abc",
                    password: "123",
                    confirmPassword: "123",
                })
            ).toThrow("Le mot de passe doit contenir au moins 8 caractères");
        });
    });

    describe("PasswordResetEmail template", () => {
        it("should render admin email with admin badge and security recommendations", async () => {
            const html = await render(
                PasswordResetEmail({
                    name: "Admin HBC",
                    resetUrl:
                        "https://hbc-logistique.fr/auth/reset-password?token=admintoken123",
                    role: "admin",
                    expiresInMinutes: 60,
                })
            );

            expect(html).toContain("HBC LOGISTIQUE");
            expect(html).toContain("Espace Administration");
            expect(html).toContain("admintoken123");
            expect(html).toContain("12 caractères");
        });

        it("should render user email with client badge", async () => {
            const html = await render(
                PasswordResetEmail({
                    name: "Client Jean",
                    resetUrl:
                        "https://hbc-logistique.fr/auth/reset-password?token=usertoken123",
                    role: "user",
                    expiresInMinutes: 60,
                })
            );

            expect(html).toContain("HBC LOGISTIQUE");
            expect(html).toContain("Espace Compte Client");
            expect(html).toContain("usertoken123");
        });
    });
});
