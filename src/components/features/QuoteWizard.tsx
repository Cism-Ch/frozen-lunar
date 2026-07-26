"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
import * as z from "zod";
import { MapPin, Truck } from "lucide-react";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
    QuoteSummaryDialog,
    type QuoteSummaryData,
} from "./QuoteSummaryDialog";
import { createQuoteAction } from "@/app/actions/quote-management";

// Sub-components
import { WizardHeader } from "./quote-wizard/WizardHeader";
import { WizardFooter } from "./quote-wizard/WizardFooter";
import { StepItemType } from "./quote-wizard/steps/StepItemType";
import { StepLocation } from "./quote-wizard/steps/StepLocation";
import { StepDate } from "./quote-wizard/steps/StepDate";
import { StepContact } from "./quote-wizard/steps/StepContact";
import { StepNotes } from "./quote-wizard/steps/StepNotes";

const formSchema = z.object({
    itemType: z.string().min(2, {
        message: "Veuillez sélectionner un type de transport.",
    }),
    pickupLocation: z.string().min(5, {
        message: "L'adresse de départ doit contenir au moins 5 caractères.",
    }),
    dropoffLocation: z.string().min(5, {
        message: "L'adresse d'arrivée doit contenir au moins 5 caractères.",
    }),
    transportDate: z.date({
        message: "Une date de transport est requise.",
    }),
    fullName: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Le téléphone est requis"),
    userNotes: z.string().optional(),
});

const TOTAL_STEPS = 6;
type QuoteFormValues = z.infer<typeof formSchema>;

export function QuoteWizard() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [summaryData, setSummaryData] = useState<QuoteSummaryData | null>(
        null
    );

    const form = useForm<QuoteFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemType: "",
            pickupLocation: "",
            dropoffLocation: "",
            fullName: "",
            email: "",
            phone: "",
            userNotes: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await createQuoteAction({
                clientName: values.fullName,
                email: values.email,
                phone: values.phone,
                itemType: values.itemType,
                pickupLocation: values.pickupLocation,
                dropoffLocation: values.dropoffLocation,
                transportDate: values.transportDate.toISOString(),
                userNotes: values.userNotes,
                source: "form",
            });

            if (!result.success || !result.quote) {
                throw new Error(
                    result.error || "Erreur lors de la création du devis"
                );
            }

            setSummaryData({
                id: result.quote.id,
                itemType: values.itemType,
                pickupLocation: values.pickupLocation,
                dropoffLocation: values.dropoffLocation,
                transportDate: values.transportDate,
                fullName: values.fullName,
                email: values.email,
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(
                    "Quote submission error:",
                    error.message,
                    error.stack
                );
                toast.error(error.message);
            } else {
                console.error("Quote submission error:", error);
                toast.error(
                    "Une erreur est survenue lors de l&apos;envoi de la demande."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleCloseSummary = () => {
        setSummaryData(null);
        form.reset();
        setStep(1);
    };

    const nextStep = async () => {
        let fieldsToValidate: FieldPath<QuoteFormValues>[] = [];
        if (step === 1) fieldsToValidate = ["itemType"];
        if (step === 2) fieldsToValidate = ["pickupLocation"];
        if (step === 3) fieldsToValidate = ["dropoffLocation"];
        if (step === 4) fieldsToValidate = ["transportDate"];
        if (step === 5) fieldsToValidate = ["fullName", "email", "phone"];
        // Step 6 (notes) is optional, no validation needed

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    return (
        <Card className="border-muted/40 mx-auto w-full max-w-2xl overflow-hidden shadow-2xl">
            <WizardHeader step={step} totalSteps={TOTAL_STEPS} />

            <CardContent className="min-h-[300px] p-6 md:p-8">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {step === 1 && <StepItemType />}

                        {step === 2 && (
                            <StepLocation
                                name="pickupLocation"
                                label="Adresse complète de départ"
                                placeholder="Ex: 12 Rue de l'Industrie, 75000 Paris"
                                icon={
                                    <MapPin className="text-muted-foreground h-6 w-6" />
                                }
                            />
                        )}

                        {step === 3 && (
                            <StepLocation
                                name="dropoffLocation"
                                label="Adresse complète d'arrivée"
                                placeholder="Ex: Zone Industrielle Nord, 69000 Lyon"
                                icon={
                                    <Truck className="text-muted-foreground h-6 w-6" />
                                }
                            />
                        )}

                        {step === 4 && <StepDate />}

                        {step === 5 && <StepContact />}

                        {step === 6 && <StepNotes />}
                    </form>
                </Form>
            </CardContent>

            <WizardFooter
                step={step}
                totalSteps={TOTAL_STEPS}
                isSubmitting={isSubmitting}
                onNext={nextStep}
                onPrev={prevStep}
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.error("Form validation errors:", errors);
                    toast.error("Veuillez vérifier les informations saisies.");
                })}
            />

            <QuoteSummaryDialog
                isOpen={!!summaryData}
                onClose={handleCloseSummary}
                data={summaryData}
            />
        </Card>
    );
}
