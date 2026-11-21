import React from "react";
import { COMPANY_CONFIG } from "@/lib/company-config";

export function JsonLd() {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || COMPANY_CONFIG.contact.website;

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "LogisticsService",
        name: COMPANY_CONFIG.legalName,
        alternateName: COMPANY_CONFIG.shortName,
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: `${COMPANY_CONFIG.slogan} — Plateforme digitale de logistique en Côte d'Ivoire spécialisée dans le transport de matériaux, containers, charpentes, machines et modules préfabriqués.`,
        telephone: COMPANY_CONFIG.contact.phoneDisplay,
        priceRange: COMPANY_CONFIG.currency.symbol,
        address: {
            "@type": "PostalAddress",
            streetAddress: COMPANY_CONFIG.address.street,
            addressLocality: COMPANY_CONFIG.address.city,
            addressCountry: COMPANY_CONFIG.address.countryCode,
        },
        areaServed: {
            "@type": "Country",
            name: COMPANY_CONFIG.address.country,
        },
        serviceType: [
            "Transport de matériaux de construction",
            "Transport de containers maritimes",
            "Transport de charpentes métalliques & bois",
            "Transport de machines industrielles & engins",
            "Transport de modules préfabriqués & bungalows",
        ],
        provider: {
            "@type": "Organization",
            name: COMPANY_CONFIG.legalName,
            url: baseUrl,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}
