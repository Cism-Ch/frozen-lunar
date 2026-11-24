import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Quote } from "./quote-storage";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { safeFormatDate } from "@/lib/date-utils";
import { formatQuoteReference } from "@/lib/tracking-code";

/**
 * Normalise les chaînes pour les polices standard PDF (Helvetica/WinAnsi) :
 * remplace les espaces insécables Unicode (\u202F, \u00A0) qui s'affichent
 * comme des caractères corrompus dans jsPDF.
 */
export function sanitizePdfText(value: string | undefined | null): string {
    if (!value) return "";
    return value
        .replace(/[\u00A0\u202F\u2009]/g, " ")
        .replace(/[–—]/g, "-")
        .replace(/[«»]/g, '"')
        .replace(/[’‘]/g, "'")
        .replace(/×/g, "x")
        .trim();
}

export function formatPdfFcfa(amount: number): string {
    const rounded = Math.round(Number.isFinite(amount) ? amount : 0);
    return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

/**
 * Génère un PDF A4 structuré, responsive en hauteur (zéro chevauchement de blocs)
 * aux couleurs de HBC Logistique, avec ventilation des postes FCFA et pagination sûre.
 */
export const generateQuotePDF = (quote: Quote) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
    const marginX = 16;
    const contentWidth = pageWidth - marginX * 2; // 178 mm

    // Palette HBC Logistique
    const NAVY: [number, number, number] = [15, 23, 42];
    const ACCENT: [number, number, number] = [234, 88, 12];
    const SLATE_TEXT: [number, number, number] = [51, 65, 85];
    const MUTED_TEXT: [number, number, number] = [100, 116, 139];
    const CARD_BG: [number, number, number] = [248, 250, 252];
    const BORDER: [number, number, number] = [226, 232, 240];

    const refLabel = sanitizePdfText(
        formatQuoteReference({
            trackingCode: quote.trackingCode,
            id: quote.id,
        })
    );
    const createdDate = sanitizePdfText(safeFormatDate(quote.date, "dd/MM/yyyy"));
    const transportDate = sanitizePdfText(
        safeFormatDate(quote.transportDate, "dd MMMM yyyy")
    );
    const statusLabel = sanitizePdfText(quote.status || "En attente");

    // --- 1. Bandeau d'en-tête institutionnel ---
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageWidth, 34, "F");
    doc.setFillColor(...ACCENT);
    doc.rect(0, 34, pageWidth, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("HBC LOGISTIQUE", marginX, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text(
        sanitizePdfText("Transport de fret, engins lourds & logistique - Côte d'Ivoire"),
        marginX,
        22
    );
    doc.text(
        sanitizePdfText(
            `${COMPANY_CONFIG.contact.phoneDisplay}  |  ${COMPANY_CONFIG.contact.email}`
        ),
        marginX,
        27.5
    );

    // Bloc référence aligné à droite dans le bandeau
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(`DEVIS N° ${refLabel}`, pageWidth - marginX, 14, {
        align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(226, 232, 240);
    doc.text(`Émis le : ${createdDate}`, pageWidth - marginX, 20.5, {
        align: "right",
    });
    doc.text(
        `Validité : 30 jours  |  Statut : ${statusLabel}`,
        pageWidth - marginX,
        26.5,
        { align: "right" }
    );

    let cursorY = 44;

    // --- 2. Cartes côte à côte : Émetteur & Client (hauteurs calculées dynamiquement) ---
    const colGap = 6;
    const colWidth = (contentWidth - colGap) / 2; // 86 mm
    const cardPadX = 4.5;
    const cardInnerW = colWidth - cardPadX * 2;
    const lineHeight = 4.6;

    const emitterLines = [
        ...doc.splitTextToSize(
            sanitizePdfText(COMPANY_CONFIG.legalName),
            cardInnerW
        ),
        ...doc.splitTextToSize(
            sanitizePdfText(COMPANY_CONFIG.address.street),
            cardInnerW
        ),
        ...doc.splitTextToSize(
            sanitizePdfText(
                `${COMPANY_CONFIG.address.city}, ${COMPANY_CONFIG.address.country}`
            ),
            cardInnerW
        ),
        ...doc.splitTextToSize(
            sanitizePdfText(COMPANY_CONFIG.contact.phoneDisplay),
            cardInnerW
        ),
    ];

    const clientLines = [
        ...doc.splitTextToSize(
            sanitizePdfText(quote.client || "Client"),
            cardInnerW
        ),
        ...doc.splitTextToSize(sanitizePdfText(quote.email || "-"), cardInnerW),
        ...doc.splitTextToSize(sanitizePdfText(quote.phone || "-"), cardInnerW),
    ];

    const maxInfoLines = Math.max(emitterLines.length, clientLines.length);
    const infoCardHeight = Math.max(30, 13 + maxInfoLines * lineHeight + 4);

    // Carte Émetteur (gauche)
    doc.setFillColor(...CARD_BG);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, cursorY, colWidth, infoCardHeight, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text("ÉMETTEUR", marginX + cardPadX, cursorY + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_TEXT);
    emitterLines.forEach((line: string, idx: number) => {
        if (idx === 0) doc.setFont("helvetica", "bold");
        else doc.setFont("helvetica", "normal");
        doc.text(line, marginX + cardPadX, cursorY + 12.5 + idx * lineHeight);
    });

    // Carte Client (droite)
    const rightColX = marginX + colWidth + colGap;
    doc.setFillColor(...CARD_BG);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(rightColX, cursorY, colWidth, infoCardHeight, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text("CLIENT / DONNEUR D'ORDRE", rightColX + cardPadX, cursorY + 6.5);

    doc.setFontSize(9);
    doc.setTextColor(...SLATE_TEXT);
    clientLines.forEach((line: string, idx: number) => {
        if (idx === 0) doc.setFont("helvetica", "bold");
        else doc.setFont("helvetica", "normal");
        doc.text(line, rightColX + cardPadX, cursorY + 12.5 + idx * lineHeight);
    });

    cursorY += infoCardHeight + 7;

    // --- 3. Bloc Détails du Transport (hauteur 100% dynamique) ---
    const pickupLines = doc.splitTextToSize(
        sanitizePdfText(quote.pickup || "Non précisé"),
        cardInnerW
    );
    const dropoffLines = doc.splitTextToSize(
        sanitizePdfText(quote.dropoff || "Non précisé"),
        cardInnerW
    );
    const vehicleLabel = sanitizePdfText(
        quote.vehicle
            ? `${quote.vehicleQuantity && quote.vehicleQuantity > 1 ? `${quote.vehicleQuantity}x ` : ""}${quote.vehicle.name}`
            : quote.supplementaryInfo?.pricingBreakdown?.vehicleName ||
                  "À définir selon capacité"
    );
    const fretLines = doc.splitTextToSize(
        sanitizePdfText(quote.type || "Fret spécialisé"),
        cardInnerW
    );
    const vehicleLines = doc.splitTextToSize(vehicleLabel, cardInnerW);

    const routeRowLines = Math.max(pickupLines.length, dropoffLines.length);
    const specRowLines = Math.max(fretLines.length, vehicleLines.length);
    const transportCardHeight =
        13 +
        5 +
        routeRowLines * lineHeight +
        6 +
        5 +
        specRowLines * lineHeight +
        10;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(
        marginX,
        cursorY,
        contentWidth,
        transportCardHeight,
        2.5,
        2.5,
        "FD"
    );

    // En-tête de section transport
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...NAVY);
    doc.text("DÉTAILS DE L'OPÉRATION DE TRANSPORT", marginX + cardPadX, cursorY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED_TEXT);
    doc.text(
        `Date souhaitée : ${transportDate}`,
        marginX + contentWidth - cardPadX,
        cursorY + 7,
        { align: "right" }
    );

    doc.setDrawColor(...BORDER);
    doc.line(
        marginX + cardPadX,
        cursorY + 10,
        marginX + contentWidth - cardPadX,
        cursorY + 10
    );

    // Ligne 1 : Départ / Arrivée
    let innerY = cursorY + 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(22, 163, 74); // Emerald
    doc.text("ENLÈVEMENT / DÉPART", marginX + cardPadX, innerY);

    doc.setTextColor(220, 38, 38); // Rose/Red
    doc.text("LIVRAISON / ARRIVÉE", rightColX + cardPadX, innerY);

    innerY += 4.8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_TEXT);
    pickupLines.forEach((l: string, i: number) => {
        doc.text(l, marginX + cardPadX, innerY + i * lineHeight);
    });
    dropoffLines.forEach((l: string, i: number) => {
        doc.text(l, rightColX + cardPadX, innerY + i * lineHeight);
    });

    // Ligne 2 : Marchandise / Véhicule
    innerY += routeRowLines * lineHeight + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED_TEXT);
    doc.text("MARCHANDISE / FRET", marginX + cardPadX, innerY);
    doc.text("VÉHICULE AFFECTÉ", rightColX + cardPadX, innerY);

    innerY += 4.8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_TEXT);
    fretLines.forEach((l: string, i: number) => {
        doc.text(l, marginX + cardPadX, innerY + i * lineHeight);
    });
    vehicleLines.forEach((l: string, i: number) => {
        doc.text(l, rightColX + cardPadX, innerY + i * lineHeight);
    });

    cursorY += transportCardHeight + 8;

    // --- 4. Tableau de Chiffrage (autoTable avec marge basse anti-chevauchement footer) ---
    const breakdown = quote.supplementaryInfo?.pricingBreakdown;
    const sanitizedAmount = sanitizePdfText(quote.amount || "Nous contacter");

    const bodyRows: Array<Array<string | { content: string; styles?: Record<string, unknown> }>> =
        breakdown && breakdown.lines.length > 0
            ? [
                  ...breakdown.lines.map((line) => [
                      sanitizePdfText(line.label),
                      formatPdfFcfa(line.amountFcfa),
                  ]),
                  [
                      {
                          content: "Sous-total HT",
                          styles: { fontStyle: "bold", fillColor: [248, 250, 252] },
                      },
                      {
                          content: formatPdfFcfa(breakdown.subtotalHt),
                          styles: { fontStyle: "bold", fillColor: [248, 250, 252] },
                      },
                  ],
                  ...(breakdown.includeVat
                      ? [
                            [
                                "TVA Côte d'Ivoire (18%)",
                                formatPdfFcfa(breakdown.vatAmount),
                            ],
                        ]
                      : []),
                  [
                      {
                          content: `TOTAL ${breakdown.includeVat ? "TTC" : "HT"}`,
                          styles: {
                              fontStyle: "bold",
                              fillColor: NAVY,
                              textColor: [255, 255, 255],
                              fontSize: 10,
                          },
                      },
                      {
                          content:
                              sanitizedAmount !== "Nous contacter" &&
                              sanitizedAmount !== "À calculer"
                                  ? sanitizedAmount
                                  : formatPdfFcfa(
                                        breakdown.includeVat
                                            ? breakdown.totalTtc
                                            : breakdown.subtotalHt
                                    ),
                          styles: {
                              fontStyle: "bold",
                              fillColor: NAVY,
                              textColor: [255, 255, 255],
                              fontSize: 10,
                          },
                      },
                  ],
              ]
            : [
                  ["Prestation de transport (Aller simple)", sanitizedAmount],
                  ["Assurance marchandise & suivi opérationnel", "Inclus"],
                  [
                      {
                          content: "TOTAL ESTIMATIF",
                          styles: {
                              fontStyle: "bold",
                              fillColor: NAVY,
                              textColor: [255, 255, 255],
                              fontSize: 10,
                          },
                      },
                      {
                          content: sanitizedAmount,
                          styles: {
                              fontStyle: "bold",
                              fillColor: NAVY,
                              textColor: [255, 255, 255],
                              fontSize: 10,
                          },
                      },
                  ],
              ];

    autoTable(doc, {
        startY: cursorY,
        margin: { left: marginX, right: marginX, bottom: 34 },
        head: [["DESCRIPTION DES PRESTATIONS", "MONTANT (FCFA)"]],
        body: bodyRows,
        theme: "grid",
        headStyles: {
            fillColor: NAVY,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
            cellPadding: 4,
        },
        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 4,
            textColor: SLATE_TEXT,
            lineColor: BORDER,
            lineWidth: 0.25,
            overflow: "linebreak",
        },
        columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: 50, halign: "right" },
        },
        didDrawPage: (data) => {
            // Pied de page propre sur chaque page sans jamais écraser le tableau
            const footerY = pageHeight - 24;
            doc.setDrawColor(...BORDER);
            doc.setLineWidth(0.3);
            doc.line(marginX, footerY, pageWidth - marginX, footerY);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...MUTED_TEXT);
            doc.text(
                sanitizePdfText(
                    "Conditions de règlement : 30% à la commande, solde à la livraison. Devis soumis aux CGV HBC Logistique."
                ),
                marginX,
                footerY + 5
            );
            doc.text(
                sanitizePdfText(
                    `${COMPANY_CONFIG.shortName} - ${COMPANY_CONFIG.address.street}, ${COMPANY_CONFIG.address.city}`
                ),
                marginX,
                footerY + 9.5
            );

            doc.setFont("helvetica", "bold");
            doc.setTextColor(...NAVY);
            doc.text(
                `Page ${data.pageNumber}`,
                pageWidth - marginX,
                footerY + 9.5,
                { align: "right" }
            );
        },
    });

    doc.save(`Devis_${refLabel}.pdf`);
};
