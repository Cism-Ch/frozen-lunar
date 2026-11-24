"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
import * as z from "zod";
import { MapPin, Sparkles, Truck } from "lucide-react";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
    QuoteSummaryDialog,
    type QuoteSummaryData,
} from "./QuoteSummaryDialog";
import { createQuoteAction } from "@/app/actions/quote-management";
import { getPublicFleetAction } from "@/app/actions/fleet-actions";
import { getClientDashboardAction } from "@/app/actions/client-space-actions";
import { authClient } from "@/lib/auth-client";
import type { FleetVehicleItem } from "@/lib/fleet-catalog";
import { logger } from "@/lib/logger";

// Sub-components
import { WizardHeader } from "./quote-wizard/WizardHeader";
import { WizardFooter } from "./quote-wizard/WizardFooter";
import { StepItemType } from "./quote-wizard/steps/StepItemType";
import { StepVehicle } from "./quote-wizard/steps/StepVehicle";
import { StepLocation } from "./quote-wizard/steps/StepLocation";
import { StepDate } from "./quote-wizard/steps/StepDate";
import { StepContact } from "./quote-wizard/steps/StepContact";
import { StepNotes } from "./quote-wizard/steps/StepNotes";

const formSchema = z.object({
    itemType: z.string().min(2, {
        message: "Veuillez sélectionner un type de transport.",
    }),
    vehicleId: z.string().optional(),
    vehicleQuantity: z.number().int().min(1).max(50).optional(),
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

const TOTAL_STEPS = 7;
type QuoteFormValues = z.infer<typeof formSchema>;

export function QuoteWizard() {
    const { data: session } = authClient.useSession();
    const hasPrefilledRef = useRef(false);
    const [prefilledNotice, setPrefilledNotice] = useState(false);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vehicles, setVehicles] = useState<FleetVehicleItem[]>([]);
    const [isLoadingFleet, setIsLoadingFleet] = useState(true);
    const [summaryData, setSummaryData] = useState<QuoteSummaryData | null>(
        null
    );

    const form = useForm<QuoteFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemType: "",
            vehicleId: "",
            vehicleQuantity: 1,
            pickupLocation: "",
            dropoffLocation: "",
            fullName: "",
            email: "",
            phone: "",
            userNotes: "",
        },
    });

    // Pré-remplissage automatique des coordonnées et adresses favorites si le client est connecté
    useEffect(() => {
        if (!session?.user || hasPrefilledRef.current) return;
        let active = true;
        async function prefillFromProfile() {
            try {
                const res = await getClientDashboardAction();
                if (!active || !res.data) return;
                hasPrefilledRef.current = true;

                const { user, profile } = res.data;
                const displayName = profile?.companyName || user.name || "";
                if (!form.getValues("fullName") && displayName) {
                    form.setValue("fullName", displayName);
                }
                if (!form.getValues("email") && user.email) {
                    form.setValue("email", user.email);
                }
                if (!form.getValues("phone") && profile?.phone) {
                    form.setValue("phone", profile.phone);
                }
                if (
                    !form.getValues("pickupLocation") &&
                    profile?.defaultPickup
                ) {
                    form.setValue("pickupLocation", profile.defaultPickup);
                }
                if (
                    !form.getValues("dropoffLocation") &&
                    profile?.defaultDropoff
                ) {
                    form.setValue("dropoffLocation", profile.defaultDropoff);
                }
                setPrefilledNotice(true);
            } catch {
                // Non bloquant
            }
        }
        void prefillFromProfile();
        return () => {
            active = false;
        };
    }, [session?.user, form]);

    // Charge la flotte active et pré-sélectionne un véhicule si `?vehicle=<slug>` est dans l'URL
    useEffect(() => {
        let active = true;
        async function loadFleet() {
            try {
                const res = await getPublicFleetAction();
                if (!active) return;
                const list = res.data || [];
                setVehicles(list);

                if (typeof window !== "undefined") {
                    const params = new URLSearchParams(window.location.search);
                    const preselectedSlug = params.get("vehicle");
                    if (preselectedSlug) {
                        const match = list.find(
                            (v) =>
                                v.slug === preselectedSlug &&
                                v.availableQuantity > 0
                        );
                        if (match) {
                            form.setValue("vehicleId", match.id);
                            form.setValue("vehicleQuantity", 1);
                        }
                    }
                }
            } catch (error: unknown) {
                logger.warn("Fleet load error in QuoteWizard", {
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            } finally {
                if (active) setIsLoadingFleet(false);
            }
        }
        void loadFleet();
        return () => {
            active = false;
        };
    }, [form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const selectedVehicle = vehicles.find(
                (v) => v.id === values.vehicleId
            );
            const hasDbVehicleId =
                selectedVehicle && !selectedVehicle.id.startsWith("catalog-");

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
                vehicleId: hasDbVehicleId ? selectedVehicle.id : undefined,
                vehicleQuantity: hasDbVehicleId
                    ? values.vehicleQuantity || 1
                    : 1,
            });

            if (!result.success || !result.quote) {
                throw new Error(
                    result.error || "Erreur lors de la création du devis"
                );
            }

            setSummaryData({
                id: result.quote.trackingCode || result.quote.id,
                dbId: result.quote.id,
                itemType: selectedVehicle
                    ? `${values.itemType} (${values.vehicleQuantity || 1}× ${selectedVehicle.name})`
                    : values.itemType,
                pickupLocation: values.pickupLocation,
                dropoffLocation: values.dropoffLocation,
                transportDate: values.transportDate,
                fullName: values.fullName,
                email: values.email,
            });
        } catch (error: unknown) {
            logger.error("Quote submission error", error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error(
                    "Une erreur est survenue lors de l'envoi de la demande."
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
        // Step 2 (vehicleId) is optional
        if (step === 3) fieldsToValidate = ["pickupLocation"];
        if (step === 4) fieldsToValidate = ["dropoffLocation"];
        if (step === 5) fieldsToValidate = ["transportDate"];
        if (step === 6) fieldsToValidate = ["fullName", "email", "phone"];

        const isValid =
            fieldsToValidate.length > 0
                ? await form.trigger(fieldsToValidate)
                : true;
        if (isValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    return (
        <Card className="border-muted/40 mx-auto w-full max-w-2xl overflow-hidden shadow-2xl">
            <WizardHeader step={step} totalSteps={TOTAL_STEPS} />

            <CardContent className="min-h-[300px] p-6 md:p-8">
                {prefilledNotice && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>
                            Vos coordonnées et adresses favorites ont été
                            pré-remplies automatiquement depuis votre Espace
                            Client.
                        </span>
                    </div>
                )}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {step === 1 && <StepItemType />}

                        {step === 2 && (
                            <StepVehicle
                                vehicles={vehicles}
                                isLoading={isLoadingFleet}
                            />
                        )}

                        {step === 3 && (
                            <StepLocation
                                name="pickupLocation"
                                label="Adresse complète de départ"
                                placeholder="Ex: Zone Industrielle Yopougon, Abidjan"
                                icon={
                                    <MapPin className="text-muted-foreground h-6 w-6" />
                                }
                            />
                        )}

                        {step === 4 && (
                            <StepLocation
                                name="dropoffLocation"
                                label="Adresse complète d'arrivée"
                                placeholder="Ex: Port de San-Pédro ou Zone Industrielle Yamoussoukro"
                                icon={
                                    <Truck className="text-muted-foreground h-6 w-6" />
                                }
                            />
                        )}

                        {step === 5 && <StepDate />}

                        {step === 6 && <StepContact />}

                        {step === 7 && <StepNotes />}
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
                    logger.error("Form validation errors", errors);
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
