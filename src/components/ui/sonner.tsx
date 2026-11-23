"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            position="top-right"
            duration={6500}
            closeButton
            richColors
            expand
            className="toaster group"
            toastOptions={{
                duration: 6500,
                classNames: {
                    toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl md:min-w-[420px] md:max-w-[500px] md:p-4 md:text-base gap-3 rounded-xl border-2",
                    title: "font-semibold text-sm md:text-[15px] leading-snug",
                    description:
                        "group-[.toast]:text-muted-foreground text-xs md:text-sm leading-relaxed",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium px-3 py-1.5",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    closeButton:
                        "bg-background border-border text-foreground hover:bg-muted",
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
