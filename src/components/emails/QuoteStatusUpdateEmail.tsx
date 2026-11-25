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
import { COMPANY_CONFIG } from "@/lib/company-config";

export interface QuoteStatusUpdateEmailProps {
    clientName: string;
    quoteId: string;
    status: "VALIDATED" | "REJECTED";
    amount?: string;
    pickup: string;
    dropoff: string;
    note?: string;
}

export const QuoteStatusUpdateEmail = ({
    clientName,
    quoteId,
    status,
    amount,
    pickup,
    dropoff,
    note,
}: QuoteStatusUpdateEmailProps) => {
    const isValidated = status === "VALIDATED";
    const siteUrl =
        process.env.NEXT_PUBLIC_APP_URL || COMPANY_CONFIG.contact.website;

    return (
        <Html lang="fr">
            <Head />
            <Preview>
                {isValidated
                    ? `Votre devis ${quoteId} est validé — ${COMPANY_CONFIG.shortName}`
                    : `Mise à jour de votre dossier ${quoteId} — ${COMPANY_CONFIG.shortName}`}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={headerBanner}>
                        <Text style={brandEyebrow}>
                            TRANSPORT &amp; LOGISTIQUE • CÔTE D&apos;IVOIRE
                        </Text>
                        <Heading style={heading}>HBC LOGISTIQUE</Heading>
                        <Text style={tagline}>{COMPANY_CONFIG.slogan}</Text>
                    </Section>
                    <Section style={accentBar} />

                    <Section style={contentSection}>
                        <Text style={greeting}>Bonjour {clientName},</Text>

                        <Section
                            style={{
                                backgroundColor: isValidated
                                    ? "#ECFDF5"
                                    : "#FEF2F2",
                                border: `1px solid ${isValidated ? "#A7F3D0" : "#FECACA"}`,
                                borderRadius: "10px",
                                padding: "14px 18px",
                                marginBottom: "20px",
                            }}
                        >
                            <Text
                                style={{
                                    color: isValidated ? "#065F46" : "#991B1B",
                                    fontSize: "14.5px",
                                    fontWeight: 700,
                                    margin: 0,
                                }}
                            >
                                {isValidated
                                    ? `Devis ${quoteId} validé par notre exploitation`
                                    : `Dossier ${quoteId} non retenu en l'état`}
                            </Text>
                        </Section>

                        <Section style={summaryCard}>
                            <Text style={line}>
                                <strong>Référence :</strong> {quoteId}
                            </Text>
                            <Text style={line}>
                                <strong>Départ :</strong> {pickup}
                            </Text>
                            <Text style={line}>
                                <strong>Arrivée :</strong> {dropoff}
                            </Text>
                            {amount && (
                                <Text style={line}>
                                    <strong>Montant retenu :</strong> {amount}
                                </Text>
                            )}
                            {note && (
                                <Text style={lineLast}>
                                    <strong>Précision d&apos;équipe :</strong>{" "}
                                    {note}
                                </Text>
                            )}
                        </Section>

                        <Section style={buttonContainer}>
                            <Button
                                style={ctaButton}
                                href={`${siteUrl}/espace-client`}
                            >
                                Consulter mon Espace Client
                            </Button>
                        </Section>

                        <Hr style={hr} />

                        <Text style={footerText}>
                            <strong>{COMPANY_CONFIG.legalName}</strong>
                            <br />
                            {COMPANY_CONFIG.contact.email} •{" "}
                            {COMPANY_CONFIG.contact.phoneDisplay}
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default QuoteStatusUpdateEmail;

const main: React.CSSProperties = {
    backgroundColor: "#F2F5F7",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
    padding: "28px 12px",
};

const container: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    margin: "0 auto",
    maxWidth: "600px",
    overflow: "hidden",
    border: "1px solid #E2E8F0",
};

const headerBanner: React.CSSProperties = {
    backgroundColor: "#001F3D",
    padding: "26px 24px 20px",
    textAlign: "center",
};

const accentBar: React.CSSProperties = {
    backgroundColor: "#FF7C24",
    height: "4px",
};

const brandEyebrow: React.CSSProperties = {
    color: "#92A9BE",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.6px",
    margin: "0 0 6px 0",
};

const heading: React.CSSProperties = {
    color: "#ffffff",
    fontSize: "23px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    margin: "0 0 4px 0",
};

const tagline: React.CSSProperties = {
    color: "#CBD5E1",
    fontSize: "12px",
    fontStyle: "italic",
    margin: "0",
};

const contentSection: React.CSSProperties = {
    padding: "28px 28px 24px",
};

const greeting: React.CSSProperties = {
    color: "#0F172A",
    fontSize: "16px",
    fontWeight: 700,
    margin: "0 0 16px 0",
};

const summaryCard: React.CSSProperties = {
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "16px 20px",
    marginBottom: "20px",
};

const line: React.CSSProperties = {
    color: "#334155",
    fontSize: "14px",
    lineHeight: "21px",
    margin: "0 0 8px 0",
};

const lineLast: React.CSSProperties = {
    color: "#334155",
    fontSize: "14px",
    lineHeight: "21px",
    margin: "0",
};

const buttonContainer: React.CSSProperties = {
    textAlign: "center",
    margin: "22px 0 16px",
};

const ctaButton: React.CSSProperties = {
    backgroundColor: "#FF7C24",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14.5px",
    fontWeight: 700,
    textDecoration: "none",
    padding: "13px 26px",
    display: "inline-block",
};

const hr: React.CSSProperties = {
    borderColor: "#E2E8F0",
    margin: "18px 0",
};

const footerText: React.CSSProperties = {
    color: "#64748B",
    fontSize: "11.5px",
    lineHeight: "18px",
    textAlign: "center",
    margin: "0",
};
