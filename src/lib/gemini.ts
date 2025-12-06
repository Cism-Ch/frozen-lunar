import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export interface EstimationResult {
    price: string;
    distance: string;
    duration: string;
    confidence: string;
    reasoning: string;
}

export const geminiService = {
    async estimateTransport(pickup: string, dropoff: string, type: string): Promise<EstimationResult> {
        if (!API_KEY) {
            // Mock response if no API key
            return new Promise(resolve => setTimeout(() => resolve({
                price: "450 - 550€ HT",
                distance: "Approx. 450 km",
                duration: "Approx. 5h30",
                confidence: "Moyenne (Mode démo)",
                reasoning: "Estimation basée sur une moyenne nationale de 1€/km + frais fixes pour ce type de véhicule."
            }), 1500));
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `
                Agis comme un expert en logistique et transport routier.
                Estime le coût, la distance et la durée pour un transport avec les détails suivants :
                - Départ : ${pickup}
                - Arrivée : ${dropoff}
                - Véhicule : ${type}
                
                Réponds UNIQUEMENT au format JSON suivant :
                {
                    "price": "Fourchette de prix en euros",
                    "distance": "Distance en km",
                    "duration": "Durée estimée",
                    "reasoning": "Brève explication du calcul"
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Basic cleanup to ensure JSON parsing
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Gemini Error:", error);
            throw new Error("Impossible de générer l'estimation");
        }
    },

    async draftEmail(type: "validation" | "refusal" | "question", clientName: string, quoteId: string): Promise<{ subject: string, body: string }> {
        if (!API_KEY) {
            // Mock response
            const mocks = {
                validation: {
                    subject: `Validation de votre devis N°${quoteId}`,
                    body: `Bonjour ${clientName},\n\nNous avons le plaisir de vous informer que votre devis N°${quoteId} a été validé par notre équipe.\n\nVous recevrez prochainement les instructions pour la prise en charge.\n\nCordialement,\nL'équipe HBC Logistique`
                },
                refusal: {
                    subject: `Concernant votre demande de devis N°${quoteId}`,
                    body: `Bonjour ${clientName},\n\nAprès étude de votre demande N°${quoteId}, nous ne sommes malheureusement pas en mesure d'y répondre favorablement pour le moment.\n\nNous restons à votre disposition pour toute autre demande.\n\nCordialement,\nL'équipe HBC Logistique`
                },
                question: {
                    subject: `Question concernant le devis N°${quoteId}`,
                    body: `Bonjour ${clientName},\n\nNous traitons actuellement votre demande de devis N°${quoteId}. \n\nPourriez-vous nous préciser [VOTRE QUESTION ICI] ?\n\nDans l'attente de votre retour,\n\nCordialement,\nL'équipe HBC Logistique`
                }
            };
            return new Promise(resolve => setTimeout(() => resolve(mocks[type]), 1000));
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `
                Rédige un email professionnel et courtois pour un client transport.
                Contexte : ${type === "validation" ? "Devis validé" : type === "refusal" ? "Devis refusé (kapacité ou faisabilité)" : "Demande de précision"}
                Client : ${clientName}
                Devis : ${quoteId}
                Ton : Professionnel, chaleureux, rassurant.
                
                Réponds au format JSON : { "subject": "Objet de l'email", "body": "Corps du message" }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            throw new Error("Erreur de génération d'email");
        }
    }
};
