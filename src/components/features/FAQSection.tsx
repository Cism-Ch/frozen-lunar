"use client";

import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { COMPANY_CONFIG } from "@/lib/company-config";
import {
    ScrollReveal,
    StaggerContainer,
    StaggerItem,
    motion,
} from "@/components/ui/motion";

const faqs = [
    {
        question: "Quels types de marchandises transportez-vous ?",
        answer: "Nous transportons une large gamme de marchandises : matériaux de construction, conteneurs maritimes (20' et 40'), charpentes métalliques, machines industrielles, engins de chantier, modules préfabriqués et bien plus encore. Contactez-nous pour des besoins spécifiques.",
    },
    {
        question: "Comment obtenir un devis ?",
        answer: `Vous pouvez obtenir un devis en remplissant notre formulaire en ligne, en nous appelant au ${COMPANY_CONFIG.contact.phoneDisplay}, ou en nous contactant directement via WhatsApp. Notre équipe vous répond sous 2 heures ouvrées.`,
    },
    {
        question: "Quels sont vos délais de livraison ?",
        answer: "Les délais varient selon la distance, l'état des axes et le type de convoi. En général, pour les livraisons dans le Grand Abidjan, comptez 24h. Pour les corridors nationaux en Côte d'Ivoire (Yamoussoukro, Bouaké, San-Pédro, Korhogo), comptez 24 à 72h. Un service express dédié est également disponible.",
    },
    {
        question: "Proposez-vous une assurance pour les marchandises ?",
        answer: "Oui, toutes nos prestations respectent le cadre de l'Acte Uniforme OHADA (AUCTMR) et disposent d'une couverture responsabilité civile transporteur. Des options d'assurance facultés ad valorem sont disponibles sur demande pour les engins et cargaisons de grande valeur.",
    },
    {
        question: "Intervenez-vous en dehors du Grand Abidjan ?",
        answer: "Absolument ! Nous couvrons toute la Côte d'Ivoire (Abidjan, Port Autonome d'Abidjan, Port de San-Pédro, Yamoussoukro, Bouaké, Korhogo, Daloa, Man, Abengourou) ainsi que les corridors de la sous-région UEMOA / CEDEAO (Mali, Burkina Faso, Ghana, Niger).",
    },
    {
        question: "Proposez-vous le chargement et le déchargement ?",
        answer: "Oui, nous proposons un service clé en main incluant le chargement, l'arrimage sécurisé, le transport et le déchargement avec camions-grues ou porte-chars adaptés.",
    },
];

export function FAQSection() {
    return (
        <SectionContainer className="bg-background">
            <ScrollReveal className="mb-16 space-y-4 text-center">
                <Badge variant="outline" className="mb-2">
                    FAQ
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Questions Fréquentes
                </h2>
                <p className="text-muted-foreground mx-auto max-w-[700px] text-lg md:text-xl">
                    Trouvez rapidement les réponses à vos questions
                </p>
            </ScrollReveal>

            <div className="mx-auto max-w-3xl">
                <StaggerContainer staggerSpeed="fast">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-4"
                    >
                        {faqs.map((faq, index) => (
                            <StaggerItem key={index}>
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25,
                                    }}
                                >
                                    <AccordionItem
                                        value={`item-${index}`}
                                        className="hover:border-primary/50 data-[state=open]:border-primary/50 rounded-lg border-2 px-6 transition-colors"
                                    >
                                        <AccordionTrigger className="group py-6 text-left hover:no-underline">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 flex-shrink-0">
                                                    <motion.div
                                                        className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors"
                                                        whileHover={{
                                                            rotate: 15,
                                                        }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 300,
                                                        }}
                                                    >
                                                        <HelpCircle className="text-primary h-5 w-5" />
                                                    </motion.div>
                                                </div>
                                                <span className="group-hover:text-primary text-lg font-semibold transition-colors">
                                                    {faq.question}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground pb-6 pl-16 leading-relaxed">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            </StaggerItem>
                        ))}
                    </Accordion>
                </StaggerContainer>
            </div>
        </SectionContainer>
    );
}
