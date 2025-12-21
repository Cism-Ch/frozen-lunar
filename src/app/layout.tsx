import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { WhatsAppButton } from "@/components/features/WhatsAppButton";
import { SupportChatButton } from "@/components/features/support";

// Client component for conditional rendering
function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  "use client";
  
  const { usePathname } = require("next/navigation");
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

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE",
  description: "Votre sécurité Notre priorité. Transport de matériaux, containers, charpentes, machines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}