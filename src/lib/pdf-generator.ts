import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Quote } from "./quote-storage";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { safeFormatDate } from "@/lib/date-utils";
import { formatQuoteReference } from "@/lib/tracking-code";

function formatPdfFcfa(amount: number): string {
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

export const generateQuotePDF = (quote: Quote) => {
    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("HBC LOGISTIQUE", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(COMPANY_CONFIG.address.street, 20, 28);
    doc.text(
        `${COMPANY_CONFIG.address.city}, ${COMPANY_CONFIG.address.country}`,
        20,
        33
    );
    doc.text(COMPANY_CONFIG.contact.email, 20, 38);
    doc.text(COMPANY_CONFIG.contact.phoneDisplay, 20, 43);

    // --- Quote Info ---
    const refLabel = formatQuoteReference({
        trackingCode: quote.trackingCode,
        id: quote.id,
    });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`DEVIS N° ${refLabel}`, 130, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${safeFormatDate(quote.date, "dd/MM/yyyy")}`, 138, 28);
    doc.text(`Validité: 30 jours`, 138, 33);

    // --- Client Info (Address Box) ---
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(120, 50, 70, 40, 2, 2, "F");

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Client :", 125, 58);

    doc.setFontSize(10);
    doc.text(quote.client, 125, 65, { maxWidth: 60 });
    doc.text(quote.email, 125, 72, { maxWidth: 60 });
    doc.text(quote.phone, 125, 79, { maxWidth: 60 });

    // --- Transport Details (Left Side) ---
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Détails du Transport", 20, 100);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 103, 80, 103);

    doc.setFontSize(10);

    // Pickup
    doc.setTextColor(0, 150, 0);
    doc.text("DÉPART", 20, 115);
    doc.setTextColor(0, 0, 0);
    doc.text(quote.pickup, 20, 120, { maxWidth: 85 });

    // Dropoff
    doc.setTextColor(200, 0, 0);
    doc.text("ARRIVÉE", 20, 135);
    doc.setTextColor(0, 0, 0);
    doc.text(quote.dropoff, 20, 140, { maxWidth: 85 });

    // Date & Vehicle
    doc.text(
        `Date prévue : ${safeFormatDate(quote.transportDate, "dd MMMM yyyy")}`,
        20,
        155
    );
    const vehicleLabel = quote.vehicle
        ? `${quote.vehicleQuantity && quote.vehicleQuantity > 1 ? `${quote.vehicleQuantity}× ` : ""}${quote.vehicle.name}`
        : quote.supplementaryInfo?.pricingBreakdown?.vehicleName || quote.type;
    doc.text(`Fret : ${quote.type}`, 20, 161, { maxWidth: 165 });
    doc.text(`Véhicule : ${vehicleLabel}`, 20, 167, { maxWidth: 165 });

    // --- Pricing Table (détail structuré si disponible) ---
    const breakdown = quote.supplementaryInfo?.pricingBreakdown;
    const bodyRows: string[][] =
        breakdown && breakdown.lines.length > 0
            ? [
                  ...breakdown.lines.map((line) => [
                      line.label,
                      formatPdfFcfa(line.amountFcfa),
                  ]),
                  ["Sous-total HT", formatPdfFcfa(breakdown.subtotalHt)],
                  ...(breakdown.includeVat
                      ? [["TVA Côte d'Ivoire (18%)", formatPdfFcfa(breakdown.vatAmount)]]
                      : []),
                  [
                      `TOTAL ${breakdown.includeVat ? "TTC" : "HT"}`,
                      quote.amount ||
                          formatPdfFcfa(
                              breakdown.includeVat
                                  ? breakdown.totalTtc
                                  : breakdown.subtotalHt
                          ),
                  ],
              ]
            : [
                  [
                      "Prestation de transport (Aller simple)",
                      quote.amount || "Nous contacter",
                  ],
                  ["Assurance marchandises", "Incluse"],
                  ["Frais de gestion", "Inclus"],
              ];

    autoTable(doc, {
        startY: 176,
        head: [["DESCRIPTION", "MONTANT"]],
        body: bodyRows,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 9.5, cellPadding: 4.5 },
        columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: 48, halign: "right" },
        },
    });

    // --- Footer ---
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
        "Conditions de paiement : 30% à la commande, solde à la livraison.",
        20,
        pageHeight - 30
    );
    doc.text(
        "Ce devis est soumis aux CGV disponibles sur notre site internet.",
        20,
        pageHeight - 25
    );

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Merci de votre confiance !", 105, pageHeight - 15, {
        align: "center",
    });

    doc.save(`Devis_${refLabel}.pdf`);
};
