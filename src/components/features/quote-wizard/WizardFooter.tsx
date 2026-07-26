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
        <CardFooter className="bg-muted/10 flex justify-between border-t p-6">
            {step > 1 ? (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onPrev}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
            ) : (
                <div />
            )}

            {step < totalSteps ? (
                <Button
                    type="button"
                    onClick={onNext}
                    size="lg"
                    className="hover:shadow-primary/25 px-8 font-semibold shadow-lg transition-all"
                >
                    Continuer <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            ) : (
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    size="lg"
                    className="hover:shadow-primary/25 px-8 font-semibold shadow-lg transition-all"
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
