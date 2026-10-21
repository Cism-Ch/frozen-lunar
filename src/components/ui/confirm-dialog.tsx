"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive";
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
}

/**
 * Composant de confirmation accessible conforme aux normes UI/UX 2026.
 * Remplace avantageusement les boîtes window.confirm() natives.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    variant = "destructive",
    isLoading = false,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[440px]"
                showCloseButton={!isLoading}
            >
                <DialogHeader className="gap-2">
                    <div className="flex items-center gap-3">
                        {variant === "destructive" && (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        )}
                        <DialogTitle className="text-base leading-6 font-semibold">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => onOpenChange(false)}
                        className="h-10 min-w-[80px]"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        size="sm"
                        disabled={isLoading}
                        onClick={onConfirm}
                        className="h-10 min-w-[100px]"
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
