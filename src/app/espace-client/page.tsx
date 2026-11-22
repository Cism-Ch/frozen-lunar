"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ClientSpaceDashboard } from "@/components/features/client/ClientSpaceDashboard";

export default function ClientSpacePage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <SectionContainer className="bg-background pt-12 md:pt-16">
                    <ClientSpaceDashboard />
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
