import { QuoteWizard } from "@/components/features/QuoteWizard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function DevisPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-12 md:py-24">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Demandez votre devis
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Remplissez le formulaire ci-dessous pour recevoir une estimation rapide et précise.
                        </p>
                    </div>
                    <QuoteWizard />
                </div>
            </main>
            <Footer />
        </div>
    );
}
