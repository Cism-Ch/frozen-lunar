import Link from "next/link";
import { Truck } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-12 md:py-16 lg:py-20">
            <div className="container px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Truck className="h-6 w-6 text-primary" />
                            <span className="text-lg font-bold tracking-tight">
                                HBC LOGISTIQUE
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Votre sécurité, notre priorité. Solutions logistiques complètes pour professionnels et particuliers.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Services</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/services" className="hover:text-primary">Transport de Matériaux</Link></li>
                            <li><Link href="/services" className="hover:text-primary">Transport de Containers</Link></li>
                            <li><Link href="/services" className="hover:text-primary">Transport de Machines</Link></li>
                            <li><Link href="/services" className="hover:text-primary">Tous nos services</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Entreprise</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">À propos</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                            <li><Link href="/legal/mentions-legales" className="hover:text-primary">Mentions légales</Link></li>
                            <li><Link href="/legal/cgv" className="hover:text-primary">CGV</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Contact</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>123 Rue de la Logistique</li>
                            <li>75000 Paris, France</li>
                            <li>contact@hbc-logistique.com</li>
                            <li>+33 1 23 45 67 89</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} HBC Service Cash Logistique Immobilière. Tous droits réservés.
                </div>
            </div>
        </footer>
    );
}
