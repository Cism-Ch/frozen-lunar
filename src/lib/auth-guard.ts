import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Récupère et valide la session active de l'utilisateur côté serveur.
 * Lève une exception explicite si l'utilisateur n'est pas authentifié.
 *
 * @returns Données de l'utilisateur authentifié
 * @throws Error si non authentifié
 */
export async function requireAuth() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        throw new Error("Non authentifié. Veuillez vous connecter.");
    }

    return session.user;
}

/**
 * Vérifie que la session active appartient à un administrateur.
 * Lève une exception si l'utilisateur n'est pas authentifié ou ne possède pas le rôle admin.
 *
 * @returns Données de l'administrateur authentifié
 * @throws Error si rôle insuffisant ou non connecté
 */
export async function requireAdmin() {
    const user = await requireAuth();

    if (user.role !== "admin") {
        throw new Error("Accès refusé. Rôle administrateur requis.");
    }

    return user;
}
