/**
 * Module d'intégration Hugging Face & Formatage de Messages WhatsApp
 * Utilise l'Inference API Serverless de Hugging Face avec basculement automatique
 * sur un moteur de modèles paramétriques (Fail-Safe 100% autonome).
 */

export interface WhatsAppQuotePayload {
    id: string;
    client: string;
    phone: string;
    email: string;
    pickup: string;
    dropoff: string;
    type: string;
    date: string;
    amount?: string;
    notes?: string;
}

export interface GeneratedWhatsAppMessage {
    text: string;
    url: string;
    source: "huggingface" | "template_local";
    model?: string;
}

/**
 * Récupère et assainit le token d'accès Hugging Face.
 */
export function getHuggingFaceApiKey(): string | null {
    const key = process.env.HUGGINGFACE_API_KEY || "";
    const trimmed = key.trim();

    if (
        !trimmed ||
        trimmed.toLowerCase().includes("your_") ||
        trimmed.toLowerCase().includes("your-") ||
        trimmed.toLowerCase().includes("placeholder") ||
        trimmed.length < 10
    ) {
        return null;
    }

    return trimmed;
}

/**
 * Indique si le service Hugging Face est configuré.
 */
export function isHuggingFaceAvailable(): boolean {
    return getHuggingFaceApiKey() !== null;
}

/**
 * Normalise un numéro de téléphone au format requis par WhatsApp (wa.me/XXXXXXXXXX)
 * Retire tout caractère non numérique, gère les préfixes internationaux et locaux.
 */
export function normalizePhoneForWhatsApp(phone: string): string {
    let digitsOnly = phone.replace(/[^0-9]/g, "");

    // Si préfixe international au format 00 (ex: 0033...), on retire le double zéro initial
    if (digitsOnly.startsWith("00")) {
        digitsOnly = digitsOnly.slice(2);
    }

    // Si numéro français au format local (10 chiffres commençant par 0)
    if (digitsOnly.length === 10 && digitsOnly.startsWith("0")) {
        return `33${digitsOnly.slice(1)}`;
    }

    // Sinon conserve la suite de chiffres nettoyée (ex: 22507000000 ou 33612345678)
    return digitsOnly;
}

/**
 * Moteur de secours local déterministe garantissant un message WhatsApp
 * parfait, lisible et professionnel même sans connexion IA externe.
 */
export function formatLocalWhatsAppMessage(
    payload: WhatsAppQuotePayload,
    contextMessage?: string
): string {
    const quoteRef = payload.id.slice(0, 8);
    const amountStr =
        payload.amount && payload.amount !== "À calculer"
            ? `💰 *Tarif proposé :* ${payload.amount}\n`
            : "";

    const customContext = contextMessage?.trim()
        ? `\nℹ️ *Précision :* ${contextMessage.trim()}\n`
        : "";

    return (
        `🚚 *HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE*\n` +
        `_"Votre sécurité, Notre priorité"_\n\n` +
        `Bonjour *${payload.client}*,\n\n` +
        `Nous faisons suite à votre demande de transport (Réf : *${quoteRef}*).\n\n` +
        `📍 *Départ :* ${payload.pickup}\n` +
        `🏁 *Destination :* ${payload.dropoff}\n` +
        `🚛 *Véhicule / Fret :* ${payload.type}\n` +
        `📅 *Date souhaitée :* ${payload.date}\n` +
        `${amountStr}` +
        `${customContext}\n` +
        `Notre équipe logistique est disponible directement sur ce fil WhatsApp pour valider les créneaux et répondre à vos questions techniques.\n\n` +
        `Bien cordialement,\n*L'équipe HBC Logistique*`
    );
}

/**
 * Génère un message WhatsApp optimisé pour smartphone.
 * Tente d'utiliser Hugging Face si configuré, avec fallback automatique vers le template local.
 */
export async function generateWhatsAppMessage(
    payload: WhatsAppQuotePayload,
    customContext?: string
): Promise<GeneratedWhatsAppMessage> {
    const cleanPhone = normalizePhoneForWhatsApp(payload.phone);
    const apiKey = getHuggingFaceApiKey();
    const model = "mistralai/Mistral-7B-Instruct-v0.3";

    if (!apiKey) {
        const text = formatLocalWhatsAppMessage(payload, customContext);
        return {
            text,
            url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`,
            source: "template_local",
        };
    }

    try {
        const prompt = `<s>[INST] Tu es le chargé de clientèle de l'entreprise HBC Logistique.
Formate un message WhatsApp professionnel, chaleureux et concis pour ce client :
Client : ${payload.client}
Devis : ${payload.id.slice(0, 8)}
Départ : ${payload.pickup}
Arrivée : ${payload.dropoff}
Type de fret : ${payload.type}
Date : ${payload.date}
${payload.amount ? `Prix : ${payload.amount}` : ""}
${customContext ? `Message complémentaire : ${customContext}` : ""}

Règles strictes :
- Utilise la mise en forme WhatsApp (*gras* pour les mots clés, emojis de transport).
- Court et lisible sur smartphone (max 10-12 lignes).
- Termine par la signature HBC Logistique ("Votre sécurité, Notre priorité").
- Rédige UNIQUEMENT le texte du message, sans explications ni guillemets d'introduction. [/INST]`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 300,
                        temperature: 0.3,
                        return_full_text: false,
                    },
                }),
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data[0]?.generated_text) {
                const generatedText = (data[0].generated_text as string).trim();
                if (generatedText.length > 30) {
                    return {
                        text: generatedText,
                        url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedText)}`,
                        source: "huggingface",
                        model,
                    };
                }
            }
        }

        console.warn(
            "Hugging Face Inference indisponible ou format inattendu. Basculement sur template local."
        );
    } catch (error: unknown) {
        console.warn(
            "Hugging Face warning (basculement fail-safe déclenché) :",
            error instanceof Error ? error.message : error
        );
    }

    const fallbackText = formatLocalWhatsAppMessage(payload, customContext);
    return {
        text: fallbackText,
        url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fallbackText)}`,
        source: "template_local",
    };
}
