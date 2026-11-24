"use client";

import { useRouter } from "next/navigation";
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
    ArrowRight,
    Calendar,
    CheckCircle,
    FileText,
    Package,
    PlusCircle,
    Truck,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface QuoteSummaryData {
    id?: string;
    dbId?: string;
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
    const router = useRouter();

    if (!data) return null;

    const handleViewQuotes = () => {
        onClose();
        router.push("/espace-client");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] overflow-y-auto p-4 sm:max-w-[600px] sm:p-6">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-3 w-fit rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold sm:text-2xl">
                        Devis validé et envoyé !
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm sm:text-base">
                        Merci {data.fullName}, votre demande est bien enregistrée.
                        Souhaitez-vous rester sur cette page ou afficher vos devis ?
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/30 border-border/50 my-2 space-y-5 rounded-xl border p-4 sm:p-5">
                    <div className="text-muted-foreground flex items-center justify-between border-b pb-3 text-sm">
                        <span>Référence de suivi</span>
                        <span className="text-foreground font-mono font-bold">
                            {data.id || "N/A"}
                        </span>
                    </div>

                    <div className="grid gap-5">
                        {/* Trajet */}
                        <div className="flex flex-col gap-3">
                            <h4 className="flex items-center gap-2 text-sm font-semibold sm:text-base">
                                <Truck className="text-primary h-4 w-4" />{" "}
                                Détails du transport
                            </h4>
                            <div className="border-border/80 relative ml-2 space-y-4 border-l-2 pl-4">
                                <div className="relative">
                                    <div className="ring-background absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full bg-blue-500 ring-4" />
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                        Départ
                                    </p>
                                    <p className="text-foreground text-sm font-medium sm:text-base">
                                        {data.pickupLocation}
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="ring-background absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4" />
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                        Arrivée
                                    </p>
                                    <p className="text-foreground text-sm font-medium sm:text-base">
                                        {data.dropoffLocation}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium uppercase">
                                    <Package className="h-3.5 w-3.5" /> Type
                                </span>
                                <span className="text-sm font-medium capitalize sm:text-base">
                                    {data.itemType}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium uppercase">
                                    <Calendar className="h-3.5 w-3.5" /> Date
                                    souhaitée
                                </span>
                                <span className="text-sm font-medium sm:text-base">
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

                <DialogFooter className="flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        size="lg"
                        className="min-h-[44px] w-full gap-2 sm:w-auto"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Rester ici (nouveau devis)
                    </Button>
                    <Button
                        type="button"
                        onClick={handleViewQuotes}
                        size="lg"
                        className="min-h-[44px] w-full gap-2 sm:w-auto"
                    >
                        <FileText className="h-4 w-4" />
                        Afficher mes devis
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
