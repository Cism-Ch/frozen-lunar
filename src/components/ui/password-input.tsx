"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
    extends Omit<React.ComponentProps<"input">, "type"> {
    wrapperClassName?: string;
}

/**
 * Champ mot de passe accessible avec bouton intégré d'affichage/masquage.
 */
export const PasswordInput = React.forwardRef<
    HTMLInputElement,
    PasswordInputProps
>(function PasswordInput({ className, wrapperClassName, ...props }, ref) {
    const [visible, setVisible] = React.useState(false);

    return (
        <div className={cn("relative", wrapperClassName)}>
            <Input
                ref={ref}
                type={visible ? "text" : "password"}
                className={cn("pr-10", className)}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible((prev) => !prev)}
                aria-label={
                    visible
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                }
                aria-pressed={visible}
                tabIndex={-1}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
                {visible ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
});
