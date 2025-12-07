"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Truck } from "lucide-react";
import { toast } from "sonner";

import { quoteStorage } from "@/lib/quote-storage";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteSummaryDialog } from "./QuoteSummaryDialog";

// Sub-components
import { WizardHeader } from "./quote-wizard/WizardHeader";
import { WizardFooter } from "./quote-wizard/WizardFooter";
import { StepItemType } from "./quote-wizard/steps/StepItemType";
import { StepLocation } from "./quote-wizard/steps/StepLocation";
import { StepDate } from "./quote-wizard/steps/StepDate";
import { StepContact } from "./quote-wizard/steps/StepContact";

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
});

export function QuoteWizard() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemType: "",
            pickupLocation: "",
            dropoffLocation: "",
            fullName: "",
            email: "",
            phone: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newQuote = quoteStorage.add({
                client: values.fullName,
                email: values.email,
                phone: values.phone,
                type: values.itemType,
                pickup: values.pickupLocation,
                dropoff: values.dropoffLocation,
                transportDate: values.transportDate.toISOString(),
            });

            // Store data for summary and open modal
            setSummaryData({ ...values, id: newQuote.id });
        } catch (error) {
            toast.error("Une erreur est survenue lors de l'envoi de la demande.");
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
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ["itemType"];
        if (step === 2) fieldsToValidate = ["pickupLocation"];
        if (step === 3) fieldsToValidate = ["dropoffLocation"];
        if (step === 4) fieldsToValidate = ["transportDate"];
        if (step === 5) fieldsToValidate = ["fullName", "email", "phone"];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl border-muted/40 overflow-hidden">
            <WizardHeader step={step} totalSteps={5} />

            <CardContent className="p-6 md:p-8 min-h-[300px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {step === 1 && <StepItemType />}

                        {step === 2 && (
                            <StepLocation
                                name="pickupLocation"
                                label="Adresse complète de départ"
                                placeholder="Ex: 12 Rue de l'Industrie, 75000 Paris"
                                icon={<MapPin className="h-6 w-6 text-muted-foreground" />}
                            />
                        )}

                        {step === 3 && (
                            <StepLocation
                                name="dropoffLocation"
                                label="Adresse complète d'arrivée"
                                placeholder="Ex: Zone Industrielle Nord, 69000 Lyon"
                                icon={<Truck className="h-6 w-6 text-muted-foreground" />}
                            />
                        )}

                        {step === 4 && <StepDate />}

                        {step === 5 && <StepContact />}
                    </form>
                </Form>
            </CardContent>

            <WizardFooter
                step={step}
                totalSteps={5}
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
