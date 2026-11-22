import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { z } from "zod";
import { resend, EMAIL_SENDER } from "@/lib/email";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { QuoteRequestEmail } from "@/components/emails/QuoteRequestEmail";
import { QuoteConfirmationEmail } from "@/components/emails/QuoteConfirmationEmail";
import { AdminAlertEmail } from "@/components/emails/AdminAlertEmail";
import { QuoteStatusUpdateEmail } from "@/components/emails/QuoteStatusUpdateEmail";
import { logger } from "@/lib/logger";

const quoteEmailSchema = z.object({
    type: z
        .enum(["admin_notification", "client_confirmation"])
        .optional()
        .default("admin_notification"),
    clientName: z.string().min(1).max(200),
    email: z.string().email(),
    phone: z.string().min(1).max(50),
    pickup: z.string().min(1).max(500),
    dropoff: z.string().min(1).max(500),
    itemType: z.string().min(1).max(200),
    date: z.string().min(1).max(100),
    quoteId: z.string().min(1).max(100),
});

const adminAlertSchema = z.object({
    type: z.literal("admin_alert"),
    title: z.string().min(1).max(200),
    severity: z.enum(["info", "warning", "critical"]),
    source: z.string().min(1).max(120),
    summary: z.string().min(1).max(2000),
    details: z.string().max(2000).optional(),
    timestamp: z.string().max(100).optional(),
    recipientEmail: z.string().email().optional(),
});

const quoteStatusSchema = z.object({
    type: z.literal("quote_status_update"),
    clientName: z.string().min(1).max(200),
    email: z.string().email(),
    quoteId: z.string().min(1).max(100),
    status: z.enum(["VALIDATED", "REJECTED"]),
    amount: z.string().max(120).optional(),
    pickup: z.string().min(1).max(500),
    dropoff: z.string().min(1).max(500),
    note: z.string().max(1000).optional(),
});

const emailWorkflowSchema = z.union([
    adminAlertSchema,
    quoteStatusSchema,
    quoteEmailSchema,
]);

async function handler(req: NextRequest) {
    try {
        const rawBody: unknown = await req.json();
        const parsed = emailWorkflowSchema.safeParse(rawBody);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Payload webhook email invalide",
                    details: parsed.error.issues[0]?.message,
                },
                { status: 400 }
            );
        }

        const adminEmail =
            process.env.ADMIN_NOTIFICATION_EMAIL ||
            COMPANY_CONFIG.contact.email;
        const payload = parsed.data;

        if (payload.type === "admin_alert") {
            const { data, error } = await resend.emails.send({
                from: EMAIL_SENDER,
                to: [payload.recipientEmail || adminEmail],
                subject: `[ALERTE ${payload.severity.toUpperCase()}] ${payload.title}`,
                react: AdminAlertEmail({
                    title: payload.title,
                    severity: payload.severity,
                    source: payload.source,
                    summary: payload.summary,
                    details: payload.details,
                    timestamp:
                        payload.timestamp ||
                        new Date().toISOString(),
                }),
            });

            if (error) {
                logger.error("Resend Admin Alert Error", error);
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                status: "Admin alert email sent",
                data,
            });
        }

        if (payload.type === "quote_status_update") {
            const { data, error } = await resend.emails.send({
                from: EMAIL_SENDER,
                to: [payload.email],
                subject:
                    payload.status === "VALIDATED"
                        ? `Devis #${payload.quoteId} validé — ${COMPANY_CONFIG.shortName}`
                        : `Mise à jour de votre devis #${payload.quoteId} — ${COMPANY_CONFIG.shortName}`,
                react: QuoteStatusUpdateEmail({
                    clientName: payload.clientName,
                    quoteId: payload.quoteId,
                    status: payload.status,
                    amount: payload.amount,
                    pickup: payload.pickup,
                    dropoff: payload.dropoff,
                    note: payload.note,
                }),
            });

            if (error) {
                logger.error("Resend Quote Status Error", error);
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                status: "Quote status email sent",
                data,
            });
        }

        if (payload.type === "client_confirmation") {
            const { data, error } = await resend.emails.send({
                from: EMAIL_SENDER,
                to: [payload.email],
                subject: `Confirmation de votre demande de devis #${payload.quoteId} - ${COMPANY_CONFIG.shortName}`,
                react: QuoteConfirmationEmail({
                    clientName: payload.clientName,
                    pickup: payload.pickup,
                    dropoff: payload.dropoff,
                    itemType: payload.itemType,
                    date: payload.date,
                    quoteId: payload.quoteId,
                }),
            });

            if (error) {
                logger.error("Resend Client Confirmation Error", error);
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                status: "Client confirmation email sent",
                data,
            });
        }

        // Par défaut: notification administrateur de nouveau devis
        const { data, error } = await resend.emails.send({
            from: EMAIL_SENDER,
            to: [adminEmail],
            subject: `[ADMIN] Nouvelle demande de devis : ${payload.itemType} (#${payload.quoteId})`,
            react: QuoteRequestEmail({
                clientName: payload.clientName,
                email: payload.email,
                phone: payload.phone,
                pickup: payload.pickup,
                dropoff: payload.dropoff,
                itemType: payload.itemType,
                date: payload.date,
                quoteId: payload.quoteId,
            }),
        });

        if (error) {
            logger.error("Resend Admin Notification Error", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            status: "Admin notification email sent",
            data,
        });
    } catch (err: unknown) {
        logger.error("Email Workflow Error", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error
                        ? err.message
                        : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}

// Sécurisation stricte fail-closed de la route webhook QStash :
// En production, les clés de signature QStash sont obligatoires (HTTP 503 si absentes).
const hasQStashKeys = Boolean(
    process.env.QSTASH_CURRENT_SIGNING_KEY &&
    process.env.QSTASH_NEXT_SIGNING_KEY
);

async function unconfiguredProdHandler() {
    logger.error(
        "QStash signing keys missing in production on /api/workflow/email"
    );
    return NextResponse.json(
        { error: "Webhook signature verification not configured" },
        { status: 503 }
    );
}

export const POST = hasQStashKeys
    ? verifySignatureAppRouter(handler)
    : process.env.NODE_ENV === "production"
      ? unconfiguredProdHandler
      : handler;
