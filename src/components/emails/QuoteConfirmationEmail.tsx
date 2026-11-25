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

interface QuoteConfirmationEmailProps {
    clientName: string;
    pickup: string;
    dropoff: string;
    itemType: string;
    date: string;
    createdAt?: string;
    quoteId: string;
}

export const QuoteConfirmationEmail = ({
    clientName,
    pickup,
    dropoff,
    itemType,
    date,
    createdAt,
    quoteId,
}: QuoteConfirmationEmailProps) => {
    const siteUrl =
        process.env.NEXT_PUBLIC_APP_URL || COMPANY_CONFIG.contact.website;

    return (
        <Html lang="fr">
            <Head />
            <Preview>
                Confirmation de votre demande de devis {quoteId} —{" "}
                {COMPANY_CONFIG.shortName}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Bandeau Institutionnel HBC Logistique */}
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
                        <Text style={paragraph}>
                            Nous vous confirmons la bonne réception de votre
                            demande de devis. Notre cellule d&apos;exploitation
                            étudie votre besoin et reviendra vers vous sous{" "}
                            <strong>24h ouvrées</strong> avec une proposition
                            chiffrée sur mesure.
                        </Text>

                        {/* Badge Référence Horodatée */}
                        <Section style={refBox}>
                            <Text style={refLabel}>
                                RÉFÉRENCE DE SUIVI DU DOSSIER
                            </Text>
                            <Text style={refValue}>{quoteId}</Text>
                            {createdAt && (
                                <Text style={refTimestamp}>
                                    Enregistré le {createdAt}
                                </Text>
                            )}
                        </Section>

                        {/* Carte Récapitulative */}
                        <Section style={summaryCard}>
                            <Text style={cardTitle}>
                                DÉTAILS DE VOTRE OPÉRATION
                            </Text>
                            <Hr style={cardHr} />
                            <Text style={itemText}>
                                <strong style={labelStrong}>Prestation :</strong>{" "}
                                {itemType}
                            </Text>
                            <Text style={itemText}>
                                <strong style={labelStrong}>
                                    Enlèvement / Départ :
                                </strong>{" "}
                                {pickup}
                            </Text>
                            <Text style={itemText}>
                                <strong style={labelStrong}>
                                    Livraison / Arrivée :
                                </strong>{" "}
                                {dropoff}
                            </Text>
                            <Text style={itemTextLast}>
                                <strong style={labelStrong}>
                                    Échéance souhaitée :
                                </strong>{" "}
                                {date}
                            </Text>
                        </Section>

                        <Text style={paragraph}>
                            Suivez l&apos;avancement de votre dossier, téléchargez
                            votre devis PDF et échangez directement avec votre
                            validateur depuis votre Espace Client.
                        </Text>

                        <Section style={buttonContainer}>
                            <Button
                                style={ctaButton}
                                href={`${siteUrl}/espace-client`}
                            >
                                Suivre mon devis dans mon espace
                            </Button>
                        </Section>

                        <Text style={secondaryNote}>
                            Besoin d&apos;une précision immédiate ? Contactez notre
                            exploitation au{" "}
                            <strong>{COMPANY_CONFIG.contact.phoneDisplay}</strong>{" "}
                            ou par retour d&apos;email.
                        </Text>

                        <Hr style={hr} />

                        <Text style={footerText}>
                            <strong>{COMPANY_CONFIG.legalName}</strong>
                            <br />
                            {COMPANY_CONFIG.address.street},{" "}
                            {COMPANY_CONFIG.address.city} —{" "}
                            {COMPANY_CONFIG.address.country}
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

export default QuoteConfirmationEmail;

const main: React.CSSProperties = {
    backgroundColor: "#F2F5F7",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
    padding: "28px 12px",
};

const container: React.CSSProperties = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "600px",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #E2E8F0",
};

const headerBanner: React.CSSProperties = {
    backgroundColor: "#001F3D",
    padding: "28px 24px 22px",
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
    fontSize: "24px",
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
    margin: "0 0 12px 0",
};

const paragraph: React.CSSProperties = {
    color: "#334155",
    fontSize: "14.5px",
    lineHeight: "23px",
    margin: "0 0 18px 0",
};

const refBox: React.CSSProperties = {
    backgroundColor: "#0B1219",
    borderRadius: "10px",
    padding: "16px 20px",
    textAlign: "center",
    marginBottom: "20px",
};

const refLabel: React.CSSProperties = {
    color: "#92A9BE",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    margin: "0 0 6px 0",
};

const refValue: React.CSSProperties = {
    color: "#FF7C24",
    fontSize: "19px",
    fontWeight: 800,
    fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace",
    letterSpacing: "0.5px",
    margin: "0",
};

const refTimestamp: React.CSSProperties = {
    color: "#CBD5E1",
    fontSize: "11.5px",
    margin: "6px 0 0 0",
};

const summaryCard: React.CSSProperties = {
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "18px 20px",
    marginBottom: "22px",
};

const cardTitle: React.CSSProperties = {
    color: "#001F3D",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
    margin: "0 0 10px 0",
};

const cardHr: React.CSSProperties = {
    borderColor: "#E2E8F0",
    margin: "0 0 12px 0",
};

const labelStrong: React.CSSProperties = {
    color: "#0F172A",
};

const itemText: React.CSSProperties = {
    color: "#334155",
    fontSize: "14px",
    lineHeight: "21px",
    margin: "0 0 8px 0",
};

const itemTextLast: React.CSSProperties = {
    color: "#334155",
    fontSize: "14px",
    lineHeight: "21px",
    margin: "0",
};

const buttonContainer: React.CSSProperties = {
    textAlign: "center",
    margin: "24px 0 16px",
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

const secondaryNote: React.CSSProperties = {
    color: "#64748B",
    fontSize: "12.5px",
    lineHeight: "19px",
    textAlign: "center",
    margin: "0 0 20px 0",
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
