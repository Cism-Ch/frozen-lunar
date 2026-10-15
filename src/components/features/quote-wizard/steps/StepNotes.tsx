"use client";

import { useState } from "react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { MessageSquare, Paperclip } from "lucide-react";
import {
    FileUpload,
    type UploadedFile,
} from "@/components/features/FileUpload";

export function StepNotes() {
    const { control, getValues, setValue } = useFormContext();
    const [attachedFile, setAttachedFile] = useState<UploadedFile | null>(null);

    const handleUploadSuccess = (file: UploadedFile) => {
        setAttachedFile(file);
        const currentNotes = (getValues("userNotes") as string) || "";
        const attachmentTag = `\n\n[Pièce jointe : ${file.fileName} (${file.publicUrl})]`;
        if (!currentNotes.includes(file.publicUrl)) {
            setValue(
                "userNotes",
                (currentNotes.trim() + attachmentTag).trim(),
                {
                    shouldDirty: true,
                }
            );
        }
    };

    const handleRemoveFile = () => {
        if (attachedFile) {
            const currentNotes = (getValues("userNotes") as string) || "";
            const cleanedNotes = currentNotes
                .replace(
                    new RegExp(
                        `\n*\\[Pièce jointe : ${attachedFile.fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\(${attachedFile.publicUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)\\]`,
                        "g"
                    ),
                    ""
                )
                .trim();
            setValue("userNotes", cleanedNotes, { shouldDirty: true });
            setAttachedFile(null);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-8 space-y-6 duration-500">
            <div className="flex items-center gap-3">
                <div className="bg-muted rounded-lg p-2">
                    <MessageSquare className="text-muted-foreground h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-medium">Notes & Pièces jointes</h3>
                    <p className="text-muted-foreground text-sm">
                        Facultatif - précisions utiles pour affiner
                        l&apos;estimation
                    </p>
                </div>
            </div>

            <FormField
                control={control}
                name="userNotes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-medium">
                            Informations complémentaires
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Ex: Accès difficile pour semi-remorque, besoin d'une grue auxiliaire, créneaux stricts, marchandise fragile..."
                                className="bg-muted/20 min-h-[110px] resize-none"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Décrivez toute contrainte d&apos;accès ou
                            spécificité technique utile.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* File Upload for plans, schemas, or cargo photos */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Paperclip className="text-primary h-4 w-4" />
                    <span className="text-sm font-medium">
                        Ajouter un document (plan de chargement, fiche
                        technique, photo)
                    </span>
                </div>
                <FileUpload
                    folder="quotes"
                    label="Déposer un document (PDF, PNG, JPG, WEBP) ou cliquer pour parcourir"
                    maxSizeMb={10}
                    onUploadSuccess={handleUploadSuccess}
                    onRemoveFile={handleRemoveFile}
                />
            </div>

            <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                    💡 <strong>Conseil :</strong> Plus vous fournissez de
                    détails (plans de masse, photos d&apos;accès, dimensions
                    exactes), plus notre cotation sera précise et rapide.
                </p>
            </div>
        </div>
    );
}
