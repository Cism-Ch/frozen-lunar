"use client";

import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/components/theme-provider";
import { WhatsAppButton } from "@/components/features/WhatsAppButton";
import { SupportChatButton } from "@/components/features/support";
import { Toaster } from "@/components/ui/sonner";

export function LayoutWrapper({ children }: { children: React.ReactNode; }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      {!isAdmin && <SupportChatButton />}
      {!isAdmin && <WhatsAppButton />}
      <Toaster />
    </ThemeProvider>
  );
}