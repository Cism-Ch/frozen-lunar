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
    Link,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
    name: string;
    resetUrl: string;
    role?: string;
    expiresInMinutes?: number;
}

export const PasswordResetEmail = ({
    name,
    resetUrl,
    role = "user",
    expiresInMinutes = 60,
}: PasswordResetEmailProps) => {
    const isAdmin = role === "admin";
    const previewText = isAdmin
        ? "Réinitialisation de votre mot de passe Administrateur - HBC Logistique"
        : "Réinitialisation de votre mot de passe - HBC Logistique";

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header Banner */}
                    <Section style={headerBanner}>
                        <Heading style={heading}>HBC LOGISTIQUE</Heading>
                        <Text style={tagline}>
                            Votre sécurité, Notre priorité
                        </Text>
                    </Section>

                    <Section style={contentSection}>
                        {/* Role Detection Badge */}
                        <Section style={badgeContainer}>
                            <Text
                                style={
                                    isAdmin ? adminBadgeStyle : userBadgeStyle
                                }
                            >
                                {isAdmin
                                    ? "🛡️ Espace Administration • Accès Sécurisé"
                                    : "👤 Espace Compte Client / Utilisateur"}
                            </Text>
                        </Section>

                        <Text style={paragraph}>Bonjour {name},</Text>

                        <Text style={paragraph}>
                            {isAdmin
                                ? "Une demande de réinitialisation de mot de passe a été initiée pour votre compte Administrateur HBC Logistique."
                                : "Une demande de réinitialisation de mot de passe a été initiée pour votre compte HBC Logistique."}
                        </Text>

                        <Text style={paragraph}>
                            Pour définir votre nouveau mot de passe et débloquer
                            l&apos;accès sécurisé à votre espace, cliquez sur le
                            bouton ci-dessous :
                        </Text>

                        {/* CTA Button */}
                        <Section style={buttonContainer}>
                            <Button style={button} href={resetUrl}>
                                Réinitialiser mon mot de passe
                            </Button>
                        </Section>

                        <Text style={expiryText}>
                            ⏱️ <strong>Validité :</strong> Ce lien expirera
                            automatiquement dans{" "}
                            <strong>{expiresInMinutes} minutes</strong> et
                            n&apos;est utilisable qu&apos;une seule fois.
                        </Text>

                        {/* Admin Security Guidance */}
                        {isAdmin && (
                            <Section style={securityBox}>
                                <Text style={securityBoxTitle}>
                                    🔒 Recommandations Administrateur
                                </Text>
                                <Text style={securityBoxText}>
                                    Votre mot de passe doit comporter au moins
                                    12 caractères, incluant majuscules,
                                    minuscules, chiffres et caractères spéciaux
                                    pour garantir la sécurité de la plateforme.
                                </Text>
                            </Section>
                        )}

                        <Hr style={divider} />

                        {/* Fallback URL */}
                        <Text style={fallbackText}>
                            Si le bouton ne fonctionne pas, copiez et collez
                            directement ce lien dans la barre d&apos;adresse de
                            votre navigateur :
                        </Text>
                        <Text style={linkText}>
                            <Link href={resetUrl} style={link}>
                                {resetUrl}
                            </Link>
                        </Text>

                        <Hr style={divider} />

                        <Text style={disclaimerText}>
                            Si vous n&apos;avez pas demandé cette
                            réinitialisation, vous pouvez ignorer cet email en
                            toute sécurité. Votre mot de passe actuel demeure
                            inchangé et protégé.
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footerSection}>
                        <Text style={footerText}>
                            HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE
                        </Text>
                        <Text style={footerSubtext}>
                            Plateforme de transport spécialisé & logistique
                            sécurisée
                        </Text>
                        <Text style={footerSubtext}>
                            &copy; {new Date().getFullYear()} HBC Logistique.
                            Tous droits réservés.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default PasswordResetEmail;

// --- Styles en ligne conformes React Email ---

const main: React.CSSProperties = {
    backgroundColor: "#f4f5f7",
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: "32px 0",
};

const container: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "580px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e2e8f0",
};

const headerBanner: React.CSSProperties = {
    backgroundColor: "#0f172a",
    padding: "32px 24px 28px",
    textAlign: "center" as const,
};

const heading: React.CSSProperties = {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    margin: "0 0 6px 0",
    textTransform: "uppercase" as const,
};

const tagline: React.CSSProperties = {
    color: "#38bdf8",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.5px",
    margin: 0,
};

const contentSection: React.CSSProperties = {
    padding: "32px 28px 24px",
};

const badgeContainer: React.CSSProperties = {
    marginBottom: "18px",
};

const adminBadgeStyle: React.CSSProperties = {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: "9999px",
    border: "1px solid #fde68a",
    margin: 0,
};

const userBadgeStyle: React.CSSProperties = {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: "9999px",
    border: "1px solid #bae6fd",
    margin: 0,
};

const paragraph: React.CSSProperties = {
    color: "#334155",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
};

const buttonContainer: React.CSSProperties = {
    textAlign: "center" as const,
    margin: "28px 0 24px 0",
};

const button: React.CSSProperties = {
    backgroundColor: "#0284c7",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 600,
    padding: "14px 28px",
    textAlign: "center" as const,
    textDecoration: "none",
    boxShadow: "0 2px 8px rgba(2, 132, 199, 0.35)",
};

const expiryText: React.CSSProperties = {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 20px 0",
    textAlign: "center" as const,
};

const securityBox: React.CSSProperties = {
    backgroundColor: "#f8fafc",
    borderLeft: "4px solid #0284c7",
    padding: "12px 16px",
    borderRadius: "4px",
    margin: "18px 0",
};

const securityBoxTitle: React.CSSProperties = {
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: 700,
    margin: "0 0 4px 0",
};

const securityBoxText: React.CSSProperties = {
    color: "#475569",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: 0,
};

const divider: React.CSSProperties = {
    borderColor: "#e2e8f0",
    borderWidth: "1px 0 0 0",
    margin: "24px 0",
};

const fallbackText: React.CSSProperties = {
    color: "#64748b",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "0 0 6px 0",
};

const linkText: React.CSSProperties = {
    margin: 0,
    wordBreak: "break-all" as const,
};

const link: React.CSSProperties = {
    color: "#0284c7",
    fontSize: "12px",
    textDecoration: "underline",
};

const disclaimerText: React.CSSProperties = {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: 0,
    fontStyle: "italic",
};

const footerSection: React.CSSProperties = {
    backgroundColor: "#0f172a",
    padding: "20px 24px",
    textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
    color: "#f8fafc",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    margin: "0 0 4px 0",
};

const footerSubtext: React.CSSProperties = {
    color: "#64748b",
    fontSize: "11px",
    margin: "0 0 2px 0",
};
