"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientList } from "./components/ClientList";
import { TeamList } from "./components/TeamList";
import { Users, Shield } from "lucide-react";

export default function ContactsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-3xl font-bold tracking-tight">Contacts</h3>
                <p className="text-muted-foreground mt-2">
                    Visualisez vos clients et gérez l'équipe administrative.
                </p>
            </div>

            <Tabs defaultValue="clients" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="clients" className="gap-2">
                        <Users className="h-4 w-4" /> Clients
                    </TabsTrigger>
                    <TabsTrigger value="team" className="gap-2">
                        <Shield className="h-4 w-4" /> Équipe
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="clients" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ClientList />
                </TabsContent>

                <TabsContent value="team" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <TeamList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
