import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export function ServiceCard({ title, description, icon: Icon }: ServiceCardProps) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border hover:border-strong">
            <CardHeader className="pb-4">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-foreground-muted leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    );
}
