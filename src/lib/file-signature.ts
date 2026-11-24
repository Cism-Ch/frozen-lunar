/**
 * Validation défensive des signatures binaires (magic bytes) des fichiers téléversés.
 * Empêche le spoofing de Content-Type (ex: fichier HTML/JS renommé en .png ou .pdf).
 */

export type AllowedBinaryMime =
    | "application/pdf"
    | "image/jpeg"
    | "image/jpg"
    | "image/png"
    | "image/webp";

export function verifyFileMagicBytes(
    buffer: Buffer,
    declaredMime: string
): boolean {
    if (!buffer || buffer.length < 4) return false;

    const mime = declaredMime.toLowerCase().trim();

    if (mime === "application/pdf") {
        // %PDF- (0x25 0x50 0x44 0x46 0x2D)
        return (
            buffer.length >= 5 &&
            buffer[0] === 0x25 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x44 &&
            buffer[3] === 0x46 &&
            buffer[4] === 0x2d
        );
    }

    if (mime === "image/jpeg" || mime === "image/jpg") {
        // FF D8 FF
        return (
            buffer.length >= 3 &&
            buffer[0] === 0xff &&
            buffer[1] === 0xd8 &&
            buffer[2] === 0xff
        );
    }

    if (mime === "image/png") {
        // 89 50 4E 47 0D 0A 1A 0A
        return (
            buffer.length >= 8 &&
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47 &&
            buffer[4] === 0x0d &&
            buffer[5] === 0x0a &&
            buffer[6] === 0x1a &&
            buffer[7] === 0x0a
        );
    }

    if (mime === "image/webp") {
        // RIFF....WEBP
        return (
            buffer.length >= 12 &&
            buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
            buffer.subarray(8, 12).toString("ascii") === "WEBP"
        );
    }

    return false;
}
