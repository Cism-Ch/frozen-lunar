import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import {
    getChangelogEntries,
    getChangelogFreshnessWindowDays,
} from "@/lib/changelog";
import { ChangelogViewer } from "@/components/features/admin/ChangelogViewer";

export const metadata: Metadata = {
    title: "Nouveautés & Changelog | Administration HBC Logistique",
    description:
        "Historique synthétique des évolutions, correctifs et améliorations de la plateforme HBC Logistique.",
};

export default async function AdminChangelogPage() {
    await requireAdmin();

    const entries = getChangelogEntries();
    const freshnessWindowDays = getChangelogFreshnessWindowDays();
    const settings = await prisma.systemSettings
        .findUnique({
            where: { id: "default" },
            select: { notifySystemUpdates: true },
        })
        .catch(() => null);

    return (
        <ChangelogViewer
            entries={entries}
            freshnessWindowDays={freshnessWindowDays}
            notifySystemUpdatesEnabled={settings?.notifySystemUpdates ?? true}
        />
    );
}
