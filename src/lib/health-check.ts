import { HeadBucketCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { redis, resolveUpstashRedisConfig } from "@/lib/redis";
import { s3Client } from "@/lib/storage";
import {
    EMAIL_SENDER,
    isAnyEmailProviderConfigured,
    isResendConfigured,
    sendTransactionalEmail,
} from "@/lib/email";
import { getGeminiApiKey, getGeminiModel } from "@/lib/gemini";
import { getOpenRouterApiKey, getOpenRouterModel } from "@/lib/openrouter";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { logger } from "@/lib/logger";
import { AdminAlertEmail } from "@/components/emails/AdminAlertEmail";

export type ServiceStatus =
    | "operational"
    | "degraded"
    | "outage"
    | "unconfigured";

export type ServiceCategory =
    | "core"
    | "infrastructure"
    | "ai"
    | "messaging"
    | "maps";

export interface ServiceHealthItem {
    id: string;
    name: string;
    category: ServiceCategory;
    critical: boolean;
    status: ServiceStatus;
    latencyMs: number | null;
    message: string;
    checkedAt: string;
}

export interface HealthReportSummary {
    operational: number;
    degraded: number;
    outage: number;
    unconfigured: number;
    total: number;
    averageLatencyMs: number | null;
}

export interface HealthReport {
    overallStatus: "operational" | "degraded" | "outage";
    checkedAt: string;
    cached: boolean;
    summary: HealthReportSummary;
    services: ServiceHealthItem[];
}

const PROBE_TIMEOUT_MS = 3000;
const HEALTH_CACHE_KEY = "health:report:v1";
const HEALTH_CACHE_TTL_SECONDS = 30;
const ALERT_LOCK_TTL_SECONDS = 1800; // 30 minutes

// Verrou mémoire de secours si Redis est indisponible lors d'un incident critique
const memoryAlertLocks = new Map<string, number>();

export function isRedisConfigured(): boolean {
    return resolveUpstashRedisConfig().isConfigured;
}

function isTigrisConfigured(): boolean {
    return Boolean(
        process.env.TIGRIS_STORAGE_ACCESS_KEY_ID?.trim() &&
            process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY?.trim() &&
            process.env.TIGRIS_BUCKET_NAME?.trim()
    );
}

async function fetchWithTimeout(
    url: string,
    init: RequestInit = {},
    timeoutMs = PROBE_TIMEOUT_MS
): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, {
            ...init,
            signal: controller.signal,
            cache: "no-store",
        });
    } finally {
        clearTimeout(timer);
    }
}

async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs = PROBE_TIMEOUT_MS
): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(
            () => reject(new Error("Délai d'attente dépassé (3s)")),
            timeoutMs
        );
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timer) clearTimeout(timer);
    }
}

async function probeSupabasePostgres(): Promise<ServiceHealthItem> {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();

    if (!process.env.DATABASE_URL?.trim()) {
        return {
            id: "supabase-postgres",
            name: "Supabase PostgreSQL",
            category: "core",
            critical: true,
            status: "unconfigured",
            latencyMs: null,
            message: "Base de données non configurée.",
            checkedAt,
        };
    }

    try {
        await withTimeout(prisma.$queryRaw`SELECT 1`);
        const latencyMs = Date.now() - startedAt;
        return {
            id: "supabase-postgres",
            name: "Supabase PostgreSQL",
            category: "core",
            critical: true,
            status: latencyMs > 1800 ? "degraded" : "operational",
            latencyMs,
            message:
                latencyMs > 1800
                    ? "Connexion active avec latence élevée."
                    : "Base de données opérationnelle.",
            checkedAt,
        };
    } catch {
        return {
            id: "supabase-postgres",
            name: "Supabase PostgreSQL",
            category: "core",
            critical: true,
            status: "outage",
            latencyMs: Date.now() - startedAt,
            message: "Impossible de joindre la base PostgreSQL.",
            checkedAt,
        };
    }
}

