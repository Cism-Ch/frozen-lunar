import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_BUCKET_NAME = process.env.TIGRIS_BUCKET_NAME!;
const S3_REGION = process.env.AWS_REGION || "auto";

if (!process.env.TIGRIS_STORAGE_ACCESS_KEY_ID || !process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY || !process.env.TIGRIS_BUCKET_NAME) {
    console.warn("⚠️ Tigris environment variables are missing.");
}

export const s3Client = new S3Client({
    region: S3_REGION,
    endpoint: process.env.TIGRIS_STORAGE_ENDPOINT || "https://fly.storage.tigris.dev",
    credentials: {
        accessKeyId: process.env.TIGRIS_STORAGE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // Required for some S3-compatible providers
});

/**
 * Génère une URL pré-signée pour uploader un fichier directement depuis le client.
 * @param key Nom du fichier (chemin inclus)
 * @param contentType Type MIME du fichier
 * @param expiresIn Durée de validité en secondes (défaut : 60s)
 */
export async function getUploadUrl(key: string, contentType: string, expiresIn = 60) {
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
export function getPublicUrl(key: string) {
    return `${process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_URL || process.env.TIGRIS_STORAGE_ENDPOINT}/${S3_BUCKET_NAME}/${key}`;
}
