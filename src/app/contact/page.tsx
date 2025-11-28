import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-12 md:py-24 relative">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Contactez-nous
                    </h1>
                    <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                        Une question ? Un projet ? Notre équipe est à votre écoute.
                    </p>
                </div>

                <div className="grid gap-12 lg:grid-cols-2">
                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <MapPin className="h-6 w-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg">Adresse</h3>
                                <p className="text-muted-foreground">
                                    123 Avenue de la Logistique<br />
                                    75000 Paris, France
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="h-6 w-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg">Téléphone</h3>
                                <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Mail className="h-6 w-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg">Email</h3>
                                <p className="text-muted-foreground">contact@hbc-logistique.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-xl">Envoyez-nous un message</h3>
                            <p className="text-sm text-muted-foreground">Nous vous répondrons dans les plus brefs délais.</p>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="first-name" className="text-sm font-medium">Prénom</label>
                                    <Input id="first-name" placeholder="Jean" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="last-name" className="text-sm font-medium">Nom</label>
                                    <Input id="last-name" placeholder="Dupont" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <Input id="email" placeholder="jean.dupont@example.com" type="email" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium">Message</label>
                                <Textarea id="message" placeholder="Votre message..." className="min-h-[120px]" />
                            </div>
                            <Button className="w-full">Envoyer le message</Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
