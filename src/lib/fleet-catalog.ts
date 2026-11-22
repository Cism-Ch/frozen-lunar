export type FleetVehicleCategory =
    | "HEAVY_HAUL"
    | "CONTAINERS"
    | "MATERIALS"
    | "PASSENGER"
    | "UTILITY";

export interface FleetVehicleItem {
    id: string;
    slug: string;
    name: string;
    category: FleetVehicleCategory;
    capacityLabel: string;
    description: string;
    totalQuantity: number;
    availableQuantity: number;
    dailyRateFcfa: number | null;
    imageUrl: string | null;
    specs: string[];
    recommendedFor: string[];
    isActive: boolean;
    sortOrder: number;
}

export const VEHICLE_CATEGORY_META: Record<
    FleetVehicleCategory,
    { label: string; shortLabel: string; accentClass: string }
> = {
    HEAVY_HAUL: {
        label: "Transport Lourd & Engins",
        shortLabel: "Transport Lourd",
        accentClass:
            "from-amber-500/20 via-orange-500/10 to-background border-amber-500/30",
    },
    CONTAINERS: {
        label: "Conteneurs & Plateaux",
        shortLabel: "Conteneurs",
        accentClass:
            "from-blue-500/20 via-indigo-500/10 to-background border-blue-500/30",
    },
    MATERIALS: {
        label: "Bennes & Matériaux BTP",
        shortLabel: "Bennes BTP",
        accentClass:
            "from-emerald-500/20 via-teal-500/10 to-background border-emerald-500/30",
    },
    PASSENGER: {
        label: "Transport de Personnel & Bus",
        shortLabel: "Personnel & Bus",
        accentClass:
            "from-violet-500/20 via-purple-500/10 to-background border-violet-500/30",
    },
    UTILITY: {
        label: "Utilitaires & Tout-Terrain",
        shortLabel: "Utilitaires",
        accentClass:
            "from-sky-500/20 via-cyan-500/10 to-background border-sky-500/30",
    },
};

/**
 * Catalogue par défaut de la flotte HBC Logistique en Côte d'Ivoire.
 * - Les descriptions portent exclusivement sur la catégorie du véhicule et son usage en Côte d'Ivoire.
 * - Les éléments `specs` listent uniquement les utilités concrètes du véhicule.
 */
