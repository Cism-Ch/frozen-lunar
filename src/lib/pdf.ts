import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPdfFcfa, sanitizePdfText } from "@/lib/pdf-generator";

interface QuoteData {
    id: string;
    clientName: string;
    items: Array<{ description: string; quantity: number; price: number }>;
    total: number;
    date: string;
}

export class PdfService {
    static async generateQuotePdf(data: QuoteData): Promise<Buffer> {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const marginX = 16;

        // En-tête sobre aligné sur la charte HBC Logistique
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 28, "F");
        doc.setFillColor(234, 88, 12);
        doc.rect(0, 28, pageWidth, 2, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("HBC LOGISTIQUE", marginX, 14);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(
            sanitizePdfText(`DEVIS N° ${data.id}`),
            pageWidth - marginX,
            13,
            { align: "right" }
        );
        doc.text(
            sanitizePdfText(`Date : ${data.date}`),
            pageWidth - marginX,
            19,
            { align: "right" }
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(
            sanitizePdfText(`Client : ${data.clientName}`),
            marginX,
            40
        );

        autoTable(doc, {
            startY: 48,
            margin: { left: marginX, right: marginX, bottom: 25 },
            head: [["DESCRIPTION", "QTÉ", "MONTANT (FCFA)"]],
            body: [
                ...data.items.map((item) => [
                    sanitizePdfText(item.description),
                    String(item.quantity),
                    formatPdfFcfa(item.price),
                ]),
                [
                    {
                        content: "TOTAL",
                        colSpan: 2,
                        styles: {
                            fontStyle: "bold",
                            fillColor: [15, 23, 42],
                            textColor: [255, 255, 255],
                        },
                    },
                    {
                        content: formatPdfFcfa(data.total),
                        styles: {
                            fontStyle: "bold",
                            fillColor: [15, 23, 42],
                            textColor: [255, 255, 255],
                        },
                    },
                ],
            ],
            theme: "grid",
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontStyle: "bold",
            },
            columnStyles: {
                1: { cellWidth: 20, halign: "center" },
                2: { cellWidth: 48, halign: "right" },
            },
        });

        const arrayBuffer = doc.output("arraybuffer");
        return Buffer.from(arrayBuffer);
    }
}
