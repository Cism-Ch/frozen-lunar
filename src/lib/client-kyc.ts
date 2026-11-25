export type ClientAccountType = "INDIVIDUAL" | "COMPANY";

export type KycDocType =
    | "identity_card"
    | "proof_of_address"
    | "manager_id"
    | "rccm"
    | "dfe_ncc";

export type KycDocStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ClientKycDocument {
    docType: KycDocType;
    fileKey: string;
    fileName: string;
    status: KycDocStatus;
    uploadedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    rejectionReason?: string;
}

export interface ClientKycState {
    documents: ClientKycDocument[];
    lastReminderAt: string | null;
}

export interface KycRequirementSpec {
    docType: KycDocType;
    label: string;
    description: string;
    required: boolean;
}

export interface StoredAddressItem {
    label: string;
    address: string;
}

export const KYC_REQUIREMENTS_BY_ACCOUNT_TYPE: Record<
    ClientAccountType,
    KycRequirementSpec[]
> = {
    INDIVIDUAL: [
        {
            docType: "identity_card",
            label: "Pièce d'identité (CNI ou Passeport)",
            description:
                "Carte Nationale d'Identité, Passeport ou Carte de résident en cours de validité pour vérifier votre identité.",
            required: true,
        },
        {
            docType: "proof_of_address",
            label: "Justificatif de domicile",
            description:
                "Facture CIE / SODECI récente ou attestation de résidence (recommandé pour vos enlèvements réguliers).",
            required: false,
        },
    ],
    COMPANY: [
        {
            docType: "manager_id",
            label: "Pièce d'identité du gérant (CNI ou Passeport)",
            description:
                "Pièce d'identité officielle du représentant légal de l'entreprise.",
            required: true,
        },
        {
            docType: "rccm",
            label: "Extrait RCCM",
            description:
                "Registre du Commerce et du Crédit Mobilier attestant l'existence légale de votre société.",
            required: true,
        },
        {
            docType: "dfe_ncc",
            label: "Attestation DFE / NCC",
            description:
                "Déclaration Fiscale d'Existence ou justificatif de Numéro de Compte Contribuable.",
            required: true,
        },
    ],
};

const VALID_DOC_TYPES = new Set<string>([
    "identity_card",
    "proof_of_address",
    "manager_id",
    "rccm",
    "dfe_ncc",
]);

const VALID_STATUSES = new Set<string>(["PENDING", "APPROVED", "REJECTED"]);

export const EMPTY_KYC_STATE: ClientKycState = {
    documents: [],
    lastReminderAt: null,
};

function parseAddressArray(raw: unknown): StoredAddressItem[] {
    if (!Array.isArray(raw)) return [];
    const items: StoredAddressItem[] = [];
    for (const entry of raw) {
        if (
            entry &&
            typeof entry === "object" &&
            "label" in entry &&
            "address" in entry &&
            typeof entry.label === "string" &&
            typeof entry.address === "string"
        ) {
            items.push({ label: entry.label, address: entry.address });
        }
    }
    return items;
}

function parseKycDocuments(raw: unknown): ClientKycDocument[] {
    if (!Array.isArray(raw)) return [];
    const docs: ClientKycDocument[] = [];
    for (const item of raw) {
        if (!item || typeof item !== "object") continue;
        const r = item as Record<string, unknown>;
        if (
            typeof r.docType === "string" &&
            VALID_DOC_TYPES.has(r.docType) &&
            typeof r.fileKey === "string" &&
            typeof r.fileName === "string" &&
            typeof r.status === "string" &&
            VALID_STATUSES.has(r.status) &&
            typeof r.uploadedAt === "string"
        ) {
            docs.push({
                docType: r.docType as KycDocType,
                fileKey: r.fileKey,
                fileName: r.fileName,
                status: r.status as KycDocStatus,
                uploadedAt: r.uploadedAt,
                reviewedAt:
                    typeof r.reviewedAt === "string" ? r.reviewedAt : undefined,
                reviewedBy:
                    typeof r.reviewedBy === "string" ? r.reviewedBy : undefined,
                rejectionReason:
                    typeof r.rejectionReason === "string"
                        ? r.rejectionReason
                        : undefined,
            });
        }
    }
    return docs;
}

