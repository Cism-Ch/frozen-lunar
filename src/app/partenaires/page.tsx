import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { PartnerBenefitsSection } from "@/components/features/partners/PartnerBenefitsSection";
import { PartnerApplicationWizard } from "@/components/features/partners/PartnerApplicationWizard";

export default function PartnersPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <SectionContainer className="bg-background pt-12 md:pt-16">
                    <PartnerBenefitsSection />
                    <PartnerApplicationWizard />
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
