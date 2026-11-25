"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { handleError } from "@/lib/error-handler";
import { formatQuoteReference } from "@/lib/tracking-code";
import {
    QuoteStatus,
    ContactStatus,
    PartnerApplicationStatus,
    SupportThreadStatus,
} from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * Server Actions pour le Centre de Notifications Opérationnelles Réelles.
 * Agrège les 5 flux critiques (Devis en attente, Devis annulés, Messages contact,
 * Candidatures partenaires en étude, Discussions chat en attente de validateur humain)
 * avec persistance des notifications lues via `AdminNotificationRead`.
 */

export type NotificationType =
    | "info"
    | "warning"
    | "success"
    | "message"
    | "quote"
    | "contact"
    | "urgent";

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
 * Récupère les alertes et notifications opérationnelles réelles pour l'administrateur.
 */
export async function getNotificationsAction(): Promise<{
    success: boolean;
    notifications: Notification[];
    error?: string;
}> {
    try {
        const admin = await requireAdmin();

        const [
            pendingQuotes,
            cancelledQuotes,
            unreadMessages,
            pendingPartners,
            humanTakeoverThreads,
            readReceipts,
        ] = await Promise.all([
            prisma.quote.findMany({
                where: { status: QuoteStatus.PENDING },
                orderBy: { date: "desc" },
                take: 8,
                select: {
                    id: true,
                    trackingCode: true,
                    clientName: true,
                    pickupLocation: true,
                    dropoffLocation: true,
                    itemType: true,
                    date: true,
                    supplementaryInfo: true,
                },
            }),
            Promise.resolve()
                .then(() =>
                    prisma.quote.findMany({
                        where: { status: QuoteStatus.CANCELLED },
                        orderBy: { cancelledAt: "desc" },
                        take: 5,
                        select: {
                            id: true,
                            trackingCode: true,
                            clientName: true,
                            cancellationReason: true,
                            cancelledAt: true,
                            date: true,
                        },
                    })
                )
                .catch(() => []),
            prisma.contactMessage.findMany({
                where: { status: ContactStatus.UNREAD },
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
            prisma.partnerApplication?.findMany
                ? prisma.partnerApplication
                      .findMany({
                          where: { status: PartnerApplicationStatus.PENDING },
                          orderBy: { createdAt: "desc" },
                          take: 5,
                          select: {
                              id: true,
                              companyName: true,
                              city: true,
                              totalVehicles: true,
                              createdAt: true,
                          },
                      })
                      .catch(() => [])
                : Promise.resolve([]),
            prisma.supportThread?.findMany
                ? prisma.supportThread
                      .findMany({
                          where: {
                              status: SupportThreadStatus.HUMAN_TAKEOVER,
                          },
                          orderBy: { updatedAt: "desc" },
                          take: 5,
                          select: {
                              id: true,
                              quoteId: true,
                              updatedAt: true,
                              quote: {
                                  select: {
                                      clientName: true,
                                      trackingCode: true,
                                  },
                              },
                          },
                      })
                      .catch(() => [])
                : Promise.resolve([]),
            prisma.adminNotificationRead?.findMany
                ? prisma.adminNotificationRead
                      .findMany({
                          where: { userId: admin.id },
                          select: { notificationKey: true },
                      })
                      .catch(() => [])
                : Promise.resolve([]),
        ]);

        const readKeys = new Set(readReceipts.map((r) => r.notificationKey));

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
            const ref = formatQuoteReference({
                id: q.id,
                trackingCode: q.trackingCode,
            });
            const key = `quote-${q.id}`;

            return {
                id: key,
                title: isUrgent
                    ? `Devis Urgent (${ref}) • ${q.clientName}`
                    : `Nouveau Devis (${ref}) • ${q.clientName}`,
                description: `${q.pickupLocation} ➔ ${q.dropoffLocation} (${q.itemType})`,
                type: isUrgent ? "urgent" : "quote",
                read: readKeys.has(key),
                timestamp: q.date.toISOString(),
                href: `/admin/quotes/${encodeURIComponent(q.id)}`,
                isUrgent,
            };
        });

        const safeCancelled = Array.isArray(cancelledQuotes)
            ? cancelledQuotes.filter(
                  (q) => q && typeof q.id === "string" && "cancellationReason" in q
              )
            : [];
        const cancelledNotifications: Notification[] = safeCancelled.map(
            (q) => {
                const ref = formatQuoteReference({
                id: q.id,
                trackingCode: q.trackingCode,
            });
                const key = `cancelled-${q.id}`;
                return {
                    id: key,
                    title: `Devis Annulé (${ref}) • ${q.clientName}`,
                    description:
                        q.cancellationReason ||
                        "Annulé par le client depuis son espace.",
                    type: "warning",
                    read: readKeys.has(key),
                    timestamp: (q.cancelledAt || q.date).toISOString(),
                    href: `/admin/quotes/${encodeURIComponent(q.id)}`,
                    isUrgent: false,
                };
            }
        );

        const contactNotifications: Notification[] = unreadMessages.map(
            (m) => {
                const key = `contact-${m.id}`;
                return {
                    id: key,
                    title: `Message • ${m.firstName} ${m.lastName}`.trim(),
                    description:
                        m.message.length > 75
                            ? `${m.message.slice(0, 75)}...`
                            : m.message,
                    type: "contact",
                    read: readKeys.has(key),
                    timestamp: m.createdAt.toISOString(),
                    href: `/admin/contacts?q=${encodeURIComponent(m.email)}`,
                    isUrgent: false,
                };
            }
        );

        const partnerNotifications: Notification[] = pendingPartners.map(
            (p) => {
                const key = `partner-${p.id}`;
                return {
                    id: key,
                    title: `Partenaire en étude • ${p.companyName}`,
                    description: `${p.city} • ${p.totalVehicles} véhicule(s) déclaré(s)`,
                    type: "info",
                    read: readKeys.has(key),
                    timestamp: p.createdAt.toISOString(),
                    href: "/admin/partners",
                    isUrgent: false,
                };
            }
        );

        const chatNotifications: Notification[] = humanTakeoverThreads.map(
            (t) => {
                const ref = formatQuoteReference({
                    id: t.quoteId,
                    trackingCode: t.quote?.trackingCode,
                });
                const key = `thread-${t.id}-${t.updatedAt.getTime()}`;
                return {
                    id: key,
                    title: `Validateur requis (${ref}) • ${t.quote?.clientName || "Client"}`,
                    description:
                        "Discussion client en attente d'une réponse humaine.",
                    type: "urgent",
                    read: readKeys.has(key),
                    timestamp: t.updatedAt.toISOString(),
                    href: `/admin/quotes/${encodeURIComponent(t.quoteId)}`,
                    isUrgent: true,
                };
            }
        );

        const combined = [
            ...quoteNotifications,
            ...cancelledNotifications,
            ...contactNotifications,
            ...partnerNotifications,
            ...chatNotifications,
        ].sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
        );

        return {
            success: true,
            notifications: combined.slice(0, 15),
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
 * Marque toutes les notifications actuellement affichées comme lues de manière persistante.
 */
export async function markAllNotificationsAsReadAction(
    notificationIds?: string[]
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const admin = await requireAdmin();

        await prisma.contactMessage.updateMany({
            where: { status: ContactStatus.UNREAD },
            data: { status: ContactStatus.READ },
        });

        let keysToPersist = notificationIds ?? [];
        if (keysToPersist.length === 0) {
            const current = await getNotificationsAction();
            keysToPersist = current.notifications.map((n) => n.id);
        }

        if (keysToPersist.length > 0 && prisma.adminNotificationRead?.createMany) {
            await prisma.adminNotificationRead
                .createMany({
                    data: keysToPersist.map((notificationKey) => ({
                        userId: admin.id,
                        notificationKey,
                    })),
                    skipDuplicates: true,
                })
                .catch(() => {});
        }

        return { success: true };
    } catch (error: unknown) {
        logger.error("Mark All Notifications Error", error);
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
        };
    }
}

