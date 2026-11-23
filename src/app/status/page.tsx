import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * La supervision des services est réservée exclusivement aux administrateurs.
 * Toute visite sur `/status` redirige vers la console sécurisée `/admin/status`.
 */
export default function StatusRedirectPage() {
    redirect("/admin/status");
}
