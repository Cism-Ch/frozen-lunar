import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CGVPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="pt-20 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-muted/50 to-background">
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="mb-2">Juridique</Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Conditions Générales de Vente
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                </SectionContainer>

                {/* Content Section */}
                <SectionContainer className="bg-background pt-0 md:pt-0">
                    <Card className="max-w-4xl mx-auto border-2">
                        <CardContent className="p-8 md:p-12 prose prose-neutral dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Article 1 - Objet</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE
                                    et ses clients dans le cadre de la vente de services de transport et de logistique.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Article 2 - Prix</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Les prix de nos services sont indiqués en euros toutes taxes comprises (TTC).
                                    Ils sont susceptibles d'être modifiés à tout moment mais les services seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Article 3 - Commandes</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Toute commande de service implique l'acceptation sans réserve des présentes CGV.
                                    Le client reconnaît avoir pris connaissance des présentes CGV et les avoir acceptées avant la passation de sa commande.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Article 4 - Modalités de paiement</h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    Le règlement des services s'effectue :
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Par virement bancaire</li>
                                    <li>Par chèque</li>
                                    <li>Par carte bancaire</li>
                                </ul>
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    Le paiement est exigible selon les modalités convenues lors de la commande.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Article 5 - Livraison</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Les délais de livraison sont donnés à titre indicatif.
                                    HBC LOGISTIQUE s'engage à faire ses meilleurs efforts pour respecter les délais annoncés.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-primary">Article 6 - Responsabilité</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    HBC LOGISTIQUE souscrit une assurance couvrant les conséquences de sa responsabilité civile professionnelle.
                                    Les marchandises transportées sont assurées selon les conditions définies dans le contrat de transport.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 text-primary">Article 7 - Litiges</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Les présentes CGV sont soumises au droit français.
                                    En cas de litige, les tribunaux français seront seuls compétents.
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
