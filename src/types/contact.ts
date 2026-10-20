import { z } from "zod";
import type { QuoteStatus } from "@prisma/client";

/**
 * Statuts possibles pour un message de contact
 */
export const ContactStatus = {
    UNREAD: "UNREAD",
    READ: "READ",
    ARCHIVED: "ARCHIVED",
} as const;
export type ContactStatus = (typeof ContactStatus)[keyof typeof ContactStatus];

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
        id?: string;
    } | null;
    error: string | null;
}

export interface ContactMessageItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    status: ContactStatus;
    createdAt: string;
}

export interface ClientDirectoryItem {
    name: string;
    email: string;
    phone: string;
    totalQuotes: number;
    lastQuoteDate: string;
    lastQuoteId: string;
    lastStatus: QuoteStatus;
}
