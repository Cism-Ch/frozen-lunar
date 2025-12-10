"use client";

import { QuoteWizard } from "@/components/features/QuoteWizard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { FadeIn, motion } from "@/components/ui/motion";

export default function DevisPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="pt-20 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-muted/50 to-background">
                    <FadeIn direction="up" className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="mb-2">Devis Gratuit</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Estimez votre{" "}
                            <motion.span
                                className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            >
                                transport
                            </motion.span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                            Remplissez le formulaire ci-dessous pour recevoir une estimation rapide et précise pour votre projet.
                        </p>
                    </FadeIn>
                </SectionContainer>

                {/* Form Section */}
                <SectionContainer className="bg-background pt-0 md:pt-0">
                    <FadeIn direction="up" delay={0.2}>
                        <div className="max-w-2xl mx-auto">
                            <QuoteWizard />
                        </div>
                    </FadeIn>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