export const AFRICAN_FLEET_CATALOG: Omit<FleetVehicleItem, "id">[] = [
    {
        slug: "bus-64-places-grand-tourisme",
        name: "Bus 64 places Grand Tourisme",
        category: "PASSENGER",
        capacityLabel: "64 places assises • Climatisé",
        description:
            "Autocar de transport collectif grande capacité conçu pour le déplacement confortable de groupes, collaborateurs et passagers à Abidjan et vers les villes de l'intérieur de la Côte d'Ivoire.",
        totalQuantity: 3,
        availableQuantity: 2,
        dailyRateFcfa: 250000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Yutong_T15E%2C_Busworld_Europe_2023%2C_Brussels_%28P1140391%29.jpg/960px-Yutong_T15E%2C_Busworld_Europe_2023%2C_Brussels_%28P1140391%29.jpg",
        specs: [
            "Transport de personnel et navettes d'entreprise",
            "Voyages de groupe, séminaires et excursions",
            "Liaisons interurbaines longue distance en Côte d'Ivoire",
            "Transferts aéroport, événements et délégations",
        ],
        recommendedFor: ["autre"],
        isActive: true,
        sortOrder: 1,
    },
    {
        slug: "minibus-coaster-30-places",
        name: "Minibus Coaster 30 places",
        category: "PASSENGER",
        capacityLabel: "30 places assises • Urbain & Interurbain",
        description:
            "Minibus de transport de passagers intermédiaire, maniable et climatisé, dédié aux liaisons quotidiennes d'équipes et aux déplacements de groupes moyens partout en Côte d'Ivoire.",
        totalQuantity: 4,
        availableQuantity: 3,
        dailyRateFcfa: 135000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/TOYOTA_COASTER_%28B40_B50%29_China_%284%29.jpg/960px-TOYOTA_COASTER_%28B40_B50%29_China_%284%29.jpg",
        specs: [
            "Navettes quotidiennes d'équipes et collaborateurs",
            "Visites de chantiers et déplacements professionnels",
            "Transport d'établissements, séminaires et événements",
            "Déplacements urbains et interurbains en Côte d'Ivoire",
        ],
        recommendedFor: ["autre"],
        isActive: true,
        sortOrder: 2,
    },
    {
        slug: "porte-char-surbaisse-40-70t",
        name: "Porte-char Surbaissé 40–70T",
        category: "HEAVY_HAUL",
        capacityLabel: "40 à 70 Tonnes • 3 à 4 essieux",
        description:
            "Ensemble de transport lourd surbaissé avec rampes d'accès, destiné au déplacement sécurisé d'engins de travaux publics et de machines industrielles sur l'ensemble du réseau routier ivoirien.",
        totalQuantity: 3,
        availableQuantity: 2,
        dailyRateFcfa: 650000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Globe_Trailers_detachable_gooseneck_trailer.jpg/960px-Globe_Trailers_detachable_gooseneck_trailer.jpg",
        specs: [
            "Transfert d'engins de chantier (pelles, bulldozers, chargeuses)",
            "Transport de machines industrielles et groupes électrogènes",
            "Acheminement d'équipements lourds et hors gabarit",
            "Mobilisation d'engins sur les chantiers de Côte d'Ivoire",
        ],
        recommendedFor: ["machines", "modules"],
        isActive: true,
        sortOrder: 3,
    },
    {
        slug: "tracteur-porte-conteneur-20-40",
        name: "Porte-conteneur 20' / 40'",
        category: "CONTAINERS",
        capacityLabel: "1×40' ou 2×20' • 35 Tonnes",
        description:
            "Ensemble routier porte-conteneur équipé d'un châssis dédié à la prise en charge, au transfert et à la livraison de conteneurs maritimes entre les zones portuaires et les sites logistiques de Côte d'Ivoire.",
        totalQuantity: 5,
        availableQuantity: 4,
        dailyRateFcfa: 320000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/CSX_Intermodal_container_with_truck_and_trailer%2C_Denver%2C_CO_2021-03-24.jpg/960px-CSX_Intermodal_container_with_truck_and_trailer%2C_Denver%2C_CO_2021-03-24.jpg",
        specs: [
            "Traction de conteneurs maritimes 20 pieds et 40 pieds",
            "Enlèvement et livraison aux ports d'Abidjan et de San-Pédro",
            "Approvisionnement d'entrepôts et zones industrielles",
            "Positionnement et retour de conteneurs vides ou pleins",
        ],
        recommendedFor: ["containers", "modules"],
        isActive: true,
        sortOrder: 4,
    },
    {
        slug: "semi-remorque-plateau-12m",
        name: "Semi-remorque Plateau 12m",
        category: "CONTAINERS",
        capacityLabel: "Longueur 12,5 m • 32 Tonnes",
        description:
            "Véhicule articulé à plateau ouvert offrant une grande surface de chargement plane pour les marchandises longues, lourdes ou palettisées à travers toute la Côte d'Ivoire.",
        totalQuantity: 4,
        availableQuantity: 3,
        dailyRateFcfa: 290000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Flatbed_semi-trailer_truck%2C_Russia.jpg/960px-Flatbed_semi-trailer_truck%2C_Russia.jpg",
        specs: [
            "Transport de fers à béton, charpentes et profilés métalliques",
            "Acheminement de charges palettisées, sacs de ciment et bois",
            "Livraison de tuyauteries et structures préfabriquées",
            "Approvisionnement de dépôts et chantiers en Côte d'Ivoire",
        ],
        recommendedFor: ["charpentes", "materiaux", "modules"],
        isActive: true,
        sortOrder: 5,
    },
    {
        slug: "camion-benne-6x4-8x4",
        name: "Camion Benne 6x4 / 8x4 (16–22 m³)",
        category: "MATERIALS",
        capacityLabel: "16 à 22 m³ • 25–30 Tonnes",
        description:
            "Camion porteur à benne basculante robuste adapté aux opérations de chantier, au transport de matériaux de construction en vrac et aux travaux de terrassement en Côte d'Ivoire.",
        totalQuantity: 6,
        availableQuantity: 4,
        dailyRateFcfa: 220000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Howo_Sinotruk_Mining_Dump_Truck_%28Mining_Indonesia_2026%29.jpg/960px-Howo_Sinotruk_Mining_Dump_Truck_%28Mining_Indonesia_2026%29.jpg",
        specs: [
            "Livraison de sable, gravier, concassé et latérite",
            "Évacuation de terre, déblais et gravats de chantier",
            "Approvisionnement direct des travaux de bâtiment et voirie",
            "Rotations sur chantiers urbains et routiers en Côte d'Ivoire",
        ],
        recommendedFor: ["materiaux"],
        isActive: true,
        sortOrder: 6,
    },
    {
        slug: "semi-benne-carriere-35-50m3",
        name: "Semi-benne Carrière 35–50 m³",
        category: "MATERIALS",
        capacityLabel: "35 à 50 m³ • 45 Tonnes",
        description:
            "Ensemble semi-remorque benne grand volume conçu pour le transport massif d'agrégats, de matériaux de carrière et de pondéreux sur les axes routiers de Côte d'Ivoire.",
        totalQuantity: 3,
        availableQuantity: 2,
        dailyRateFcfa: 380000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/2000_Foden_truck_with_tipper_trailer%2C_3_February_2009.jpg/960px-2000_Foden_truck_with_tipper_trailer%2C_3_February_2009.jpg",
        specs: [
            "Transport grand volume de granulats et roches de carrière",
            "Approvisionnement massif de centrales à béton et cimenteries",
            "Acheminement de matières premières et récoltes en vrac",
            "Soutien logistique aux grands chantiers d'infrastructures",
        ],
        recommendedFor: ["materiaux"],
        isActive: true,
        sortOrder: 7,
    },
    {
        slug: "camion-grue-hiab-manutention",
        name: "Camion-Grue Bras Hiab",
        category: "HEAVY_HAUL",
        capacityLabel: "Plateau 12T + Grue auxiliaire 10T/m",
        description:
            "Camion porteur plateau doté d'une grue hydraulique embarquée permettant de combiner en une seule mission le transport, le levage et la dépose précise de charges lourdes en Côte d'Ivoire.",
        totalQuantity: 2,
        availableQuantity: 1,
        dailyRateFcfa: 340000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Dornbirn-HIAB_truck-mounted_crane_145Z-01ASD.jpg/960px-Dornbirn-HIAB_truck-mounted_crane_145Z-01ASD.jpg",
        specs: [
            "Chargement et déchargement autonome sans grue externe",
            "Pose de bungalows de chantier, cabines et groupes électrogènes",
            "Manutention de transformateurs et équipements industriels",
            "Levage et mise en place directe sur site en Côte d'Ivoire",
        ],
        recommendedFor: ["machines", "charpentes", "modules"],
        isActive: true,
        sortOrder: 8,
    },
    {
        slug: "pickup-4x4-double-cabine",
        name: "Pick-up 4x4 Double Cabine",
        category: "UTILITY",
        capacityLabel: "1,2 Tonne • 5 places • 4x4",
        description:
            "Véhicule utilitaire tout-terrain à double cabine alliant transport d'équipe et benne arrière pour les interventions techniques sur routes et pistes en Côte d'Ivoire.",
        totalQuantity: 6,
        availableQuantity: 5,
        dailyRateFcfa: 85000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/2025_Toyota_Hilux_Travo_Prerunner_Double-Cab_2.8_Premium.jpg/960px-2025_Toyota_Hilux_Travo_Prerunner_Double-Cab_2.8_Premium.jpg",
        specs: [
            "Accès aux chantiers, plantations et pistes difficiles",
            "Transport simultané d'une équipe (5 places) et d'outillage",
            "Livraison rapide de pièces détachées et matériel urgent",
            "Supervision de travaux et liaisons terrain en Côte d'Ivoire",
        ],
        recommendedFor: ["materiaux", "autre"],
        isActive: true,
        sortOrder: 9,
    },
    {
        slug: "fourgon-utilitaire-3-5t",
        name: "Fourgon Utilitaire 3,5T (14 m³)",
        category: "UTILITY",
        capacityLabel: "14 m³ • 3,5 Tonnes • Fermé",
        description:
            "Fourgon utilitaire tôlé conçu pour le transport protégé de marchandises, cartons et équipements sensibles en milieu urbain et interurbain en Côte d'Ivoire.",
        totalQuantity: 5,
        availableQuantity: 4,
        dailyRateFcfa: 75000,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/2024_Mercedes-Benz_Sprinter_311_CDI_%28Argentina%29.jpg/960px-2024_Mercedes-Benz_Sprinter_311_CDI_%28Argentina%29.jpg",
        specs: [
            "Distribution urbaine et livraisons express à Abidjan",
            "Transport fermé à l'abri de la pluie et de la poussière",
            "Déménagements de bureaux, mobilier et matériel informatique",
            "Approvisionnement de commerces, pharmacies et agences",
        ],
        recommendedFor: ["materiaux", "autre"],
        isActive: true,
        sortOrder: 10,
    },
];

