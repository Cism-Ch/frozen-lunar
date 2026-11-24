"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { QuoteStatus, ContactStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

const searchQuerySchema = z
    .string()
    .trim()
    .max(100, "Le terme de recherche ne peut pas dépasser 100 caractères");

export interface SearchQuoteResult {
    id: string;
    trackingCode?: string | null;
    client: string;
    email: string;
    phone: string;
    pickup: string;
    dropoff: string;
    itemType: string;
    status: "En attente" | "Validé" | "Refusé" | "Annulé";
    source: "form" | "chat";
    date: string;
}

export interface SearchContactResult {
    id: string;
    name: string;
    email: string;
    phone: string;
    messageSnippet: string;
    status: "Non lu" | "Lu" | "Archivé";
    createdAt: string;
}

export interface SearchNavigationItem {
    id: string;
    title: string;
    description: string;
    href: string;
    category: "Général" | "Opérations" | "Configuration";
    icon: "dashboard" | "quotes" | "contacts" | "users" | "settings" | "home";
}

export interface GlobalSearchData {
    quotes: SearchQuoteResult[];
    contacts: SearchContactResult[];
    navigation: SearchNavigationItem[];
}

const STATIC_NAVIGATION_ROUTES: SearchNavigationItem[] = [
    {
        id: "nav-dashboard",
        title: "Tableau de bord",
        description: "Vue d'ensemble des KPIs, graphiques et activité récente",
        href: "/admin/dashboard",
        category: "Général",
        icon: "dashboard",
    },
    {
        id: "nav-quotes",
        title: "Dossiers de devis",
        description: "Gestion, filtrage et traitement des cotations de fret",
        href: "/admin/quotes",
        category: "Opérations",
        icon: "quotes",
    },
    {
        id: "nav-contacts",
        title: "Boîte de réception & Clients",
        description: "Messagerie de contact et annuaire clients consolidé",
        href: "/admin/contacts",
        category: "Opérations",
        icon: "contacts",
    },
    {
        id: "nav-users",
        title: "Gestion des utilisateurs",
        description: "Administration des comptes et accès collaborateurs",
        href: "/admin/users",
        category: "Configuration",
        icon: "users",
    },
    {
        id: "nav-settings",
        title: "Paramètres de l'entreprise",
        description: "Coordonnées, modèle IA, intégration WhatsApp et alertes",
        href: "/admin/settings",
        category: "Configuration",
        icon: "settings",
    },
    {
        id: "nav-fleet",
        title: "Flotte & Stocks",
        description: "Parc véhicules, tarifs FCFA, photos et disponibilités",
        href: "/admin/fleet",
        category: "Opérations",
        icon: "quotes",
    },
    {
        id: "nav-partners",
        title: "Partenaires Transport",
        description: "Candidatures transporteurs particuliers et entreprises",
        href: "/admin/partners",
        category: "Opérations",
        icon: "users",
    },
    {
        id: "nav-assistant",
        title: "Copilote IA Admin",
        description: "Assistant intelligent pour consulter et piloter l'activité",
        href: "/admin/assistant",
        category: "Général",
        icon: "dashboard",
    },
    {
        id: "nav-status",
        title: "Statut des services",
        description: "Diagnostic temps réel PostgreSQL, Redis, S3, IA et Email",
        href: "/admin/status",
        category: "Configuration",
        icon: "settings",
    },
    {
        id: "nav-home",
        title: "Site Public HBC Logistics",
        description: "Retourner à la page d'accueil publique du site",
        href: "/",
        category: "Général",
        icon: "home",
    },
];

function mapQuoteStatus(
    status: QuoteStatus
): "En attente" | "Validé" | "Refusé" | "Annulé" {
    switch (status) {
        case QuoteStatus.VALIDATED:
            return "Validé";
        case QuoteStatus.REJECTED:
            return "Refusé";
        case QuoteStatus.CANCELLED:
            return "Annulé";
        case QuoteStatus.PENDING:
        default:
            return "En attente";
    }
}

function mapContactStatus(status: ContactStatus): "Non lu" | "Lu" | "Archivé" {
    switch (status) {
        case ContactStatus.READ:
            return "Lu";
        case ContactStatus.ARCHIVED:
            return "Archivé";
        case ContactStatus.UNREAD:
        default:
            return "Non lu";
    }
}

