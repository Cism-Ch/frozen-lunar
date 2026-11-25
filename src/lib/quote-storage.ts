export interface QuoteHistoryEvent {
    id: string;
    action: string;
    description?: string;
    timestamp: string;
    user: string;
}

export interface QuotePricingLine {
    id: string;
    label: string;
    category: "base" | "distance" | "handling" | "insurance" | "margin" | "other";
    amountFcfa: number;
}

export interface QuotePricingBreakdown {
    vehicleName?: string;
    estimatedDistanceKm?: number;
    estimatedDuration?: string;
    lines: QuotePricingLine[];
    includeVat: boolean;
    vatRate: number;
    subtotalHt: number;
    vatAmount: number;
    totalTtc: number;
    aiReasoning?: string;
    aiSource?: string;
    updatedAt: string;
}

export interface QuotePartnerAssignment {
    partnerId: string;
    partnerName: string;
    contactName: string;
    phone: string;
    whatsapp?: string | null;
    email: string;
    city: string;
    partnerNetFcfa: number;
    clientPriceFcfa?: number;
    hbcMarginFcfa?: number;
    missionNotes?: string;
    assignedAt: string;
    assignedBy: string;
}

export interface QuoteSupplementaryInfo {
    category: "materials" | "container" | "machinery" | "structure" | "other";
    // Matériaux
    materialType?: string;
    weight?: string;
    packaging?: string;
    hazardous?: boolean;
    stackable?: boolean;
    // Container
    containerSize?: string;
    containerType?: string;
    loadingType?: string;
    isEmpty?: boolean;
    // Machine
    machineType?: string;
    dimensions?: string;
    requiresCrane?: boolean;
    // Charpente
    structureType?: string;
    length?: string;
    // Commun
    specialRequirements?: string;
    accessInfo?: string;
    urgency?: "standard" | "urgent" | "very_urgent";
    attachments?: string[];
    pricingBreakdown?: QuotePricingBreakdown;
    partnerAssignment?: QuotePartnerAssignment;
}

export interface QuoteVehicleSummary {
    id: string;
    name: string;
    category: string;
    dailyRateFcfa?: number | null;
    capacityLabel: string;
}

export interface Quote {
    id: string;
    trackingCode?: string;
    date: string;
    client: string;
    email: string;
    phone: string;
    type: string;
    pickup: string;
    dropoff: string;
    transportDate: string;
    status: "En attente" | "Validé" | "Refusé" | "Annulé";
    amount: string;
    notes?: string;
    userNotes?: string;
    cancellationReason?: string;
    cancelledAt?: string;
    vehicleId?: string;
    vehicleQuantity?: number;
    vehicle?: QuoteVehicleSummary;
    supplementaryInfo?: QuoteSupplementaryInfo;
    source: "form" | "chat";
    history?: QuoteHistoryEvent[];
}

const STORAGE_KEY = "hbc_quotes";

export const quoteStorage = {
    getAll: (): Quote[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    getById: (id: string): Quote | undefined => {
        const quotes = quoteStorage.getAll();
        return quotes.find((q) => q.id === id);
    },

    add: (
        quote: Omit<Quote, "id" | "date" | "status" | "amount" | "history">
    ) => {
        const quotes = quoteStorage.getAll();
        const sourceLabel =
            quote.source === "chat"
                ? "l'assistant virtuel"
                : "le formulaire web";
        const newQuote: Quote = {
            ...quote,
            id: `DEV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            date: new Date().toISOString().split("T")[0],
            status: "En attente",
            amount: "À calculer",
            notes: quote.notes || "",
            history: [
                {
                    id: Date.now().toString(),
                    action: "Création",
                    description: `Devis créé via ${sourceLabel}`,
                    timestamp: new Date().toISOString(),
                    user: "Système",
                },
            ],
        };
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([newQuote, ...quotes])
        );
        return newQuote;
    },

    update: (id: string, data: Partial<Quote>, historyAction?: string) => {
        const quotes = quoteStorage.getAll();
        const updatedQuotes = quotes.map((q) => {
            if (q.id !== id) return q;

            const updatedQuote = { ...q, ...data };

            if (historyAction) {
                const newEvent: QuoteHistoryEvent = {
                    id: Date.now().toString(),
                    action: historyAction,
                    timestamp: new Date().toISOString(),
                    user: "Admin",
                    description: `Mise à jour: ${Object.keys(data).join(", ")}`,
                };
                updatedQuote.history = [newEvent, ...(q.history || [])];
            }

            return updatedQuote;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuotes));
    },

    updateStatus: (id: string, status: Quote["status"]) => {
        quoteStorage.update(id, { status }, `Changement de statut : ${status}`);
    },

    addNote: (id: string, note: string) => {
        const quotes = quoteStorage.getAll();
        const updatedQuotes = quotes.map((q) => {
            if (q.id !== id) return q;
            const newEvent: QuoteHistoryEvent = {
                id: Date.now().toString(),
                action: "Note Interne",
                description: note,
                timestamp: new Date().toISOString(),
                user: "Admin",
            };
            return {
                ...q,
                history: [newEvent, ...(q.history || [])],
            };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuotes));
    },

    delete: (id: string) => {
        const quotes = quoteStorage.getAll();
        const filteredQuotes = quotes.filter((q) => q.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredQuotes));
    },
};
