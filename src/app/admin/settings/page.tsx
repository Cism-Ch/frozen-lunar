import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import { getAdminSettingsAction } from "@/app/actions/settings-actions";
import { SettingsClient } from "./components/SettingsClient";

export const metadata: Metadata = {
    title: "Paramètres & Configuration | Administration HBC Logistique",
    description:
        "Gestion des préférences de compte, informations de l'entreprise, configuration WhatsApp et politique de sécurité.",
};

export default async function SettingsPage() {
    // 1. Vérification stricte des autorisations Administrateur côté serveur
    await requireAdmin();

    // 2. Récupération des données réelles PostgreSQL (Profil Admin + Singleton SystemSettings)
    const result = await getAdminSettingsAction();

    if (!result.data) {
        throw new Error(
            result.error ||
                "Impossible de charger les paramètres administrateur."
        );
    }

    // 3. Rendu du composant client avec les données synchronisées
    return <SettingsClient initialData={result.data} />;
}
