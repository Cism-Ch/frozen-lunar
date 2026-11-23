"use client";

import { useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    Building2,
    CheckCircle2,
    ExternalLink,
    FileCheck,
    FileUp,
    Handshake,
    Loader2,
    MapPin,
    ShieldCheck,
    Trash2,
    Truck,
    User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    CI_ROAD_SAFETY_CHARTER_ARTICLES,
    CI_ROAD_SAFETY_CHARTER_INTRO,
    CI_ROAD_SAFETY_CHARTER_TITLE,
} from "@/lib/ci-road-charter";
import { submitPartnerApplicationAction } from "@/app/actions/partner-actions";
import {
    compressFileForUpload,
    formatFileSize,
    MAX_SERVER_UPLOAD_BYTES,
} from "@/lib/file-compression";
import {
    PARTNER_OPERATING_ZONES,
    VEHICLE_CATEGORY_META,
    type FleetVehicleCategory,
} from "@/lib/fleet-catalog";

interface UploadedKycDoc {
    key: string;
    name: string;
}

export function PartnerApplicationWizard() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [submittedResult, setSubmittedResult] = useState<{
        id: string;
        companyName: string;
    } | null>(null);

    // Champs Étape 1 : Type (Particulier vs Entreprise) & Identité
    const [partnerType, setPartnerType] = useState<"INDIVIDUAL" | "COMPANY">(
        "INDIVIDUAL"
    );
    const [companyName, setCompanyName] = useState("");
    const [city, setCity] = useState("");
    const [rccmNumber, setRccmNumber] = useState("");
    const [nccNumber, setNccNumber] = useState("");
    const [idDocumentNumber, setIdDocumentNumber] = useState("");
    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [whatsapp, setWhatsapp] = useState("");

    // Modales Charte & Confirmation soumission
    const [charterOpen, setCharterOpen] = useState(false);
    const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

    // Champs Étape 2 : Flotte & Corridors
    const [totalVehicles, setTotalVehicles] = useState("2");
    const [fleetCategories, setFleetCategories] = useState<string[]>([]);
    const [operatingZones, setOperatingZones] = useState<string[]>([]);
    const [fleetSummary, setFleetSummary] = useState("");

    // Champs Étape 3 : KYC privé & Charte
    const [kycDocs, setKycDocs] = useState<UploadedKycDoc[]>([]);
    const [acceptOhadaCharter, setAcceptOhadaCharter] = useState(false);

    const toggleArrayItem = (
        list: string[],
        setList: (next: string[]) => void,
        value: string
    ) => {
        if (list.includes(value)) {
            setList(list.filter((item) => item !== value));
        } else {
            setList([...list, value]);
        }
    };

    const handleKycFileSelect = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const rawFile = e.target.files?.[0];
        e.target.value = "";
        if (!rawFile) return;

        if (kycDocs.length >= 5) {
            toast.error("Maximum 5 documents par dossier.");
            return;
        }

        setIsUploading(true);
        try {
            const { file, wasCompressed, originalSize, finalSize } =
                await compressFileForUpload(rawFile);

            if (file.size > MAX_SERVER_UPLOAD_BYTES) {
                toast.error(
                    `Fichier trop volumineux (${formatFileSize(file.size)}). Maximum 4 Mo.`
                );
                return;
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "partners-kyc");

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const json = (await uploadRes.json()) as {
                success?: boolean;
                key?: string;
                error?: string;
            };

            if (!uploadRes.ok || !json.success || !json.key) {
                toast.error(
                    json.error ||
                        "Impossible de téléverser la pièce justificative."
                );
                return;
            }

            setKycDocs((prev) => [
                ...prev,
                { key: json.key!, name: file.name },
            ]);
            toast.success(
                wasCompressed
                    ? `Document optimisé (${formatFileSize(originalSize)} → ${formatFileSize(finalSize)}) et ajouté`
                    : `Document ajouté (${file.name})`
            );
        } catch {
            toast.error("Erreur lors du téléversement du document.");
        } finally {
            setIsUploading(false);
        }
    };

    const validateStep1 = (): boolean => {
        if (partnerType === "COMPANY") {
            if (companyName.trim().length < 2) {
                toast.error("Veuillez renseigner la raison sociale.");
                return false;
            }
            if (rccmNumber.trim().length < 4) {
                toast.error("Veuillez renseigner votre numéro RCCM.");
                return false;
            }
            if (contactName.trim().length < 2) {
                toast.error("Veuillez indiquer le nom du responsable.");
                return false;
            }
        } else {
            if (contactName.trim().length < 2) {
                toast.error("Veuillez renseigner votre nom et prénoms.");
                return false;
            }
            if (idDocumentNumber.trim().length < 4) {
                toast.error(
                    "Veuillez renseigner votre numéro de CNI ou de permis de conduire."
                );
                return false;
            }
        }
        if (city.trim().length < 2) {
            toast.error("Veuillez indiquer votre ville en Côte d'Ivoire.");
            return false;
        }
        if (!email.includes("@")) {
            toast.error("Veuillez saisir une adresse email valide.");
            return false;
        }
        if (phone.trim().length < 8) {
            toast.error("Veuillez saisir un numéro de téléphone valide.");
            return false;
        }
        return true;
    };

    const validateStep2 = (): boolean => {
        if (fleetCategories.length === 0) {
            toast.error("Sélectionnez au moins une catégorie de véhicules.");
            return false;
        }
        if (operatingZones.length === 0) {
            toast.error("Sélectionnez au moins une zone ou un corridor.");
            return false;
        }
        if (fleetSummary.trim().length < 10) {
            toast.error(
                "Décrivez brièvement votre parc (modèles, tonnages, états)."
            );
            return false;
        }
        return true;
    };

    const executeSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await submitPartnerApplicationAction({
                partnerType,
                companyName:
                    partnerType === "COMPANY"
                        ? companyName.trim()
                        : contactName.trim(),
                rccmNumber: partnerType === "COMPANY" ? rccmNumber.trim() : "",
                nccNumber: partnerType === "COMPANY" ? nccNumber.trim() : "",
                idDocumentNumber:
                    partnerType === "INDIVIDUAL"
                        ? idDocumentNumber.trim()
                        : "",
                country: "Côte d'Ivoire",
                city,
                contactName,
                email,
                phone,
                whatsapp,
                fleetCategories,
                fleetSummary,
                totalVehicles: Number(totalVehicles) || 1,
                operatingZones,
                kycDocumentKeys: kycDocs.map((d) => d.key),
                acceptOhadaCharter: true,
            });

            if (res.error || !res.data) {
                toast.error(
                    res.error || "Impossible d'envoyer la candidature."
                );
                return;
            }

            setSubmittedResult(res.data);
            toast.success("Candidature partenaire envoyée avec succès !");
        } finally {
            setIsSubmitting(false);
            setConfirmSubmitOpen(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptOhadaCharter) {
            toast.error(
                "Veuillez accepter la Charte de Qualité et de Sécurité Routière de Côte d'Ivoire."
            );
            return;
        }
        setConfirmSubmitOpen(true);
    };

    if (submittedResult) {
        return (
            <Card className="border-emerald-500/30 bg-emerald-500/5 mx-auto max-w-2xl">
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="rounded-full bg-emerald-500/15 p-4 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold">
                        Dossier Partenaire Enregistré
                    </h2>
                    <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                        Merci ! Le dossier de{" "}
                        <strong>{submittedResult.companyName}</strong> (Réf.{" "}
                        <code className="bg-muted rounded px-1.5 py-0.5 font-mono">
                            {submittedResult.id}
                        </code>
                        ) a été transmis à notre cellule Conformité &amp;
                        Exploitation à Abidjan. Vous recevrez une réponse sous
                        48h ouvrées.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSubmittedResult(null);
                            setStep(1);
                        }}
                        className="mt-2 min-h-[44px]"
                    >
                        Soumettre un autre dossier
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-10">
            {/* Hero Partenaires */}
            <section className="from-primary/10 via-background to-muted/40 rounded-3xl border bg-gradient-to-br p-6 sm:p-10">
                <div className="max-w-3xl space-y-4">
                    <Badge
                        variant="outline"
                        className="bg-background/80 gap-1.5 px-3 py-1 text-xs"
                    >
                        <Handshake className="text-primary h-3.5 w-3.5" />
                        Réseau Transporteurs &amp; Loueurs Agréés • Côte
                        d&apos;Ivoire
                    </Badge>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Devenez Partenaire Transporteur HBC Logistique
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        Rentabilisez vos camions, bennes, porte-chars, bus et
                        utilitaires en rejoignant notre réseau d&apos;affrètement
                        à Abidjan, San-Pédro, Yamoussoukro, Bouaké et partout en
                        Côte d&apos;Ivoire.
                    </p>
                </div>
            </section>

            {/* Formulaire 3 étapes */}
            <Card className="mx-auto max-w-3xl shadow-xl">
                <CardHeader className="bg-muted/30 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="outline" className="bg-background">
                            Étape {step} sur 3
                        </Badge>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span
                                className={
                                    step >= 1
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }
                            >
                                1. Entreprise
                            </span>
                            <span>→</span>
                            <span
                                className={
                                    step >= 2
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }
                            >
                                2. Parc &amp; Zones CI
                            </span>
                            <span>→</span>
                            <span
                                className={
                                    step >= 3
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }
                            >
                                3. Pièces &amp; Charte
                            </span>
                        </div>
                    </div>
                    <CardTitle className="mt-2 text-xl">
                        {step === 1 &&
                            "Identification de l'entreprise & Contact"}
                        {step === 2 &&
                            "Capacités matérielles & Zones en Côte d'Ivoire"}
                        {step === 3 &&
                            "Pièces justificatives & Engagement Qualité"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 &&
                            "Informations légales RCCM/NCC et coordonnées de votre responsable d'exploitation."}
                        {step === 2 &&
                            "Précisez la composition de votre flotte et les axes routiers couverts."}
                        {step === 3 &&
                            "Vos documents KYC sont chiffrés et stockés dans un compartiment privé inaccessible au public."}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 p-6">
                        {step === 1 && (
                            <div className="space-y-5">
                                {/* Sélecteur Particulier vs Entreprise */}
                                <div className="space-y-2">
                                    <Label>Vous êtes : *</Label>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPartnerType("INDIVIDUAL")
                                            }
                                            className={`flex min-h-[56px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                                                partnerType === "INDIVIDUAL"
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border hover:border-primary/40"
                                            }`}
                                        >
                                            <User className="h-5 w-5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Particulier
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    Propriétaire de véhicule /
                                                    Chauffeur indépendant
                                                </p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPartnerType("COMPANY")
                                            }
                                            className={`flex min-h-[56px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                                                partnerType === "COMPANY"
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border hover:border-primary/40"
                                            }`}
                                        >
                                            <Building2 className="h-5 w-5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Entreprise
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    Société de transport /
                                                    Loueur d&apos;engins
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {partnerType === "COMPANY" ? (
                                    <>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="p-company">
                                                    Raison sociale *
                                                </Label>
                                                <Input
                                                    id="p-company"
                                                    value={companyName}
                                                    onChange={(e) =>
                                                        setCompanyName(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Ex: Ivoire Trans-BTP SARL"
                                                    className="min-h-[44px]"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="p-city">
                                                    Ville en Côte d&apos;Ivoire
                                                    *
                                                </Label>
                                                <Input
                                                    id="p-city"
                                                    value={city}
                                                    onChange={(e) =>
                                                        setCity(e.target.value)
                                                    }
                                                    placeholder="Ex: Abidjan - Yopougon"
                                                    className="min-h-[44px]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="p-rccm">
                                                    Numéro RCCM *
                                                </Label>
                                                <Input
                                                    id="p-rccm"
                                                    value={rccmNumber}
                                                    onChange={(e) =>
                                                        setRccmNumber(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="CI-ABJ-03-2024-B12-..."
                                                    className="min-h-[44px]"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="p-ncc">
                                                    N° NCC (optionnel)
                                                </Label>
                                                <Input
                                                    id="p-ncc"
                                                    value={nccNumber}
                                                    onChange={(e) =>
                                                        setNccNumber(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Ex: 2401589-K"
                                                    className="min-h-[44px]"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="p-id-doc">
                                                N° CNI ou Permis de conduire *
                                            </Label>
                                            <Input
                                                id="p-id-doc"
                                                value={idDocumentNumber}
                                                onChange={(e) =>
                                                    setIdDocumentNumber(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Ex: CI001234567 ou Permis C/D/E"
                                                className="min-h-[44px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="p-city">
                                                Ville en Côte d&apos;Ivoire *
                                            </Label>
                                            <Input
                                                id="p-city"
                                                value={city}
                                                onChange={(e) =>
                                                    setCity(e.target.value)
                                                }
                                                placeholder="Ex: Abidjan - Cocody / Bouaké"
                                                className="min-h-[44px]"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-contact">
                                            {partnerType === "COMPANY"
                                                ? "Responsable d'exploitation *"
                                                : "Nom et Prénoms *"}
                                        </Label>
                                        <Input
                                            id="p-contact"
                                            value={contactName}
                                            onChange={(e) =>
                                                setContactName(e.target.value)
                                            }
                                            placeholder="Ex: Kouassi Yao"
                                            className="min-h-[44px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-email">
                                            Adresse email *
                                        </Label>
                                        <Input
                                            id="p-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="contact@exemple.ci"
                                            className="min-h-[44px]"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-phone">
                                            Téléphone direct *
                                        </Label>
                                        <Input
                                            id="p-phone"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            placeholder="+225 07 00 00 00 00"
                                            className="min-h-[44px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="p-wa">
                                            Numéro WhatsApp (optionnel)
                                        </Label>
                                        <Input
                                            id="p-wa"
                                            value={whatsapp}
                                            onChange={(e) =>
                                                setWhatsapp(e.target.value)
                                            }
                                            placeholder="+225 07 00 00 00 00"
                                            className="min-h-[44px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="p-total">
                                        Nombre total de véhicules mobilisables *
                                    </Label>
                                    <Input
                                        id="p-total"
                                        type="number"
                                        min={1}
                                        max={500}
                                        value={totalVehicles}
                                        onChange={(e) =>
                                            setTotalVehicles(e.target.value)
                                        }
                                        className="min-h-[44px] max-w-xs"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Catégories de véhicules opérées *
                                    </Label>
                                    <div className="grid gap-2.5 sm:grid-cols-2">
                                        {(
                                            Object.keys(
                                                VEHICLE_CATEGORY_META
                                            ) as FleetVehicleCategory[]
                                        ).map((cat) => {
                                            const label =
                                                VEHICLE_CATEGORY_META[cat]
                                                    .label;
                                            const checked =
                                                fleetCategories.includes(label);
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleArrayItem(
                                                            fleetCategories,
                                                            setFleetCategories,
                                                            label
                                                        )
                                                    }
                                                    className={`flex min-h-[44px] items-center gap-2.5 rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                                                        checked
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "hover:border-primary/40"
                                                    }`}
                                                >
                                                    <Truck className="h-4 w-4 shrink-0" />
                                                    <span>{label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Zones &amp; Corridors couverts *
                                    </Label>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {PARTNER_OPERATING_ZONES.map((zone) => {
                                            const checked =
                                                operatingZones.includes(zone);
                                            return (
                                                <button
                                                    key={zone}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleArrayItem(
                                                            operatingZones,
                                                            setOperatingZones,
                                                            zone
                                                        )
                                                    }
                                                    className={`flex min-h-[44px] items-center gap-2 rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                                                        checked
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "hover:border-primary/40"
                                                    }`}
                                                >
                                                    <MapPin className="h-4 w-4 shrink-0" />
                                                    <span>{zone}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="p-summary">
                                        Détail de votre parc (modèles, tonnages,
                                        état, GPS) *
                                    </Label>
                                    <Textarea
                                        id="p-summary"
                                        rows={4}
                                        value={fleetSummary}
                                        onChange={(e) =>
                                            setFleetSummary(e.target.value)
                                        }
                                        placeholder="Ex: 2 Bus Yutong 64 places (2023), 3 Tracteurs Sinotruk + plateaux 12m, 1 Porte-char 60T..."
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5">
                                <div className="bg-muted/30 space-y-3 rounded-xl border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="flex items-center gap-2 text-sm font-semibold">
                                                <ShieldCheck className="text-primary h-4 w-4" />
                                                Coffre-fort KYC Privé (RCCM,
                                                Assurance, Visite SICTA)
                                            </p>
                                            <p className="text-muted-foreground mt-0.5 text-xs">
                                                Formats acceptés : PDF, JPG, PNG
                                                (max 10 Mo). Stockage privé S3{" "}
                                                <code className="bg-muted rounded px-1">
                                                    partners-kyc
                                                </code>{" "}
                                                consultable uniquement par
                                                l&apos;administration via URL
                                                signée 5 min.
                                            </p>
                                        </div>
                                        <Label
                                            htmlFor="kyc-upload"
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-[40px] shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <FileUp className="h-4 w-4" />
                                            )}
                                            Ajouter une pièce
                                        </Label>
                                        <input
                                            id="kyc-upload"
                                            type="file"
                                            accept=".pdf,image/jpeg,image/png,image/webp"
                                            onChange={handleKycFileSelect}
                                            disabled={isUploading}
                                            className="hidden"
                                        />
                                    </div>

                                    {kycDocs.length > 0 && (
                                        <ul className="space-y-2 pt-2">
                                            {kycDocs.map((doc) => (
                                                <li
                                                    key={doc.key}
                                                    className="bg-background flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                                                >
                                                    <span className="flex items-center gap-2 truncate font-medium">
                                                        <FileCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                                                        {doc.name}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setKycDocs((prev) =>
                                                                prev.filter(
                                                                    (d) =>
                                                                        d.key !==
                                                                        doc.key
                                                                )
                                                            )
                                                        }
                                                        aria-label={`Retirer ${doc.name}`}
                                                        className="text-destructive h-7 w-7"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="space-y-3 rounded-xl border p-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="p-charter"
                                            checked={acceptOhadaCharter}
                                            onCheckedChange={(val) =>
                                                setAcceptOhadaCharter(
                                                    val === true
                                                )
                                            }
                                            className="mt-0.5"
                                        />
                                        <Label
                                            htmlFor="p-charter"
                                            className="text-xs leading-relaxed font-normal"
                                        >
                                            J&apos;atteste sur l&apos;honneur
                                            que mes véhicules disposent
                                            d&apos;assurances (Code CIMA) et de
                                            visites techniques (SICTA) en cours
                                            de validité en Côte d&apos;Ivoire,
                                            et je m&apos;engage à respecter la{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCharterOpen(true)
                                                }
                                                className="text-primary inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80"
                                            >
                                                Charte de Qualité et de Sécurité
                                                Routière en vigueur en Côte
                                                d&apos;Ivoire
                                            </button>
                                            .
                                        </Label>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 pl-7">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCharterOpen(true)}
                                            className="h-8 gap-1.5 text-xs"
                                        >
                                            <BookOpen className="h-3.5 w-3.5" />
                                            Lire la charte complète
                                        </Button>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-1.5 text-xs"
                                        >
                                            <Link
                                                href="/legal/charte-qualite-securite"
                                                target="_blank"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Ouvrir dans un nouvel onglet
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t p-6">
                        {step > 1 ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setStep((prev) =>
                                        prev === 3 ? 2 : 1
                                    )
                                }
                                className="min-h-[44px]"
                            >
                                Étape précédente
                            </Button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    if (step === 1 && validateStep1()) {
                                        setStep(2);
                                    } else if (step === 2 && validateStep2()) {
                                        setStep(3);
                                    }
                                }}
                                className="min-h-[44px]"
                            >
                                Continuer
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="min-h-[44px] gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Building2 className="h-4 w-4" />
                                )}
                                {isSubmitting
                                    ? "Transmission du dossier..."
                                    : "Soumettre notre candidature"}
                            </Button>
                        )}
                    </CardFooter>
                </form>
            </Card>

            {/* Modale centrée de lecture de la Charte de Qualité & Sécurité Routière (Côte d'Ivoire) */}
            <Dialog open={charterOpen} onOpenChange={setCharterOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <ShieldCheck className="text-primary h-5 w-5 shrink-0" />
                            {CI_ROAD_SAFETY_CHARTER_TITLE}
                        </DialogTitle>
                        <DialogDescription className="text-xs leading-relaxed">
                            {CI_ROAD_SAFETY_CHARTER_INTRO}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {CI_ROAD_SAFETY_CHARTER_ARTICLES.map((article) => (
                            <div
                                key={article.number}
                                className="space-y-2 rounded-xl border p-4"
                            >
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {article.number}
                                    </Badge>
                                    <h3 className="text-sm font-semibold">
                                        {article.title}
                                    </h3>
                                </div>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    {article.summary}
                                </p>
                                <ul className="space-y-1 text-xs">
                                    {article.obligations.map((obs) => (
                                        <li
                                            key={obs}
                                            className="flex items-start gap-2"
                                        >
                                            <CheckCircle2 className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <span>{obs}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCharterOpen(false)}
                        >
                            Fermer
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                setAcceptOhadaCharter(true);
                                setCharterOpen(false);
                                toast.success(
                                    "Charte acceptée — vous pouvez soumettre votre dossier."
                                );
                            }}
                        >
                            J&apos;ai lu et j&apos;accepte la charte
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modale centrée de confirmation d'envoi du dossier partenaire */}
            <ConfirmDialog
                open={confirmSubmitOpen}
                onOpenChange={setConfirmSubmitOpen}
                title="Confirmer l'envoi de votre dossier partenaire ?"
                description={`Votre dossier (${partnerType === "INDIVIDUAL" ? "Particulier" : "Entreprise"} — ${partnerType === "COMPANY" ? companyName : contactName}, ${totalVehicles} véhicule(s)) sera transmis à l'équipe HBC Logistique pour validation.`}
                confirmLabel="Confirmer et envoyer"
                onConfirm={() => {
                    void executeSubmit();
                }}
            />
        </div>
    );
}
