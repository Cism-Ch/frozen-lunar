import { Suspense } from "react";
import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Réinitialisation de mot de passe | HBC Logistique",
    description:
        "Définissez votre nouveau mot de passe de manière sécurisée sur la plateforme HBC Logistique.",
};

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    const params = await searchParams;

    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
            }
        >
            <ResetPasswordForm token={params.token} />
        </Suspense>
    );
}
