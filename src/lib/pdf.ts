import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface QuoteData {
    id: string;
    clientName: string;
    items: Array<{ description: string; quantity: number; price: number }>;
    total: number;
    date: string;
}

export class PdfService {
    static async generateQuotePdf(data: QuoteData): Promise<Buffer> {
        // Note: jsPDF is primarily client-side. In Node.js, we might need a workaround or specific construct.
        // For this implementation, we assume basic text generation works.
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Devis - HBC Logistique", 20, 20);

        doc.setFontSize(12);
        doc.text(`Devis N°: ${data.id}`, 20, 40);
        doc.text(`Date: ${data.date}`, 20, 50);
        doc.text(`Client: ${data.clientName}`, 20, 60);

        // Simple table simulation
        let y = 80;
        doc.text("Description", 20, y);
        doc.text("Quantité", 120, y);
        doc.text("Prix", 160, y);
        y += 10;
        doc.line(20, y - 5, 190, y - 5);

        data.items.forEach((item) => {
            doc.text(item.description, 20, y);
            doc.text(item.quantity.toString(), 120, y);
            doc.text(`${item.price} €`, 160, y);
            y += 10;
        });

        doc.line(20, y, 190, y);
        y += 10;
        doc.setFontSize(14);
        doc.text(`Total: ${data.total} €`, 150, y);

        // Output as ArrayBuffer and convert to Buffer for Node.js upload
        const arrayBuffer = doc.output("arraybuffer");
        return Buffer.from(arrayBuffer);
    }
}
