"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function TestimonialsSection() {
    const testimonials = [
        {
            name: "Jean Dupont",
            company: "Construction Moderne SA",
            content: "Service impeccable ! HBC Logistique a transporté nos matériaux de construction avec un professionnalisme exemplaire. Livraison ponctuelle et équipe très compétente.",
            rating: 5
        },
        {
            name: "Marie Laurent",
            company: "Architecte Indépendante",
            content: "Je recommande vivement HBC pour le transport de modules préfabriqués. Leur attention aux détails et leur souci de la sécurité sont remarquables.",
            rating: 5
        },
        {
            name: "Pierre Martin",
            company: "Industrie Mécanique Pro",
            content: "Transport de machines industrielles effectué sans aucun problème. Prix compétitif et service client réactif. Une entreprise de confiance !",
            rating: 5
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6
            }
        }
    }

    return (
        <section className="py-12 md:py-24 bg-background">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Ce que disent nos clients
                    </h2>
                    <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                        La satisfaction de nos clients est notre priorité absolue.
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.div key={index} variants={cardVariants}>
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <Quote className="h-8 w-8 text-primary/20 mb-4" />
                                    <p className="text-muted-foreground mb-6 italic">
                                        "{testimonial.content}"
                                    </p>
                                    <div className="flex items-center gap-1 mb-3">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                        ))}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
