"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { sendContactMessageAction } from "@/app/actions/contact";
import {
    FadeIn,
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    AnimatedCard,
    IconFloat,
    motion,
} from "@/components/ui/motion";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
    });
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
                <SectionContainer className="from-muted/50 to-background bg-gradient-to-b pt-20 pb-16 md:pt-32 md:pb-24">
                    <FadeIn
                        direction="up"
                        className="mx-auto max-w-3xl space-y-6 text-center"
                    >
                        <Badge variant="outline" className="mb-2">
                            Contact
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
                            Contactez{" "}
                            <motion.span
                                className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                notre équipe
                            </motion.span>
                        </h1>
                        <p className="text-muted-foreground text-lg leading-relaxed text-balance md:text-xl">
                            Une question ? Un projet ? Notre équipe est à votre
                            écoute pour vous accompagner.
                        </p>
                    </FadeIn>
                </SectionContainer>

                {/* Contact Section */}
                <SectionContainer className="bg-background">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Contact Info */}
                        <ScrollReveal direction="left" className="space-y-8">
                            <div className="space-y-4 text-center lg:text-left">
                                <h2 className="text-3xl font-bold">
                                    Nos coordonnées
                                </h2>
                                <p className="text-muted-foreground text-lg text-balance">
                                    N&apos;hésitez pas à nous contacter par
                                    téléphone, email ou à nous rendre visite.
                                </p>
                            </div>

                            <StaggerContainer
                                staggerSpeed="fast"
                                className="space-y-6"
                            >
                                {contactInfo.map((info) => (
                                    <StaggerItem key={info.title}>
                                        <AnimatedCard hoverEffect="lift">
                                            <Card className="hover:border-primary/50 border-2 transition-colors">
                                                <CardContent className="flex items-start gap-4 p-6">
                                                    <IconFloat>
                                                        <div className="bg-primary/10 flex-shrink-0 rounded-xl p-3">
                                                            <info.icon className="text-primary h-6 w-6" />
                                                        </div>
                                                    </IconFloat>
                                                    <div className="space-y-1">
                                                        <h3 className="text-lg font-semibold">
                                                            {info.title}
                                                        </h3>
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
                                    <CardContent className="space-y-3 p-6">
                                        <h3 className="text-lg font-semibold">
                                            Horaires d&apos;ouverture
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Lundi - Vendredi
                                                </span>
                                                <span className="font-medium">
                                                    8h00 - 18h00
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Samedi
                                                </span>
                                                <span className="font-medium">
                                                    9h00 - 12h00
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Dimanche
                                                </span>
                                                <span className="font-medium">
                                                    Fermé
                                                </span>
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
                                    <CardContent className="space-y-6 p-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold">
                                                Envoyez-nous un message
                                            </h3>
                                            <p className="text-muted-foreground">
                                                Nous vous répondrons dans les
                                                plus brefs délais.
                                            </p>
                                        </div>

                                        {isSubmitted ? (
                                            <div className="animate-in fade-in-50 space-y-4 py-8 text-center duration-500">
                                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-8 w-8" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-xl font-bold">
                                                        Message envoyé avec
                                                        succès !
                                                    </h4>
                                                    <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                                                        Merci pour votre prise
                                                        de contact. Notre équipe
                                                        étudie votre demande et
                                                        vous répondra sous 24h
                                                        ouvrées.
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsSubmitted(false);
                                                        setFormData({
                                                            firstName: "",
                                                            lastName: "",
                                                            email: "",
                                                            phone: "",
                                                            message: "",
                                                        });
                                                    }}
                                                    className="mt-4"
                                                >
                                                    Envoyer un autre message
                                                </Button>
                                            </div>
                                        ) : (
                                            <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    setIsSubmitting(true);
                                                    try {
                                                        const result =
                                                            await sendContactMessageAction(
                                                                formData
                                                            );
                                                        if (result.error) {
                                                            toast.error(
                                                                result.error
                                                            );
                                                        } else {
                                                            toast.success(
                                                                result.data
                                                                    ?.message ||
                                                                    "Message envoyé avec succès"
                                                            );
                                                            setIsSubmitted(
                                                                true
                                                            );
                                                        }
                                                    } catch (err: unknown) {
                                                        console.error(
                                                            "Contact submit error:",
                                                            err
                                                        );
                                                        toast.error(
                                                            "Une erreur est survenue lors de l'envoi"
                                                        );
                                                    } finally {
                                                        setIsSubmitting(false);
                                                    }
                                                }}
                                                className="space-y-4"
                                            >
                                                <motion.div
                                                    className="grid grid-cols-2 gap-4"
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <div className="space-y-2">
                                                        <label
                                                            htmlFor="first-name"
                                                            className="text-sm font-medium"
                                                        >
                                                            Prénom
                                                        </label>
                                                        <Input
                                                            id="first-name"
                                                            placeholder="Jean"
                                                            className="h-12"
                                                            required
                                                            autoComplete="given-name"
                                                            value={
                                                                formData.firstName
                                                            }
                                                            onChange={(e) =>
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        firstName:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            disabled={
                                                                isSubmitting
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label
                                                            htmlFor="last-name"
                                                            className="text-sm font-medium"
                                                        >
                                                            Nom
                                                        </label>
                                                        <Input
                                                            id="last-name"
                                                            placeholder="Dupont"
                                                            className="h-12"
                                                            required
                                                            autoComplete="family-name"
                                                            value={
                                                                formData.lastName
                                                            }
                                                            onChange={(e) =>
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        lastName:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            disabled={
                                                                isSubmitting
                                                            }
                                                        />
                                                    </div>
                                                </motion.div>

                                                <motion.div
                                                    className="space-y-2"
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <label
                                                        htmlFor="email"
                                                        className="text-sm font-medium"
                                                    >
                                                        Email
                                                    </label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="jean.dupont@example.com"
                                                        className="h-12"
                                                        required
                                                        autoComplete="email"
                                                        value={formData.email}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    email: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            )
                                                        }
                                                        disabled={isSubmitting}
                                                    />
                                                </motion.div>

                                                <motion.div
                                                    className="space-y-2"
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    <label
                                                        htmlFor="phone"
                                                        className="text-sm font-medium"
                                                    >
                                                        Téléphone
                                                    </label>
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        placeholder="+33 6 12 34 56 78"
                                                        className="h-12"
                                                        required
                                                        autoComplete="tel"
                                                        value={formData.phone}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    phone: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            )
                                                        }
                                                        disabled={isSubmitting}
                                                    />
                                                </motion.div>

                                                <motion.div
                                                    className="space-y-2"
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{ delay: 0.5 }}
                                                >
                                                    <label
                                                        htmlFor="message"
                                                        className="text-sm font-medium"
                                                    >
                                                        Message
                                                    </label>
                                                    <Textarea
                                                        id="message"
                                                        placeholder="Décrivez votre projet ou votre demande..."
                                                        className="min-h-[150px] resize-none"
                                                        required
                                                        value={formData.message}
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    message:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            )
                                                        }
                                                        disabled={isSubmitting}
                                                    />
                                                </motion.div>

                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{ delay: 0.6 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        size="lg"
                                                        disabled={isSubmitting}
                                                        className="group h-14 w-full text-lg font-semibold"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                                Envoi en
                                                                cours...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Envoyer le
                                                                message
                                                                <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            </form>
                                        )}
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
