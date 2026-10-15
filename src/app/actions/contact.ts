"use server";

import { z } from "zod";

/**
 * Schéma de validation pour le formulaire de contact
 */
export const contactFormSchema = z.object({
    firstName: z
        .string()
        .min(2, "Le prénom doit contenir au moins 2 caractères")
        .max(50, "Le prénom est trop long"),
    lastName: z
        .string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom est trop long"),
    email: z
        .string()
        .email("Veuillez saisir une adresse email valide")
        .max(100, "L'email est trop long"),
    phone: z
        .string()
        .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres")
        .max(20, "Numéro de téléphone trop long"),
    message: z
        .string()
        .min(10, "Votre message doit contenir au moins 10 caractères")
        .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export interface ContactActionResult {
    data: {
        success: boolean;
        message: string;
    } | null;
    error: string | null;
}

/**
 * Server Action pour le traitement et l'envoi d'un message de contact.
 * Suit strictement la convention de retour { data, error }.
 *
 * @param input - Données du formulaire validées via Zod
 * @returns Résultat de l'opération
 */
export async function sendContactMessageAction(
    input: unknown
): Promise<ContactActionResult> {
    try {
        const validated = contactFormSchema.parse(input);

        // Simulation ou persistance du message de contact
        console.log("Nouveau message de contact reçu :", {
            name: `${validated.firstName} ${validated.lastName}`,
            email: validated.email,
            phone: validated.phone,
            messageLength: validated.message.length,
            receivedAt: new Date().toISOString(),
        });

        return {
            data: {
                success: true,
                message:
                    "Votre message a bien été envoyé. Notre équipe vous répondra sous 24h ouvrées.",
            },
            error: null,
        };
    } catch (error: unknown) {
        console.error("sendContactMessageAction Error:", error);
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0]?.message || "Données invalides";
            return { data: null, error: firstError };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Une erreur inattendue est survenue lors de l'envoi du message.",
        };
    }
}
