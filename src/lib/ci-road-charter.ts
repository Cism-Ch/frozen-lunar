export interface CharterArticle {
    number: string;
    title: string;
    summary: string;
    obligations: string[];
}

/**
 * Charte de Qualité et de Sécurité Routière en vigueur en République de Côte d'Ivoire
 * pour les partenaires transporteurs (Particuliers et Entreprises) de HBC Logistique.
 */
export const CI_ROAD_SAFETY_CHARTER_TITLE =
    "Charte de Qualité et de Sécurité Routière — République de Côte d'Ivoire";

export const CI_ROAD_SAFETY_CHARTER_INTRO =
    "La présente charte définit les engagements réglementaires, techniques et professionnels applicables à tout transporteur partenaire (particulier propriétaire de véhicule ou société de transport) opérant avec HBC Logistique sur l'ensemble du territoire ivoirien, conformément au Code de la route de Côte d'Ivoire et à la Loi n° 2014-812 d'orientation du transport intérieur.";

export const CI_ROAD_SAFETY_CHARTER_ARTICLES: CharterArticle[] = [
    {
        number: "Article 1",
        title: "Respect strict du Code de la route de Côte d'Ivoire",
        summary:
            "Tout conducteur partenaire s'engage à respecter l'ensemble des règles de circulation édictées par le Ministère des Transports et l'Office de Sécurité Routière (OSER).",
        obligations: [
            "Respect absolu des limitations de vitesse (zones urbaines d'Abidjan, autoroute du Nord, axes interurbains).",
            "Respect de la signalisation, des feux tricolores, des passages piétons et des zones de travaux.",
            "Interdiction stricte de l'usage du téléphone au volant sans dispositif mains libres.",
            "Port obligatoire de la ceinture de sécurité pour le conducteur et l'ensemble des passagers.",
        ],
    },
    {
        number: "Article 2",
        title: "Conformité technique & Visite périodique SICTA",
        summary:
            "Chaque véhicule mobilisé sur une mission HBC Logistique doit être en parfait état mécanique et administratif.",
        obligations: [
            "Certificat de visite technique périodique SICTA en cours de validité.",
            "Carte grise conforme, vignette à jour et autorisation de transport (carte de transport public de marchandises ou de voyageurs le cas échéant).",
            "Pneumatiques, système de freinage, éclairage, rétroviseurs et feux de détresse vérifiés avant chaque départ.",
            "Présence obligatoire à bord du kit de sécurité : triangle de présignalisation, gilet réfléchissant, extincteur contrôlé et trousse de premiers secours.",
        ],
    },
    {
        number: "Article 3",
        title: "Qualification des conducteurs & Permis adaptés",
        summary:
            "La conduite d'engins lourds, utilitaires et autocars est exclusivement confiée à des chauffeurs qualifiés.",
        obligations: [
            "Permis de conduire ivoirien authentique et valide correspondant à la catégorie du véhicule (B pour utilitaires/4x4, C pour poids lourds, D pour bus/cars de transport de personnes, E pour ensembles articulés/semi-remorques).",
            "Aptitude médicale à jour et maîtrise des manœuvres sur chantiers et zones portuaires (Abidjan et San-Pédro).",
            "Comportement courtois, tenue correcte et respect des consignes de sécurité sur les sites clients.",
        ],
    },
    {
        number: "Article 4",
        title: "Assurance Automobile Obligatoire (Code CIMA)",
        summary:
            "Aucune prestation ne peut être exécutée sans couverture d'assurance réglementaire valide.",
        obligations: [
            "Attestation d'assurance Responsabilité Civile Automobile conforme au Code CIMA en cours de validité.",
            "Couverture adaptée à l'usage déclaré (transport de marchandises pour compte d'autrui ou transport de passagers).",
            "Déclaration immédiate à HBC Logistique en cas de sinistre, panne bloquante ou incident de route.",
        ],
    },
    {
        number: "Article 5",
        title: "Charges à l'essieu, arrimage & sécurité des chargements",
        summary:
            "La préservation des infrastructures routières ivoiriennes et l'intégrité des marchandises sont prioritaires.",
        obligations: [
            "Respect des limites réglementaires de poids total autorisé en charge (PTAC) et de charge à l'essieu aux postes de pesage.",
            "Arrimage rigoureux des charges (sangles, chaînes, verrous Twist-Lock pour conteneurs, bâchage des bennes pour éviter toute projection de gravats ou sable).",
            "Signalisation réglementaire et escorte pour tout chargement hors gabarit ou convoi lourd.",
        ],
    },
    {
        number: "Article 6",
        title: "Temps de repos & Tolérance zéro alcool / stupéfiants",
        summary:
            "La prévention de la fatigue et des conduites à risque protège les vies humaines sur les routes de Côte d'Ivoire.",
        obligations: [
            "Tolérance zéro absolue vis-à-vis de l'alcool, des stupéfiants et de toute substance altérant la vigilance.",
            "Respect de pauses régulières sur les trajets longue distance (ex: Abidjan – San-Pédro, Bouaké, Korhogo, Man).",
            "Refus systématique de prendre la route en cas de fatigue excessive ou d'anomalie mécanique critique.",
        ],
    },
    {
        number: "Article 7",
        title: "Engagement Qualité, Ponctualité & Confidentialité",
        summary:
            "En tant que partenaire HBC Logistique, vous représentez l'exigence de fiabilité de la plateforme.",
        obligations: [
            "Respect des horaires d'enlèvement et de livraison convenus avec le client.",
            "Signalement en temps réel de l'avancement de la mission (départ, arrivée, preuve de livraison).",
            "Confidentialité stricte concernant les coordonnées clients, les marchandises transportées et les tarifs.",
        ],
    },
];
