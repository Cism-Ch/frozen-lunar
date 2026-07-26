import Link from "next/link";
import {
    Truck,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-muted/30 w-full border-t">
            <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid gap-10 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-4">
                    {/* Company Info */}
                    <div className="flex flex-col items-center space-y-4 sm:items-start">
                        <Link
                            href="/"
                            className="group flex items-center gap-2"
                        >
                            <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors">
                                <Truck className="text-primary h-6 w-6" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                HBC LOGISTIQUE
                            </span>
                        </Link>
                        <p className="text-muted-foreground mx-auto max-w-xs text-sm leading-relaxed sm:mx-0">
                            Votre sécurité, notre priorité. Solutions
                            logistiques complètes pour professionnels et
                            particuliers.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-2">
                            {[
                                { icon: Facebook, href: "#" },
                                { icon: Twitter, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Instagram, href: "#" },
                            ].map((social, index) => (
                                <Link
                                    key={index}
                                    href={social.href}
                                    className="bg-muted hover:bg-primary/10 hover:text-primary group rounded-lg p-2 transition-all"
                                >
                                    <social.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider uppercase">
                            Services
                        </h3>
                        <ul className="space-y-3 text-sm">
                            {[
                                {
                                    name: "Transport de Matériaux",
                                    href: "/services",
                                },
                                {
                                    name: "Transport de Containers",
                                    href: "/services",
                                },
                                {
                                    name: "Transport de Machines",
                                    href: "/services",
                                },
                                {
                                    name: "Tous nos services",
                                    href: "/services",
                                },
                            ].map((item) => (
                                <li
                                    key={item.name}
                                    className="flex justify-center sm:justify-start"
                                >
                                    <Link
                                        href={item.href}
                                        className="text-muted-foreground hover:text-primary group inline-flex items-center transition-colors"
                                    >
                                        <span className="transition-transform group-hover:translate-x-1">
                                            {item.name}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider uppercase">
                            Entreprise
                        </h3>
                        <ul className="space-y-3 text-sm">
                            {[
                                { name: "À propos", href: "/about" },
                                { name: "Contact", href: "/contact" },
                                {
                                    name: "Mentions légales",
                                    href: "/legal/mentions-legales",
                                },
                                { name: "CGV", href: "/legal/cgv" },
                                {
                                    name: "Espace Admin",
                                    href: "/admin/dashboard",
                                },
                            ].map((item) => (
                                <li
                                    key={item.name}
                                    className="flex justify-center sm:justify-start"
                                >
                                    <Link
                                        href={item.href}
                                        className="text-muted-foreground hover:text-primary group inline-flex items-center transition-colors"
                                    >
                                        <span className="transition-transform group-hover:translate-x-1">
                                            {item.name}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider uppercase">
                            Contact
                        </h3>
                        <ul className="text-muted-foreground space-y-3 text-sm">
                            <li className="flex items-start justify-center gap-2 sm:justify-start">
                                <MapPin className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                                <span>
                                    123 Rue de la Logistique
                                    <br />
                                    75000 Paris, France
                                </span>
                            </li>
                            <li className="flex items-center justify-center gap-2 sm:justify-start">
                                <Mail className="text-primary h-4 w-4 flex-shrink-0" />
                                <a
                                    href="mailto:contact@hbc-logistique.com"
                                    className="hover:text-primary transition-colors"
                                >
                                    contact@hbc-logistique.com
                                </a>
                            </li>
                            <li className="flex items-center justify-center gap-2 sm:justify-start">
                                <Phone className="text-primary h-4 w-4 flex-shrink-0" />
                                <a
                                    href="tel:+33123456789"
                                    className="hover:text-primary transition-colors"
                                >
                                    +33 1 23 45 67 89
                                </a>
                            </li>
                        </ul>

                        {/* Newsletter */}
                        <div className="space-y-2 pt-4">
                            <p className="text-sm font-medium">Newsletter</p>
                            <div className="flex justify-center gap-2 sm:justify-start">
                                <Input
                                    type="email"
                                    placeholder="Votre email"
                                    className="h-9 text-sm"
                                />
                                <Button size="sm" className="font-semibold">
                                    OK
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 border-t pt-8 text-center">
                    <p className="text-muted-foreground text-sm text-balance">
                        © {currentYear} HBC Service Cash Logistique Immobilière.
                        Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
}
