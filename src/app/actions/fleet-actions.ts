"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, Vehicle, VehicleCategory } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { logger } from "@/lib/logger";
import {
    AFRICAN_FLEET_CATALOG,
    type FleetVehicleCategory,
    type FleetVehicleItem,
} from "@/lib/fleet-catalog";

const vehicleCategorySchema = z.enum([
    "HEAVY_HAUL",
    "CONTAINERS",
    "MATERIALS",
    "PASSENGER",
    "UTILITY",
]);

const vehicleInputSchema = z
    .object({
        slug: z
            .string()
            .trim()
            .min(3, "Le slug doit contenir au moins 3 caractères")
            .max(120)
            .regex(
                /^[a-z0-9-]+$/,
                "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"
            ),
        name: z
            .string()
            .trim()
            .min(3, "Le nom du véhicule est requis")
            .max(120),
        category: vehicleCategorySchema,
        capacityLabel: z
            .string()
            .trim()
            .min(2, "La capacité est requise")
            .max(120),
        description: z
            .string()
            .trim()
            .min(10, "La description doit contenir au moins 10 caractères")
            .max(1000),
        totalQuantity: z.coerce
            .number()
            .int()
            .min(0, "La quantité totale doit être >= 0")
            .max(500),
        availableQuantity: z.coerce
            .number()
            .int()
            .min(0, "La quantité disponible doit être >= 0")
            .max(500),
        dailyRateFcfa: z.coerce
            .number()
            .int()
            .min(0)
            .max(50000000)
            .nullable()
            .optional(),
        imageUrl: z
            .string()
            .trim()
            .url("URL d'image invalide")
            .nullable()
            .optional()
            .or(z.literal("")),
        specs: z.array(z.string().trim().min(1).max(120)).max(10).default([]),
        recommendedFor: z.array(z.string().trim().min(1).max(60)).default([]),
        isActive: z.boolean().default(true),
        sortOrder: z.coerce.number().int().min(0).max(999).default(0),
    })
    .refine((data) => data.availableQuantity <= data.totalQuantity, {
        message:
            "La quantité disponible ne peut pas dépasser la quantité totale.",
        path: ["availableQuantity"],
    });

export type VehicleMutationInput = z.infer<typeof vehicleInputSchema>;

function toFleetVehicleItem(v: Vehicle): FleetVehicleItem {
    const specsArray = Array.isArray(v.specs)
        ? v.specs.filter((s): s is string => typeof s === "string")
        : [];

    return {
        id: v.id,
        slug: v.slug,
        name: v.name,
        category: v.category as FleetVehicleCategory,
        capacityLabel: v.capacityLabel,
        description: v.description,
        totalQuantity: v.totalQuantity,
        availableQuantity: v.availableQuantity,
        dailyRateFcfa: v.dailyRateFcfa,
        imageUrl: v.imageUrl,
        specs: specsArray,
        recommendedFor: v.recommendedFor ?? [],
        isActive: v.isActive,
        sortOrder: v.sortOrder,
    };
}

function getFallbackCatalog(): FleetVehicleItem[] {
    return AFRICAN_FLEET_CATALOG.map((item, idx) => ({
        ...item,
        id: `catalog-${idx + 1}`,
    }));
}

function revalidateFleetPaths() {
    revalidatePath("/flotte");
    revalidatePath("/admin/fleet");
    revalidatePath("/");
}

/**
 * Récupère la flotte active pour la vitrine `/flotte` et le `QuoteWizard`.
 * En cas de table vide, initialise automatiquement le catalogue Afrique de référence.
 * En cas d'absence de migration sur une base locale, retourne le catalogue statique de secours sans crash.
 */
export async function getPublicFleetAction(): Promise<{
    data: FleetVehicleItem[];
    error: string | null;
}> {
    try {
        const count = await prisma.vehicle.count();
        if (count === 0) {
            await prisma.vehicle.createMany({
                data: AFRICAN_FLEET_CATALOG.map((item) => ({
                    slug: item.slug,
                    name: item.name,
                    category: item.category as VehicleCategory,
                    capacityLabel: item.capacityLabel,
                    description: item.description,
                    totalQuantity: item.totalQuantity,
                    availableQuantity: item.availableQuantity,
                    dailyRateFcfa: item.dailyRateFcfa,
                    imageUrl: item.imageUrl,
                    specs: item.specs as Prisma.InputJsonValue,
                    recommendedFor: item.recommendedFor,
                    isActive: item.isActive,
                    sortOrder: item.sortOrder,
                })),
                skipDuplicates: true,
            });
        }

        const vehicles = await prisma.vehicle.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });

        return {
            data: vehicles.map(toFleetVehicleItem),
            error: null,
        };
    } catch (error: unknown) {
        logger.warn(
            "Fallback catalogue flotte statique (table vehicle non migrée ou DB indisponible)",
            {
                error: error instanceof Error ? error.message : String(error),
            }
        );
        return {
            data: getFallbackCatalog(),
            error: null,
        };
    }
}

/**
 * Récupère tous les véhicules (actifs et inactifs) pour la console d'administration `/admin/fleet`.
 */
export async function getAdminFleetAction(): Promise<{
    data: FleetVehicleItem[] | null;
    error: string | null;
}> {
    try {
        await requireAdmin();

        const vehicles = await prisma.vehicle.findMany({
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });

        return {
            data: vehicles.map(toFleetVehicleItem),
            error: null,
        };
    } catch (error: unknown) {
        logger.error("getAdminFleetAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de charger la flotte.",
        };
    }
}

