"use client";

import { FeatureItem } from "@/types/marketing";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCard, IconFloat, motion } from "@/components/ui/motion";

interface FeatureCardProps extends FeatureItem {
  className?: string;
}

export function FeatureCard({ title, description, icon: Icon, className }: FeatureCardProps) {
  return (
    <AnimatedCard hoverEffect="lift" className={cn("h-full", className)}>
      <Card
        className="group border-2 hover:border-primary/50 transition-colors duration-300 overflow-hidden h-full"
      >
        <CardContent className="p-6 md:p-8 flex flex-col items-center text-center gap-4">
          {/* Icon with gradient background */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              initial={{ scale: 1, opacity: 0.5 }}
              whileHover={{ scale: 1.2, opacity: 0.8 }}
              transition={{ duration: 0.3 }}
            />
            <IconFloat>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all">
                <Icon className="h-10 w-10 text-primary" />
              </div>
            </IconFloat>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl md:text-2xl group-hover:text-primary transition-colors">
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