import {
    S3Client,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_BUCKET_NAME = process.env.TIGRIS_BUCKET_NAME || "frozen-lunar-bucket";
const S3_REGION = process.env.AWS_REGION || "auto";

const hasTigrisConfig = !!(
    process.env.TIGRIS_STORAGE_ACCESS_KEY_ID &&
    process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY &&
    process.env.TIGRIS_BUCKET_NAME
);

if (!hasTigrisConfig) {
    console.warn(
        "⚠️ Tigris environment variables are missing (TIGRIS_STORAGE_*). Upload fallback enabled."
    );
}

export const s3Client = new S3Client({
    region: S3_REGION,
    endpoint:
        process.env.TIGRIS_STORAGE_ENDPOINT || "https://fly.storage.tigris.dev",
    credentials: {
        accessKeyId:
            process.env.TIGRIS_STORAGE_ACCESS_KEY_ID ||
            process.env.AWS_ACCESS_KEY_ID ||
            "dummy-access-key",
        secretAccessKey:
            process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY ||
            process.env.AWS_SECRET_ACCESS_KEY ||
            "dummy-secret-key",
    },
    forcePathStyle: true,
});

/**
 * Génère une URL pré-signée pour uploader un fichier directement depuis le client.
 * @param key Nom du fichier (chemin inclus)
 * @param contentType Type MIME du fichier
 * @param expiresIn Durée de validité en secondes (défaut : 300s)
 */
export async function getUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 300
): Promise<string> {
    if (!hasTigrisConfig) {
        console.log("ℹ️ Tigris non configuré. URL pré-signée simulée pour dev.");
        return `http://localhost:3000/api/mock-upload?key=${encodeURIComponent(key)}`;
    }

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });
    return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Génère une URL publique pour accéder à un fichier.
 * @param key Nom du fichier
 */
export function getPublicUrl(key: string): string {
    const publicUrlBase =
        process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_URL ||
        process.env.TIGRIS_STORAGE_ENDPOINT ||
        "https://fly.storage.tigris.dev";
    return `${publicUrlBase}/${S3_BUCKET_NAME}/${key}`;
}
