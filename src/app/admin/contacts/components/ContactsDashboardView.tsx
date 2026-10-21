"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactMessagesInbox } from "./ContactMessagesInbox";
import { ClientDirectory } from "./ClientDirectory";
import {
    type ContactMessageItem,
    type ClientDirectoryItem,
    ContactStatus,
} from "@/types/contact";
import { Inbox, Users, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ContactsDashboardViewProps {
    initialMessages: ContactMessageItem[];
    initialClients: ClientDirectoryItem[];
}

export function ContactsDashboardView({
    initialMessages,
    initialClients,
}: ContactsDashboardViewProps) {
    const unreadCount = initialMessages.filter(
        (m) => m.status === ContactStatus.UNREAD
    ).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Centre de Contacts
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Gérez les messages entrants des prospects et consultez
                        votre carnet de clients réels.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/users" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 w-full text-xs font-medium sm:h-9 sm:w-auto"
                        >
                            <Shield className="text-primary mr-1.5 h-3.5 w-3.5" />
                            Gérer l&apos;équipe administrative
                            <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="messages" className="space-y-6">
                <div className="w-full overflow-x-auto pb-1">
                    <TabsList className="bg-muted/60 inline-flex h-11 min-w-full items-center justify-start p-1 sm:min-w-0">
                        <TabsTrigger
                            value="messages"
                            className="flex-1 gap-2 px-4 text-xs font-semibold whitespace-nowrap sm:flex-initial"
                        >
                            <Inbox className="text-primary h-4 w-4 shrink-0" />
                            <span>Messages Reçus</span>
                            <span className="bg-muted text-muted-foreground ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold">
                                {initialMessages.length}
                            </span>
                            {unreadCount > 0 && (
                                <span className="bg-primary text-primary-foreground ml-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow-xs">
                                    {unreadCount} new
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="clients"
                            className="flex-1 gap-2 px-4 text-xs font-semibold whitespace-nowrap sm:flex-initial"
                        >
                            <Users className="text-primary h-4 w-4 shrink-0" />
                            <span>Répertoire Clients</span>
                            <span className="bg-muted text-muted-foreground ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold">
                                {initialClients.length}
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent
                    value="messages"
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                    <Suspense
                        fallback={
                            <div className="flex h-64 items-center justify-center">
                                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                                    Chargement de la boîte de réception...
                                </div>
                            </div>
                        }
                    >
                        <ContactMessagesInbox
                            initialMessages={initialMessages}
                        />
                    </Suspense>
                </TabsContent>

                <TabsContent
                    value="clients"
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                    <ClientDirectory initialClients={initialClients} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
