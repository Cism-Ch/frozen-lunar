"use client";

import { FeatureItem } from "@/types/marketing";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCard, IconFloat, motion } from "@/components/ui/motion";

interface FeatureCardProps extends FeatureItem {
    className?: string;
}

export function FeatureCard({
    title,
    description,
    icon: Icon,
    className,
}: FeatureCardProps) {
    return (
        <AnimatedCard hoverEffect="lift" className={cn("h-full", className)}>
            <Card className="group hover:border-primary/50 h-full overflow-hidden border-2 transition-colors duration-300">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center md:p-8">
                    {/* Icon with gradient background */}
                    <div className="relative">
                        <motion.div
                            className="bg-primary/20 absolute inset-0 rounded-full blur-xl"
                            initial={{ scale: 1, opacity: 0.5 }}
                            whileHover={{ scale: 1.2, opacity: 0.8 }}
                            transition={{ duration: 0.3 }}
                        />
                        <IconFloat>
                            <div className="from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 relative rounded-2xl bg-gradient-to-br p-4 transition-all">
                                <Icon className="text-primary h-10 w-10" />
                            </div>
                        </IconFloat>
                    </div>

                    {/* Title */}
                    <h3 className="group-hover:text-primary text-xl font-bold transition-colors md:text-2xl">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </AnimatedCard>
    );
}
