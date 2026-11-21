import { z } from "zod";
import { logger } from "@/lib/logger";

export const OPENROUTER_API_URL =
    "https://openrouter.ai/api/v1/chat/completions";

/**
 * Modèle OpenRouter par défaut (NVIDIA Nemotron open-source, modifiable via OPENROUTER_MODEL).
 */
export const DEFAULT_OPENROUTER_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct";

export interface OpenRouterChatOptions {
    systemPrompt?: string;
    userPrompt: string;
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
    model?: string;
}

export type OpenRouterResult =
    | { success: true; data: { content: string; model: string } }
    | { success: false; error: string };

const openRouterResponseSchema = z.object({
    model: z.string().optional(),
    choices: z
        .array(
            z.object({
                message: z.object({
                    content: z.string().nullable().optional(),
                }),
            })
        )
        .min(1),
});

/**
 * Récupère et assainit la clé API OpenRouter depuis les variables d'environnement serveur.
 */
export function getOpenRouterApiKey(): string | null {
    const key = process.env.OPENROUTER_API_KEY || "";
    const trimmed = key.trim();

    if (
        !trimmed ||
        trimmed.toLowerCase().includes("your_") ||
        trimmed.toLowerCase().includes("your-") ||
        trimmed.toLowerCase().includes("placeholder") ||
        trimmed.toLowerCase() === "mock" ||
        trimmed.length < 15
    ) {
        return null;
    }

    return trimmed;
}

/**
 * Retourne le modèle OpenRouter configuré ou le modèle NVIDIA Nemotron par défaut.
 */
export function getOpenRouterModel(): string {
    const configured = process.env.OPENROUTER_MODEL?.trim();
    return configured && configured.length > 0
        ? configured
        : DEFAULT_OPENROUTER_MODEL;
}

/**
 * Indique si le fournisseur OpenRouter est configuré côté serveur.
 */
export function isOpenRouterAvailable(): boolean {
    return getOpenRouterApiKey() !== null;
}

/**
 * Extrait et parse un objet JSON depuis une réponse texte IA (avec ou sans balises Markdown).
 */
export function extractJsonFromAiText<T>(rawText: string): T | null {
    const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned) as T;
    } catch {
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            try {
                return JSON.parse(
                    cleaned.slice(firstBrace, lastBrace + 1)
                ) as T;
            } catch {
                return null;
            }
        }
        return null;
    }
}

/**
 * Appelle l'API OpenRouter (format standard OpenAI Chat Completions) avec timeout strict
 * et validation Zod de la réponse. Ne lève jamais d'exception non gérée.
 */
export async function callOpenRouterChat(
    options: OpenRouterChatOptions
): Promise<OpenRouterResult> {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
        return { success: false, error: "Clé API OpenRouter non configurée." };
    }

    const model = options.model?.trim() || getOpenRouterModel();
    const timeoutMs = options.timeoutMs ?? 8000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const messages: Array<{ role: "system" | "user"; content: string }> =
            [];
        if (options.systemPrompt) {
            messages.push({ role: "system", content: options.systemPrompt });
        }
        messages.push({ role: "user", content: options.userPrompt });

        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "https://hbc-logistique.fr";

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": appUrl,
                "X-Title": "HBC Logistique",
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: options.maxTokens ?? 400,
                temperature: options.temperature ?? 0.3,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            return {
                success: false,
                error: `OpenRouter HTTP ${response.status}`,
            };
        }

        const rawJson: unknown = await response.json();
        const parsed = openRouterResponseSchema.safeParse(rawJson);

        if (!parsed.success) {
            logger.warn("Réponse OpenRouter inattendue", {
                issues: parsed.error.issues.length,
            });
            return {
                success: false,
                error: "Format de réponse OpenRouter invalide.",
            };
        }

        const content = parsed.data.choices[0]?.message?.content?.trim();
        if (!content) {
            return {
                success: false,
                error: "Réponse OpenRouter vide.",
            };
        }

        return {
            success: true,
            data: {
                content,
                model: parsed.data.model || model,
            },
        };
    } catch (error: unknown) {
        logger.warn("OpenRouter chat warning (Fail-Safe activé)", {
            error: error instanceof Error ? error.message : String(error),
        });
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Erreur réseau OpenRouter.",
        };
    } finally {
        clearTimeout(timeoutId);
    }
}