async function probeUpstashRedis(): Promise<ServiceHealthItem> {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();

    if (!isRedisConfigured()) {
        return {
            id: "upstash-redis",
            name: "Upstash Redis",
            category: "infrastructure",
            critical: true,
            status: "unconfigured",
            latencyMs: null,
            message: "Cache Redis non configuré.",
            checkedAt,
        };
    }

    try {
        await withTimeout(redis.ping());
        const latencyMs = Date.now() - startedAt;
        return {
            id: "upstash-redis",
            name: "Upstash Redis",
            category: "infrastructure",
            critical: true,
            status: latencyMs > 1500 ? "degraded" : "operational",
            latencyMs,
            message:
                latencyMs > 1500
                    ? "Cache accessible avec latence élevée."
                    : "Cache et rate-limiting opérationnels.",
            checkedAt,
        };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        const isAuthErr = msg.includes("401") || msg.includes("unauthorized") || msg.includes("wrongpass");
        return {
            id: "upstash-redis",
            name: "Upstash Redis",
            category: "infrastructure",
            critical: true,
            status: isAuthErr ? "degraded" : "outage",
            latencyMs: Date.now() - startedAt,
            message: isAuthErr
                ? "Jeton REST Redis refusé (vérifiez UPSTASH_REDIS_REST_TOKEN dans Upstash Console)."
                : "Service Redis injoignable.",
            checkedAt,
        };
    }
}

