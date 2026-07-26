import {
    Html,
    Body,
    Head,
    Heading,
    Hr,
    Container,
    Preview,
    Section,
    Text,
    Button,
} from "@react-email/components";
import * as React from "react";

interface QuoteConfirmationEmailProps {
    clientName: string;
    pickup: string;
    dropoff: string;
    itemType: string;
    date: string;
    quoteId: string;
}

export const QuoteConfirmationEmail = ({
    clientName,
    pickup,
    dropoff,
    itemType,
    date,
    quoteId,
}: QuoteConfirmationEmailProps) => {
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hbc-logistique.fr";

    return (
        <Html>
            <Head />
            <Preview>Confirmation de votre demande de devis #{quoteId} - HBC Logistique</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header Banner */}
                    <Section style={headerBanner}>
                        <Heading style={heading}>HBC LOGISTIQUE</Heading>
                        <Text style={tagline}>Votre sécurité, Notre priorité</Text>
                    </Section>

                    <Section style={contentSection}>
                        <Text style={paragraph}>Bonjour {clientName},</Text>
                        <Text style={paragraph}>
                            Nous avons bien reçu votre demande de devis et nous vous en remercions. 
                            Notre équipe spécialisée étudie actuellement votre besoin de transport et reviendra vers vous sous 24h ouvrées avec une proposition sur mesure.
                        </Text>

                        {/* Order Summary Box */}
                        <Section style={summaryCard}>
                            <Text style={cardTitle}>Récapitulatif de votre demande (#{quoteId})</Text>
                            <Hr style={cardHr} />
                            <Text style={itemText}><strong>Prestation :</strong> {itemType}</Text>
                            <Text style={itemText}><strong>Lieu de départ :</strong> {pickup}</Text>
                            <Text style={itemText}><strong>Lieu d&apos;arrivée :</strong> {dropoff}</Text>
                            <Text style={itemText}><strong>Date souhaitée :</strong> {date}</Text>
                        </Section>

                        <Text style={paragraph}>
                            Vous pouvez suivre l&apos;avancement de votre dossier ou contacter directement nos équipes pour toute précision.
                        </Text>

                        <Section style={buttonContainer}>
                            <Button style={ctaButton} href={`${siteUrl}/contact`}>
                                Contacter un conseiller
                            </Button>
                        </Section>

                        <Hr style={hr} />

                        <Text style={footerText}>
                            HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE<br />
                            Transport de matériaux, containers, charpentes et machines industrielles.<br />
                            Email : contact@hbc-logistique.fr | Tél : +33 1 00 00 00 00
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles - Brand compliant (Industrial Orange #FF6600 & Deep Blue #003366)
const main = {
    backgroundColor: "#f4f6f9",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: "32px",
    marginBottom: "48px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    maxWidth: "600px",
};

const headerBanner = {
    backgroundColor: "#003366", // Deep Blue
    padding: "32px 24px",
    textAlign: "center" as const,
};

const heading = {
    fontSize: "28px",
    lineHeight: "1.2",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0",
    letterSpacing: "0.5px",
};

const tagline = {
    fontSize: "14px",
    color: "#FF6600", // Industrial Orange
    margin: "6px 0 0 0",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
};

const contentSection = {
    padding: "32px 24px",
};

const paragraph = {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#333333",
    margin: "0 0 16px 0",
};

const summaryCard = {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    margin: "24px 0",
};

const cardTitle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#003366",
    margin: "0 0 8px 0",
};

const cardHr = {
    borderColor: "#cbd5e1",
    margin: "8px 0 12px 0",
};

const itemText = {
    fontSize: "15px",
    color: "#475569",
    margin: "6px 0",
};

const buttonContainer = {
    textAlign: "center" as const,
    margin: "28px 0",
};

const ctaButton = {
    backgroundColor: "#FF6600", // Industrial Orange
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 28px",
};

const hr = {
    borderColor: "#e2e8f0",
    margin: "28px 0 20px 0",
};

const footerText = {
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#94a3b8",
    textAlign: "center" as const,
};

export default QuoteConfirmationEmail;
