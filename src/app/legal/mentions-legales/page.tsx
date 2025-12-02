import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function MentionsLegalesPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="pt-20 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-muted/50 to-background">
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="mb-2">Juridique</Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Mentions Légales
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Informations légales et réglementaires
                        </p>
                    </div>
                </SectionContainer>

                {/* Content Section */}
                <SectionContainer className="bg-background pt-0 md:pt-0">
                    <Card className="max-w-4xl mx-auto border-2">
                        <CardContent className="p-8 md:p-12 prose prose-neutral dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Éditeur du site</h2>
                                <div className="space-y-2 text-muted-foreground leading-relaxed">
                                    <p><strong>Raison sociale :</strong> HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE</p>
                                    <p><strong>Forme juridique :</strong> [À compléter]</p>
                                    <p><strong>Capital social :</strong> [À compléter]</p>
                                    <p><strong>Siège social :</strong> 123 Avenue de la Logistique, 75000 Paris, France</p>
                                    <p><strong>Numéro SIRET :</strong> [À compléter]</p>
                                    <p><strong>Numéro de TVA intracommunautaire :</strong> [À compléter]</p>
                                    <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
                                    <p><strong>Email :</strong> contact@hbc-logistique.com</p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Directeur de la publication</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    [Nom du directeur de la publication]
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Hébergement</h2>
                                <div className="space-y-2 text-muted-foreground leading-relaxed">
                                    <p>Ce site est hébergé par :</p>
                                    <p><strong>[Nom de l'hébergeur]</strong></p>
                                    <p>[Adresse de l'hébergeur]</p>
                                    <p>[Téléphone de l'hébergeur]</p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Propriété intellectuelle</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                                    Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 text-primary">Données personnelles</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD),
                                    vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
                                </p>
                            </section>
                        </CardContent>
                    </Card>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
