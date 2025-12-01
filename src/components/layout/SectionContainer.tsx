import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SectionContainer({ children, className, id }: SectionContainerProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}