import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { z } from "zod";
import { PdfService } from "@/lib/pdf";
import { s3Client, getPublicUrl } from "@/lib/storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { logger } from "@/lib/logger";

const pdfWorkflowSchema = z.object({
    id: z
        .string()
        .regex(
            /^[a-zA-Z0-9_-]{1,64}$/,
            "Identifiant de devis invalide pour génération PDF"
        ),
    clientName: z.string().min(1).max(200),
    items: z
        .array(
            z.object({
                description: z.string().min(1).max(500),
                quantity: z.number().finite().nonnegative().default(1),
                price: z.number().finite().nonnegative(),
            })
        )
        .default([]),
    total: z.number().finite().nonnegative().default(0),
    date: z.string().max(100).optional(),
});

async function handler(req: NextRequest) {
    try {
        const rawBody: unknown = await req.json();
        const parsed = pdfWorkflowSchema.safeParse(rawBody);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Payload webhook PDF invalide",
                    details: parsed.error.issues[0]?.message,
                },
                { status: 400 }
            );
        }

        const { id, clientName, items, total, date } = parsed.data;

        // 1. Générer le PDF
        const pdfBuffer = await PdfService.generateQuotePdf({
            id,
            clientName,
            items: items || [],
            total: total || 0,
            date: date || new Date().toISOString(),
        });

        // 2. Uploader sur Tigris S3 si configuré
        const fileName = `quotes/${id}.pdf`;
        if (process.env.TIGRIS_BUCKET_NAME) {
            const uploadParams = {
                Bucket: process.env.TIGRIS_BUCKET_NAME,
                Key: fileName,
                Body: pdfBuffer,
                ContentType: "application/pdf",
            };

            await s3Client.send(new PutObjectCommand(uploadParams));
        }

        // 3. Obtenir l'URL publique
        const publicUrl = getPublicUrl(fileName);

        return NextResponse.json({
            status: "PDF generated and uploaded",
            url: publicUrl,
        });
    } catch (err: unknown) {
        logger.error("PDF Worker Error", err);
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
        "QStash signing keys missing in production on /api/workflow/pdf"
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
