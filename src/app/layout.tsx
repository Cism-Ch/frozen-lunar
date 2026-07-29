import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { JsonLd } from "@/components/layout/JsonLd";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
    fallback: ["system-ui", "arial"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hbc-logistique.fr";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE — Votre sécurité, Notre priorité",
        template: "%s | HBC Logistique",
    },
    description:
        "Plateforme digitale de logistique spécialisée : transport de matériaux, containers, charpentes, machines industrielles et modules préfabriqués. Demande de devis gratuite et rapide.",
    keywords: [
        "logistique",
        "transport exceptionnel",
        "transport matériaux",
        "containers",
        "charpentes métalliques",
        "machines industrielles",
        "modules préfabriqués",
        "HBC Logistique",
        "devis transport",
    ],
    authors: [{ name: "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE" }],
    creator: "HBC Logistique",
    openGraph: {
        type: "website",
        locale: "fr_FR",
        url: baseUrl,
        title: "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE — Votre sécurité, Notre priorité",
        description:
            "Transport spécialisé de matériaux, containers, charpentes et machines. Devis rapide en ligne.",
        siteName: "HBC Logistique",
    },
    twitter: {
        card: "summary_large_image",
        title: "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE",
        description:
            "Transport spécialisé de matériaux, containers, charpentes et machines.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                <JsonLd />
                <LayoutWrapper>{children}</LayoutWrapper>
            </body>
        </html>
    );
}
