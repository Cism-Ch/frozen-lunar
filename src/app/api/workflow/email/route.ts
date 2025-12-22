import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { resend, EMAIL_SENDER } from "@/lib/email";
import { QuoteRequestEmail } from "@/components/emails/QuoteRequestEmail";

async function handler(req: NextRequest) {
    try {
        const body = await req.json();
        const { clientName, email, phone, pickup, dropoff, itemType, date, quoteId } = body;

        const { data, error } = await resend.emails.send({
            from: EMAIL_SENDER,
            to: ["hanok.hanokbbb@gmail.com"], // À remplacer par l'email de l'admin ou configurer via ENV
            subject: `Nouvelle demande de devis : ${itemType}`,
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
            console.error("Resend Error:", error);
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ status: "Email sent", data });
    } catch (err) {
        console.error("Email Workflow Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Sécurise la route pour n'accepter que les requêtes signées par QStash
export const POST = verifySignatureAppRouter(handler);
