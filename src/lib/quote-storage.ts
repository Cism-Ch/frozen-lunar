export interface QuoteHistoryEvent {
    id: string;
    action: string;
    description?: string;
    timestamp: string;
    user: string; // Mock user for now
}

export interface Quote {
    id: string;
    date: string;
    client: string;
    email: string;
    phone: string;
    type: string;
    pickup: string;
    dropoff: string;
    transportDate: string;
    status: "En attente" | "Validé" | "Refusé";
    amount: string;
    notes?: string;
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

    add: (quote: Omit<Quote, "id" | "date" | "status" | "amount" | "history">) => {
        const quotes = quoteStorage.getAll();
        const newQuote: Quote = {
            ...quote,
            id: `DEV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            date: new Date().toISOString().split('T')[0],
            status: "En attente",
            amount: "À calculer",
            notes: "",
            history: [{
                id: Date.now().toString(),
                action: "Création",
                description: "Devis créé via le formulaire web",
                timestamp: new Date().toISOString(),
                user: "Système"
            }]
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newQuote, ...quotes]));
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
                    user: "Admin", // Mock user
                    description: `Mise à jour: ${Object.keys(data).join(", ")}`
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
        // Specific helper for notes to avoid overwriting unrelated data and provide clean history
        const quotes = quoteStorage.getAll();
        const updatedQuotes = quotes.map((q) => {
            if (q.id !== id) return q;
            const newEvent: QuoteHistoryEvent = {
                id: Date.now().toString(),
                action: "Note Interne",
                description: note,
                timestamp: new Date().toISOString(),
                user: "Admin"
            };
            return {
                ...q,
                history: [newEvent, ...(q.history || [])]
            };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuotes));
    },

    delete: (id: string) => {
        const quotes = quoteStorage.getAll();
        const filteredQuotes = quotes.filter((q) => q.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredQuotes));
    }
};
