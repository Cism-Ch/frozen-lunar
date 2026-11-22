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
 * Catalogue de référence de la flotte adaptée aux opérations logistiques,
 * BTP, portuaires et transport de personnel en Côte d'Ivoire et Afrique de l'Ouest (CEDEAO).
 */
export const AFRICAN_FLEET_CATALOG: Omit<FleetVehicleItem, "id">[] = [
    {
        slug: "bus-64-places-grand-tourisme",
        name: "Bus 64 places Grand Tourisme",
        category: "PASSENGER",
        capacityLabel: "64 places assises • Climatisé",
        description:
            "Autocar grand confort (type Yutong / Zhongtong) idéal pour les navettes d'entreprises, chantiers miniers, délégations et liaisons interurbaines Abidjan – Yamoussoukro – San-Pédro.",
        totalQuantity: 3,
        availableQuantity: 2,
        dailyRateFcfa: 250000,
        imageUrl: null,
        specs: [
            "64 sièges inclinables",
            "Climatisation tropicalisée",
            "Soutes bagages 10 m³",
            "Suivi GPS temps réel",
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
            "Navette professionnelle robuste (Toyota Coaster climatisé) adaptée au transport quotidien d'équipes techniques, cadres et visites de sites industriels.",
        totalQuantity: 4,
        availableQuantity: 3,
        dailyRateFcfa: 135000,
        imageUrl: null,
        specs: [
            "30 places climatisées",
            "Accès facile zones industrielles",
            "Chauffeur dédié certifié",
            "Ceintures 3 points",
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
            "Ensemble tracteur 6x4 + semi-remorque surbaissée avec rampes hydrauliques pour le transfert d'engins de chantier (pelles, bulldozers, foreuses, groupes électrogènes) sur toute la CEDEAO.",
        totalQuantity: 3,
        availableQuantity: 2,
        dailyRateFcfa: 650000,
        imageUrl: null,
        specs: [
            "Charge utile jusqu'à 70T",
            "Rampes hydrauliques renforcées",
            "Escorte & autorisation convoi",
            "Assurance Ad Valorem OHADA",
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
            "Tracteur routier avec châssis squelette à verrous tournants (Twist-Lock) pour l'enlèvement au Port Autonome d'Abidjan (PAA) et Port de San-Pédro vers les entrepôts ou corridors Mali / Burkina.",
        totalQuantity: 5,
        availableQuantity: 4,
        dailyRateFcfa: 320000,
        imageUrl: null,
        specs: [
            "Compatible 20 pieds & 40 pieds HC",
            "Badge d'accès Port Autonome d'Abidjan",
            "Verrous Twist-Lock certifiés",
            "Lettre de voiture OHADA",
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
            "Plateau nu équipé de ranchers et sangles haute résistance pour fers à béton, charpentes métalliques, tuyauteries industrielles, bois débité et palettes volumineuses.",
        totalQuantity: 4,
        availableQuantity: 3,
        dailyRateFcfa: 290000,
        imageUrl: null,
        specs: [
            "Longueur utile 12,5 mètres",
            "Arrimage renforcé & bâchage",
            "Idéal charpentes & acier",
            "Corridors nationaux & CEDEAO",
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
            "Camion benne tout-terrain (Sinotruk Howo / Shacman) conçu pour les chantiers BTP, terrassements, évacuation de déblais et livraison de sable, gravier et latérite.",
        totalQuantity: 6,
        availableQuantity: 4,
        dailyRateFcfa: 220000,
        imageUrl: null,
        specs: [
            "Benne basculante hydraulique",
            "Châssis renforcé pistes & chantiers",
            "Capacité 16 à 22 m³",
            "Rotation rapide Abidjan & intérieur",
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
            "Semi-remorque benne grand volume pour approvisionnement massif en granulats, clinker, minerais et produits agricoles en vrac sur longues distances.",
        totalQuantity: 3,
        availableQuantity: 2,
        dailyRateFcfa: 380000,
        imageUrl: null,
        specs: [
            "Grand volume jusqu'à 50 m³",
            "Bâchage sécurisé anti-poussière",
            "Pesage certifié pont-bascule",
            "Adapté carrières & grands travaux",
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
            "Camion plateau autonome équipé d'un bras de grue hydraulique pour charger, transporter et décharger directement sur chantier sans moyen de levage externe.",
        totalQuantity: 2,
        availableQuantity: 1,
        dailyRateFcfa: 340000,
        imageUrl: null,
        specs: [
            "Autonomie chargement/déchargement",
            "Portée flèche jusqu'à 12 m",
            "Stabilisateurs hydrauliques",
            "Idéal transformateurs & bungalows",
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
            "Véhicule tout-terrain (Toyota Hilux / Mitsubishi L200) pour missions de supervision chantier, zones rurales difficilement accessibles, livraison de pièces urgentes et escorte technique.",
        totalQuantity: 6,
        availableQuantity: 5,
        dailyRateFcfa: 85000,
        imageUrl: null,
        specs: [
            "Transmission intégrale 4x4",
            "Benne arrière 1,2 Tonne",
            "Climatisation & GPS",
            "Idéal pistes & sites miniers",
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
            "Utilitaire tôlé sécurisé pour la distribution urbaine à Abidjan (Plateau, Marcory, Zone 4, Yopougon, Cocody), colis fragiles, équipements informatiques et fournitures.",
        totalQuantity: 5,
        availableQuantity: 4,
        dailyRateFcfa: 75000,
        imageUrl: null,
        specs: [
            "Volume utile 14 m³ fermé",
            "Accès centre-ville sans restriction",
            "Livraison express J+0",
            "Protection pluie & poussière",
        ],
        recommendedFor: ["materiaux", "autre"],
        isActive: true,
        sortOrder: 10,
    },
];

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