/**
 * Initialise ou complète la base avec le catalogue de flotte Afrique de référence.
 */
export async function seedDefaultFleetAction(): Promise<{
    data: { seededCount: number } | null;
    error: string | null;
}> {
    try {
        await requireAdmin();

        const result = await prisma.vehicle.createMany({
            data: AFRICAN_FLEET_CATALOG.map((item) => ({
                slug: item.slug,
                name: item.name,
                category: item.category as VehicleCategory,
                capacityLabel: item.capacityLabel,
                description: item.description,
                totalQuantity: item.totalQuantity,
                availableQuantity: item.availableQuantity,
                dailyRateFcfa: item.dailyRateFcfa,
                imageUrl: item.imageUrl,
                specs: item.specs as Prisma.InputJsonValue,
                recommendedFor: item.recommendedFor,
                isActive: item.isActive,
                sortOrder: item.sortOrder,
            })),
            skipDuplicates: true,
        });

        revalidateFleetPaths();

        return {
            data: { seededCount: result.count },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("seedDefaultFleetAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible d'initialiser le catalogue flotte.",
        };
    }
}

/**
 * Crée un nouveau modèle de véhicule dans la flotte.
 */
export async function createVehicleAction(
    input: VehicleMutationInput
): Promise<{ data: FleetVehicleItem | null; error: string | null }> {
    try {
        await requireAdmin();

        const parsed = vehicleInputSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Données véhicule invalides.",
            };
        }

        const v = parsed.data;
        const created = await prisma.vehicle.create({
            data: {
                slug: v.slug,
                name: v.name,
                category: v.category as VehicleCategory,
                capacityLabel: v.capacityLabel,
                description: v.description,
                totalQuantity: v.totalQuantity,
                availableQuantity: v.availableQuantity,
                dailyRateFcfa: v.dailyRateFcfa ?? null,
                imageUrl: v.imageUrl || null,
                specs: v.specs as Prisma.InputJsonValue,
                recommendedFor: v.recommendedFor,
                isActive: v.isActive,
                sortOrder: v.sortOrder,
            },
        });

        revalidateFleetPaths();

        return { data: toFleetVehicleItem(created), error: null };
    } catch (error: unknown) {
        logger.error("createVehicleAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la création du véhicule.",
        };
    }
}

/**
 * Met à jour les caractéristiques et stocks d'un véhicule existant.
 */
export async function updateVehicleAction(
    id: string,
    input: VehicleMutationInput
): Promise<{ data: FleetVehicleItem | null; error: string | null }> {
    try {
        await requireAdmin();

        if (!id?.trim()) {
            return { data: null, error: "Identifiant véhicule requis." };
        }

        const parsed = vehicleInputSchema.safeParse(input);
        if (!parsed.success) {
            return {
                data: null,
                error:
                    parsed.error.issues[0]?.message ||
                    "Données véhicule invalides.",
            };
        }

        const v = parsed.data;
        const updated = await prisma.vehicle.update({
            where: { id },
            data: {
                slug: v.slug,
                name: v.name,
                category: v.category as VehicleCategory,
                capacityLabel: v.capacityLabel,
                description: v.description,
                totalQuantity: v.totalQuantity,
                availableQuantity: v.availableQuantity,
                dailyRateFcfa: v.dailyRateFcfa ?? null,
                imageUrl: v.imageUrl || null,
                specs: v.specs as Prisma.InputJsonValue,
                recommendedFor: v.recommendedFor,
                isActive: v.isActive,
                sortOrder: v.sortOrder,
            },
        });

        revalidateFleetPaths();

        return { data: toFleetVehicleItem(updated), error: null };
    } catch (error: unknown) {
        logger.error("updateVehicleAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la mise à jour du véhicule.",
        };
    }
}

/**
 * Ajuste rapidement la quantité disponible (+1 / -1) d'un véhicule, bornée entre 0 et totalQuantity.
 */
export async function adjustVehicleStockAction(
    id: string,
    delta: number
): Promise<{ data: FleetVehicleItem | null; error: string | null }> {
    try {
        await requireAdmin();

        const existing = await prisma.vehicle.findUnique({ where: { id } });
        if (!existing) {
            return { data: null, error: "Véhicule introuvable." };
        }

        const nextAvailable = Math.max(
            0,
            Math.min(existing.totalQuantity, existing.availableQuantity + delta)
        );

        const updated = await prisma.vehicle.update({
            where: { id },
            data: { availableQuantity: nextAvailable },
        });

        revalidateFleetPaths();

        return { data: toFleetVehicleItem(updated), error: null };
    } catch (error: unknown) {
        logger.error("adjustVehicleStockAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Erreur lors de l'ajustement du stock.",
        };
    }
}

/**
 * Supprime un modèle de véhicule du catalogue.
 */
export async function deleteVehicleAction(
    id: string
): Promise<{ data: { deleted: boolean } | null; error: string | null }> {
    try {
        await requireAdmin();

        await prisma.vehicle.delete({ where: { id } });
        revalidateFleetPaths();

        return { data: { deleted: true }, error: null };
    } catch (error: unknown) {
        logger.error("deleteVehicleAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de supprimer ce véhicule.",
        };
    }
}
