"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { FadeIn, ScrollReveal, StaggerContainer, StaggerItem, AnimatedCard, IconFloat, motion } from "@/components/ui/motion";

export default function ContactPage() {
    const contactInfo = [
        {
            icon: MapPin,
            title: "Adresse",
            content: "123 Avenue de la Logistique\n75000 Paris, France",
        },
        {
            icon: Phone,
            title: "Téléphone",
            content: "+33 1 23 45 67 89",
        },
        {
            icon: Mail,
            title: "Email",
            content: "contact@hbc-logistique.com",
        },
    ];

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="pt-20 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-muted/50 to-background">
                    <FadeIn direction="up" className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="mb-2">Contact</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
                            Contactez{" "}
                            <motion.span
                                className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                notre équipe
                            </motion.span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
                            Une question ? Un projet ? Notre équipe est à votre écoute pour vous accompagner.
                        </p>
                    </FadeIn>
                </SectionContainer>

                {/* Contact Section */}
                <SectionContainer className="bg-background">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Contact Info */}
                        <ScrollReveal direction="left" className="space-y-8">
                            <div className="space-y-4 text-center lg:text-left">
                                <h2 className="text-3xl font-bold">Nos coordonnées</h2>
                                <p className="text-lg text-muted-foreground text-balance">
                                    N&apos;hésitez pas à nous contacter par téléphone, email ou à nous rendre visite.
                                </p>
                            </div>

                            <StaggerContainer staggerSpeed="fast" className="space-y-6">
                                {contactInfo.map((info) => (
                                    <StaggerItem key={info.title}>
                                        <AnimatedCard hoverEffect="lift">
                                            <Card className="border-2 hover:border-primary/50 transition-colors">
                                                <CardContent className="p-6 flex items-start gap-4">
                                                    <IconFloat>
                                                        <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10">
                                                            <info.icon className="h-6 w-6 text-primary" />
                                                        </div>
                                                    </IconFloat>
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold text-lg">{info.title}</h3>
                                                        <p className="text-muted-foreground whitespace-pre-line">
                                                            {info.content}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </AnimatedCard>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>

                            {/* Business Hours */}
                            <FadeIn delay={0.4}>
                                <Card className="bg-muted/50 border-2">
                                    <CardContent className="p-6 space-y-3">
                                        <h3 className="font-semibold text-lg">Horaires d&apos;ouverture</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Lundi - Vendredi</span>
                                                <span className="font-medium">8h00 - 18h00</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Samedi</span>
                                                <span className="font-medium">9h00 - 12h00</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Dimanche</span>
                                                <span className="font-medium">Fermé</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </FadeIn>
                        </ScrollReveal>

                        {/* Contact Form */}
                        <ScrollReveal direction="right">
                            <AnimatedCard hoverEffect="subtle">
                                <Card className="border-2 shadow-lg">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold">Envoyez-nous un message</h3>
                                            <p className="text-muted-foreground">
                                                Nous vous répondrons dans les plus brefs délais.
                                            </p>
                                        </div>

                                        <form className="space-y-4">
                                            <motion.div
                                                className="grid grid-cols-2 gap-4"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <div className="space-y-2">
                                                    <label htmlFor="first-name" className="text-sm font-medium">
                                                        Prénom
                                                    </label>
                                                    <Input id="first-name" placeholder="Jean" className="h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="last-name" className="text-sm font-medium">
                                                        Nom
                                                    </label>
                                                    <Input id="last-name" placeholder="Dupont" className="h-12" />
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="space-y-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <label htmlFor="email" className="text-sm font-medium">
                                                    Email
                                                </label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="jean.dupont@example.com"
                                                    className="h-12"
                                                />
                                            </motion.div>

                                            <motion.div
                                                className="space-y-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <label htmlFor="phone" className="text-sm font-medium">
                                                    Téléphone
                                                </label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+33 6 12 34 56 78"
                                                    className="h-12"
                                                />
                                            </motion.div>

                                            <motion.div
                                                className="space-y-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <label htmlFor="message" className="text-sm font-medium">
                                                    Message
                                                </label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="Décrivez votre projet ou votre demande..."
                                                    className="min-h-[150px] resize-none"
                                                />
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button size="lg" className="w-full h-14 text-lg font-semibold group">
                                                    Envoyer le message
                                                    <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </motion.div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </AnimatedCard>
                        </ScrollReveal>
                    </div>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
