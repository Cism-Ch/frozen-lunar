"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon, ArrowRight } from "lucide-react";
import { AnimatedCard, IconFloat, motion } from "@/components/ui/motion";

interface ServiceCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    badge?: string;
    href?: string;
}

export function ServiceCard({
    title,
    description,
    icon: Icon,
    badge,
    href = "/services",
}: ServiceCardProps) {
    return (
        <AnimatedCard hoverEffect="lift" className="h-full">
            <Card className="group hover:border-primary/50 relative h-full overflow-hidden border-2 transition-colors duration-300">
                {/* Badge */}
                {badge && (
                    <div className="absolute top-4 right-4 z-10">
                        <Badge variant="default" className="font-semibold">
                            {badge}
                        </Badge>
                    </div>
                )}

                {/* Gradient Overlay on Hover */}
                <div className="from-primary/0 via-primary/0 to-primary/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <CardHeader className="relative pb-4">
                    {/* Icon */}
                    <IconFloat>
                        <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300">
                            <Icon className="text-primary h-8 w-8" />
                        </div>
                    </IconFloat>

                    <CardTitle className="group-hover:text-primary text-2xl font-bold transition-colors">
                        {title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="relative space-y-4">
                    <p className="text-muted-foreground min-h-[60px] leading-relaxed">
                        {description}
                    </p>

                    {/* CTA Button */}
                    <Button
                        variant="ghost"
                        className="group/btn text-primary hover:text-primary h-auto p-0 font-semibold hover:bg-transparent"
                        asChild
                    >
                        <a
                            href={href}
                            className="inline-flex items-center gap-2"
                        >
                            En savoir plus
                            <motion.span
                                initial={{ x: 0 }}
                                whileHover={{ x: 4 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 20,
                                }}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </motion.span>
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </AnimatedCard>
    );
}
