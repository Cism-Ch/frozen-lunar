"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Filtre le faux-positif React 19 en environnement de développement.
 * React 19 émet un avertissement lorsqu'une balise <script> est rendue dans l'arbre
 * de composants, ce que fait next-themes pour injecter son script anti-FOUC (Flash of Unstyled Content).
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
        if (
            typeof args[0] === "string" &&
            args[0].includes(
                "Encountered a script tag while rendering React component"
            )
        ) {
            return;
        }
        originalConsoleError.apply(console, args);
    };
}

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
