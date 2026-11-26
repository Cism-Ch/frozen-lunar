import rawChangelog from "@/data/changelog.json";

export type ChangelogCategory =
    | "feature"
    | "security"
    | "performance"
    | "improvement"
    | "fix";

export interface ChangelogEntry {
    key: string;
    version: string;
    sprint: string;
    publishedAt: string;
    category: ChangelogCategory;
    title: string;
    summary: string;
    highlights: string[];
}

export interface ChangelogDocument {
    schemaVersion: number;
    freshnessWindowDays: number;
    entries: ChangelogEntry[];
}

const changelogDoc = rawChangelog as ChangelogDocument;

/**
 * Retourne toutes les entrées du changelog triées de la plus récente à la plus ancienne.
 */
export function getChangelogEntries(): ChangelogEntry[] {
    return [...changelogDoc.entries].sort(
        (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
    );
}

/**
 * Retourne la dernière évolution enregistrée dans le changelog JSON.
 */
export function getLatestChangelogEntry(): ChangelogEntry | null {
    const sorted = getChangelogEntries();
    return sorted[0] ?? null;
}

/**
 * Retourne la fenêtre de visibilité (en jours) pendant laquelle le badge What's New reste affiché.
 */
export function getChangelogFreshnessWindowDays(): number {
    return changelogDoc.freshnessWindowDays || 14;
}

/**
 * Indique si une entrée de changelog est encore dans sa période de nouveauté.
 */
export function isChangelogEntryFresh(
    entry: ChangelogEntry,
    now: Date = new Date(),
    windowDays = getChangelogFreshnessWindowDays()
): boolean {
    const publishedMs = new Date(entry.publishedAt).getTime();
    if (!Number.isFinite(publishedMs)) return false;
    const ageMs = now.getTime() - publishedMs;
    const maxAgeMs = windowDays * 24 * 60 * 60 * 1000;
    return ageMs >= -24 * 60 * 60 * 1000 && ageMs <= maxAgeMs;
}

/**
 * Clé de persistance `AdminNotificationRead` associée à une entrée du changelog.
 */
export function getChangelogReadKey(changelogKey: string): string {
    return `changelog-${changelogKey}`;
}
