import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import {
    getContactMessagesAction,
    getClientsDirectoryAction,
} from "@/app/actions/contact";
import { ContactsDashboardView } from "./components/ContactsDashboardView";

export const metadata: Metadata = {
    title: "Contacts & Boîte de Réception | Administration HBC Logistique",
    description:
        "Gestion des messages de contact entrants et répertoire des clients de la plateforme.",
};

export default async function ContactsPage() {
    // Vérification stricte des permissions administrateur côté serveur
    await requireAdmin();

    // Récupération simultanée et asynchrone des données réelles PostgreSQL
    const [messagesRes, clientsRes] = await Promise.all([
        getContactMessagesAction(),
        getClientsDirectoryAction(),
    ]);

    const messages = messagesRes.data || [];
    const clients = clientsRes.data || [];

    return (
        <ContactsDashboardView
            initialMessages={messages}
            initialClients={clients}
        />
    );
}