export const UEMOA_CEDEAO_COUNTRIES = ["Côte d'Ivoire"] as const;

export const PARTNER_OPERATING_ZONES = [
    "Grand Abidjan & Zones Industrielles",
    "Port Autonome d'Abidjan (PAA)",
    "Port de San-Pédro & Sud-Ouest",
    "Yamoussoukro & Centre",
    "Bouaké & Gbêkê",
    "Korhogo & Grand Nord",
    "Daloa • Man & Grand Ouest",
] as const;

const CATEGORY_FALLBACK_IMAGES: Record<FleetVehicleCategory, string> = {
    PASSENGER:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Yutong_T15E%2C_Busworld_Europe_2023%2C_Brussels_%28P1140391%29.jpg/960px-Yutong_T15E%2C_Busworld_Europe_2023%2C_Brussels_%28P1140391%29.jpg",
    HEAVY_HAUL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Globe_Trailers_detachable_gooseneck_trailer.jpg/960px-Globe_Trailers_detachable_gooseneck_trailer.jpg",
    CONTAINERS:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/CSX_Intermodal_container_with_truck_and_trailer%2C_Denver%2C_CO_2021-03-24.jpg/960px-CSX_Intermodal_container_with_truck_and_trailer%2C_Denver%2C_CO_2021-03-24.jpg",
    MATERIALS:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Howo_Sinotruk_Mining_Dump_Truck_%28Mining_Indonesia_2026%29.jpg/960px-Howo_Sinotruk_Mining_Dump_Truck_%28Mining_Indonesia_2026%29.jpg",
    UTILITY:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/2025_Toyota_Hilux_Travo_Prerunner_Double-Cab_2.8_Premium.jpg/960px-2025_Toyota_Hilux_Travo_Prerunner_Double-Cab_2.8_Premium.jpg",
};

