"use server";

import { getUploadUrl, getPublicUrl } from "@/lib/storage";
import { handleError } from "@/lib/error-handler";
import { ERROR_CODES } from "@/lib/error-codes";
import { z } from "zod";

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

const presignedUrlSchema = z.object({
    fileName: z.string().min(1, "Nom du fichier requis"),
    fileType: z.string().refine(
        (type) => ALLOWED_MIME_TYPES.includes(type),
        "Format de fichier non autorisé. Formats acceptés : PDF, JPG, PNG, WEBP"
    ),
    fileSize: z.number().max(MAX_FILE_SIZE_BYTES, "La taille du fichier ne doit pas dépasser 10 Mo"),
    folder: z.string().optional().default("attachments"),
});

/**
 * Server Action pour générer une URL pré-signée d'upload vers Tigris S3.
 */
export async function getPresignedUploadUrlAction(input: unknown) {
    try {
        const validated = presignedUrlSchema.parse(input);

        // Sanitiniser le nom du fichier et générer une clé S3 unique
        const sanitizedName = validated.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueKey = `${validated.folder}/${Date.now()}_${sanitizedName}`;

        const uploadUrl = await getUploadUrl(uniqueKey, validated.fileType, 300);
        const publicUrl = getPublicUrl(uniqueKey);

        return {
            success: true,
            uploadUrl,
            publicUrl,
            key: uniqueKey,
        };
    } catch (error: unknown) {
        console.error("Presigned Upload URL Error:", error);
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
