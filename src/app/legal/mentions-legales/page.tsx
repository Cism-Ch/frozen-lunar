"use client";

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
                <SectionContainer className="from-muted/50 to-background bg-gradient-to-b pt-20 pb-12 md:pt-32 md:pb-16">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <Badge variant="outline" className="mb-2">
                            Juridique
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Mentions Légales
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Informations légales et réglementaires
                        </p>
                    </div>
                </SectionContainer>

                {/* Content Section */}
                <SectionContainer className="bg-background pt-0 md:pt-0">
                    <Card className="mx-auto max-w-4xl border-2">
                        <CardContent className="prose prose-neutral dark:prose-invert max-w-none p-8 md:p-12">
                            <section className="mb-8">
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    Éditeur du site
                                </h2>
                                <div className="text-muted-foreground space-y-2 leading-relaxed">
                                    <p>
                                        <strong>Raison sociale :</strong> HBC
                                        SERVICE CASH LOGISTIQUE IMMOBILIÈRE
                                    </p>
                                    <p>
                                        <strong>Forme juridique :</strong> [À
                                        compléter]
                                    </p>
                                    <p>
                                        <strong>Capital social :</strong> [À
                                        compléter]
                                    </p>
                                    <p>
                                        <strong>Siège social :</strong> 123
                                        Avenue de la Logistique, 75000 Paris,
                                        France
                                    </p>
                                    <p>
                                        <strong>Numéro SIRET :</strong> [À
                                        compléter]
                                    </p>
                                    <p>
                                        <strong>
                                            Numéro de TVA intracommunautaire :
                                        </strong>{" "}
                                        [À compléter]
                                    </p>
                                    <p>
                                        <strong>Téléphone :</strong> +33 1 23 45
                                        67 89
                                    </p>
                                    <p>
                                        <strong>Email :</strong>{" "}
                                        contact@hbc-logistique.com
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    Directeur de la publication
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    [Nom du directeur de la publication]
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    Hébergement
                                </h2>
                                <div className="text-muted-foreground space-y-2 leading-relaxed">
                                    <p>Ce site est hébergé par :</p>
                                    <p>
                                        <strong>
                                            [Nom de l&apos;hébergeur]
                                        </strong>
                                    </p>
                                    <p>[Adresse de l&apos;hébergeur]</p>
                                    <p>[Téléphone de l&apos;hébergeur]</p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    Propriété intellectuelle
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    L&apos;ensemble de ce site relève de la
                                    législation française et internationale sur
                                    le droit d&apos;auteur et la propriété
                                    intellectuelle. Tous les droits de
                                    reproduction sont réservés, y compris pour
                                    les documents téléchargeables et les
                                    représentations iconographiques et
                                    photographiques.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    Données personnelles
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Conformément à la loi « Informatique et
                                    Libertés » du 6 janvier 1978 modifiée et au
                                    Règlement Général sur la Protection des
                                    Données (RGPD), vous disposez d&apos;un
                                    droit d&apos;accès, de rectification, de
                                    suppression et d&apos;opposition aux données
                                    personnelles vous concernant.
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
