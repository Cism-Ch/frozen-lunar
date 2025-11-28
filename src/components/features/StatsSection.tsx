"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Clock, Award } from "lucide-react"

export function StatsSection() {
    const stats = [
        {
            icon: Users,
            value: "500+",
            label: "Clients Satisfaits",
            suffix: ""
        },
        {
            icon: Clock,
            value: "10",
            label: "Ans d'Expérience",
            suffix: ""
        },
        {
            icon: TrendingUp,
            value: "24/7",
            label: "Disponibilité",
            suffix: ""
        },
        {
            icon: Award,
            value: "100",
            label: "Taux de Satisfaction",
            suffix: "%"
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    }

    return (
        <section className="py-16 md:py-20 bg-background-subtle">
            <div className="container px-4 md:px-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="flex flex-col items-center text-center p-8 rounded-lg bg-card border hover:border-strong shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="p-3 rounded-full bg-primary/10 mb-4">
                                <stat.icon className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-5xl md:text-6xl font-bold text-foreground mb-3">
                                {stat.value}{stat.suffix}
                            </div>
                            <div className="text-sm font-medium text-foreground-muted">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
