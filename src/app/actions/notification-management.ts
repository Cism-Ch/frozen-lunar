"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

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
            return { success: false, error: "Non authentifié", notifications: [] };
        }

        // For now, return mock notifications
        // In production, fetch from database
        const notifications: Notification[] = [
            {
                id: "1",
                title: "Nouveau devis reçu",
                description: "Un client a demandé un devis pour un transport Paris-Lyon.",
                type: "info",
                read: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                userId: session.user.id,
            },
            {
                id: "2",
                title: "Paiement confirmé",
                description: "Le paiement pour la commande #INV-2024-001 a été reçu.",
                type: "success",
                read: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                userId: session.user.id,
            },
        ];

        return { success: true, notifications };
    } catch (error: unknown) {
        console.error("Get Notifications Error:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message, notifications: [] };
        }
        return { success: false, error: "Erreur lors de la récupération des notifications", notifications: [] };
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

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error: unknown) {
        console.error("Mark Notification Error:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erreur lors de la mise à jour" };
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
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erreur lors de la mise à jour" };
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
        if (error instanceof Error) {
            return { success: false, error: error.message, count: 0 };
        }
        return { success: false, error: "Erreur lors du comptage", count: 0 };
    }
}
