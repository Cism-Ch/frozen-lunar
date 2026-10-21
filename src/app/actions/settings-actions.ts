"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { formatZodError } from "@/lib/validation";

/**
 * Schémas de validation Zod internes pour les différents onglets de paramètres
 */
const updateAdminProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Le nom d'affichage doit comporter au moins 2 caractères")
        .max(100, "Nom trop long"),
    email: z.string().email("Adresse email invalide").toLowerCase().trim(),
});

const updateCompanySettingsSchema = z.object({
    companyName: z
        .string()
        .min(2, "Le nom de l'entreprise est requis")
        .max(150, "Nom d'entreprise trop long"),
    address: z
        .string()
        .min(5, "L'adresse du siège est requise")
        .max(255, "Adresse trop longue"),
    siret: z
        .string()
        .min(9, "Le numéro SIRET est requis")
        .max(30, "Numéro SIRET trop long"),
    vatNumber: z
        .string()
        .min(5, "Le numéro de TVA intracommunautaire est requis")
        .max(30, "Numéro de TVA trop long"),
});

const updateWhatsAppSettingsSchema = z.object({
    whatsappNumber: z
        .string()
        .min(6, "Le numéro WhatsApp est requis")
        .max(30, "Numéro trop long"),
    hfModel: z
        .string()
        .min(3, "Le modèle IA Hugging Face est requis")
        .max(120, "Identifiant du modèle trop long"),
    whatsappTemplate: z
        .string()
        .min(10, "Le modèle de message doit comporter au moins 10 caractères")
        .max(1000, "Template trop long"),
    whatsappAiAutoGenerate: z.boolean(),
    whatsappAutoAuditLog: z.boolean(),
    whatsappCrossSearchPhone: z.boolean(),
});

const updateNotificationSettingsSchema = z.object({
    notifyNewQuoteEmail: z.boolean(),
    notifyWeeklyReport: z.boolean(),
    notifySystemUpdates: z.boolean(),
});

const changeAdminPasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
        newPassword: z
            .string()
            .min(
                12,
                "Pour un compte Administrateur, le nouveau mot de passe doit comporter au moins 12 caractères"
            )
            .max(128, "Mot de passe trop long"),
        confirmPassword: z
            .string()
            .min(1, "La confirmation du mot de passe est requise"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Les nouveaux mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

export interface AdminSettingsData {
    admin: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    settings: {
        companyName: string;
        address: string;
        siret: string;
        vatNumber: string;
        contactEmail: string;
        contactPhone: string;
        whatsappNumber: string;
        hfModel: string;
        whatsappTemplate: string;
        whatsappAiAutoGenerate: boolean;
        whatsappAutoAuditLog: boolean;
        whatsappCrossSearchPhone: boolean;
        notifyNewQuoteEmail: boolean;
        notifyWeeklyReport: boolean;
        notifySystemUpdates: boolean;
    };
}

/**
 * Récupère l'ensemble des paramètres système et le profil de l'administrateur connecté.
 */
export async function getAdminSettingsAction(): Promise<{
    data: AdminSettingsData | null;
    error: string | null;
}> {
    try {
        const admin = await requireAdmin();

        const settings = await prisma.systemSettings.upsert({
            where: { id: "default" },
            update: {},
            create: { id: "default" },
        });

        return {
            data: {
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
                settings: {
                    companyName: settings.companyName,
                    address: settings.address,
                    siret: settings.siret,
                    vatNumber: settings.vatNumber,
                    contactEmail: settings.contactEmail,
                    contactPhone: settings.contactPhone,
                    whatsappNumber: settings.whatsappNumber,
                    hfModel: settings.hfModel,
                    whatsappTemplate: settings.whatsappTemplate,
                    whatsappAiAutoGenerate: settings.whatsappAiAutoGenerate,
                    whatsappAutoAuditLog: settings.whatsappAutoAuditLog,
                    whatsappCrossSearchPhone: settings.whatsappCrossSearchPhone,
                    notifyNewQuoteEmail: settings.notifyNewQuoteEmail,
                    notifyWeeklyReport: settings.notifyWeeklyReport,
                    notifySystemUpdates: settings.notifySystemUpdates,
                },
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("❌ Erreur getAdminSettingsAction:", error);
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Impossible de charger les paramètres administrateur.",
        };
    }
}

/**
 * Met à jour le profil de l'administrateur actuel (Nom et Email).
 */
export async function updateAdminProfileAction(input: unknown): Promise<{
    data: { name: string; email: string } | null;
    error: string | null;
}> {
    try {
        const currentAdmin = await requireAdmin();
        const validated = updateAdminProfileSchema.parse(input);

        // Si l'email est modifié, s'assurer qu'aucun autre utilisateur ne le possède
        if (validated.email !== currentAdmin.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: validated.email },
            });
            if (existingUser && existingUser.id !== currentAdmin.id) {
                return {
                    data: null,
                    error: "Cette adresse email est déjà utilisée par un autre compte.",
                };
            }
        }

        const updated = await prisma.user.update({
            where: { id: currentAdmin.id },
            data: {
                name: validated.name,
                email: validated.email,
            },
        });

        revalidatePath("/admin");
        revalidatePath("/admin/settings");

        return {
            data: {
                name: updated.name,
                email: updated.email,
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("❌ Erreur updateAdminProfileAction:", error);
        if (error instanceof z.ZodError) {
            return { data: null, error: formatZodError(error) };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Échec de la mise à jour du profil administrateur.",
        };
    }
}

/**
 * Met à jour les informations légales et coordonnées de l'entreprise.
 */
export async function updateCompanySettingsAction(input: unknown): Promise<{
    data: {
        companyName: string;
        address: string;
        siret: string;
        vatNumber: string;
    } | null;
    error: string | null;
}> {
    try {
        await requireAdmin();
        const validated = updateCompanySettingsSchema.parse(input);

        const updated = await prisma.systemSettings.upsert({
            where: { id: "default" },
            update: {
                companyName: validated.companyName,
                address: validated.address,
                siret: validated.siret,
                vatNumber: validated.vatNumber,
            },
            create: {
                id: "default",
                companyName: validated.companyName,
                address: validated.address,
                siret: validated.siret,
                vatNumber: validated.vatNumber,
            },
        });

        revalidatePath("/admin");
        revalidatePath("/admin/settings");
        revalidatePath("/devis");

        return {
            data: {
                companyName: updated.companyName,
                address: updated.address,
                siret: updated.siret,
                vatNumber: updated.vatNumber,
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("❌ Erreur updateCompanySettingsAction:", error);
        if (error instanceof z.ZodError) {
            return { data: null, error: formatZodError(error) };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Échec de l'enregistrement des coordonnées entreprise.",
        };
    }
}

/**
 * Met à jour la configuration WhatsApp & le modèle Hugging Face.
 */
export async function updateWhatsAppSettingsAction(
    input: unknown
): Promise<{ data: { success: boolean } | null; error: string | null }> {
    try {
        await requireAdmin();
        const validated = updateWhatsAppSettingsSchema.parse(input);

        await prisma.systemSettings.upsert({
            where: { id: "default" },
            update: {
                whatsappNumber: validated.whatsappNumber,
                hfModel: validated.hfModel,
                whatsappTemplate: validated.whatsappTemplate,
                whatsappAiAutoGenerate: validated.whatsappAiAutoGenerate,
                whatsappAutoAuditLog: validated.whatsappAutoAuditLog,
                whatsappCrossSearchPhone: validated.whatsappCrossSearchPhone,
            },
            create: {
                id: "default",
                whatsappNumber: validated.whatsappNumber,
                hfModel: validated.hfModel,
                whatsappTemplate: validated.whatsappTemplate,
                whatsappAiAutoGenerate: validated.whatsappAiAutoGenerate,
                whatsappAutoAuditLog: validated.whatsappAutoAuditLog,
                whatsappCrossSearchPhone: validated.whatsappCrossSearchPhone,
            },
        });

        revalidatePath("/admin/settings");
        revalidatePath("/admin/devis");

        return {
            data: { success: true },
            error: null,
        };
    } catch (error: unknown) {
        console.error("❌ Erreur updateWhatsAppSettingsAction:", error);
        if (error instanceof z.ZodError) {
            return { data: null, error: formatZodError(error) };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Échec de l'enregistrement des paramètres WhatsApp.",
        };
    }
}

/**
 * Met à jour les préférences de notifications du système.
 */
export async function updateNotificationSettingsAction(
    input: unknown
): Promise<{ data: { success: boolean } | null; error: string | null }> {
    try {
        await requireAdmin();
        const validated = updateNotificationSettingsSchema.parse(input);

        await prisma.systemSettings.upsert({
            where: { id: "default" },
            update: {
                notifyNewQuoteEmail: validated.notifyNewQuoteEmail,
                notifyWeeklyReport: validated.notifyWeeklyReport,
                notifySystemUpdates: validated.notifySystemUpdates,
            },
            create: {
                id: "default",
                notifyNewQuoteEmail: validated.notifyNewQuoteEmail,
                notifyWeeklyReport: validated.notifyWeeklyReport,
                notifySystemUpdates: validated.notifySystemUpdates,
            },
        });

        revalidatePath("/admin/settings");

        return {
            data: { success: true },
            error: null,
        };
    } catch (error: unknown) {
        console.error("❌ Erreur updateNotificationSettingsAction:", error);
        if (error instanceof z.ZodError) {
            return { data: null, error: formatZodError(error) };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Échec de l'enregistrement des préférences de notification.",
        };
    }
}

/**
 * Modifie le mot de passe de l'administrateur avec vérification de l'ancien mot de passe.
 */
export async function changeAdminPasswordAction(input: unknown): Promise<{
    data: { success: boolean; message: string } | null;
    error: string | null;
}> {
    try {
        const admin = await requireAdmin();
        const validated = changeAdminPasswordSchema.parse(input);

        // Récupérer le compte credential lié
        const account = await prisma.account.findFirst({
            where: {
                userId: admin.id,
                providerId: "credential",
            },
        });

        if (!account || !account.password) {
            return {
                data: null,
                error: "Aucun compte par mot de passe n'a été trouvé pour cet administrateur.",
            };
        }

        // Vérification du mot de passe actuel via scrypt (Better-Auth)
        const isCurrentPasswordValid = await verifyPassword({
            hash: account.password,
            password: validated.currentPassword,
        });

        if (!isCurrentPasswordValid) {
            return {
                data: null,
                error: "Le mot de passe actuel saisi est incorrect.",
            };
        }

        // Hachage sécurisé du nouveau mot de passe
        const newHashedPassword = await hashPassword(validated.newPassword);

        await prisma.account.update({
            where: { id: account.id },
            data: {
                password: newHashedPassword,
                updatedAt: new Date(),
            },
        });

        revalidatePath("/admin");
        revalidatePath("/admin/settings");

        return {
            data: {
                success: true,
                message:
                    "Votre mot de passe Administrateur a été modifié avec succès.",
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("❌ Erreur changeAdminPasswordAction:", error);
        if (error instanceof z.ZodError) {
            return { data: null, error: formatZodError(error) };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Erreur lors du changement de mot de passe.",
        };
    }
}
