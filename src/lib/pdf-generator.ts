import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Quote } from "./quote-storage";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
    const refLabel = quote.trackingCode || `HBC-${quote.id.slice(-6).toUpperCase()}`;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`DEVIS N° ${refLabel}`, 132, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${format(new Date(quote.date), "dd/MM/yyyy")}`, 140, 28);
    doc.text(`Validité: 30 jours`, 140, 33);

    // --- Client Info (Address Box) ---
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(120, 50, 70, 40, 2, 2, "F");

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Client :", 125, 58);

    doc.setFontSize(10);
    doc.text(quote.client, 125, 65);
    doc.text(quote.email, 125, 70);
    doc.text(quote.phone, 125, 75);

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
    doc.text(quote.pickup, 20, 120, { maxWidth: 80 });

    // Dropoff
    doc.setTextColor(200, 0, 0);
    doc.text("ARRIVÉE", 20, 135);
    doc.setTextColor(0, 0, 0);
    doc.text(quote.dropoff, 20, 140, { maxWidth: 80 });

    // Date & Vehicle
    doc.text(
        `Date prévue : ${format(new Date(quote.transportDate), "dd MMMM yyyy", { locale: fr })}`,
        20,
        155
    );
    doc.text(`Véhicule : ${quote.type}`, 20, 160);

    // --- Pricing Table ---
    const tableData = [
        ["DESCRIPTION", "TOTAL"],
        [
            "Prestation de transport (Aller simple)",
            quote.amount || "Nous contacter",
        ],
        ["Assurance marchandises", "Incluse"],
        ["Frais de gestion", "Inclus"],
    ];

    autoTable(doc, {
        startY: 180,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: 40, halign: "right" },
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

    doc.save(`Devis_${quote.id}.pdf`);
};
