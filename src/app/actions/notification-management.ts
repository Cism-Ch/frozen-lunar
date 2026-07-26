"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { handleError } from "@/lib/error-handler";

/**
 * Server Actions for Notification Management
 */

export type NotificationType = "info" | "warning" | "success" | "message";

export interface Notification {
    id: string;
    title: string;
    description: string;
    type: NotificationType;
    read: boolean;
    timestamp: string;
    userId: string;
}

/**
 * Get notifications for the current user
 */
export async function getNotificationsAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return {
                success: false,
                error: "Non authentifié",
                notifications: [],
            };
        }

        // For now, return mock notifications
        // In production, fetch from database
        const notifications: Notification[] = [
            {
                id: "1",
                title: "Nouveau devis reçu",
                description:
                    "Un client a demandé un devis pour un transport Paris-Lyon.",
                type: "info",
                read: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                userId: session.user.id,
            },
            {
                id: "2",
                title: "Paiement confirmé",
                description:
                    "Le paiement pour la commande #INV-2024-001 a été reçu.",
                type: "success",
                read: false,
                timestamp: new Date(
                    Date.now() - 1000 * 60 * 60 * 2
                ).toISOString(),
                userId: session.user.id,
            },
        ];

        return { success: true, notifications };
    } catch (error: unknown) {
        console.error("Get Notifications Error:", error);
        const errorResponse = handleError(error);
        return {
            success: false,
            error: errorResponse.message,
            notifications: [],
        };
    }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsReadAction(notificationId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return { success: false, error: "Non authentifié" };
        }

        // In production, update in database
        // await prisma.notification.update({
        //     where: { id: notificationId, userId: session.user.id },
        //     data: { read: true },
        // });

        // Use notificationId when database is integrated
        console.log("Marking notification as read:", notificationId);

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error: unknown) {
        console.error("Mark Notification Error:", error);
        const errorResponse = handleError(error);
        return { success: false, error: errorResponse.message };
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsReadAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return { success: false, error: "Non authentifié" };
        }

        // In production, update in database
        // await prisma.notification.updateMany({
        //     where: { userId: session.user.id, read: false },
        //     data: { read: true },
        // });

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error: unknown) {
        console.error("Mark All Notifications Error:", error);
        const errorResponse = handleError(error);
        return { success: false, error: errorResponse.message };
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCountAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return { success: false, error: "Non authentifié", count: 0 };
        }

        // In production, count from database
        // const count = await prisma.notification.count({
        //     where: { userId: session.user.id, read: false },
        // });

        const count = 2; // Mock count

        return { success: true, count };
    } catch (error: unknown) {
        console.error("Get Unread Count Error:", error);
        const errorResponse = handleError(error);
        return { success: false, error: errorResponse.message, count: 0 };
    }
}
