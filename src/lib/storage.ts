import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "@/lib/logger";

const S3_BUCKET_NAME = process.env.TIGRIS_BUCKET_NAME || "frozen-lunar-bucket";
const S3_REGION = process.env.AWS_REGION || "auto";

const hasTigrisConfig = !!(
    process.env.TIGRIS_STORAGE_ACCESS_KEY_ID &&
    process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY &&
    process.env.TIGRIS_BUCKET_NAME
);

if (!hasTigrisConfig) {
    logger.warn(
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
        logger.info(
            "ℹ️ Tigris non configuré. URL pré-signée simulée pour dev."
        );
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

/**
 * Indique si Tigris S3 est configuré côté serveur.
 */
export function isTigrisConfigured(): boolean {
    return hasTigrisConfig;
}

/**
 * Téléverse directement un Buffer depuis le serveur vers Tigris S3 (évite les blocages CORS navigateur).
 */
export async function uploadBufferToStorage(
    key: string,
    body: Buffer,
    contentType: string
): Promise<{ storedInS3: boolean; key: string }> {
    if (!hasTigrisConfig) {
        logger.info("ℹ️ Tigris non configuré. Upload serveur simulé en local.", {
            key,
        });
        return { storedInS3: false, key };
    }

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    await s3Client.send(command);
    return { storedInS3: true, key };
}

/**
 * Lit un objet depuis Tigris S3 (utilisé par le proxy d'images flotte).
 */
export async function getObjectFromStorage(key: string) {
    if (!hasTigrisConfig) {
        return null;
    }

    const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
    });
    return await s3Client.send(command);
}

/**
 * Génère une URL pré-signée temporaire en lecture (GET) pour les documents privés (ex: KYC partenaires).
 * @param key Clé S3 du document privé
 * @param expiresIn Durée de validité en secondes (défaut : 300s)
 */
export async function getPrivateDownloadUrl(
    key: string,
    expiresIn = 300
): Promise<string> {
    if (!hasTigrisConfig) {
        logger.info(
            "ℹ️ Tigris non configuré. URL de lecture KYC signée simulée pour dev."
        );
        return `http://localhost:3000/api/mock-kyc-download?key=${encodeURIComponent(key)}&expires=${expiresIn}`;
    }

    const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn });
}