/**
 * Résout l'URL de photo d'illustration d'un véhicule (même si la ligne DB existante avait imageUrl à null).
 */
export function resolveVehicleImageUrl(vehicle: {
    slug: string;
    category: FleetVehicleCategory;
    imageUrl?: string | null;
}): string {
    const raw = vehicle.imageUrl?.trim();
    if (raw && (raw.startsWith("https://") || raw.startsWith("http://"))) {
        return raw;
    }
    const catalogMatch = AFRICAN_FLEET_CATALOG.find(
        (item) => item.slug === vehicle.slug
    );
    if (catalogMatch?.imageUrl) {
        return catalogMatch.imageUrl;
    }
    return CATEGORY_FALLBACK_IMAGES[vehicle.category];
}

/**
 * Formate le badge de stock au format métier demandé (ex: "Qté: 02 disponibles").
 */
export function formatQuantityBadge(availableQuantity: number): string {
    const safeQty = Math.max(0, Math.floor(availableQuantity));
    const padded = String(safeQty).padStart(2, "0");
    if (safeQty === 0) return "Qté: 00 • Sur demande";
    if (safeQty === 1) return `Qté: ${padded} disponible`;
    return `Qté: ${padded} disponibles`;
}

/**
 * Formate un tarif journalier en FCFA.
 */
export function formatFcfaRate(rate: number | null | undefined): string {
    if (typeof rate !== "number" || rate <= 0) {
        return "Sur devis";
    }
    return `${new Intl.NumberFormat("fr-FR").format(rate)} FCFA / jour`;
}
