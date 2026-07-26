import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Safely formats a date string with fallback behavior
 * @param dateString - The date string to format
 * @param formatStr - The date-fns format string (default: "dd MMMM yyyy")
 * @param fallback - Fallback text when date is invalid (default: "Date invalide")
 * @returns Formatted date string or fallback text
 */
export function safeFormatDate(
    dateString: string | undefined | null,
    formatStr: string = "dd MMMM yyyy",
    fallback: string = "Date invalide"
): string {
    if (!dateString) {
        return fallback;
    }

    try {
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.warn("Invalid date value:", dateString);
            return fallback;
        }

        return format(date, formatStr, { locale: fr });
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return fallback;
    }
}

/**
 * Safely creates a Date object with validation
 * @param dateString - The date string to parse
 * @returns Valid Date object or null
 */
export function safeParseDate(
    dateString: string | undefined | null
): Date | null {
    if (!dateString) {
        return null;
    }

    try {
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.warn("Invalid date value:", dateString);
            return null;
        }

        return date;
    } catch (error) {
        console.error("Error parsing date:", dateString, error);
        return null;
    }
}
