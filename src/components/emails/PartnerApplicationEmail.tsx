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
} from "@react-email/components";
import * as React from "react";
import { COMPANY_CONFIG } from "@/lib/company-config";

export interface PartnerApplicationEmailProps {
    companyName: string;
    contactName: string;
    country: string;
    city: string;
    category: string;
    fleetSummary: string;
    isAdminCopy?: boolean;
}

export const PartnerApplicationEmail = ({
    companyName,
    contactName,
    country,
    city,
    category,
    fleetSummary,
    isAdminCopy = false,
}: PartnerApplicationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>
                {isAdminCopy
                    ? `Nouvelle candidature partenaire : ${companyName} (${city})`
                    : `Candidature partenaire reçue — ${COMPANY_CONFIG.shortName}`}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={headerBanner}>
                        <Heading style={heading}>
                            {COMPANY_CONFIG.shortName} • PARTENAIRES AFRIQUE
                        </Heading>
                        <Text style={tagline}>{COMPANY_CONFIG.slogan}</Text>
                    </Section>

                    <Section style={contentSection}>
                        <Text style={paragraph}>
                            {isAdminCopy
                                ? "Une nouvelle entreprise souhaite rejoindre le réseau de transporteurs et loueurs partenaires :"
                                : `Bonjour ${contactName},`}
                        </Text>

                        {!isAdminCopy && (
                            <Text style={paragraph}>
                                Nous avons bien reçu la candidature de{" "}
                                <strong>{companyName}</strong>. Notre équipe
                                conformité & exploitation examine actuellement vos
                                documents et capacités matérielles, et
                                reviendra vers vous sous 48h ouvrées.
                            </Text>
                        )}

                        <Section style={summaryCard}>
                            <Text style={line}>
                                <strong>Entreprise :</strong> {companyName}
                            </Text>
                            <Text style={line}>
                                <strong>Contact :</strong> {contactName}
                            </Text>
                            <Text style={line}>
                                <strong>Localisation :</strong> {city},{" "}
                                {country}
                            </Text>
                            <Text style={line}>
                                <strong>Catégorie :</strong> {category}
                            </Text>
                            <Text style={line}>
                                <strong>Flotte déclarée :</strong>{" "}
                                {fleetSummary}
                            </Text>
                        </Section>

                        <Hr style={hr} />

                        <Text style={footerText}>
                            {COMPANY_CONFIG.legalName} —{" "}
                            {COMPANY_CONFIG.contact.email} |{" "}
                            {COMPANY_CONFIG.contact.phoneDisplay}
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default PartnerApplicationEmail;

const main: React.CSSProperties = {
    backgroundColor: "#f4f6f9",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
    padding: "24px 0",
};

const container: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "600px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
};

const headerBanner: React.CSSProperties = {
    backgroundColor: "#003366",
    padding: "24px",
    textAlign: "center",
};

const heading: React.CSSProperties = {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 4px 0",
};

const tagline: React.CSSProperties = {
    color: "#cbd5e1",
    fontSize: "12px",
    margin: 0,
};

const contentSection: React.CSSProperties = {
    padding: "24px",
};

const paragraph: React.CSSProperties = {
    color: "#334155",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
};

const summaryCard: React.CSSProperties = {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e2e8f0",
};

const line: React.CSSProperties = {
    color: "#1e293b",
    fontSize: "14px",
    margin: "6px 0",
};

const hr: React.CSSProperties = {
    borderColor: "#e2e8f0",
    margin: "24px 0 16px 0",
};

const footerText: React.CSSProperties = {
    color: "#94a3b8",
    fontSize: "12px",
    textAlign: "center",
    margin: 0,
};
