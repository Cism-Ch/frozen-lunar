import { beforeEach, describe, expect, it } from "vitest";
import { formatPdfFcfa, sanitizePdfText } from "@/lib/pdf-generator";
import { PdfService } from "@/lib/pdf";
import {
    generateMockResponse,
    isOffTopicForRobot,
    resetConversation,
} from "@/lib/support-agent/mock-responses";
import {
    getStepMessage,
    processFlowAnswer,
    startQuoteFlow,
} from "@/lib/support-agent/quote-flow";

describe("Sprint 29 — PDF Template Hygiene & Interactive Support Flows", () => {
    beforeEach(() => {
        resetConversation();
    });

    describe("PDF Template Sanitization & Buffer Generation", () => {
        it("sanitizes Unicode narrow no-break spaces and typographic chars for Helvetica", () => {
            expect(sanitizePdfText("1\u202F450\u00A0000 FCFA — 2× Camion")).toBe(
                "1 450 000 FCFA - 2x Camion"
            );
            expect(formatPdfFcfa(1250000)).toBe("1 250 000 FCFA");
            expect(formatPdfFcfa(1250000)).not.toMatch(/[\u00A0\u202F]/);
        });

        it("generates a valid server-side PDF buffer with multi-line descriptions", async () => {
            const buffer = await PdfService.generateQuotePdf({
                id: "HBC-2026-9001",
                clientName: "Société Ivoirienne de Travaux Publics & Logistique",
                date: "24/11/2026",
                items: [
                    {
                        description:
                            "Transport exceptionnel Porte-char 40T Abidjan Vridi vers Yamoussoukro Zone Industrielle",
                        quantity: 2,
                        price: 950000,
                    },
                ],
                total: 950000,
            });

            expect(buffer.byteLength).toBeGreaterThan(500);
            expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
        });
    });

    describe("Interactive Multi-Turn Support Flows", () => {
        it("completes a full interactive quote-creation flow with validation recovery", () => {
            let state = startQuoteFlow();
            expect(state.isActive).toBe(true);
            expect(state.currentStep).toBe("itemType");
            expect(getStepMessage(state).toLowerCase()).toContain("transporter");

            // 1. Type de fret
            let step = processFlowAnswer(state, "Container 40 pieds");
            state = step.newState;
            expect(state.currentStep).toBe("pickup");

            // 2. Départ
            step = processFlowAnswer(state, "Port Autonome d'Abidjan, Vridi");
            state = step.newState;
            expect(state.currentStep).toBe("dropoff");

            // 3. Arrivée
            step = processFlowAnswer(state, "Zone Industrielle de Bouaké");
            state = step.newState;
            expect(state.currentStep).toBe("date");

            // 4. Date
            step = processFlowAnswer(state, "15/12/2026");
            state = step.newState;
            expect(state.currentStep).toBe("contact_name");

            // 5. Nom client
            step = processFlowAnswer(state, "Kouadio Jean-Marc");
            state = step.newState;
            expect(state.currentStep).toBe("contact_email");

            // 6. Email invalide puis valide
            const invalidEmail = processFlowAnswer(state, "email-invalide");
            expect(invalidEmail.error).toBeTruthy();
            expect(invalidEmail.newState.currentStep).toBe("contact_email");

            step = processFlowAnswer(state, "jm.kouadio@entreprise.ci");
            state = step.newState;
            expect(state.currentStep).toBe("contact_phone");

            // 7. Téléphone
            step = processFlowAnswer(state, "+225 07 08 09 10 11");
            state = step.newState;
            expect(state.currentStep).toBe("category_questions");

            // 8. Questions spécifiques à la catégorie (boucle dynamique jusqu'à notes)
            let guard = 0;
            while (state.currentStep === "category_questions" && guard < 10) {
                step = processFlowAnswer(state, "standard");
                state = step.newState;
                guard += 1;
            }
            expect(state.currentStep).toBe("notes");

            // 9. Notes puis confirmation
            step = processFlowAnswer(state, "Accès poids lourd dégagé");
            state = step.newState;
            expect(state.currentStep).toBe("confirm");

            step = processFlowAnswer(state, "oui");
            expect(step.complete).toBe(true);
            expect(step.newState.data.email).toBe("jm.kouadio@entreprise.ci");
            expect(step.newState.data.pickup).toContain("Abidjan");
        });

        it("handles off-topic guardrails and in-scope tracking/greeting turns cleanly", async () => {
            expect(
                isOffTopicForRobot("Quelle est la recette des crêpes ?")
            ).toBe(true);
            expect(isOffTopicForRobot("Bonjour")).toBe(false);
            expect(
                isOffTopicForRobot("Je souhaite un devis pour un porte-char")
            ).toBe(false);

            const offTopicRes = await generateMockResponse(
                "Quelle est la recette des crêpes ?"
            );
            expect(offTopicRes.message.toLowerCase()).toContain("hbc");

            const trackingPrompt = await generateMockResponse(
                "Je veux suivre mon transport"
            );
            expect(trackingPrompt.category).toBe("transport");

            const trackingRef = await generateMockResponse("HBC-2026-4412");
            expect(trackingRef.message).toContain("HBC-2026-4412");
        });
    });
});
