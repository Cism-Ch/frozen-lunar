"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { handleError } from "@/lib/error-handler";
import { QuoteStatus, ContactStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * Server Actions pour le Centre de Notifications Opérationnelles Réelles
 * Connecté directement aux flux de devis (PENDING) et de messagerie (UNREAD)
 */

export type NotificationType =
    "info" | "warning" | "success" | "message" | "quote" | "contact" | "urgent";

export interface Notification {
    id: string;
    title: string;
    description: string;
    type: NotificationType;
    read: boolean;
    timestamp: string;
    href: string;
    isUrgent?: boolean;
    userId?: string;
}

/**
 * Récupère les alertes et notifications opérationnelles réelles pour l'administrateur
 * Agrège les devis en attente et les messages non lus directement depuis PostgreSQL
 */
export async function getNotificationsAction(): Promise<{
    success: boolean;
    notifications: Notification[];
    error?: string;
}> {
    try {
        await requireAdmin();

        // Récupération simultanée des devis en attente et des messages de contact non lus
        const [pendingQuotes, unreadMessages] = await Promise.all([
            prisma.quote.findMany({
                where: {
                    status: QuoteStatus.PENDING,
                },
                orderBy: { date: "desc" },
                take: 8,
                select: {
                    id: true,
                    clientName: true,
                    pickupLocation: true,
                    dropoffLocation: true,
                    itemType: true,
                    date: true,
                    supplementaryInfo: true,
                },
            }),
            prisma.contactMessage.findMany({
                where: {
                    status: ContactStatus.UNREAD,
                },
                orderBy: { createdAt: "desc" },
                take: 8,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    message: true,
                    createdAt: true,
                },
            }),
        ]);

        const quoteNotifications: Notification[] = pendingQuotes.map((q) => {
            const suppInfo = q.supplementaryInfo as {
                urgency?: string;
                hazardous?: boolean;
                requiresCrane?: boolean;
            } | null;
            const isUrgent =
                suppInfo?.urgency === "urgent" ||
                suppInfo?.urgency === "very_urgent" ||
                Boolean(suppInfo?.hazardous);

            const title = isUrgent
                ? `Devis Urgent • ${q.clientName}`
                : `Nouveau Devis • ${q.clientName}`;

            return {
                id: `quote-${q.id}`,
                title,
                description: `${q.pickupLocation} ➔ ${q.dropoffLocation} (${q.itemType})`,
                type: isUrgent ? "urgent" : "quote",
                read: false,
                timestamp: q.date.toISOString(),
                href: `/admin/quotes/${encodeURIComponent(q.id)}`,
                isUrgent,
            };
        });

        const contactNotifications: Notification[] = unreadMessages.map(
            (m) => ({
                id: `contact-${m.id}`,
                title: `Message • ${m.firstName} ${m.lastName}`.trim(),
                description:
                    m.message.length > 75
                        ? `${m.message.slice(0, 75)}...`
                        : m.message,
                type: "contact",
                read: false,
                timestamp: m.createdAt.toISOString(),
                href: `/admin/contacts?q=${encodeURIComponent(m.email)}`,
                isUrgent: false,
            })
        );

        // Concaténation et ordonnancement chronologique décroissant
        const combined = [...quoteNotifications, ...contactNotifications].sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
        );

        return {
            success: true,
            notifications: combined.slice(0, 10),
        };
    } catch (error: unknown) {
        logger.error("Get Notifications Error", error);
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
            notifications: [],
        };
    }
}

/**
 * Marque toutes les notifications comme lues
 * Dans l'architecture dérivée, cela marque les messages de contact récents comme READ
 */
export async function markAllNotificationsAsReadAction(): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await requireAdmin();

        // Mettre à jour les messages non lus vers le statut READ
        await prisma.contactMessage.updateMany({
            where: { status: ContactStatus.UNREAD },
            data: { status: ContactStatus.READ },
        });

        return { success: true };
    } catch (error: unknown) {
        logger.error("Mark All Notifications Error", error);
        const errorResponse = handleError(error);
        return { success: false, error: errorResponse.message };
    }
}

/**
 * Marque une notification spécifique comme traitée/lue
 */
export async function markNotificationAsReadAction(
    notificationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAdmin();

        if (notificationId.startsWith("contact-")) {
            const messageId = notificationId.replace("contact-", "");
            await prisma.contactMessage.update({
                where: { id: messageId },
                data: { status: ContactStatus.READ },
            });
        }

        return { success: true };
    } catch (error: unknown) {
        logger.error("Mark Notification Error", error);
        const errorResponse = handleError(error);
        return { success: false, error: errorResponse.message };
    }
}

/**
 * Récupère le décompte exact d'alertes non traitées
 */
export async function getUnreadNotificationCountAction(): Promise<{
    success: boolean;
    count: number;
    error?: string;
}> {
    try {
        await requireAdmin();

        const [pendingQuotesCount, unreadMessagesCount] = await Promise.all([
            prisma.quote.count({
                where: { status: QuoteStatus.PENDING },
            }),
            prisma.contactMessage.count({
                where: { status: ContactStatus.UNREAD },
            }),
        ]);

        return {
            success: true,
            count: pendingQuotesCount + unreadMessagesCount,
        };
    } catch (error: unknown) {
        logger.error("Get Unread Count Error", error);
        const errorResponse = handleError(error);
        return { success: false, error: errorResponse.message, count: 0 };
    }
}
