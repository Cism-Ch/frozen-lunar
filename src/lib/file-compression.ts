/**
 * Utilitaire léger de compression d'images côté navigateur (Canvas natif, zéro dépendance)
 * afin d'alléger automatiquement les photos avant upload vers `POST /api/upload` (plafond 4 Mo).
 */

export const MAX_SERVER_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 Mo (compatible limite Vercel 4.5 Mo)

export interface CompressionResult {
    file: File;
    wasCompressed: boolean;
    originalSize: number;
    finalSize: number;
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

/**
 * Compresse automatiquement une image (JPG, PNG, WEBP) via HTMLCanvasElement.
 * Les PDF ou fichiers déjà légers (< 350 Ko) sont retournés intacts.
 */
export async function compressFileForUpload(
    file: File,
    options?: { maxDimension?: number; quality?: number }
): Promise<CompressionResult> {
    const originalSize = file.size;
    const isCompressibleImage =
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png" ||
        file.type === "image/webp";

    // Ne touche pas aux PDF ni aux petites images déjà légères
    if (
        !isCompressibleImage ||
        typeof window === "undefined" ||
        originalSize < 350 * 1024
    ) {
        return {
            file,
            wasCompressed: false,
            originalSize,
            finalSize: originalSize,
        };
    }

    const maxDim = options?.maxDimension ?? 1600;
    const quality = options?.quality ?? 0.82;

    try {
        const imageBitmap = await createImageBitmap(file);
        const scale = Math.min(
            1,
            maxDim / Math.max(imageBitmap.width, imageBitmap.height)
        );
        const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
        const targetHeight = Math.max(
            1,
            Math.round(imageBitmap.height * scale)
        );

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            imageBitmap.close();
            return {
                file,
                wasCompressed: false,
                originalSize,
                finalSize: originalSize,
            };
        }

        ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
        imageBitmap.close();

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/webp", quality);
        });

        if (!blob || blob.size >= originalSize) {
            return {
                file,
                wasCompressed: false,
                originalSize,
                finalSize: originalSize,
            };
        }

        const baseName = file.name.replace(/\.[^.]+$/, "");
        const compressedFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
        });

        return {
            file: compressedFile,
            wasCompressed: true,
            originalSize,
            finalSize: compressedFile.size,
        };
    } catch {
        return {
            file,
            wasCompressed: false,
            originalSize,
            finalSize: originalSize,
        };
    }
}
