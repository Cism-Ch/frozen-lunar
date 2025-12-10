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

export function ServiceCard({ title, description, icon: Icon, badge, href = "/services" }: ServiceCardProps) {
  return (
    <AnimatedCard hoverEffect="lift" className="h-full">
      <Card
        className="
          group relative
          border-2 hover:border-primary/50
          transition-colors duration-300
          overflow-hidden
          h-full
        "
      >
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="default" className="font-semibold">
              {badge}
            </Badge>
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="pb-4 relative">
          {/* Icon */}
          <IconFloat>
            <div
              className="
                mb-4
                inline-flex
                h-16 w-16
                items-center justify-center
                rounded-2xl
                bg-primary/10 
                group-hover:bg-primary/20
                transition-colors duration-300
              "
            >
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </IconFloat>

          <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-4">
          <p className="text-muted-foreground leading-relaxed min-h-[60px]">
            {description}
          </p>

          {/* CTA Button */}
          <Button
            variant="ghost"
            className="group/btn p-0 h-auto font-semibold text-primary hover:text-primary hover:bg-transparent"
            asChild
          >
            <a href={href} className="inline-flex items-center gap-2">
              En savoir plus
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
