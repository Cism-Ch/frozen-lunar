import { Suspense } from "react";
import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Réinitialisation du mot de passe Administrateur | HBC Logistique",
    description:
        "Définition sécurisée du nouveau mot de passe pour l'espace d'administration.",
};

interface AdminResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function AdminResetPasswordPage({
    searchParams,
}: AdminResetPasswordPageProps) {
    const params = await searchParams;

    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
            }
        >
            <ResetPasswordForm token={params.token} context="admin" />
        </Suspense>
    );
}
