/**
 * Configuration centralisée de l'entreprise HBC Logistique (Côte d'Ivoire).
 * Single Source of Truth (SSOT) pour les informations légales, coordonnées, devise
 * et conformité réglementaire (OHADA / ARTCI).
 *
 * NOTE : Les identifiants légaux ci-dessous sont des valeurs provisoires de démarrage
 * à remplacer par les informations officielles définitives lors de la mise en production.
 */
export const COMPANY_CONFIG = {
    legalName: "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE",
    shortName: "HBC Logistique",
    slogan: "Votre sécurité, Notre priorité",
    legalForm: "SARL (Société à Responsabilité Limitée)",
    capitalSocial: "10 000 000 FCFA",
    rccm: "CI-ABJ-03-2026-B12-00001",
    ncc: "2600001-A",
    publicationDirector: "Direction Générale HBC Logistique",
    address: {
        street: "Zone Industrielle de Yopougon, Lot 142",
        city: "Abidjan",
        postalBox: "01 BP 4520 Abidjan 01",
        country: "Côte d'Ivoire",
        countryCode: "CI",
        full: "Zone Industrielle de Yopougon, Lot 142, Abidjan, Côte d'Ivoire",
        multiline:
            "Zone Industrielle de Yopougon, Lot 142\n01 BP 4520 Abidjan 01, Côte d'Ivoire",
    },
    contact: {
        phoneDisplay: "+225 07 00 00 00 00",
        phoneRaw: "+2250700000000",
        whatsappDefaultCountryCode: "225",
        email: "contact@hbc-logistique.ci",
        website: "https://hbc-logistique.ci",
    },
    businessHours: {
        weekdays: "07h30 - 18h00 (GMT)",
        saturday: "08h00 - 13h00 (GMT)",
        sunday: "Fermé (Urgences exploitation sur astreinte)",
        summary: "Lundi au Vendredi : 07h30 - 18h00 | Samedi : 08h00 - 13h00 (GMT)",
    },
    currency: {
        symbol: "FCFA",
        code: "XOF",
        locale: "fr-CI",
    },
    compliance: {
        legalFramework: "Droit ivoirien et Actes Uniformes OHADA",
        jurisdiction: "Tribunal de Commerce d'Abidjan",
        dataProtectionAuthority: "ARTCI (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire)",
        dataProtectionLaw:
            "Loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel",
    },
} as const;
