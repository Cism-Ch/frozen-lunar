"use client";

import Link from "next/link";
import {
    Truck,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Linkedin,
    Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMPANY_CONFIG } from "@/lib/company-config";

function XIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

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
                        <div className="flex justify-center gap-2 sm:justify-start">
                            {[
                                {
                                    icon: Facebook,
                                    href: "#",
                                    label: "Facebook",
                                },
                                { icon: XIcon, href: "#", label: "X" },
                                {
                                    icon: Linkedin,
                                    href: "#",
                                    label: "LinkedIn",
                                },
                                {
                                    icon: Instagram,
                                    href: "#",
                                    label: "Instagram",
                                },
                            ].map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    aria-label={`Suivez-nous sur ${social.label}`}
                                    className="bg-muted hover:bg-primary/10 hover:text-primary group border-border/50 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-lg border transition-all focus-visible:ring-2 focus-visible:outline-none"
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
                                    name: "Notre Flotte",
                                    href: "/flotte",
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
                                {
                                    name: "Devenir Partenaire",
                                    href: "/partenaires",
                                },
                                {
                                    name: "Espace Client",
                                    href: "/espace-client",
                                },
                                { name: "Contact", href: "/contact" },
                                {
                                    name: "Mentions légales",
                                    href: "/legal/mentions-legales",
                                },
                                { name: "CGV", href: "/legal/cgv" },
                                {
                                    name: "Statut des services",
                                    href: "/status",
                                },
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
                                    {COMPANY_CONFIG.address.street}
                                    <br />
                                    {COMPANY_CONFIG.address.city},{" "}
                                    {COMPANY_CONFIG.address.country}
                                </span>
                            </li>
                            <li className="flex items-center justify-center gap-2 sm:justify-start">
                                <Mail className="text-primary h-4 w-4 flex-shrink-0" />
                                <a
                                    href={`mailto:${COMPANY_CONFIG.contact.email}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {COMPANY_CONFIG.contact.email}
                                </a>
                            </li>
                            <li className="flex items-center justify-center gap-2 sm:justify-start">
                                <Phone className="text-primary h-4 w-4 flex-shrink-0" />
                                <a
                                    href={`tel:${COMPANY_CONFIG.contact.phoneRaw}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {COMPANY_CONFIG.contact.phoneDisplay}
                                </a>
                            </li>
                        </ul>

                        {/* Newsletter */}
                        <div className="space-y-2 pt-4">
                            <p className="text-sm font-medium">Newsletter</p>
                            <div className="flex flex-col justify-center gap-2 sm:flex-row sm:justify-start">
                                <Input
                                    type="email"
                                    placeholder="Votre email"
                                    className="h-11 text-sm sm:h-10"
                                    aria-label="Adresse email pour la newsletter"
                                />
                                <Button className="h-11 w-full px-5 font-semibold sm:h-10 sm:w-auto">
                                    S&apos;inscrire
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
