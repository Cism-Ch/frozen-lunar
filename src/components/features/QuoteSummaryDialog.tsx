"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Calendar, Package, ArrowRight, Truck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface QuoteSummaryData {
    id?: string;
    itemType: string;
    pickupLocation: string;
    dropoffLocation: string;
    transportDate: Date;
    fullName: string;
    email: string;
}

interface QuoteSummaryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    data: QuoteSummaryData | null;
}

export function QuoteSummaryDialog({ isOpen, onClose, data }: QuoteSummaryDialogProps) {
    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="text-center">
                    <div className="mx-auto bg-green-100 p-3 rounded-full mb-4 w-fit">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <DialogTitle className="text-2xl text-center">Demande envoyée avec succès !</DialogTitle>
                    <DialogDescription className="text-center text-lg">
                        Merci {data.fullName}, nous avons bien reçu votre demande.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/30 p-6 rounded-lg space-y-6 my-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-4">
                        <span>Référence</span>
                        <span className="font-mono font-bold text-foreground">#{data.id || "N/A"}</span>
                    </div>

                    <div className="grid gap-6">
                        {/* Trajet */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" /> Détails du transport
                            </h4>
                            <div className="relative pl-6 space-y-6">
                                {/* Ligne verticale */}
                                <div className="absolute left-[3px] top-2 bottom-2 w-0.5 bg-border" />

                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-background" />
                                    <p className="text-sm font-medium text-muted-foreground">Départ</p>
                                    <p className="font-medium text-foreground">{data.pickupLocation}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 h-2 w-2 rounded-full bg-red-500 ring-4 ring-background" />
                                    <p className="text-sm font-medium text-muted-foreground">Arrivée</p>
                                    <p className="font-medium text-foreground">{data.dropoffLocation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Package className="h-3 w-3" /> Type
                                </span>
                                <span className="font-medium capitalize">{data.itemType}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-3 w-3" /> Date souhaitée
                                </span>
                                <span className="font-medium">
                                    {format(data.transportDate, "dd MMMM yyyy", { locale: fr })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button onClick={onClose} size="lg" className="w-full sm:w-auto">
                        Retour à l'accueil
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
