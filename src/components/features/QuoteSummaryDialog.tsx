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
import {
    CheckCircle,
    Calendar,
    Package,
    Truck,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface QuoteSummaryData {
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

export function QuoteSummaryDialog({
    isOpen,
    onClose,
    data,
}: QuoteSummaryDialogProps) {
    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 w-fit rounded-full bg-green-100 p-3">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <DialogTitle className="text-center text-2xl">
                        Demande envoyée avec succès !
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg">
                        Merci {data.fullName}, nous avons bien reçu votre
                        demande.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/30 my-2 space-y-6 rounded-lg p-6">
                    <div className="text-muted-foreground flex items-center justify-between border-b pb-4 text-sm">
                        <span>Référence</span>
                        <span className="text-foreground font-mono font-bold">
                            #{data.id || "N/A"}
                        </span>
                    </div>

                    <div className="grid gap-6">
                        {/* Trajet */}
                        <div className="flex flex-col gap-4">
                            <h4 className="flex items-center gap-2 font-semibold">
                                <Truck className="text-primary h-4 w-4" />{" "}
                                Détails du transport
                            </h4>
                            <div className="relative space-y-6 pl-6">
                                {/* Ligne verticale */}
                                <div className="bg-border absolute top-2 bottom-2 left-[3px] w-0.5" />

                                <div className="relative">
                                    <div className="ring-background absolute top-1 -left-[27px] h-2 w-2 rounded-full bg-blue-500 ring-4" />
                                    <p className="text-muted-foreground text-sm font-medium">
                                        Départ
                                    </p>
                                    <p className="text-foreground font-medium">
                                        {data.pickupLocation}
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="ring-background absolute top-1 -left-[27px] h-2 w-2 rounded-full bg-red-500 ring-4" />
                                    <p className="text-muted-foreground text-sm font-medium">
                                        Arrivée
                                    </p>
                                    <p className="text-foreground font-medium">
                                        {data.dropoffLocation}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <Package className="h-3 w-3" /> Type
                                </span>
                                <span className="font-medium capitalize">
                                    {data.itemType}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <Calendar className="h-3 w-3" /> Date
                                    souhaitée
                                </span>
                                <span className="font-medium">
                                    {format(
                                        data.transportDate,
                                        "dd MMMM yyyy",
                                        { locale: fr }
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={onClose}
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Retour à l&apos;accueil
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
