import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getPublicUrl, uploadBufferToStorage } from "@/lib/storage";
import { verifyFileMagicBytes } from "@/lib/file-signature";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);

const ALLOWED_FOLDERS = new Set([
    "attachments",
    "quotes",
    "quotes-uploads",
    "partners-kyc",
    "fleet-images",
]);

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 Mo (compatible plafond Vercel 4.5 Mo)

/**
 * Route d'upload serveur sécurisée (`POST /api/upload`) :
 * - Contourne les blocages CORS navigateur vers Tigris S3.
 * - Valide strictement le type MIME, la taille (<= 4 Mo) et le dossier cible.
 * - Exige le rôle administrateur pour le dossier `fleet-images`.
 * - N'expose jamais d'URL publique pour le dossier privé `partners-kyc`.
 */
export async function POST(request: NextRequest) {
    try {
        // Protection anti-abus S3 (25 téléversements / 10 min par IP)
        const rl = await checkRateLimit({
            scope: "api-upload",
            limit: 25,
            windowSeconds: 600,
        });
        if (!rl.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trop de téléversements récents. Veuillez patienter quelques minutes.",
                },
                { status: 429 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const rawFolder = String(formData.get("folder") || "attachments").trim();

        if (!(file instanceof File)) {
            return NextResponse.json(
                { success: false, error: "Aucun fichier fourni." },
                { status: 400 }
            );
        }

        if (!ALLOWED_FOLDERS.has(rawFolder)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Dossier de destination non autorisé.",
                },
                { status: 400 }
            );
        }

        // Le téléversement d'images de flotte est strictement réservé aux administrateurs
        if (rawFolder === "fleet-images") {
            const session = await auth.api.getSession({
                headers: await headers(),
            });
            if (!session?.user || session.user.role !== "admin") {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Accès refusé. Rôle administrateur requis pour les images flotte.",
                    },
                    { status: 403 }
                );
            }
        }

        const mimeType = file.type || "application/octet-stream";
        if (!ALLOWED_MIME_TYPES.has(mimeType)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Format non autorisé. Formats acceptés : PDF, JPG, PNG, WEBP.",
                },
                { status: 400 }
            );
        }

        if (rawFolder === "fleet-images" && mimeType === "application/pdf") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Les véhicules nécessitent une image (JPG, PNG ou WEBP).",
                },
                { status: 400 }
            );
        }

        if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Fichier trop volumineux (maximum 4 Mo après compression).",
                },
                { status: 413 }
            );
        }

        const normalizedFolder =
            rawFolder === "quotes" ? "quotes-uploads" : rawFolder;
        const sanitizedName = file.name
            .replace(/\.\./g, "_")
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .slice(0, 120);
        const key = `${normalizedFolder}/${Date.now()}_${sanitizedName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Vérification défensive des magic bytes (anti-spoofing MIME)
        if (!verifyFileMagicBytes(buffer, mimeType)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Le contenu réel du fichier ne correspond pas au format déclaré (PDF, JPG, PNG ou WEBP requis).",
                },
                { status: 400 }
            );
        }

        const uploadResult = await uploadBufferToStorage(key, buffer, mimeType);

        // Résolution de l'URL retournée selon la confidentialité du dossier
        let publicUrl: string | null = null;
        if (normalizedFolder === "partners-kyc") {
            publicUrl = null; // Jamais d'URL publique pour le KYC privé
        } else if (normalizedFolder === "fleet-images") {
            publicUrl = uploadResult.storedInS3
                ? `/api/fleet-image/${key}`
                : getPublicUrl(key);
        } else {
            publicUrl = getPublicUrl(key);
        }

        return NextResponse.json({
            success: true,
            key,
            publicUrl,
            fileName: file.name,
            fileSize: file.size,
            storedInS3: uploadResult.storedInS3,
        });
    } catch (error: unknown) {
        logger.error("POST /api/upload error", error);
        return NextResponse.json(
            {
                success: false,
                error: "Erreur serveur lors du téléversement du fichier.",
            },
            { status: 500 }
        );
    }
}
