"use client";

import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Package, MapPin, Truck, CalendarIcon, User, MessageSquare } from "lucide-react";

interface WizardHeaderProps {
    step: number;
    totalSteps: number;
}

export function WizardHeader({ step, totalSteps }: WizardHeaderProps) {
    return (
        <div className="bg-muted/30 p-6 border-b">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Badge variant="outline" className="mb-2 bg-background">Étape {step} sur {totalSteps}</Badge>
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
                        {step === 2 && "Où devons-nous récupérer la marchandise ?"}
                        {step === 3 && "Où devons-nous livrer la marchandise ?"}
                        {step === 4 && "Quand souhaitez-vous être livré ?"}
                        {step === 5 && "Pour vous envoyer votre devis personnalisé"}
                        {step === 6 && "Ajoutez des informations complémentaires si besoin"}
                    </CardDescription>
                </div>
                <div className="hidden md:block">
                    <div className="p-3 bg-primary/10 rounded-full">
                        {step === 1 && <Package className="h-8 w-8 text-primary" />}
                        {step === 2 && <MapPin className="h-8 w-8 text-primary" />}
                        {step === 3 && <Truck className="h-8 w-8 text-primary" />}
                        {step === 4 && <CalendarIcon className="h-8 w-8 text-primary" />}
                        {step === 5 && <User className="h-8 w-8 text-primary" />}
                        {step === 6 && <MessageSquare className="h-8 w-8 text-primary" />}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>
        </div>
    );
}
