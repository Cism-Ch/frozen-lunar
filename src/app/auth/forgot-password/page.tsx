import { Suspense } from "react";
import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Mot de passe oublié | HBC Logistique",
    description:
        "Réinitialisez votre mot de passe pour accéder en toute sécurité à la plateforme HBC Logistique.",
};

interface ForgotPasswordPageProps {
    searchParams: Promise<{ context?: string }>;
}

export default async function ForgotPasswordPage({
    searchParams,
}: ForgotPasswordPageProps) {
    const params = await searchParams;
    const context = (params.context === "admin" ? "admin" : "user") as
        "admin" | "user" | "auto";

    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
            }
        >
            <ForgotPasswordForm context={context} />
        </Suspense>
    );
}
