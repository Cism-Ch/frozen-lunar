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
}

const STORAGE_KEY = "hbc_quotes";

export const quoteStorage = {
    getAll: (): Quote[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    add: (quote: Omit<Quote, "id" | "date" | "status" | "amount">) => {
        const quotes = quoteStorage.getAll();
        const newQuote: Quote = {
            ...quote,
            id: `DEV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            date: new Date().toISOString().split('T')[0],
            status: "En attente",
            amount: "À calculer", // Placeholder for now
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newQuote, ...quotes]));
        return newQuote;
    },

    updateStatus: (id: string, status: Quote["status"]) => {
        const quotes = quoteStorage.getAll();
        const updatedQuotes = quotes.map((q) =>
            q.id === id ? { ...q, status } : q
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuotes));
    },

    delete: (id: string) => {
        const quotes = quoteStorage.getAll();
        const filteredQuotes = quotes.filter((q) => q.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredQuotes));
    }
};
