import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Safely formats a date string or Date object with fallback behavior
 * @param dateInput - The date string or Date object to format
 * @param formatStr - The date-fns format string (default: "dd MMMM yyyy")
 * @param fallback - Fallback text when date is invalid (default: "Date invalide")
 * @returns Formatted date string or fallback text
 */
export function safeFormatDate(
    dateInput: string | Date | undefined | null,
    formatStr: string = "dd MMMM yyyy",
    fallback: string = "Date invalide"
): string {
    if (!dateInput) {
        return fallback;
    }

    try {
        const date =
            dateInput instanceof Date ? dateInput : new Date(dateInput);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.warn("Invalid date value:", dateInput);
            return fallback;
        }

        return format(date, formatStr, { locale: fr });
    } catch (error) {
        console.error("Error formatting date:", dateInput, error);
        return fallback;
    }
}

/**
 * Safely creates a Date object with validation
 * @param dateInput - The date string or Date object to parse
 * @returns Valid Date object or null
 */
export function safeParseDate(
    dateInput: string | Date | undefined | null
): Date | null {
    if (!dateInput) {
        return null;
    }

    try {
        const date =
            dateInput instanceof Date ? dateInput : new Date(dateInput);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.warn("Invalid date value:", dateInput);
            return null;
        }

        return date;
    } catch (error) {
        console.error("Error parsing date:", dateInput, error);
        return null;
    }
}
