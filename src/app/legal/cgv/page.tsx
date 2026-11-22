"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { COMPANY_CONFIG } from "@/lib/company-config";

export default function CGVPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <SectionContainer className="from-muted/50 to-background bg-gradient-to-b pt-20 pb-12 md:pt-32 md:pb-16">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <Badge variant="outline" className="mb-2">
                            Juridique • OHADA / AUCTMR
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Conditions Générales de Vente et de Transport
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Dernière mise à jour :{" "}
                            {new Date().toLocaleDateString("fr-FR")}
                        </p>
                    </div>
                </SectionContainer>

                {/* Content Section */}
                <SectionContainer className="bg-background pt-0 md:pt-0">
                    <Card className="mx-auto max-w-4xl border-2">
                        <CardContent className="prose prose-neutral dark:prose-invert max-w-none space-y-8 p-8 md:p-12">
                            <section>
                                <h2 className="text-primary mb-3 text-2xl font-bold">
                                    Article 1 - Objet et Champ d&apos;application
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Les présentes Conditions Générales de Vente
                                    et de Transport (CGV) régissent
                                    l&apos;ensemble des prestations de
                                    transport routier de marchandises, levage,
                                    convoi exceptionnel et logistique de
                                    personnel conclues entre{" "}
                                    <strong>{COMPANY_CONFIG.legalName}</strong>{" "}
                                    ({COMPANY_CONFIG.shortName}) et ses clients
                                    professionnels ou particuliers sur le
                                    territoire de la{" "}
                                    {COMPANY_CONFIG.address.country} et les
                                    corridors routiers de la sous-région UEMOA /
                                    CEDEAO, conformément à l&apos;Acte Uniforme
                                    OHADA relatif aux Contrats de Transport de
                                    Marchandises par Route (AUCTMR).
                                </p>
                            </section>

                            <section>
                                <h2 className="text-primary mb-3 text-2xl font-bold">
                                    Article 2 - Devis, Tarifs (FCFA) et
                                    Estimations IA
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Les tarifs des prestations sont exprimés en{" "}
                                    <strong>Francs CFA (FCFA / XOF)</strong>{" "}
                                    hors taxes ou toutes taxes comprises selon
                                    le devis établi. Toute estimation indicative
                                    fournie instantanément par l&apos;assistant
                                    virtuel ou le simulateur en ligne revêt un
                                    caractère purement informatif et ne constitue
                                    pas une offre contractuelle ferme. Seul un
                                    devis formel validé par la direction
                                    d&apos;exploitation de{" "}
                                    {COMPANY_CONFIG.shortName} engage la
                                    société, hors frais additionnels
                                    imprévus (droits portuaires, formalités
                                    douanières, escortes ou autorisations de
                                    convoi exceptionnel).
                                </p>
                            </section>

                            <section>
                                <h2 className="text-primary mb-3 text-2xl font-bold">
                                    Article 3 - Commande, Lettre de Voiture et
                                    Déclarations du Donneur d&apos;Ordre
                                </h2>
                                <p className="text-muted-foreground mb-3 leading-relaxed">
                                    La commande devient ferme après validation
                                    écrite du devis et versement de
                                    l&apos;acompte convenu. Conformément à
                                    l&apos;AUCTMR, chaque opération donne lieu à
                                    l&apos;établissement d&apos;une lettre de
                                    voiture ou d&apos;un bon de transport.
                                </p>
                                <ul className="text-muted-foreground list-disc space-y-2 pl-6">
                                    <li>
                                        Le client garantit l&apos;exactitude
                                        des informations déclarées : nature,
                                        poids brut, dimensions hors-tout, centre
                                        de gravité et caractère éventuellement
                                        dangereux ou réglementé de la cargaison.
                                    </li>
                                    <li>
                                        Le client s&apos;engage à assurer la
                                        praticabilité et la sécurité des voies
                                        d&apos;accès sur les sites de chargement
                                        et de déchargement.
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-primary mb-3 text-2xl font-bold">
                                    Article 4 - Modalités de Paiement
                                </h2>
                                <p className="text-muted-foreground mb-3 leading-relaxed">
                                    Sauf accord contractuel spécifique (compte
                                    entreprise agréé), les règlements
                                    s&apos;effectuent à hauteur de 50 % à la
                                    confirmation de la réservation et le solde
                                    avant déchargement ou à réception de facture
                                    selon les moyens suivants :
                                </p>
                                <ul className="text-muted-foreground list-disc space-y-2 pl-6">
                                    <li>
                                        Virement bancaire (réseau bancaire
                                        ivoirien et zone UEMOA)
                                    </li>
                                    <li>
                                        Mobile Money professionnel (Orange
                                        Money, MTN MoMo, Wave, Moov Money)
                                    </li>
                                    <li>
                                        Chèque d&apos;entreprise certifié libellé
                                        à l&apos;ordre de{" "}
                                        {COMPANY_CONFIG.legalName}
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-primary mb-3 text-2xl font-bold">
                                    Article 5 - Délais, Manutention et Frais
                                    d&apos;Immobilisation (Surestaries)
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Les délais d&apos;acheminement sont
                                    communiqués à titre indicatif en tenant
                                    compte des contraintes routières,
                                    portuaires et réglementaires (postes de
                                    pesage UEMOA). Une franchise
                                    d&apos;attente de deux (2) heures est
                                    accordée au chargement et au déchargement ;
                                    au-delà, toute immobilisation du véhicule ou
                                    de l&apos;engin imputable au client entraîne
                                    la facturation de frais
                                    d&apos;immobilisation selon le barème
                                    journalier du matériel mobilisé.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-primary mb-3 text-2xl font-bold">
                                    Article 6 - Assurance et Responsabilité
                                    (AUCTMR)
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {COMPANY_CONFIG.shortName} dispose
                                    d&apos;une assurance Responsabilité Civile
                                    Professionnelle et Transporteur conforme aux
                                    dispositions de l&apos;AUCTMR. La
                                    responsabilité du transporteur pour perte
                                    ou avarie est plafonnée selon les seuils
                                    légaux de l&apos;Acte Uniforme OHADA, sauf
                                    déclaration de valeur préalable et
                                    souscription par le client d&apos;une
                                    assurance facultés ad valorem sur la
                                    marchandise transportée.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-primary mb-3 text-2xl font-bold">
                                    Article 7 - Annulation, Report et Force
                                    Majeure
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Toute annulation intervenant moins de 24
                                    heures avant la mise à disposition du
                                    véhicule ou de l&apos;engin donne lieu à la
                                    retenue d&apos;une indemnité forfaitaire de
                                    mobilisation correspondant à 30 % du montant
                                    du devis. Aucune partie ne pourra être tenue
                                    responsable d&apos;un retard dû à un cas de
                                    force majeure (intempéries extrêmes,
                                    fermeture d&apos;axes, troubles ou
                                    réquisitions administratives).
                                </p>
                            </section>

                            <section>
                                <h2 className="text-primary mb-3 text-2xl font-bold">
                                    Article 8 - Données Personnelles (ARTCI) et
                                    Litiges
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Les données collectées sont traitées
                                    conformément à la{" "}
                                    {COMPANY_CONFIG.compliance.dataProtectionLaw}{" "}
                                    sous le contrôle de l&apos;
                                    {
                                        COMPANY_CONFIG.compliance
                                            .dataProtectionAuthority
                                    }
                                    . Les présentes CGV sont régies par le{" "}
                                    {COMPANY_CONFIG.compliance.legalFramework}.
                                    Tout différend qui ne pourrait être résolu à
                                    l&apos;amiable dans un délai de quinze (15)
                                    jours sera porté devant le{" "}
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
