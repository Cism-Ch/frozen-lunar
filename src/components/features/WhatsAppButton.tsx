"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppButton() {
  const phoneNumber = "33123456789"; // Format international sans le +
  const message = encodeURIComponent("Bonjour, je souhaite obtenir un devis pour un transport.");

  return (
    <Button
      asChild
      size="icon"
      className="
                fixed
                bottom-6 right-6 lg:bottom-8 lg:right-8
                h-14 w-14 lg:h-16 lg:w-16
                rounded-full
                shadow-2xl hover:shadow-3xl
                hover:scale-110
                transition-all duration-300
                z-50
                bg-[#25D366] hover:bg-[#20BA5A]
                border-2 border-white/20
                group
            "
    >
      <a
        href={`https://wa.me/${phoneNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactez-nous sur WhatsApp"
        className="flex items-center justify-center"
      >
        <MessageCircle className="h-7 w-7 lg:h-8 lg:w-8 text-white group-hover:rotate-12 transition-transform" />

        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
      </a>
    </Button>
  );
}
