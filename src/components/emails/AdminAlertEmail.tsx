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

export interface AdminAlertEmailProps {
    title: string;
    severity: "info" | "warning" | "critical";
    source: string;
    summary: string;
    details?: string;
    timestamp: string;
}

const SEVERITY_COLORS: Record<
    AdminAlertEmailProps["severity"],
    { bg: string; border: string; text: string; label: string }
> = {
    info: {
        bg: "#eff6ff",
        border: "#bfdbfe",
        text: "#1d4ed8",
        label: "INFORMATION SYSTÈME",
    },
    warning: {
        bg: "#fffbeb",
        border: "#fde68a",
        text: "#b45309",
        label: "AVERTISSEMENT OPÉRATIONNEL",
    },
    critical: {
        bg: "#fef2f2",
        border: "#fecaca",
        text: "#b91c1c",
        label: "ALERTE CRITIQUE",
    },
};

export const AdminAlertEmail = ({
    title,
    severity,
    source,
    summary,
    details,
    timestamp,
}: AdminAlertEmailProps) => {
    const theme = SEVERITY_COLORS[severity];

    return (
        <Html>
            <Head />
            <Preview>
                [{theme.label}] {title} — {COMPANY_CONFIG.shortName}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={headerBanner}>
                        <Heading style={heading}>
                            {COMPANY_CONFIG.shortName} • SUPERVISION
                        </Heading>
                        <Text style={tagline}>{COMPANY_CONFIG.slogan}</Text>
                    </Section>

                    <Section style={contentSection}>
                        <Section
                            style={{
                                backgroundColor: theme.bg,
                                border: `1px solid ${theme.border}`,
                                borderRadius: "8px",
                                padding: "12px 16px",
                                marginBottom: "20px",
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.text,
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    letterSpacing: "0.8px",
                                    margin: "0 0 4px 0",
                                }}
                            >
                                {theme.label}
                            </Text>
                            <Text style={alertTitle}>{title}</Text>
                        </Section>

                        <Text style={paragraph}>{summary}</Text>

                        <Section style={metaBox}>
                            <Text style={metaLine}>
                                <strong>Source :</strong> {source}
                            </Text>
                            <Text style={metaLine}>
                                <strong>Horodatage :</strong> {timestamp}
                            </Text>
                            {details && (
                                <Text style={metaLine}>
                                    <strong>Détails :</strong> {details}
                                </Text>
                            )}
                        </Section>

                        <Hr style={hr} />

                        <Text style={footerText}>
                            {COMPANY_CONFIG.legalName} —{" "}
                            {COMPANY_CONFIG.address.city},{" "}
                            {COMPANY_CONFIG.address.country}
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default AdminAlertEmail;

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
    backgroundColor: "#0f172a",
    padding: "24px",
    textAlign: "center",
};

const heading: React.CSSProperties = {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: 700,
    margin: "0 0 4px 0",
};

const tagline: React.CSSProperties = {
    color: "#38bdf8",
    fontSize: "12px",
    margin: 0,
};

const contentSection: React.CSSProperties = {
    padding: "24px",
};

const alertTitle: React.CSSProperties = {
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: 700,
    margin: 0,
};

const paragraph: React.CSSProperties = {
    color: "#334155",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
};

const metaBox: React.CSSProperties = {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
};

const metaLine: React.CSSProperties = {
    color: "#475569",
    fontSize: "13px",
    margin: "4px 0",
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