async function probeUpstashQStash(): Promise<ServiceHealthItem> {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();
    const token = process.env.QSTASH_TOKEN?.trim();

    if (!token) {
        return {
            id: "upstash-qstash",
            name: "Upstash QStash",
            category: "infrastructure",
            critical: false,
            status: "unconfigured",
            latencyMs: null,
            message: "File asynchrone QStash non configurée.",
            checkedAt,
        };
    }

    try {
        const res = await fetchWithTimeout(
            "https://qstash.upstash.io/v2/topics",
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        const latencyMs = Date.now() - startedAt;

        if (res.ok) {
            return {
                id: "upstash-qstash",
                name: "Upstash QStash",
                category: "infrastructure",
                critical: false,
                status: "operational",
                latencyMs,
                message: "File de tâches asynchrones opérationnelle.",
                checkedAt,
            };
        }

        return {
            id: "upstash-qstash",
            name: "Upstash QStash",
            category: "infrastructure",
            critical: false,
            status: res.status === 401 || res.status === 403 ? "degraded" : "outage",
            latencyMs,
            message:
                res.status === 401 || res.status === 403
                    ? "Jeton QStash refusé par le fournisseur."
                    : `Réponse inattendue du service (HTTP ${res.status}).`,
            checkedAt,
        };
    } catch {
        return {
            id: "upstash-qstash",
            name: "Upstash QStash",
            category: "infrastructure",
            critical: false,
            status: "outage",
            latencyMs: Date.now() - startedAt,
            message: "Service QStash injoignable ou délai dépassé.",
            checkedAt,
        };
    }
}

async function probeTigrisS3(): Promise<ServiceHealthItem> {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();

    if (!isTigrisConfigured()) {
        return {
            id: "tigris-s3",
            name: "Tigris Object Storage (S3)",
            category: "infrastructure",
            critical: false,
            status: "unconfigured",
            latencyMs: null,
            message: "Stockage objet S3 non configuré.",
            checkedAt,
        };
    }

    try {
        await withTimeout(
            s3Client.send(
                new HeadBucketCommand({
                    Bucket: process.env.TIGRIS_BUCKET_NAME!,
                })
            )
        );
        const latencyMs = Date.now() - startedAt;
        return {
            id: "tigris-s3",
            name: "Tigris Object Storage (S3)",
            category: "infrastructure",
            critical: false,
            status: "operational",
            latencyMs,
            message: "Stockage de documents et PDF opérationnel.",
            checkedAt,
        };
    } catch {
        return {
            id: "tigris-s3",
            name: "Tigris Object Storage (S3)",
            category: "infrastructure",
            critical: false,
            status: "outage",
            latencyMs: Date.now() - startedAt,
            message: "Bucket S3 Tigris inaccessible.",
            checkedAt,
        };
    }
}

async function probeResend(): Promise<ServiceHealthItem> {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();

    if (!isResendConfigured()) {
        return {
            id: "resend",
            name: "Resend (Emails & Alertes)",
            category: "messaging",
            critical: true,
            status: "unconfigured",
            latencyMs: null,
            message: "Clé API Resend non configurée.",
            checkedAt,
        };
    }

    const apiKey = (
        process.env.RESEND_KEY ||
        process.env.AUTH_RESEND_KEY ||
        ""
    ).trim();

    try {
        const res = await fetchWithTimeout("https://api.resend.com/domains", {
            method: "GET",
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        const latencyMs = Date.now() - startedAt;

        if (res.ok) {
            return {
                id: "resend",
                name: "Resend (Emails & Alertes)",
                category: "messaging",
                critical: true,
                status: "operational",
                latencyMs,
                message: "Service d'envoi d'emails opérationnel.",
                checkedAt,
            };
        }

        // Les clés Resend "sending_access" renvoient 401 sur /domains mais sont valides pour l'envoi
        if (res.status === 401 || res.status === 403) {
            const bodyText = await res.text().catch(() => "");
            if (bodyText.toLowerCase().includes("restricted to only send")) {
                return {
                    id: "resend",
                    name: "Resend (Emails & Alertes)",
                    category: "messaging",
                    critical: true,
                    status: "operational",
                    latencyMs,
                    message: "Clé d'envoi Resend active (portée envoi uniquement).",
                    checkedAt,
                };
            }

            return {
                id: "resend",
                name: "Resend (Emails & Alertes)",
                category: "messaging",
                critical: true,
                status: "degraded",
                latencyMs,
                message: "Clé API Resend rejetée par le fournisseur.",
                checkedAt,
            };
        }

        return {
            id: "resend",
            name: "Resend (Emails & Alertes)",
            category: "messaging",
            critical: true,
            status: "outage",
            latencyMs,
            message: `Erreur du service email (HTTP ${res.status}).`,
            checkedAt,
        };
    } catch {
        return {
            id: "resend",
            name: "Resend (Emails & Alertes)",
            category: "messaging",
            critical: true,
            status: "outage",
            latencyMs: Date.now() - startedAt,
            message: "API Resend injoignable ou délai dépassé.",
            checkedAt,
        };
    }
}

async function probeGemini(): Promise<ServiceHealthItem> {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
        return {
            id: "gemini-ai",
            name: "Google Gemini 2.5 (IA Principale)",
            category: "ai",
            critical: false,
            status: "unconfigured",
            latencyMs: null,
            message: "Clé API Gemini non configurée.",
            checkedAt,
        };
    }

    try {
        const model = encodeURIComponent(getGeminiModel());
        const res = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${encodeURIComponent(apiKey)}`,
            { method: "GET" }
        );
        const latencyMs = Date.now() - startedAt;

        if (res.ok) {
            return {
                id: "gemini-ai",
                name: "Google Gemini 2.5 (IA Principale)",
                category: "ai",
                critical: false,
                status: "operational",
                latencyMs,
                message: "Modèle Gemini disponible pour l'assistant IA.",
                checkedAt,
            };
        }

        return {
            id: "gemini-ai",
            name: "Google Gemini 2.5 (IA Principale)",
            category: "ai",
            critical: false,
            status: res.status === 429 ? "degraded" : "outage",
            latencyMs,
            message:
                res.status === 429
                    ? "Quota Gemini temporairement saturé (relais OpenRouter actif)."
                    : `Service Gemini indisponible (HTTP ${res.status}).`,
            checkedAt,
        };
    } catch {
        return {
            id: "gemini-ai",
            name: "Google Gemini 2.5 (IA Principale)",
            category: "ai",
            critical: false,
            status: "outage",
            latencyMs: Date.now() - startedAt,
            message: "API Gemini injoignable (relais OpenRouter / Mode Robot).",
            checkedAt,
        };
    }
}

async function probeOpenRouter(): Promise<ServiceHealthItem> {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();
    const apiKey = getOpenRouterApiKey();

    if (!apiKey) {
        return {
            id: "openrouter-ai",
            name: "OpenRouter / NVIDIA Nemotron (Relais IA)",
            category: "ai",
            critical: false,
            status: "unconfigured",
            latencyMs: null,
            message: "Clé API OpenRouter non configurée.",
            checkedAt,
        };
    }

    try {
        const res = await fetchWithTimeout(
            "https://openrouter.ai/api/v1/auth/key",
            {
                method: "GET",
                headers: { Authorization: `Bearer ${apiKey}` },
            }
        );
        const latencyMs = Date.now() - startedAt;

        if (res.ok) {
            return {
                id: "openrouter-ai",
                name: "OpenRouter / NVIDIA Nemotron (Relais IA)",
                category: "ai",
                critical: false,
                status: "operational",
                latencyMs,
                message: `Relais IA actif (${getOpenRouterModel()}).`,
                checkedAt,
            };
        }

        return {
            id: "openrouter-ai",
            name: "OpenRouter / NVIDIA Nemotron (Relais IA)",
            category: "ai",
            critical: false,
            status: res.status === 429 ? "degraded" : "outage",
            latencyMs,
            message:
                res.status === 429
                    ? "Limite de requêtes OpenRouter atteinte."
                    : `Relais OpenRouter indisponible (HTTP ${res.status}).`,
            checkedAt,
        };
    } catch {
        return {
            id: "openrouter-ai",
            name: "OpenRouter / NVIDIA Nemotron (Relais IA)",
            category: "ai",
            critical: false,
            status: "outage",
            latencyMs: Date.now() - startedAt,
            message: "API OpenRouter injoignable (Mode Robot en secours).",
            checkedAt,
        };
    }
}

async function probeOpenStreetMap(): Promise<ServiceHealthItem> {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();

    try {
        const res = await fetchWithTimeout(
            "https://photon.komoot.io/api/?q=Abidjan&limit=1",
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "User-Agent": "HBC-Logistique-HealthCheck/1.0",
                },
            }
        );
        const latencyMs = Date.now() - startedAt;

        if (res.ok) {
            return {
                id: "osm-geocoding",
                name: "OpenStreetMap (Photon / Nominatim)",
                category: "maps",
                critical: false,
                status: latencyMs > 2000 ? "degraded" : "operational",
                latencyMs,
                message: "Géocodage et cartes d'itinéraires opérationnels.",
                checkedAt,
            };
        }

        return {
            id: "osm-geocoding",
            name: "OpenStreetMap (Photon / Nominatim)",
            category: "maps",
            critical: false,
            status: "degraded",
            latencyMs,
            message: `Géocodage dégradé (HTTP ${res.status}).`,
            checkedAt,
        };
    } catch {
        return {
            id: "osm-geocoding",
            name: "OpenStreetMap (Photon / Nominatim)",
            category: "maps",
            critical: false,
            status: "outage",
            latencyMs: Date.now() - startedAt,
            message: "Service de géocodage OpenStreetMap injoignable.",
            checkedAt,
        };
    }
}

/**
 * Calcule la synthèse et le statut global d'une liste de sondes de services.
 */
export function buildHealthReport(
    services: ServiceHealthItem[],
    cached = false
): HealthReport {
    const checkedAt = new Date().toISOString();

    let operational = 0;
    let degraded = 0;
    let outage = 0;
    let unconfigured = 0;
    let latencySum = 0;
    let latencyCount = 0;

    let hasCriticalOutage = false;
    let hasAnyIssue = false;

    for (const svc of services) {
        if (svc.status === "operational") operational++;
        else if (svc.status === "degraded") {
            degraded++;
            hasAnyIssue = true;
        } else if (svc.status === "outage") {
            outage++;
            hasAnyIssue = true;
            if (svc.critical) hasCriticalOutage = true;
        } else {
            unconfigured++;
        }

        if (typeof svc.latencyMs === "number") {
            latencySum += svc.latencyMs;
            latencyCount++;
        }
    }

    const overallStatus: HealthReport["overallStatus"] = hasCriticalOutage
        ? "outage"
        : hasAnyIssue
          ? "degraded"
          : "operational";

    return {
        overallStatus,
        checkedAt,
        cached,
        summary: {
            operational,
            degraded,
            outage,
            unconfigured,
            total: services.length,
            averageLatencyMs:
                latencyCount > 0 ? Math.round(latencySum / latencyCount) : null,
        },
        services,
    };
}

/**
 * Acquiert un verrou dédupliqué (30 min) afin d'éviter le spam d'alertes email.
 */
async function acquireAlertLock(lockKey: string): Promise<boolean> {
    if (isRedisConfigured()) {
        try {
            const acquired = await withTimeout(
                redis.set(lockKey, "1", {
                    nx: true,
                    ex: ALERT_LOCK_TTL_SECONDS,
                }),
                1500
            );
            return acquired === "OK";
        } catch {
            // Repli sur le verrou mémoire si Redis est le service en panne
        }
    }

    const now = Date.now();
    const expiresAt = memoryAlertLocks.get(lockKey) ?? 0;
    if (expiresAt > now) {
        return false;
    }

    memoryAlertLocks.set(lockKey, now + ALERT_LOCK_TTL_SECONDS * 1000);
    return true;
}

/**
 * Envoie une alerte administrateur dédupliquée via Resend en cas de panne d'une dépendance critique.
 */
export async function maybeSendCriticalOutageAlert(
    report: HealthReport
): Promise<boolean> {
    const criticalOutages = report.services.filter(
        (svc) => svc.critical && svc.status === "outage"
    );

    if (criticalOutages.length === 0 || !isAnyEmailProviderConfigured()) {
        return false;
    }

    // Ne tente pas d'envoyer un email si Resend est l'unique dépendance en panne
    const resendDownOnly =
        criticalOutages.length === 1 && criticalOutages[0].id === "resend";
    if (resendDownOnly) {
        return false;
    }

    const lockSuffix = criticalOutages
        .map((svc) => svc.id)
        .sort()
        .join(",");
    const lockKey = `health:alert-lock:${lockSuffix}`;

    const locked = await acquireAlertLock(lockKey);
    if (!locked) {
        return false;
    }

    const adminEmail =
        process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
        COMPANY_CONFIG.contact.email;

    const serviceNames = criticalOutages.map((s) => s.name).join(", ");
    const details = criticalOutages
        .map((s) => `${s.name}: ${s.message}`)
        .join(" | ");

    try {
        if (!isAnyEmailProviderConfigured()) {
            return false;
        }
        const { error } = await sendTransactionalEmail({
            from: EMAIL_SENDER,
            to: [adminEmail],
            subject: `[ALERTE CRITICAL] Incident dépendance : ${serviceNames}`,
            react: AdminAlertEmail({
                title: `Indisponibilité critique détectée (${criticalOutages.length})`,
                severity: "critical",
                source: "Monitoring Uptime (/api/health)",
                summary: `Une ou plusieurs dépendances critiques de la plateforme ${COMPANY_CONFIG.shortName} ne répondent plus : ${serviceNames}.`,
                details,
                timestamp: report.checkedAt,
            }),
        });

        if (error) {
            logger.error("Échec envoi alerte critique Resend", error);
            return false;
        }

        logger.warn("Alerte critique d'uptime envoyée à l'administrateur", {
            services: lockSuffix,
        });
        return true;
    } catch (error: unknown) {
        logger.error("Exception envoi alerte critique Resend", error);
        return false;
    }
}

/**
 * Exécute les sondes de santé de toutes les dépendances externes (avec cache Redis 30s).
 */
export async function getSystemHealthReport(options?: {
    bypassCache?: boolean;
    triggerAlerts?: boolean;
}): Promise<HealthReport> {
    const bypassCache = options?.bypassCache ?? false;
    const triggerAlerts = options?.triggerAlerts ?? true;

    if (!bypassCache && isRedisConfigured()) {
        try {
            const cached = await withTimeout(
                redis.get<HealthReport>(HEALTH_CACHE_KEY),
                1200
            );
            if (cached && Array.isArray(cached.services)) {
                return { ...cached, cached: true };
            }
        } catch {
            // Poursuit avec les sondes en direct si la lecture cache échoue
        }
    }

    const services = await Promise.all([
        probeSupabasePostgres(),
        probeUpstashRedis(),
        probeUpstashQStash(),
        probeTigrisS3(),
        probeResend(),
        probeGemini(),
        probeOpenRouter(),
        probeOpenStreetMap(),
    ]);

    const report = buildHealthReport(services, false);

    if (isRedisConfigured()) {
        try {
            await withTimeout(
                redis.set(HEALTH_CACHE_KEY, report, {
                    ex: HEALTH_CACHE_TTL_SECONDS,
                }),
                1200
            );
        } catch {
            // Non bloquant si Redis est indisponible
        }
    }

    if (triggerAlerts && report.overallStatus === "outage") {
        void maybeSendCriticalOutageAlert(report);
    }

    return report;
}

/**
 * Réinitialise les verrous mémoire d'alerte (utilisé pour les tests unitaires).
 */
export function resetMemoryAlertLocksForTest(): void {
    memoryAlertLocks.clear();
}
