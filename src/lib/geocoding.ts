import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Coordonnées par défaut pour le centrage de la carte (Abidjan, Côte d'Ivoire).
 */
export const DEFAULT_MAP_CENTER = {
    lat: 5.36,
    lon: -4.0083,
} as const;

export interface LocationSuggestion {
    id: string;
    label: string;
    primaryText: string;
    secondaryText: string;
    lat: number;
    lon: number;
}

export interface ReverseGeocodeResult {
    label: string;
    lat: number;
    lon: number;
}

export type GeocodingResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

const photonFeatureSchema = z.object({
    geometry: z.object({
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    properties: z.object({
        osm_id: z.union([z.number(), z.string()]).optional(),
        name: z.string().optional(),
        housenumber: z.string().optional(),
        street: z.string().optional(),
        district: z.string().optional(),
        locality: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postcode: z.string().optional(),
        country: z.string().optional(),
    }),
});

const photonResponseSchema = z.object({
    features: z.array(photonFeatureSchema),
});

const nominatimReverseSchema = z.object({
    display_name: z.string().optional(),
    address: z
        .object({
            road: z.string().optional(),
            house_number: z.string().optional(),
            neighbourhood: z.string().optional(),
            suburb: z.string().optional(),
            city_district: z.string().optional(),
            city: z.string().optional(),
            town: z.string().optional(),
            village: z.string().optional(),
            state: z.string().optional(),
            country: z.string().optional(),
        })
        .optional(),
});

/**
 * Formate une entrée Photon GeoJSON en libellé d'adresse lisible.
 */
function formatPhotonSuggestion(
    feature: z.infer<typeof photonFeatureSchema>,
    index: number
): LocationSuggestion | null {
    const [lon, lat] = feature.geometry.coordinates;
    const p = feature.properties;

    const streetPart = [p.housenumber, p.street].filter(Boolean).join(" ");
    const primaryParts = [p.name, streetPart].filter(
        (part, idx, arr) => Boolean(part) && arr.indexOf(part) === idx
    );
    const primaryText =
        primaryParts.join(", ") || p.district || p.city || p.country || "";

    if (!primaryText) {
        return null;
    }

    const secondaryParts = [
        p.district && p.district !== primaryText ? p.district : undefined,
        p.locality && p.locality !== primaryText ? p.locality : undefined,
        p.city && p.city !== primaryText ? p.city : undefined,
        p.postcode,
        p.country && p.country !== primaryText ? p.country : undefined,
    ].filter((part, idx, arr): part is string => {
        return Boolean(part) && arr.indexOf(part) === idx;
    });

    const secondaryText = secondaryParts.join(", ");
    const label = secondaryText
        ? `${primaryText}, ${secondaryText}`
        : primaryText;

    return {
        id: `${p.osm_id ?? "osm"}-${lat.toFixed(5)}-${lon.toFixed(5)}-${index}`,
        label,
        primaryText,
        secondaryText,
        lat,
        lon,
    };
}

/**
 * Recherche d'adresses en autocomplétion via Photon (OpenStreetMap, open-source, sans clé API).
 * Favorise la zone d'Abidjan par proximité tout en supportant la recherche internationale.
 */
export async function searchAddresses(
    query: string,
    signal?: AbortSignal
): Promise<GeocodingResult<LocationSuggestion[]>> {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
        return { success: true, data: [] };
    }

    try {
        const params = new URLSearchParams({
            q: trimmed,
            lang: "fr",
            limit: "6",
            lat: String(DEFAULT_MAP_CENTER.lat),
            lon: String(DEFAULT_MAP_CENTER.lon),
        });

        const response = await fetch(
            `https://photon.komoot.io/api/?${params.toString()}`,
            {
                method: "GET",
                headers: { Accept: "application/json" },
                signal,
            }
        );

        if (!response.ok) {
            return {
                success: false,
                error: "Service de recherche d'adresses temporairement indisponible.",
            };
        }

        const rawJson: unknown = await response.json();
        const parsed = photonResponseSchema.safeParse(rawJson);

        if (!parsed.success) {
            logger.warn("Réponse Photon inattendue", parsed.error.flatten());
            return {
                success: false,
                error: "Impossible d'interpréter les suggestions d'adresses.",
            };
        }

        const seenLabels = new Set<string>();
        const suggestions: LocationSuggestion[] = [];

        parsed.data.features.forEach((feature, idx) => {
            const item = formatPhotonSuggestion(feature, idx);
            if (!item) return;
            const normalizedKey = item.label.toLowerCase();
            if (seenLabels.has(normalizedKey)) return;
            seenLabels.add(normalizedKey);
            suggestions.push(item);
        });

        return { success: true, data: suggestions };
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return { success: true, data: [] };
        }
        logger.error("Erreur lors de la recherche d'adresse Photon", error);
        return {
            success: false,
            error: "Erreur réseau lors de la recherche d'adresses.",
        };
    }
}

/**
 * Convertit des coordonnées GPS (lat, lon) en adresse lisible via Nominatim (OpenStreetMap).
 */
export async function reverseGeocode(
    lat: number,
    lon: number,
    signal?: AbortSignal
): Promise<GeocodingResult<ReverseGeocodeResult>> {
    try {
        const params = new URLSearchParams({
            format: "jsonv2",
            lat: String(lat),
            lon: String(lon),
            "accept-language": "fr",
        });

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
            {
                method: "GET",
                headers: { Accept: "application/json" },
                signal,
            }
        );

        if (!response.ok) {
            return {
                success: false,
                error: "Impossible de résoudre l'adresse à partir de ces coordonnées.",
            };
        }

        const rawJson: unknown = await response.json();
        const parsed = nominatimReverseSchema.safeParse(rawJson);

        if (!parsed.success) {
            return {
                success: false,
                error: "Format de réponse de géocodage invalide.",
            };
        }

        const addr = parsed.data.address;
        const street = [addr?.house_number, addr?.road]
            .filter(Boolean)
            .join(" ");
        const area =
            addr?.neighbourhood || addr?.suburb || addr?.city_district;
        const locality = addr?.city || addr?.town || addr?.village;

        const structuredParts = [street, area, locality, addr?.country].filter(
            (part, idx, arr): part is string =>
                Boolean(part) && arr.indexOf(part) === idx
        );

        const label =
            structuredParts.length > 0
                ? structuredParts.join(", ")
                : parsed.data.display_name ||
                  `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

        return {
            success: true,
            data: {
                label,
                lat,
                lon,
            },
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return {
                success: false,
                error: "Requête annulée.",
            };
        }
        logger.error("Erreur lors du géocodage inverse Nominatim", error);
        return {
            success: false,
            error: "Erreur réseau lors de la récupération de l'adresse.",
        };
    }
}
