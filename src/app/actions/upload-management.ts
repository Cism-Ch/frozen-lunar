"use server";

import {
    getUploadUrl,
    getPublicUrl,
    getPrivateDownloadUrl,
} from "@/lib/storage";
import { requireAdmin } from "@/lib/auth-guard";
import { handleError } from "@/lib/error-handler";
import { ERROR_CODES } from "@/lib/error-codes";
import { z } from "zod";
import { logger } from "@/lib/logger";

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

const ALLOWED_UPLOAD_FOLDERS = [
    "attachments",
    "quotes",
    "quotes-uploads",
    "partners-kyc",
    "fleet-images",
] as const;

const presignedUrlSchema = z.object({
    fileName: z.string().min(1, "Nom du fichier requis").max(200),
    fileType: z
        .string()
        .refine(
            (type) => ALLOWED_MIME_TYPES.includes(type),
            "Format de fichier non autorisé. Formats acceptés : PDF, JPG, PNG, WEBP"
        ),
    fileSize: z
        .number()
        .positive("Taille de fichier invalide")
        .max(
            MAX_FILE_SIZE_BYTES,
            "La taille du fichier ne doit pas dépasser 10 Mo"
        ),
    folder: z.enum(ALLOWED_UPLOAD_FOLDERS).optional().default("attachments"),
});

const kycKeySchema = z
    .string()
    .trim()
    .min(15, "Clé de document KYC invalide")
    .max(300)
    .refine(
        (key) => key.startsWith("partners-kyc/") && !key.includes(".."),
        "Accès restreint au répertoire privé partners-kyc"
    );

/**
 * Server Action pour générer une URL pré-signée d'upload vers Tigris S3.
 * Pour le dossier privé `partners-kyc`, aucune URL publique n'est exposée (`publicUrl: null`).
 */
export async function getPresignedUploadUrlAction(input: unknown) {
    try {
        const validated = presignedUrlSchema.parse(input);

        // Assainir strictement le nom du fichier (aucune traversée de répertoire possible)
        const sanitizedName = validated.fileName
            .replace(/\.\./g, "_")
            .replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueKey = `${validated.folder}/${Date.now()}_${sanitizedName}`;

        const uploadUrl = await getUploadUrl(
            uniqueKey,
            validated.fileType,
            300
        );
        const isPrivateKyc = validated.folder === "partners-kyc";
        const publicUrl = isPrivateKyc ? null : getPublicUrl(uniqueKey);

        return {
            success: true,
            uploadUrl,
            publicUrl,
            key: uniqueKey,
        };
    } catch (error: unknown) {
        logger.error("Presigned Upload URL Error", error);
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
                code: ERROR_CODES.INVALID_FORMAT.code,
            };
        }
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
            code: errorResponse.code,
        };
    }
}

/**
 * Génère une URL pré-signée de lecture (validité 300s) pour un document KYC partenaire.
 * Strictement réservé aux administrateurs authentifiés (`requireAdmin()`).
 */
export async function getKycDocumentSignedUrlAction(key: string): Promise<{
    data: { signedUrl: string; expiresInSeconds: number } | null;
    error: string | null;
}> {
    try {
        await requireAdmin();

        const parsed = kycKeySchema.safeParse(key);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Clé de document KYC non valide.",
            };
        }

        const signedUrl = await getPrivateDownloadUrl(parsed.data, 300);
        return {
            data: { signedUrl, expiresInSeconds: 300 },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("getKycDocumentSignedUrlAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de générer le lien sécurisé du document KYC.",
        };
    }
}
