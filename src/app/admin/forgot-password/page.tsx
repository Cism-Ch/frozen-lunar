import { Suspense } from "react";
import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Mot de passe oublié - Administration | HBC Logistique",
    description:
        "Réinitialisation sécurisée des identifiants d'administration HBC Logistique.",
};

export default function AdminForgotPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
            }
        >
            <ForgotPasswordForm context="admin" />
        </Suspense>
    );
}
