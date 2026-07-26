"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppButton() {
    const phoneNumber = "33123456789"; // Format international sans le +
    const message = encodeURIComponent(
        "Bonjour, je souhaite obtenir un devis pour un transport."
    );

    return (
        <Button
            asChild
            size="icon"
            className="hover:shadow-3xl group fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full border-2 border-white/20 bg-[#25D366] shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#20BA5A] lg:right-8 lg:bottom-8 lg:h-16 lg:w-16"
        >
            <a
                href={`https://wa.me/${phoneNumber}?text=${message}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactez-nous sur WhatsApp"
                className="flex items-center justify-center"
            >
                <MessageCircle className="h-7 w-7 text-white transition-transform group-hover:rotate-12 lg:h-8 lg:w-8" />

                {/* Pulse animation */}
                <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20"></span>
            </a>
        </Button>
    );
}
