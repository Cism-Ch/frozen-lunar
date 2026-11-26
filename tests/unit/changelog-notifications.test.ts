import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    mockRequireAdmin,
    mockSystemSettingsFindUnique,
    mockAdminNotifFindUnique,
    mockAdminNotifUpsert,
} = vi.hoisted(() => ({
    mockRequireAdmin: vi.fn(),
    mockSystemSettingsFindUnique: vi.fn(),
    mockAdminNotifFindUnique: vi.fn(),
    mockAdminNotifUpsert: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({
    requireAdmin: mockRequireAdmin,
}));

vi.mock("@/lib/prisma", () => {
    const prismaMock = {
        systemSettings: {
            findUnique: mockSystemSettingsFindUnique,
        },
        adminNotificationRead: {
            findUnique: mockAdminNotifFindUnique,
            upsert: mockAdminNotifUpsert,
        },
    };
    return { default: prismaMock, prisma: prismaMock };
});

import {
    getChangelogEntries,
    getLatestChangelogEntry,
    isChangelogEntryFresh,
} from "@/lib/changelog";
import {
    acknowledgeChangelogUpdateAction,
    getAdminWhatsNewAction,
} from "@/app/actions/notification-management";

describe("Sprint 45: Keyed JSON Changelog & Notification Preferences", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireAdmin.mockResolvedValue({
            id: "admin-1",
            email: "admin@hbc-logistique.com",
            role: "admin",
        });
    });

    it("loads keyed changelog entries sorted newest-first with unique keys", () => {
        const entries = getChangelogEntries();
        expect(entries.length).toBeGreaterThanOrEqual(5);
        const keys = new Set(entries.map((e) => e.key));
        expect(keys.size).toBe(entries.length);
        expect(entries[0]?.key).toBe("rel-2026-11-s45");
    });

    it("evaluates freshness window accurately", () => {
        const latest = getLatestChangelogEntry()!;
        const withinWindow = new Date(
            new Date(latest.publishedAt).getTime() + 3 * 24 * 60 * 60 * 1000
        );
        const expired = new Date(
            new Date(latest.publishedAt).getTime() + 30 * 24 * 60 * 60 * 1000
        );

        expect(isChangelogEntryFresh(latest, withinWindow, 14)).toBe(true);
        expect(isChangelogEntryFresh(latest, expired, 14)).toBe(false);
    });

    it("disables What's New alert when notifySystemUpdates is false in SystemSettings", async () => {
        mockSystemSettingsFindUnique.mockResolvedValue({
            notifySystemUpdates: false,
        });
        mockAdminNotifFindUnique.mockResolvedValue(null);

        const res = await getAdminWhatsNewAction();
        expect(res.error).toBeNull();
        expect(res.data?.enabled).toBe(false);
        expect(res.data?.hasUnreadUpdate).toBe(false);
    });

    it("persists changelog acknowledgement per admin via AdminNotificationRead", async () => {
        mockAdminNotifUpsert.mockResolvedValue({ id: "ack-1" });

        const res = await acknowledgeChangelogUpdateAction("rel-2026-11-s45");
        expect(res.error).toBeNull();
        expect(res.data?.acknowledged).toBe(true);
        expect(mockAdminNotifUpsert).toHaveBeenCalledTimes(1);
    });
});
