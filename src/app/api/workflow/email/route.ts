import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { z } from "zod";
import { resend, EMAIL_SENDER } from "@/lib/email";
import { QuoteRequestEmail } from "@/components/emails/QuoteRequestEmail";
import { QuoteConfirmationEmail } from "@/components/emails/QuoteConfirmationEmail";
import { logger } from "@/lib/logger";

const emailWorkflowSchema = z.object({
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

        const {
            type,
            clientName,
            email,
            phone,
            pickup,
            dropoff,
            itemType,
            date,
            quoteId,
        } = parsed.data;

        const adminEmail =
            process.env.ADMIN_NOTIFICATION_EMAIL || "contact@hbc-logistique.fr";

        if (type === "client_confirmation") {
            // Envoi de la confirmation au client
            const { data, error } = await resend.emails.send({
                from: EMAIL_SENDER,
                to: [email],
                subject: `Confirmation de votre demande de devis #${quoteId} - HBC Logistique`,
                react: QuoteConfirmationEmail({
                    clientName,
                    pickup,
                    dropoff,
                    itemType,
                    date,
                    quoteId,
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

        // Par défaut: notification administrateur
        const { data, error } = await resend.emails.send({
            from: EMAIL_SENDER,
            to: [adminEmail],
            subject: `[ADMIN] Nouvelle demande de devis : ${itemType} (#${quoteId})`,
            react: QuoteRequestEmail({
                clientName,
                email,
                phone,
                pickup,
                dropoff,
                itemType,
                date,
                quoteId,
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
