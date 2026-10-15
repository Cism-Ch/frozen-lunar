import React from "react";

export function JsonLd() {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://hbc-logistique.fr";

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "LogisticsService",
        name: "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE",
        alternateName: "HBC Logistique",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description:
            "Votre sécurité, Notre priorité — Plateforme digitale de logistique spécialisée dans le transport de matériaux, containers, charpentes, machines et modules préfabriqués.",
        telephone: "+33 1 00 00 00 00",
        priceRange: "€€",
        areaServed: {
            "@type": "Country",
            name: "France",
        },
        serviceType: [
            "Transport de matériaux de construction",
            "Transport de containers",
            "Transport de charpentes métalliques & bois",
            "Transport de machines industrielles & engins",
            "Transport de modules préfabriqués & bungalows",
        ],
        provider: {
            "@type": "Organization",
            name: "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE",
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
