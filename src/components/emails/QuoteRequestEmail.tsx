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

interface QuoteRequestEmailProps {
    clientName: string;
    email: string;
    phone: string;
    pickup: string;
    dropoff: string;
    itemType: string;
    date: string;
    createdAt?: string;
    quoteId: string;
}

export const QuoteRequestEmail = ({
    clientName,
    email,
    phone,
    pickup,
    dropoff,
    itemType,
    date,
    createdAt,
    quoteId,
}: QuoteRequestEmailProps) => {
    const siteUrl =
        process.env.NEXT_PUBLIC_APP_URL || COMPANY_CONFIG.contact.website;

    return (
        <Html lang="fr">
            <Head />
            <Preview>
                Nouvelle demande de devis {quoteId} — {clientName}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={headerBanner}>
                        <Text style={brandEyebrow}>
                            EXPLOITATION ADMIN • NOUVEAU DOSSIER
                        </Text>
                        <Heading style={heading}>HBC LOGISTIQUE</Heading>
                    </Section>
                    <Section style={accentBar} />

                    <Section style={contentSection}>
                        <Section style={refBox}>
                            <Text style={refLabel}>RÉFÉRENCE DU DEVIS</Text>
                            <Text style={refValue}>{quoteId}</Text>
                            {createdAt && (
                                <Text style={refTimestamp}>
                                    Reçu le {createdAt}
                                </Text>
                            )}
                        </Section>

                        <Section style={card}>
                            <Text style={subHeading}>DONNEUR D&apos;ORDRE</Text>
                            <Hr style={cardHr} />
                            <Text style={text}>
                                <strong>Client :</strong> {clientName}
                            </Text>
                            <Text style={text}>
                                <strong>Email :</strong> {email}
                            </Text>
                            <Text style={textLast}>
                                <strong>Téléphone :</strong> {phone}
                            </Text>
                        </Section>

                        <Section style={card}>
                            <Text style={subHeading}>
                                LOGISTIQUE &amp; ÉCHÉANCE
                            </Text>
                            <Hr style={cardHr} />
                            <Text style={text}>
                                <strong>Fret / Prestation :</strong> {itemType}
                            </Text>
                            <Text style={text}>
                                <strong>Départ :</strong> {pickup}
                            </Text>
                            <Text style={text}>
                                <strong>Arrivée :</strong> {dropoff}
                            </Text>
                            <Text style={textLast}>
                                <strong>Date &amp; heure souhaitée :</strong>{" "}
                                {date}
                            </Text>
                        </Section>

                        <Section style={buttonContainer}>
                            <Button
                                style={ctaButton}
                                href={`${siteUrl}/admin/quotes`}
                            >
                                Ouvrir dans l&apos;administration
                            </Button>
                        </Section>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default QuoteRequestEmail;

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
    padding: "24px 24px 18px",
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
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    margin: "0",
};

const contentSection: React.CSSProperties = {
    padding: "24px 28px",
};

const refBox: React.CSSProperties = {
    backgroundColor: "#0B1219",
    borderRadius: "10px",
    padding: "14px 18px",
    textAlign: "center",
    marginBottom: "18px",
};

const refLabel: React.CSSProperties = {
    color: "#92A9BE",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    margin: "0 0 4px 0",
};

const refValue: React.CSSProperties = {
    color: "#FF7C24",
    fontSize: "18px",
    fontWeight: 800,
    fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace",
    margin: "0",
};

const refTimestamp: React.CSSProperties = {
    color: "#CBD5E1",
    fontSize: "11.5px",
    margin: "5px 0 0 0",
};

const card: React.CSSProperties = {
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "16px 20px",
    marginBottom: "16px",
};

const subHeading: React.CSSProperties = {
    color: "#001F3D",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
    margin: "0 0 8px 0",
};

const cardHr: React.CSSProperties = {
    borderColor: "#E2E8F0",
    margin: "0 0 10px 0",
};

const text: React.CSSProperties = {
    color: "#334155",
    fontSize: "14px",
    lineHeight: "21px",
    margin: "0 0 6px 0",
};

const textLast: React.CSSProperties = {
    color: "#334155",
    fontSize: "14px",
    lineHeight: "21px",
    margin: "0",
};

const buttonContainer: React.CSSProperties = {
    textAlign: "center",
    margin: "20px 0 6px",
};

const ctaButton: React.CSSProperties = {
    backgroundColor: "#001F3D",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    padding: "12px 24px",
    display: "inline-block",
};
