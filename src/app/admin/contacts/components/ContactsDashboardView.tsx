"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactMessagesInbox } from "./ContactMessagesInbox";
import { ClientDirectory } from "./ClientDirectory";
import {
    ContactMessageItem,
    ClientDirectoryItem,
    ContactStatus,
} from "@/app/actions/contact";
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Centre de Contacts
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Gérez les messages entrants des prospects et consultez
                        votre carnet de clients réels.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/users">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs"
                        >
                            <Shield className="text-primary mr-1.5 h-3.5 w-3.5" />
                            Gérer l&apos;équipe administrative
                            <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="messages" className="space-y-6">
                <TabsList className="bg-muted/60 h-11 p-1">
                    <TabsTrigger
                        value="messages"
                        className="gap-2 px-4 text-xs font-semibold"
                    >
                        <Inbox className="text-primary h-4 w-4" />
                        Messages Reçus
                        {unreadCount > 0 && (
                            <span className="py-0.2 ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="clients"
                        className="gap-2 px-4 text-xs font-semibold"
                    >
                        <Users className="text-primary h-4 w-4" />
                        Répertoire Clients ({initialClients.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    value="messages"
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                    <ContactMessagesInbox initialMessages={initialMessages} />
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
