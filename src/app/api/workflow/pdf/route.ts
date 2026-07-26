import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { PdfService } from "@/lib/pdf";
import { s3Client, getPublicUrl } from "@/lib/storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PdfWorkflowPayload } from "@/lib/qstash";

async function handler(req: NextRequest) {
    try {
        const body = (await req.json()) as PdfWorkflowPayload;
        const { id, clientName, items, total, date } = body;

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
        console.error("PDF Worker Error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

export const POST =
    process.env.QSTASH_CURRENT_SIGNING_KEY
        ? verifySignatureAppRouter(handler)
        : handler;
