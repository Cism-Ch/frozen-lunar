import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { PdfService } from "@/lib/pdf";
import { s3Client, getPublicUrl } from "@/lib/storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";

async function handler(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, clientName, items, total, date } = body;

        // 1. Générer le PDF
        const pdfBuffer = await PdfService.generateQuotePdf({
            id,
            clientName,
            items: items || [],
            total: total || 0,
            date: date || new Date().toISOString(),
        });

        // 2. Uploader sur Tigris
        const fileName = `quotes/${id}.pdf`;
        const uploadParams = {
            Bucket: process.env.TIGRIS_BUCKET_NAME,
            Key: fileName,
            Body: pdfBuffer,
            ContentType: "application/pdf",
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // 3. Obtenir l'URL publique
        const publicUrl = getPublicUrl(fileName);

        return NextResponse.json({
            status: "PDF generated and uploaded",
            url: publicUrl
        });

    } catch (err) {
        console.error("PDF Worker Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export const POST = verifySignatureAppRouter(handler);
