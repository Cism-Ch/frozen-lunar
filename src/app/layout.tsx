import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
    fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
    title: "HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE",
    description:
        "Votre sécurité Notre priorité. Transport de matériaux, containers, charpentes, machines.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                <LayoutWrapper>{children}</LayoutWrapper>
            </body>
        </html>
    );
}
