import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { resend, EMAIL_SENDER } from "@/lib/email";
import { QuoteRequestEmail } from "@/components/emails/QuoteRequestEmail";
import { QuoteConfirmationEmail } from "@/components/emails/QuoteConfirmationEmail";
import { EmailWorkflowPayload } from "@/lib/qstash";

async function handler(req: NextRequest) {
    try {
        const body = (await req.json()) as EmailWorkflowPayload;
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
        } = body;

        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "contact@hbc-logistique.fr";

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
                console.error("Resend Client Confirmation Error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ status: "Client confirmation email sent", data });
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
            console.error("Resend Admin Notification Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ status: "Admin notification email sent", data });
    } catch (err: unknown) {
        console.error("Email Workflow Error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Sécurise la route en production via QStash signature
export const POST =
    process.env.QSTASH_CURRENT_SIGNING_KEY
        ? verifySignatureAppRouter(handler)
        : handler;
