"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/useHasMounted";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useHasMounted();

    if (!mounted) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 sm:h-9 sm:w-9"
                disabled
                aria-label="Changer de thème"
            />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative h-11 w-11 shrink-0 sm:h-9 sm:w-9"
            title={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
            aria-label={
                isDark ? "Passer en thème clair" : "Passer en thème sombre"
            }
        >
            {isDark ? (
                <Sun className="h-4 w-4 transition-transform duration-200" />
            ) : (
                <Moon className="h-4 w-4 transition-transform duration-200" />
            )}
            <span className="sr-only">Changer de thème</span>
        </Button>
    );
}
