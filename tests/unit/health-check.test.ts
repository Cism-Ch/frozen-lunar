import { describe, it, expect, vi, beforeEach } from "vitest";

const { sendMock } = vi.hoisted(() => ({
    sendMock: vi.fn().mockResolvedValue({ data: { id: "alert-1" }, error: null }),
}));

vi.mock("@/lib/email", () => ({
    EMAIL_SENDER: "noreply@hbclogistique.ci",
    isResendConfigured: () => true,
    resend: {
        emails: {
            send: sendMock,
        },
    },
}));

vi.mock("@/lib/redis", () => ({
    redis: {
        ping: vi.fn(),
        get: vi.fn(),
        set: vi.fn(),
    },
    resolveUpstashRedisConfig: () => ({
        url: null,
        token: null,
        isConfigured: false,
        normalizedFromTcp: false,
    }),
}));

import {
    buildHealthReport,
    maybeSendCriticalOutageAlert,
    resetMemoryAlertLocksForTest,
    type ServiceHealthItem,
} from "@/lib/health-check";

function makeService(
    overrides: Partial<ServiceHealthItem>
): ServiceHealthItem {
    return {
        id: "supabase-postgres",
        name: "Supabase PostgreSQL",
        category: "core",
        critical: true,
        status: "operational",
        latencyMs: 50,
        message: "Base de données opérationnelle.",
        checkedAt: "2026-11-22T03:00:00.000Z",
        ...overrides,
    };
}

describe("Health Check & Uptime Monitoring", () => {
    beforeEach(() => {
        sendMock.mockClear();
        resetMemoryAlertLocksForTest();
        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    it("computes operational overall status and average latency", () => {
        const report = buildHealthReport([
            makeService({ id: "supabase-postgres", latencyMs: 40 }),
            makeService({
                id: "osm-geocoding",
                name: "OpenStreetMap",
                category: "maps",
                critical: false,
                latencyMs: 120,
            }),
            makeService({
                id: "tigris-s3",
                name: "Tigris S3",
                category: "infrastructure",
                critical: false,
                status: "unconfigured",
                latencyMs: null,
            }),
        ]);

        expect(report.overallStatus).toBe("operational");
        expect(report.summary.operational).toBe(2);
        expect(report.summary.unconfigured).toBe(1);
        expect(report.summary.averageLatencyMs).toBe(80);
    });

    it("marks overallStatus as degraded when a non-critical service is in outage", () => {
        const report = buildHealthReport([
            makeService({ id: "supabase-postgres", critical: true, status: "operational" }),
            makeService({
                id: "gemini-ai",
                name: "Google Gemini 2.5",
                category: "ai",
                critical: false,
                status: "outage",
                latencyMs: 3000,
            }),
        ]);

        expect(report.overallStatus).toBe("degraded");
        expect(report.summary.outage).toBe(1);
    });

    it("marks overallStatus as outage when a critical dependency fails", () => {
        const report = buildHealthReport([
            makeService({
                id: "supabase-postgres",
                critical: true,
                status: "outage",
                message: "Impossible de joindre la base PostgreSQL.",
            }),
        ]);

        expect(report.overallStatus).toBe("outage");
        expect(report.summary.outage).toBe(1);
    });

    it("sends a deduplicated Resend alert once for critical outages within the 30-min lock", async () => {
        const report = buildHealthReport([
            makeService({
                id: "supabase-postgres",
                name: "Supabase PostgreSQL",
                critical: true,
                status: "outage",
                message: "Impossible de joindre la base PostgreSQL.",
            }),
        ]);

        const firstSent = await maybeSendCriticalOutageAlert(report);
        const secondSent = await maybeSendCriticalOutageAlert(report);

        expect(firstSent).toBe(true);
        expect(secondSent).toBe(false);
        expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it("skips sending email alert when Resend itself is the only critical outage", async () => {
        const report = buildHealthReport([
            makeService({
                id: "resend",
                name: "Resend (Emails & Alertes)",
                category: "messaging",
                critical: true,
                status: "outage",
                message: "API Resend injoignable.",
            }),
        ]);

        const sent = await maybeSendCriticalOutageAlert(report);
        expect(sent).toBe(false);
        expect(sendMock).not.toHaveBeenCalled();
    });
});