/**
 * Recherche multi-entités unifiée (Devis, Contacts, Navigation)
 * Sécurisée pour les administrateurs et optimisée sub-50ms
 */
export async function searchAdminAction(
    queryInput: unknown
): Promise<{ data: GlobalSearchData | null; error: string | null }> {
    try {
        await requireAdmin();
        const query = searchQuerySchema.parse(queryInput);

        // Si la recherche est vide, on renvoie les raccourcis de navigation principaux
        if (!query) {
            return {
                data: {
                    quotes: [],
                    contacts: [],
                    navigation: STATIC_NAVIGATION_ROUTES.slice(0, 5),
                },
                error: null,
            };
        }

        const normalizedQuery = query.toLowerCase();

        // Filtrer les raccourcis de navigation en mémoire
        const matchedNavigation = STATIC_NAVIGATION_ROUTES.filter(
            (item) =>
                item.title.toLowerCase().includes(normalizedQuery) ||
                item.description.toLowerCase().includes(normalizedQuery) ||
                item.category.toLowerCase().includes(normalizedQuery)
        );

        // Recherche parallèle PostgreSQL sur les devis et les messages de contact
        const [quotesFound, contactsFound] = await Promise.all([
            prisma.quote.findMany({
                where: {
                    OR: [
                        { id: { contains: query, mode: "insensitive" } },
                        {
                            trackingCode: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            clientName: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        { email: { contains: query, mode: "insensitive" } },
                        { phone: { contains: query, mode: "insensitive" } },
                        {
                            pickupLocation: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        {
                            dropoffLocation: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                        { itemType: { contains: query, mode: "insensitive" } },
                    ],
                },
                take: 5,
                orderBy: { date: "desc" },
                select: {
                    id: true,
                    trackingCode: true,
                    clientName: true,
                    email: true,
                    phone: true,
                    pickupLocation: true,
                    dropoffLocation: true,
                    itemType: true,
                    status: true,
                    source: true,
                    date: true,
                },
            }),
            prisma.contactMessage.findMany({
                where: {
                    OR: [
                        { firstName: { contains: query, mode: "insensitive" } },
                        { lastName: { contains: query, mode: "insensitive" } },
                        { email: { contains: query, mode: "insensitive" } },
                        { phone: { contains: query, mode: "insensitive" } },
                        { message: { contains: query, mode: "insensitive" } },
                    ],
                },
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    message: true,
                    status: true,
                    createdAt: true,
                },
            }),
        ]);

        const mappedQuotes: SearchQuoteResult[] = quotesFound.map((q) => ({
            id: q.id,
            trackingCode: q.trackingCode ?? null,
            client: q.clientName,
            email: q.email,
            phone: q.phone,
            pickup: q.pickupLocation,
            dropoff: q.dropoffLocation,
            itemType: q.itemType,
            status: mapQuoteStatus(q.status),
            source: q.source === "CHAT" ? "chat" : "form",
            date: q.date.toISOString(),
        }));

        const mappedContacts: SearchContactResult[] = contactsFound.map(
            (c) => ({
                id: c.id,
                name: `${c.firstName} ${c.lastName}`.trim(),
                email: c.email,
                phone: c.phone,
                messageSnippet:
                    c.message.length > 80
                        ? `${c.message.slice(0, 80)}...`
                        : c.message,
                status: mapContactStatus(c.status),
                createdAt: c.createdAt.toISOString(),
            })
        );

        return {
            data: {
                quotes: mappedQuotes,
                contacts: mappedContacts,
                navigation: matchedNavigation,
            },
            error: null,
        };
    } catch (error: unknown) {
        logger.error("Erreur searchAdminAction", error);
        if (error instanceof z.ZodError) {
            return {
                data: null,
                error:
                    error.issues[0]?.message ||
                    "Paramètre de recherche invalide",
            };
        }
        if (error instanceof Error) {
            return { data: null, error: error.message };
        }
        return {
            data: null,
            error: "Erreur inattendue lors de la recherche globale",
        };
    }
}
