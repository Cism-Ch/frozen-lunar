import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getObjectFromStorage } from "@/lib/storage";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const ALLOWED_PREFIXES = [
    "attachments/",
    "quotes-uploads/",
    "quotes/",
    "partners-kyc/",
];

const SAFE_ATTACHMENT_MIMES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);

function sanitizeDownloadFilename(key: string): string {
    const rawName = key.split("/").pop() || "piece-jointe";
    return rawName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

/**
 * Proxy authentifié sécurisé (`GET /api/attachments/[...key]`) :
 * - Exige un administrateur authentifié (évite toute fuite IDOR sur les pièces jointes / KYC).
 * - Bloque strictement toute traversée de répertoire (`..`, `\`) et tout préfixe non autorisé.
 * - Supporte `?download=1` pour forcer le téléchargement local (`Content-Disposition: attachment`),
 *   ou l'affichage natif navigateur (`inline`) avec `X-Content-Type-Options: nosniff`.
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ key: string[] }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Authentification requise." },
                { status: 401 }
            );
        }

        if (session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Accès réservé aux administrateurs." },
                { status: 403 }
            );
        }

        const { key: segments } = await context.params;
        const joinedKey = (segments || []).join("/");

        if (
            !joinedKey ||
            joinedKey.includes("..") ||
            joinedKey.includes("\\") ||
            joinedKey.includes("\0") ||
            !ALLOWED_PREFIXES.some((prefix) => joinedKey.startsWith(prefix))
        ) {
            return NextResponse.json(
                { error: "Chemin de pièce jointe non autorisé." },
                { status: 403 }
            );
        }

        const obj = await getObjectFromStorage(joinedKey);
        if (!obj || !obj.Body) {
            return NextResponse.json(
                { error: "Pièce jointe introuvable." },
                { status: 404 }
            );
        }

        const bytes = await obj.Body.transformToByteArray();
        const rawType = (obj.ContentType || "application/octet-stream")
            .split(";")[0]
            .trim()
            .toLowerCase();
        const contentType = SAFE_ATTACHMENT_MIMES.has(rawType)
            ? rawType
            : "application/octet-stream";

        const forceDownload =
            request.nextUrl.searchParams.get("download") === "1";
        const filename = sanitizeDownloadFilename(joinedKey);
        const disposition =
            forceDownload || contentType === "application/octet-stream"
                ? `attachment; filename="${filename}"`
                : `inline; filename="${filename}"`;

        return new NextResponse(Buffer.from(bytes), {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": disposition,
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "private, no-store, max-age=0",
            },
        });
    } catch (error: unknown) {
        logger.error("GET /api/attachments error", error);
        return NextResponse.json(
            { error: "Impossible de récupérer la pièce jointe." },
            { status: 500 }
        );
    }
}
