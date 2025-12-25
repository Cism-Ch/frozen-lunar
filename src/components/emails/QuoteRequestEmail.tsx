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

interface QuoteRequestEmailProps {
    clientName: string;
    email: string;
    phone: string;
    pickup: string;
    dropoff: string;
    itemType: string;
    date: string;
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
    quoteId,
}: QuoteRequestEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Nouvelle demande de devis de {clientName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>HBC Logistique</Heading>
                    <Text style={paragraph}>Bonjour,</Text>
                    <Text style={paragraph}>
                        Une nouvelle demande de devis a été reçue. Voici les détails :
                    </Text>

                    <Section style={section}>
                        <Text style={subHeading}>Client</Text>
                        <Text style={text}>Nom: {clientName}</Text>
                        <Text style={text}>Email: {email}</Text>
                        <Text style={text}>Tél: {phone}</Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={section}>
                        <Text style={subHeading}>Logistique</Text>
                        <Text style={text}>Type: {itemType}</Text>
                        <Text style={text}>Départ: {pickup}</Text>
                        <Text style={text}>Arrivée: {dropoff}</Text>
                        <Text style={text}>Date souhaitée: {date}</Text>
                    </Section>

                    <Hr style={hr} />

                    <Text style={paragraph}>
                        ID du devis : <strong>{quoteId}</strong>
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
};

const heading = {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#484848",
    textAlign: "center" as const,
};

const paragraph = {
    fontSize: "18px",
    lineHeight: "1.4",
    color: "#484848",
    padding: "0 24px",
};

const section = {
    padding: "0 24px",
};

const subHeading = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#484848",
    marginBottom: "12px",
};

const text = {
    fontSize: "16px",
    margin: "4px 0",
    color: "#555",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

export default QuoteRequestEmail;
