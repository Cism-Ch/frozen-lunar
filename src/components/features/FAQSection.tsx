"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQSection() {
    const faqs = [
        {
            question: "Quels types de marchandises transportez-vous ?",
            answer: "Nous transportons une large gamme de marchandises : matériaux de construction, containers, charpentes, machines industrielles, modules préfabriqués et bien plus encore. Contactez-nous pour des besoins spécifiques."
        },
        {
            question: "Comment obtenir un devis ?",
            answer: "Vous pouvez obtenir un devis en remplissant notre formulaire en ligne, en nous appelant au +33 1 23 45 67 89, ou en nous contactant via WhatsApp. Nous vous répondrons dans les 2 heures."
        },
        {
            question: "Quels sont vos délais de livraison ?",
            answer: "Les délais varient selon la distance et le type de marchandise. En général, pour les livraisons locales (Île-de-France), comptez 24-48h. Pour les livraisons nationales, 2-5 jours ouvrés. Nous proposons également un service express."
        },
        {
            question: "Proposez-vous une assurance pour les marchandises ?",
            answer: "Oui, toutes nos livraisons sont assurées. Nous souscrivons une assurance couvrant les dommages éventuels pendant le transport. Des options d'assurance complémentaire sont disponibles pour les marchandises de grande valeur."
        },
        {
            question: "Intervenez-vous en dehors de l'Île-de-France ?",
            answer: "Absolument ! Nous intervenons sur toute la France métropolitaine. Nous avons également des partenaires en Europe pour les transports internationaux."
        },
        {
            question: "Proposez-vous le chargement et le déchargement ?",
            answer: "Oui, nous proposons un service complet incluant le chargement, le transport sécurisé et le déchargement. Notre équipe est formée pour manipuler tous types de marchandises avec le plus grand soin."
        }
    ]

    return (
        <section className="py-12 md:py-24 bg-muted/30">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Questions Fréquentes
                    </h2>
                    <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                        Trouvez rapidement les réponses à vos questions
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    )
}
