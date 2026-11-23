"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, X, Loader2 } from "lucide-react";
import {
    compressFileForUpload,
    formatFileSize,
    MAX_SERVER_UPLOAD_BYTES,
} from "@/lib/file-compression";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface UploadedFile {
    fileName: string;
    publicUrl: string;
    key: string;
    fileSize: number;
}

interface FileUploadProps {
    onUploadSuccess?: (file: UploadedFile) => void;
    onRemoveFile?: () => void;
    folder?: string;
    label?: string;
    maxSizeMb?: number;
}

export function FileUpload({
    onUploadSuccess,
    onRemoveFile,
    folder = "attachments",
    label = "Glissez-déposez vos pièces jointes (plans, photos) ou cliquez pour parcourir",
    maxSizeMb = 10,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (rawFile: File) => {
        if (!rawFile) return;

        setIsUploading(true);
        setProgress(15);

        try {
            // 1. Compression automatique côté client pour les images (allège sous 4 Mo)
            const { file, wasCompressed, originalSize, finalSize } =
                await compressFileForUpload(rawFile);

            const effectiveMaxBytes = Math.min(
                maxSizeMb * 1024 * 1024,
                MAX_SERVER_UPLOAD_BYTES
            );

            if (file.size > effectiveMaxBytes) {
                toast.error(
                    `Le fichier dépasse la limite autorisée de ${formatFileSize(effectiveMaxBytes)} (${formatFileSize(file.size)}).`
                );
                return;
            }

            setProgress(45);

            // 2. Téléversement serveur sécurisé via POST /api/upload (zéro erreur CORS)
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", folder);

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const json = (await uploadResponse.json()) as {
                success?: boolean;
                key?: string;
                publicUrl?: string | null;
                fileName?: string;
                fileSize?: number;
                error?: string;
            };

            if (!uploadResponse.ok || !json.success || !json.key) {
                throw new Error(
                    json.error ||
                        "Échec du téléversement du fichier sur le serveur."
                );
            }

            setProgress(100);

            const fileData: UploadedFile = {
                fileName: json.fileName || file.name,
                publicUrl: json.publicUrl || "",
                key: json.key,
                fileSize: json.fileSize || file.size,
            };

            setUploadedFile(fileData);
            toast.success(
                wasCompressed
                    ? `Fichier optimisé (${formatFileSize(originalSize)} → ${formatFileSize(finalSize)}) et téléversé`
                    : `Fichier ${file.name} téléversé avec succès`
            );
            onUploadSuccess?.(fileData);
        } catch (error: unknown) {
            logger.error("Upload Error", error);
            const msg =
                error instanceof Error
                    ? error.message
                    : "Erreur lors du téléversement";
            toast.error(msg);
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleRemove = () => {
        setUploadedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onRemoveFile?.();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                    }
                }}
            />

            {!uploadedFile ? (
                <div
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() =>
                        !isUploading && fileInputRef.current?.click()
                    }
                    onKeyDown={(e) => {
                        if (
                            !isUploading &&
                            (e.key === "Enter" || e.key === " ")
                        ) {
                            e.preventDefault();
                            fileInputRef.current?.click();
                        }
                    }}
                    className={`focus-visible:ring-primary relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 outline-none focus-visible:ring-2 ${
                        isUploading
                            ? "border-muted bg-muted/20 cursor-not-allowed opacity-70"
                            : isDragging
                              ? "border-primary bg-primary/10 scale-[1.01]"
                              : "border-border hover:border-primary/50 hover:bg-accent/40 bg-card cursor-pointer"
                    }`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-3 py-2 text-center">
                            <Loader2 className="text-primary h-8 w-8 animate-spin" />
                            <div className="space-y-1">
                                <p className="text-foreground text-sm font-medium">
                                    Téléversement en cours ({progress}%)...
                                </p>
                                <div className="bg-muted h-1.5 w-48 overflow-hidden rounded-full">
                                    <div
                                        className="bg-primary h-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="bg-primary/10 text-primary rounded-full p-3">
                                <Upload className="h-6 w-6" />
                            </div>
                            <p className="text-foreground text-sm font-medium">
                                {label}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Formats acceptés : PDF, PNG, JPG, WEBP (Max{" "}
                                {maxSizeMb} Mo)
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="border-border bg-card flex items-center justify-between rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary rounded-lg p-2.5">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="text-foreground max-w-[220px] truncate text-sm font-medium sm:max-w-xs">
                                    {uploadedFile.fileName}
                                </span>
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            </div>
                            <span className="text-muted-foreground text-xs">
                                {formatFileSize(uploadedFile.fileSize)}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg p-2 transition-colors"
                        title="Supprimer le fichier"
                        aria-label="Supprimer le fichier"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
