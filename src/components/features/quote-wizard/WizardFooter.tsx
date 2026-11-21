"use client";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, Loader2, Check } from "lucide-react";

interface WizardFooterProps {
    step: number;
    totalSteps: number;
    isSubmitting: boolean;
    onNext: () => void;
    onPrev: () => void;
    onSubmit: () => void; // Usually passed as form.handleSubmit(onSubmit) result, but here we trigger the button
}

export function WizardFooter({
    step,
    totalSteps,
    isSubmitting,
    onNext,
    onPrev,
    onSubmit,
}: WizardFooterProps) {
    return (
        <CardFooter className="bg-muted/10 flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            {step > 1 ? (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onPrev}
                    className="text-muted-foreground hover:text-foreground min-h-[44px] w-full sm:w-auto"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
            ) : (
                <div className="hidden sm:block" />
            )}

            {step < totalSteps ? (
                <Button
                    type="button"
                    onClick={onNext}
                    size="lg"
                    className="hover:shadow-primary/25 h-12 w-full px-8 text-base font-semibold shadow-lg transition-all sm:h-11 sm:w-auto sm:text-sm"
                >
                    Continuer <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            ) : (
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    size="lg"
                    className="hover:shadow-primary/25 h-12 w-full px-8 text-base font-semibold shadow-lg transition-all sm:h-11 sm:w-auto sm:text-sm"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                            Envoi...
                        </>
                    ) : (
                        <>
                            Demander mon devis{" "}
                            <Check className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            )}
        </CardFooter>
    );
}
