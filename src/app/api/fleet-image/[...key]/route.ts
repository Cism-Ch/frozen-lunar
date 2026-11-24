import { NextRequest, NextResponse } from "next/server";
import { getObjectFromStorage } from "@/lib/storage";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Proxy public sécurisé pour servir les images de véhicules uploadées dans `fleet-images/`.
 * Garantit l'affichage sur `/flotte` même si le bucket Tigris S3 est configuré en privé,
 * tout en bloquant strictement tout accès à `partners-kyc/` ou à toute traversée de répertoire.
 */
export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ key: string[] }> }
) {
    try {
        const { key: segments } = await context.params;
        const joinedKey = (segments || []).join("/");

        if (
            !joinedKey.startsWith("fleet-images/") ||
            joinedKey.includes("..")
        ) {
            return NextResponse.json(
                { error: "Accès non autorisé." },
                { status: 403 }
            );
        }

        const obj = await getObjectFromStorage(joinedKey);
        if (!obj || !obj.Body) {
            return NextResponse.json(
                { error: "Image introuvable." },
                { status: 404 }
            );
        }

        const bytes = await obj.Body.transformToByteArray();
        const rawType = (obj.ContentType || "image/webp").toLowerCase();
        const SAFE_IMAGE_MIMES = new Set([
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ]);
        const contentType = SAFE_IMAGE_MIMES.has(rawType)
            ? rawType
            : "application/octet-stream";

        return new NextResponse(Buffer.from(bytes), {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "public, max-age=86400, immutable",
            },
        });
    } catch (error: unknown) {
        logger.error("GET /api/fleet-image error", error);
        return NextResponse.json(
            { error: "Impossible de charger l'image." },
            { status: 404 }
        );
    }
}
