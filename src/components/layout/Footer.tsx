import Link from "next/link";
import { Truck, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                HBC LOGISTIQUE
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Votre sécurité, notre priorité. Solutions logistiques complètes pour professionnels et particuliers.
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
                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all group"
                >
                  <social.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Services
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Transport de Matériaux", href: "/services" },
                { name: "Transport de Containers", href: "/services" },
                { name: "Transport de Machines", href: "/services" },
                { name: "Tous nos services", href: "/services" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Entreprise
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "À propos", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "Mentions légales", href: "/legal/mentions-legales" },
                { name: "CGV", href: "/legal/cgv" },
                { name: "Espace Admin", href: "/admin/dashboard" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>123 Rue de la Logistique<br />75000 Paris, France</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:contact@hbc-logistique.com" className="hover:text-primary transition-colors">
                  contact@hbc-logistique.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+33123456789" className="hover:text-primary transition-colors">
                  +33 1 23 45 67 89
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium">Newsletter</p>
              <div className="flex gap-2">
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
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} HBC Service Cash Logistique Immobilière. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