/**
 * Marque une notification spécifique comme lue (persistant en DB pour l'administrateur).
 */
export async function markNotificationAsReadAction(
    notificationId: string
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const admin = await requireAdmin();

        if (!notificationId?.trim()) {
            return { success: false, error: "Identifiant requis" };
        }

        if (notificationId.startsWith("contact-")) {
            const contactId = notificationId.replace("contact-", "");
            await prisma.contactMessage
                .update({
                    where: { id: contactId },
                    data: { status: ContactStatus.READ },
                })
                .catch(() => {});
        }

        if (prisma.adminNotificationRead?.upsert) {
            await prisma.adminNotificationRead
                .upsert({
                    where: {
                        userId_notificationKey: {
                            userId: admin.id,
                            notificationKey: notificationId,
                        },
                    },
                    create: {
                        userId: admin.id,
                        notificationKey: notificationId,
                    },
                    update: {
                        readAt: new Date(),
                    },
                })
                .catch(() => {});
        }

        return { success: true };
    } catch (error: unknown) {
        logger.error("Mark Notification Read Error", error);
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
        };
    }
}

/**
 * Retourne le nombre total d'éléments non lus en attente de traitement par l'admin.
 */
export async function getUnreadNotificationCountAction(): Promise<{
    success: boolean;
    count: number;
    error?: string;
}> {
    try {
        await requireAdmin();

        const [pendingQuotesCount, unreadMessagesCount, pendingPartnersCount] =
            await Promise.all([
                prisma.quote.count({
                    where: { status: QuoteStatus.PENDING },
                }),
                prisma.contactMessage.count({
                    where: { status: ContactStatus.UNREAD },
                }),
                prisma.partnerApplication?.count
                    ? prisma.partnerApplication
                          .count({
                              where: {
                                  status: PartnerApplicationStatus.PENDING,
                              },
                          })
                          .catch(() => 0)
                    : Promise.resolve(0),
            ]);

        return {
            success: true,
            count:
                pendingQuotesCount + unreadMessagesCount + pendingPartnersCount,
        };
    } catch (error: unknown) {
        logger.error("Get Unread Notification Count Error", error);
        const errorResponse = handleError(error);
        return {
            success: false,
            count: 0,
            error: errorResponse.message,
        };
    }
}
