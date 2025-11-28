import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function MentionsLegalesPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-12 md:py-24 max-w-4xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">
                    Mentions Légales
                </h1>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Éditeur du site</h2>
                        <p>
                            <strong>Raison sociale :</strong> HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE<br />
                            <strong>Forme juridique :</strong> [À compléter]<br />
                            <strong>Capital social :</strong> [À compléter]<br />
                            <strong>Siège social :</strong> 123 Avenue de la Logistique, 75000 Paris, France<br />
                            <strong>Numéro SIRET :</strong> [À compléter]<br />
                            <strong>Numéro de TVA intracommunautaire :</strong> [À compléter]<br />
                            <strong>Téléphone :</strong> +33 1 23 45 67 89<br />
                            <strong>Email :</strong> contact@hbc-logistique.com
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Directeur de la publication</h2>
                        <p>[Nom du directeur de la publication]</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Hébergement</h2>
                        <p>
                            Ce site est hébergé par :<br />
                            [Nom de l'hébergeur]<br />
                            [Adresse de l'hébergeur]<br />
                            [Téléphone de l'hébergeur]
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Propriété intellectuelle</h2>
                        <p>
                            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                            Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Données personnelles</h2>
                        <p>
                            Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD),
                            vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
