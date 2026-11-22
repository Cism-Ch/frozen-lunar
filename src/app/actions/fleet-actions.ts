"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, Vehicle, VehicleCategory } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { logger } from "@/lib/logger";
import {
    AFRICAN_FLEET_CATALOG,
    resolveVehicleImageUrl,
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
            .url("URL d'image invalide (doit commencer par https://)")
            .nullable()
            .optional()
            .or(z.literal("")),
        specs: z.array(z.string().trim().min(1).max(160)).max(10).default([]),
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
        imageUrl: resolveVehicleImageUrl({
            slug: v.slug,
            category: v.category as FleetVehicleCategory,
            imageUrl: v.imageUrl,
        }),
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
    revalidatePath("/devis");
    revalidatePath("/");
}

/**
 * S'assure que les 10 cartes pré-existantes par défaut sont présentes en base
 * et nettoie automatiquement les anciennes descriptions contenant OHADA / CEDEAO
 * tout en préservant les prix, stocks et images personnalisés par l'admin.
 */
async function ensureDefaultFleetInDb(): Promise<void> {
    const existing = await prisma.vehicle.findMany();

    if (existing.length === 0) {
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
        return;
    }

    // Met à jour automatiquement les anciennes cartes par défaut qui contenaient encore OHADA/CEDEAO
    for (const row of existing) {
        const catalogDefault = AFRICAN_FLEET_CATALOG.find(
            (c) => c.slug === row.slug
        );
        if (!catalogDefault) continue;

        const rawSpecs = JSON.stringify(row.specs ?? []);
        const hasLegacyTerms =
            /ohada|cedeao|mali|burkina|soutes bagages 10/i.test(
                row.description
            ) ||
            /ohada|cedeao|soutes bagages 10|badge d'accès port/i.test(rawSpecs);

        if (hasLegacyTerms || !row.imageUrl) {
            await prisma.vehicle.update({
                where: { id: row.id },
                data: {
                    description: hasLegacyTerms
                        ? catalogDefault.description
                        : row.description,
                    specs: (hasLegacyTerms
                        ? catalogDefault.specs
                        : row.specs) as Prisma.InputJsonValue,
                    imageUrl: row.imageUrl || catalogDefault.imageUrl,
                },
            });
        }
    }
}

/**
 * Récupère la flotte active pour la vitrine `/flotte` et le `QuoteWizard`.
 */
export async function getPublicFleetAction(): Promise<{
    data: FleetVehicleItem[];
    error: string | null;
}> {
    try {
        await ensureDefaultFleetInDb();

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
 * Récupère tous les véhicules (y compris les cartes pré-existantes par défaut) pour `/admin/fleet`
 * afin que l'administrateur puisse affiner librement leurs descriptions, tarifs, images et stocks.
 */
export async function getAdminFleetAction(): Promise<{
    data: FleetVehicleItem[] | null;
    error: string | null;
}> {
    try {
        await requireAdmin();
        await ensureDefaultFleetInDb();

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
            data: getFallbackCatalog(),
            error: null,
        };
    }
}

/**
 * Réinitialise ou synchronise les 10 cartes par défaut du catalogue Côte d'Ivoire.
 */
export async function seedDefaultFleetAction(): Promise<{
    data: { seededCount: number } | null;
    error: string | null;
}> {
    try {
        await requireAdmin();

        let count = 0;
        for (const item of AFRICAN_FLEET_CATALOG) {
            await prisma.vehicle.upsert({
                where: { slug: item.slug },
                create: {
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
                },
                update: {
                    description: item.description,
                    specs: item.specs as Prisma.InputJsonValue,
                    imageUrl: item.imageUrl,
                },
            });
            count++;
        }

        revalidateFleetPaths();

        return {
            data: { seededCount: count },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("seedDefaultFleetAction error", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Impossible de synchroniser les cartes par défaut.",
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
 * Met à jour les caractéristiques (description, tarif FCFA, image, utilités, stock)
 * d'un véhicule existant ou d'une carte pré-existante par défaut.
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
        const dataPayload = {
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
        };

        // Si l'admin modifie une carte par défaut issue du fallback ("catalog-X"), on fait un upsert par slug
        const updated = id.startsWith("catalog-")
            ? await prisma.vehicle.upsert({
                  where: { slug: v.slug },
                  create: dataPayload,
                  update: dataPayload,
              })
            : await prisma.vehicle.update({
                  where: { id },
                  data: dataPayload,
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

        if (id.startsWith("catalog-")) {
            await ensureDefaultFleetInDb();
        }

        const existing = await prisma.vehicle.findUnique({ where: { id } });
        if (!existing) {
            return {
                data: null,
                error: "Véhicule introuvable. Actualisez la page.",
            };
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
