"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppButton() {
    const phoneNumber = "33123456789" // Format international sans le +
    const message = encodeURIComponent("Bonjour, je souhaite obtenir un devis pour un transport.")

    return (
        <Button
            asChild
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50 bg-[#25D366] hover:bg-[#20BA5A]"
        >
            <a
                href={`https://wa.me/${phoneNumber}?text=${message}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactez-nous sur WhatsApp"
            >
                <MessageCircle className="h-6 w-6 text-white" />
            </a>
        </Button>
    )
}
