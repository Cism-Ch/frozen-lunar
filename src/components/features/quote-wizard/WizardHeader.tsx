"use client";

import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription } from "@/components/ui/card";
import {
    Package,
    MapPin,
    Truck,
    CalendarIcon,
    User,
    MessageSquare,
} from "lucide-react";

interface WizardHeaderProps {
    step: number;
    totalSteps: number;
}

export function WizardHeader({ step, totalSteps }: WizardHeaderProps) {
    return (
        <div className="bg-muted/30 border-b p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Badge variant="outline" className="bg-background mb-2">
                        Étape {step} sur {totalSteps}
                    </Badge>
                    <CardTitle className="text-2xl font-bold">
                        {step === 1 && "Que transportez-vous ?"}
                        {step === 2 && "Lieu de départ"}
                        {step === 3 && "Lieu d'arrivée"}
                        {step === 4 && "Date du transport"}
                        {step === 5 && "Vos coordonnées"}
                        {step === 6 && "Notes (optionnel)"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                        {step === 1 && "Sélectionnez le type de marchandise"}
                        {step === 2 &&
                            "Où devons-nous récupérer la marchandise ?"}
                        {step === 3 && "Où devons-nous livrer la marchandise ?"}
                        {step === 4 && "Quand souhaitez-vous être livré ?"}
                        {step === 5 &&
                            "Pour vous envoyer votre devis personnalisé"}
                        {step === 6 &&
                            "Ajoutez des informations complémentaires si besoin"}
                    </CardDescription>
                </div>
                <div className="hidden md:block">
                    <div className="bg-primary/10 rounded-full p-3">
                        {step === 1 && (
                            <Package className="text-primary h-8 w-8" />
                        )}
                        {step === 2 && (
                            <MapPin className="text-primary h-8 w-8" />
                        )}
                        {step === 3 && (
                            <Truck className="text-primary h-8 w-8" />
                        )}
                        {step === 4 && (
                            <CalendarIcon className="text-primary h-8 w-8" />
                        )}
                        {step === 5 && (
                            <User className="text-primary h-8 w-8" />
                        )}
                        {step === 6 && (
                            <MessageSquare className="text-primary h-8 w-8" />
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-muted relative h-2 overflow-hidden rounded-full">
                <div
                    className="bg-primary absolute top-0 left-0 h-full transition-all duration-500 ease-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>
        </div>
    );
}
