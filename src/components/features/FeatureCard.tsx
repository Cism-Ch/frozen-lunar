import { FeatureItem } from "@/types/marketing";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps extends FeatureItem {
  className?: string;
}

export function FeatureCard({ title, description, icon: Icon, className }: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden",
        className
      )}
    >
      <CardContent className="p-6 md:p-8 flex flex-col items-center text-center gap-4">
        {/* Icon with gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all">
            <Icon className="h-10 w-10 text-primary" />
          </div>
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
  );
}