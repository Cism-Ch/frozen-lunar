// Support Agent Types
// Phase 2: These types will be used for LangGraph agent integration

export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    isTyping?: boolean;
    category?: QueryCategory;
    sentiment?: Sentiment;
}

export type QueryCategory = "technical" | "billing" | "general" | "quote" | "transport";

export type Sentiment = "positive" | "neutral" | "negative";

export interface SupportState {
    query: string;
    category: QueryCategory;
    sentiment: Sentiment;
    response: string;
    shouldEscalate: boolean;
    customerContext?: CustomerContext;
}

export interface CustomerContext {
    // Phase 2: Customer data from database
    id?: string;
    email?: string;
    name?: string;
    recentQuotes?: QuoteReference[];
    isReturningCustomer?: boolean;
}

export interface QuoteReference {
    id: string;
    date: Date;
    status: string;
    itemType: string;
}

export interface QuickReply {
    id: string;
    label: string;
    text: string;
    category?: QueryCategory;
    icon?: string;
}

export interface ChatSession {
    id: string;
    messages: Message[];
    startedAt: Date;
    customerContext?: CustomerContext;
    isActive: boolean;
}

// API Types for Phase 2 dedicated API
export interface SupportApiRequest {
    message: string;
    sessionId: string;
    customerContext?: CustomerContext;
}

export interface SupportApiResponse {
    message: string;
    category: QueryCategory;
    sentiment: Sentiment;
    shouldEscalate: boolean;
    suggestedActions?: string[];
}