/**
 * Lit de façon 100% rétrocompatible la colonne JSON `CompanyProfile.savedAddresses` :
 * - Ancien format : `SavedAddressItem[]`
 * - Nouveau format enrichi : `{ addresses: SavedAddressItem[], kyc: ClientKycState }`
 */
export function parseProfileStorage(raw: unknown): {
    addresses: StoredAddressItem[];
    kyc: ClientKycState;
} {
    if (Array.isArray(raw)) {
        return {
            addresses: parseAddressArray(raw),
            kyc: { documents: [], lastReminderAt: null },
        };
    }
    if (raw && typeof raw === "object") {
        const obj = raw as Record<string, unknown>;
        const kycObj =
            obj.kyc && typeof obj.kyc === "object"
                ? (obj.kyc as Record<string, unknown>)
                : null;
        return {
            addresses: parseAddressArray(obj.addresses),
            kyc: {
                documents: parseKycDocuments(kycObj?.documents),
                lastReminderAt:
                    typeof kycObj?.lastReminderAt === "string"
                        ? kycObj.lastReminderAt
                        : null,
            },
        };
    }
    return {
        addresses: [],
        kyc: { documents: [], lastReminderAt: null },
    };
}

export function serializeProfileStorage(
    addresses: StoredAddressItem[],
    kyc: ClientKycState
): { addresses: StoredAddressItem[]; kyc: ClientKycState } {
    return { addresses, kyc };
}

export function getKycDocLabel(docType: KycDocType): string {
    for (const specs of Object.values(KYC_REQUIREMENTS_BY_ACCOUNT_TYPE)) {
        const found = specs.find((s) => s.docType === docType);
        if (found) return found.label;
    }
    return docType;
}

/**
 * Vérifie si le client peut envoyer un rappel de validation à l'administrateur (max 1 fois / 24h)
 * et uniquement s'il possède au moins un document en attente de validation.
 */
export function canSendKycReminder(
    kyc: ClientKycState,
    now = new Date()
): { allowed: boolean; remainingHours: number; reason?: string } {
    const hasPending = kyc.documents.some((d) => d.status === "PENDING");
    if (!hasPending) {
        return {
            allowed: false,
            remainingHours: 0,
            reason: "Aucun document en attente de validation pour le moment.",
        };
    }

    if (kyc.lastReminderAt) {
        const lastMs = new Date(kyc.lastReminderAt).getTime();
        if (!Number.isNaN(lastMs)) {
            const elapsedMs = now.getTime() - lastMs;
            const cooldownMs = 24 * 60 * 60 * 1000;
            if (elapsedMs < cooldownMs) {
                const remainingHours = Math.max(
                    1,
                    Math.ceil((cooldownMs - elapsedMs) / (60 * 60 * 1000))
                );
                return {
                    allowed: false,
                    remainingHours,
                    reason: `Vous avez déjà relancé l'équipe aujourd'hui. Prochaine relance possible dans ${remainingHours}h.`,
                };
            }
        }
    }

    return { allowed: true, remainingHours: 0 };
}

export type OverallKycStatus =
    | "UNVERIFIED"
    | "PENDING"
    | "VERIFIED"
    | "ACTION_REQUIRED";

export function computeOverallKycStatus(
    accountType: ClientAccountType,
    documents: ClientKycDocument[]
): OverallKycStatus {
    const requiredSpecs = KYC_REQUIREMENTS_BY_ACCOUNT_TYPE[accountType].filter(
        (s) => s.required
    );
    if (documents.some((d) => d.status === "REJECTED")) {
        return "ACTION_REQUIRED";
    }
    const allRequiredApproved =
        requiredSpecs.length > 0 &&
        requiredSpecs.every((spec) =>
            documents.some(
                (d) => d.docType === spec.docType && d.status === "APPROVED"
            )
        );
    if (allRequiredApproved) {
        return "VERIFIED";
    }
    if (documents.some((d) => d.status === "PENDING")) {
        return "PENDING";
    }
    return "UNVERIFIED";
}
