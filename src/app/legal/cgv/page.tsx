import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function CGVPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-12 md:py-24 max-w-4xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">
                    Conditions Générales de Vente
                </h1>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Article 1 - Objet</h2>
                        <p>
                            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE
                            et ses clients dans le cadre de la vente de services de transport et de logistique.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Article 2 - Prix</h2>
                        <p>
                            Les prix de nos services sont indiqués en euros toutes taxes comprises (TTC).
                            Ils sont susceptibles d'être modifiés à tout moment mais les services seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Article 3 - Commandes</h2>
                        <p>
                            Toute commande de service implique l'acceptation sans réserve des présentes CGV.
                            Le client reconnaît avoir pris connaissance des présentes CGV et les avoir acceptées avant la passation de sa commande.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Article 4 - Modalités de paiement</h2>
                        <p>
                            Le règlement des services s'effectue :<br />
                            - Par virement bancaire<br />
                            - Par chèque<br />
                            - Par carte bancaire<br />
                            Le paiement est exigible selon les modalités convenues lors de la commande.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Article 5 - Livraison</h2>
                        <p>
                            Les délais de livraison sont donnés à titre indicatif.
                            HBC LOGISTIQUE s'engage à faire ses meilleurs efforts pour respecter les délais annoncés.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Article 6 - Responsabilité</h2>
                        <p>
                            HBC LOGISTIQUE souscrit une assurance couvrant les conséquences de sa responsabilité civile professionnelle.
                            Les marchandises transportées sont assurées selon les conditions définies dans le contrat de transport.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Article 7 - Litiges</h2>
                        <p>
                            Les présentes CGV sont soumises au droit français.
                            En cas de litige, les tribunaux français seront seuls compétents.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
