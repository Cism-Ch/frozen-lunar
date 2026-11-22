"use client";

import { useState } from "react";
import {
    Database,
    Edit,
    Minus,
    Plus,
    Trash2,
    Truck,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    formatFcfaRate,
    formatQuantityBadge,
    resolveVehicleImageUrl,
    VEHICLE_CATEGORY_META,
    type FleetVehicleCategory,
    type FleetVehicleItem,
} from "@/lib/fleet-catalog";
import {
    adjustVehicleStockAction,
    createVehicleAction,
    deleteVehicleAction,
    getAdminFleetAction,
    seedDefaultFleetAction,
    updateVehicleAction,
} from "@/app/actions/fleet-actions";

interface AdminFleetClientProps {
    initialVehicles: FleetVehicleItem[];
}

interface VehicleFormState {
    slug: string;
    name: string;
    category: FleetVehicleCategory;
    capacityLabel: string;
    description: string;
    totalQuantity: string;
    availableQuantity: string;
    dailyRateFcfa: string;
    imageUrl: string;
    specsText: string;
    isActive: boolean;
    sortOrder: string;
}

const EMPTY_FORM: VehicleFormState = {
    slug: "",
    name: "",
    category: "HEAVY_HAUL",
    capacityLabel: "",
    description: "",
    totalQuantity: "2",
    availableQuantity: "2",
    dailyRateFcfa: "",
    imageUrl: "",
    specsText: "",
    isActive: true,
    sortOrder: "10",
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function AdminFleetClient({ initialVehicles }: AdminFleetClientProps) {
    const [vehicles, setVehicles] =
        useState<FleetVehicleItem[]>(initialVehicles);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);

    // Modale création / édition
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] =
        useState<FleetVehicleItem | null>(null);
    const [form, setForm] = useState<VehicleFormState>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    // Confirmation suppression
    const [deleteTarget, setDeleteTarget] = useState<FleetVehicleItem | null>(
        null
    );

    const reloadVehicles = async () => {
        const res = await getAdminFleetAction();
        if (res.data) {
            setVehicles(res.data);
        }
    };

    const openCreateDialog = () => {
        setEditingVehicle(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEditDialog = (v: FleetVehicleItem) => {
        setEditingVehicle(v);
        setForm({
            slug: v.slug,
            name: v.name,
            category: v.category,
            capacityLabel: v.capacityLabel,
            description: v.description,
            totalQuantity: String(v.totalQuantity),
            availableQuantity: String(v.availableQuantity),
            dailyRateFcfa:
                v.dailyRateFcfa !== null ? String(v.dailyRateFcfa) : "",
            imageUrl: v.imageUrl || "",
            specsText: v.specs.join("\n"),
            isActive: v.isActive,
            sortOrder: String(v.sortOrder),
        });
        setDialogOpen(true);
    };

    const handleAdjustStock = async (vehicle: FleetVehicleItem, delta: number) => {
        setBusyId(vehicle.id);
        try {
            const res = await adjustVehicleStockAction(vehicle.id, delta);
            if (res.error || !res.data) {
                toast.error(res.error || "Impossible d'ajuster le stock.");
                return;
            }
            setVehicles((prev) =>
                prev.map((item) =>
                    item.id === vehicle.id ? res.data! : item
                )
            );
            toast.success(
                `${res.data.name} : ${formatQuantityBadge(res.data.availableQuantity)}`
            );
        } finally {
            setBusyId(null);
        }
    };

    const handleSeedCatalog = async () => {
        setIsSeeding(true);
        try {
            const res = await seedDefaultFleetAction();
            if (res.error || !res.data) {
                toast.error(
                    res.error || "Erreur lors de l'initialisation du catalogue."
                );
                return;
            }
            await reloadVehicles();
            toast.success(
                "Les cartes par défaut (Côte d'Ivoire) ont été synchronisées."
            );
        } finally {
            setIsSeeding(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            slug: form.slug.trim() || slugify(form.name),
            name: form.name.trim(),
            category: form.category,
            capacityLabel: form.capacityLabel.trim(),
            description: form.description.trim(),
            totalQuantity: Number(form.totalQuantity) || 0,
            availableQuantity: Number(form.availableQuantity) || 0,
            dailyRateFcfa: form.dailyRateFcfa.trim()
                ? Number(form.dailyRateFcfa)
                : null,
            imageUrl: form.imageUrl.trim() || null,
            specs: form.specsText
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            recommendedFor: editingVehicle?.recommendedFor ?? [],
            isActive: form.isActive,
            sortOrder: Number(form.sortOrder) || 0,
        };

        try {
            const res = editingVehicle
                ? await updateVehicleAction(editingVehicle.id, payload)
                : await createVehicleAction(payload);

            if (res.error || !res.data) {
                toast.error(res.error || "Échec de l'enregistrement.");
                return;
            }

            await reloadVehicles();
            setDialogOpen(false);
            toast.success(
                editingVehicle
                    ? "Véhicule mis à jour."
                    : "Véhicule ajouté à la flotte."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setBusyId(deleteTarget.id);
        try {
            const res = await deleteVehicleAction(deleteTarget.id);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            setVehicles((prev) =>
                prev.filter((item) => item.id !== deleteTarget.id)
            );
            toast.success(`${deleteTarget.name} supprimé.`);
        } finally {
            setBusyId(null);
            setDeleteTarget(null);
        }
    };

    const totalAvailable = vehicles.reduce(
        (sum, v) => sum + (v.isActive ? v.availableQuantity : 0),
        0
    );
    const totalPark = vehicles.reduce((sum, v) => sum + v.totalQuantity, 0);

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Truck className="text-primary h-5 w-5" />
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Gestion de la Flotte &amp; Stocks
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Pilotez les véhicules visibles sur{" "}
                        <code className="bg-muted rounded px-1">/flotte</code>{" "}
                        et leurs quantités disponibles en temps réel.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSeedCatalog}
                        disabled={isSeeding}
                        className="min-h-[44px] gap-2"
                    >
                        {isSeeding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Database className="h-4 w-4" />
                        )}
                        Réinitialiser cartes par défaut
                    </Button>
                    <Button
                        onClick={openCreateDialog}
                        className="min-h-[44px] gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter un véhicule
                    </Button>
                </div>
            </div>

            {/* Synthèse */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Modèles référencés
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {vehicles.length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Disponibles immédiatement
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {String(totalAvailable).padStart(2, "0")} /{" "}
                            {String(totalPark).padStart(2, "0")}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-xs font-medium">
                            Modèles en rupture (Qté: 00)
                        </p>
                        <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {
                                vehicles.filter(
                                    (v) => v.availableQuantity === 0
                                ).length
                            }
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des véhicules */}
            {vehicles.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                        <Truck className="text-muted-foreground h-10 w-10" />
                        <div className="space-y-1">
                            <p className="font-semibold">
                                Aucun véhicule enregistré en base
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Cliquez sur « Catalogue Afrique » pour charger
                                automatiquement les 10 modèles standards (Bus 64
                                places, Porte-char, Bennes, etc.).
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {vehicles.map((vehicle) => {
                        const catMeta = VEHICLE_CATEGORY_META[vehicle.category];
                        const isBusy = busyId === vehicle.id;
                        const imgUrl = resolveVehicleImageUrl(vehicle);

                        return (
                            <Card
                                key={vehicle.id}
                                className={`overflow-hidden ${
                                    vehicle.isActive ? "" : "opacity-65"
                                }`}
                            >
                                {/* Aperçu visuel de la carte */}
                                <div className="bg-muted relative h-36 w-full overflow-hidden border-b">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imgUrl}
                                        alt={vehicle.name}
                                        loading="lazy"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                    <div className="absolute right-3 bottom-2.5 left-3 flex items-center justify-between text-white">
                                        <span className="rounded bg-black/60 px-2 py-0.5 text-xs font-medium">
                                            {catMeta.shortLabel}
                                        </span>
                                        <span className="rounded bg-black/65 px-2.5 py-0.5 font-mono text-xs font-bold">
                                            {formatFcfaRate(
                                                vehicle.dailyRateFcfa
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-base">
                                                {vehicle.name}
                                            </CardTitle>
                                            <CardDescription className="mt-0.5 text-xs">
                                                {vehicle.capacityLabel}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-wrap justify-end gap-1.5">
                                            {!vehicle.isActive && (
                                                <Badge variant="secondary">
                                                    Masqué
                                                </Badge>
                                            )}
                                            <Badge
                                                variant="outline"
                                                className={
                                                    vehicle.availableQuantity >
                                                    0
                                                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                                        : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                                }
                                            >
                                                {formatQuantityBadge(
                                                    vehicle.availableQuantity
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                                        {vehicle.description}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                                        <div className="text-xs">
                                            <span className="text-muted-foreground block">
                                                Stock disponible / Parc total
                                            </span>
                                            <span className="font-mono text-sm font-semibold">
                                                {String(
                                                    vehicle.availableQuantity
                                                ).padStart(2, "0")}{" "}
                                                /{" "}
                                                {String(
                                                    vehicle.totalQuantity
                                                ).padStart(2, "0")}{" "}
                                                •{" "}
                                                {formatFcfaRate(
                                                    vehicle.dailyRateFcfa
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                disabled={
                                                    isBusy ||
                                                    vehicle.availableQuantity <=
                                                        0
                                                }
                                                onClick={() =>
                                                    handleAdjustStock(
                                                        vehicle,
                                                        -1
                                                    )
                                                }
                                                aria-label={`Diminuer le stock de ${vehicle.name}`}
                                                className="h-10 w-10"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                disabled={
                                                    isBusy ||
                                                    vehicle.availableQuantity >=
                                                        vehicle.totalQuantity
                                                }
                                                onClick={() =>
                                                    handleAdjustStock(
                                                        vehicle,
                                                        1
                                                    )
                                                }
                                                aria-label={`Augmenter le stock de ${vehicle.name}`}
                                                className="h-10 w-10"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="sm"
                                            onClick={() =>
                                                openEditDialog(vehicle)
                                            }
                                            className="min-h-[40px] flex-1 gap-1.5"
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                            Affiner (Description / Prix / Image)
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setDeleteTarget(vehicle)
                                            }
                                            className="text-destructive hover:text-destructive min-h-[40px] gap-1.5"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Dialog Création / Édition */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingVehicle
                                ? `Modifier : ${editingVehicle.name}`
                                : "Ajouter un modèle de véhicule"}
                        </DialogTitle>
                        <DialogDescription>
                            Définissez la capacité, le tarif journalier en FCFA
                            et les quantités disponibles pour le public.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="v-name">Nom du véhicule</Label>
                                <Input
                                    id="v-name"
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                            slug: editingVehicle
                                                ? prev.slug
                                                : slugify(e.target.value),
                                        }))
                                    }
                                    placeholder="Ex: Bus 64 places"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="v-slug">Slug URL</Label>
                                <Input
                                    id="v-slug"
                                    required
                                    value={form.slug}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            slug: e.target.value,
                                        }))
                                    }
                                    placeholder="bus-64-places"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label>Catégorie</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(val) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            category:
                                                val as FleetVehicleCategory,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(
                                            Object.keys(
                                                VEHICLE_CATEGORY_META
                                            ) as FleetVehicleCategory[]
                                        ).map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {
                                                    VEHICLE_CATEGORY_META[cat]
                                                        .label
                                                }
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="v-capacity">Capacité</Label>
                                <Input
                                    id="v-capacity"
                                    required
                                    value={form.capacityLabel}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            capacityLabel: e.target.value,
                                        }))
                                    }
                                    placeholder="Ex: 64 places assises"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="v-total">Parc total</Label>
                                <Input
                                    id="v-total"
                                    type="number"
                                    min={0}
                                    required
                                    value={form.totalQuantity}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            totalQuantity: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="v-avail">Disponibles</Label>
                                <Input
                                    id="v-avail"
                                    type="number"
                                    min={0}
                                    required
                                    value={form.availableQuantity}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            availableQuantity: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="v-rate">FCFA / jour</Label>
                                <Input
                                    id="v-rate"
                                    type="number"
                                    min={0}
                                    value={form.dailyRateFcfa}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            dailyRateFcfa: e.target.value,
                                        }))
                                    }
                                    placeholder="Sur devis"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="v-image">
                                URL de l&apos;image d&apos;illustration (https://...)
                            </Label>
                            <Input
                                id="v-image"
                                type="url"
                                value={form.imageUrl}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        imageUrl: e.target.value,
                                    }))
                                }
                                placeholder="https://upload.wikimedia.org/..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="v-desc">
                                Description (catégorie &amp; usage en Côte
                                d&apos;Ivoire)
                            </Label>
                            <Textarea
                                id="v-desc"
                                rows={3}
                                required
                                value={form.description}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="v-specs">
                                Utilités cochées sur la carte (une utilité par
                                ligne)
                            </Label>
                            <Textarea
                                id="v-specs"
                                rows={4}
                                value={form.specsText}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        specsText: e.target.value,
                                    }))
                                }
                                placeholder="Transport de personnel et navettes d'entreprise&#10;Liaisons interurbaines en Côte d'Ivoire"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="v-active">
                                    Visible sur le site public
                                </Label>
                                <p className="text-muted-foreground text-xs">
                                    Affiche le véhicule sur /flotte et dans le
                                    formulaire de devis.
                                </p>
                            </div>
                            <Switch
                                id="v-active"
                                checked={form.isActive}
                                onCheckedChange={(checked) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        isActive: checked,
                                    }))
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving
                                    ? "Enregistrement..."
                                    : editingVehicle
                                      ? "Enregistrer"
                                      : "Créer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                title="Supprimer ce véhicule ?"
                description={
                    deleteTarget
                        ? `Le modèle « ${deleteTarget.name} » sera retiré du catalogue de la flotte.`
                        : ""
                }
                confirmLabel="Supprimer"
                variant="destructive"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
