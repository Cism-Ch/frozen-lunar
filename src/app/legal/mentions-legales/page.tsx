"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { COMPANY_CONFIG } from "@/lib/company-config";

export default function MentionsLegalesPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="from-muted/50 to-background bg-gradient-to-b pt-20 pb-12 md:pt-32 md:pb-16">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <Badge variant="outline" className="mb-2">
                            Juridique • Côte d&apos;Ivoire / ARTCI
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Mentions Légales & Conformité
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Informations légales, éditoriales et protection des
                            données personnelles
                        </p>
                    </div>
                </SectionContainer>

                {/* Content Section */}
                <SectionContainer className="bg-background pt-0 md:pt-0">
                    <Card className="mx-auto max-w-4xl border-2">
                        <CardContent className="prose prose-neutral dark:prose-invert max-w-none space-y-8 p-8 md:p-12">
                            <section>
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    1. Éditeur de la plateforme
                                </h2>
                                <div className="text-muted-foreground space-y-2 leading-relaxed">
                                    <p>
                                        <strong>Raison sociale :</strong>{" "}
                                        {COMPANY_CONFIG.legalName}
                                    </p>
                                    <p>
                                        <strong>Forme juridique :</strong>{" "}
                                        {COMPANY_CONFIG.legalForm}
                                    </p>
                                    <p>
                                        <strong>Capital social :</strong>{" "}
                                        {COMPANY_CONFIG.capitalSocial}
                                    </p>
                                    <p>
                                        <strong>Siège social :</strong>{" "}
                                        {COMPANY_CONFIG.address.full} (
                                        {COMPANY_CONFIG.address.postalBox})
                                    </p>
                                    <p>
                                        <strong>RCCM :</strong>{" "}
                                        {COMPANY_CONFIG.rccm}
                                    </p>
                                    <p>
                                        <strong>
                                            NCC (Numéro Compte Contribuable) :
                                        </strong>{" "}
                                        {COMPANY_CONFIG.ncc}
                                    </p>
                                    <p>
                                        <strong>Téléphone :</strong>{" "}
                                        {COMPANY_CONFIG.contact.phoneDisplay}
                                    </p>
                                    <p>
                                        <strong>Email :</strong>{" "}
                                        {COMPANY_CONFIG.contact.email}
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    2. Directeur de la publication
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {COMPANY_CONFIG.publicationDirector}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    3. Hébergement & Infrastructure Cloud
                                </h2>
                                <div className="text-muted-foreground space-y-2 leading-relaxed">
                                    <p>
                                        La plateforme web, les API et la base de
                                        données sont opérées sur une
                                        infrastructure cloud sécurisée et
                                        chiffrée (TLS 1.3 & chiffrement au
                                        repos) via des prestataires certifiés
                                        (Vercel / Supabase / Tigris S3).
                                    </p>
                                    <p>
                                        Pour toute demande relative à
                                        l&apos;hébergement technique :{" "}
                                        {COMPANY_CONFIG.contact.email}.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    4. Propriété intellectuelle (OAPI)
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    L&apos;ensemble des contenus présents sur ce
                                    site (textes, logos, marques, fiches flotte,
                                    graphismes, interfaces et code applicatif)
                                    est protégé par les accords de
                                    l&apos;Organisation Africaine de la
                                    Propriété Intellectuelle (OAPI) et les
                                    lois en vigueur en République de Côte
                                    d&apos;Ivoire. Toute reproduction ou
                                    exploitation sans autorisation écrite
                                    préalable est strictement interdite.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    5. Protection des données personnelles
                                    (Loi ARTCI n° 2013-450)
                                </h2>
                                <div className="text-muted-foreground space-y-3 leading-relaxed">
                                    <p>
                                        Conformément à la{" "}
                                        <strong>
                                            {
                                                COMPANY_CONFIG.compliance
                                                    .dataProtectionLaw
                                            }
                                        </strong>{" "}
                                        en République de Côte d&apos;Ivoire,
                                        sous le contrôle de l&apos;
                                        <strong>
                                            {
                                                COMPANY_CONFIG.compliance
                                                    .dataProtectionAuthority
                                            }
                                        </strong>
                                        , et à la Loi n° 2013-546 relative aux
                                        transactions électroniques :
                                    </p>
                                    <ul className="list-disc space-y-1.5 pl-6">
                                        <li>
                                            <strong>Finalités :</strong> gestion
                                            des demandes de devis, suivi des
                                            opérations de transport, support
                                            client et relation partenaire.
                                        </li>
                                        <li>
                                            <strong>Conservation :</strong> les
                                            données sont conservées pendant la
                                            durée nécessaire à l&apos;exécution
                                            des prestations et aux obligations
                                            légales OHADA.
                                        </li>
                                        <li>
                                            <strong>Vos droits :</strong> vous
                                            disposez d&apos;un droit
                                            d&apos;accès, de rectification,
                                            d&apos;opposition et de suppression
                                            de vos données en écrivant à{" "}
                                            <strong>
                                                {COMPANY_CONFIG.contact.email}
                                            </strong>
                                            .
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-primary mb-4 text-2xl font-bold">
                                    6. Cookies & Droit applicable
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Ce site utilise exclusivement des cookies
                                    techniques essentiels à la sécurité des
                                    sessions et au bon fonctionnement de
                                    l&apos;application. Les présentes mentions
                                    légales sont régies par le{" "}
                                    {COMPANY_CONFIG.compliance.legalFramework} ;
                                    tout litige relève de la compétence du{" "}
                                    {COMPANY_CONFIG.compliance.jurisdiction}.
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
