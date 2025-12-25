import { Prisma } from "@prisma/client";
import { ERROR_CODES, mapPrismaError, createErrorResponse } from "./error-codes";

/**
 * Helper pour gérer les erreurs Prisma de manière type-safe
 * Utilise les classes d'erreur spécifiques de Prisma au lieu de constructor.name
 */

/**
 * Vérifie si une erreur est une erreur Prisma connue
 */
export function isPrismaKnownError(
    error: unknown
): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Vérifie si une erreur est une erreur d'initialisation Prisma
 */
export function isPrismaInitError(
    error: unknown
): error is Prisma.PrismaClientInitializationError {
    return error instanceof Prisma.PrismaClientInitializationError;
}

/**
 * Vérifie si une erreur est une erreur de validation Prisma
 */
export function isPrismaValidationError(
    error: unknown
): error is Prisma.PrismaClientValidationError {
    return error instanceof Prisma.PrismaClientValidationError;
}

/**
 * Gère une erreur Prisma et retourne un message d'erreur approprié
 */
export function handlePrismaError(error: unknown): {
    code: string;
    message: string;
    solution: string;
    httpStatus: number;
    details?: string;
    timestamp: string;
} {
    // Erreur connue avec code d'erreur
    if (isPrismaKnownError(error)) {
        const errorCode = mapPrismaError(error.code);
        
        // Ajouter des détails spécifiques selon le code
        let details = error.message;
        
        // Pour les violations de contrainte unique, extraire le champ concerné
        if (error.code === 'P2002' && error.meta?.target) {
            const target = Array.isArray(error.meta.target) 
                ? error.meta.target.join(', ')
                : String(error.meta.target);
            details = `Champ en conflit: ${target}`;
        }
        
        return {
            ...createErrorResponse(errorCode, details),
            httpStatus: errorCode.httpStatus!
        };
    }
    
    // Erreur d'initialisation (connexion DB, etc.)
    if (isPrismaInitError(error)) {
        const errorResponse = createErrorResponse(
            ERROR_CODES.CONNECTION_FAILED,
            error.message
        );
        return {
            ...errorResponse,
            httpStatus: errorResponse.httpStatus!
        };
    }
    
    // Erreur de validation
    if (isPrismaValidationError(error)) {
        const errorResponse = createErrorResponse(
            ERROR_CODES.INVALID_FORMAT,
            error.message
        );
        return {
            ...errorResponse,
            httpStatus: errorResponse.httpStatus!
        };
    }
    
    // Erreur inconnue
    const errorResponse = createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "Erreur de base de données inconnue"
    );
    return {
        ...errorResponse,
        httpStatus: errorResponse.httpStatus!
    };
}

/**
 * Type guard pour vérifier les erreurs Better Auth
 */
export function isBetterAuthError(error: unknown): error is {
    body?: { 
        message?: string;
        email?: string | null;
        [key: string]: unknown;
    };
    status?: number;
} {
    return (
        error !== null &&
        typeof error === 'object' &&
        'body' in error
    );
}

/**
 * Gère une erreur Better Auth et retourne un message approprié
 */
export function handleBetterAuthError(error: unknown): {
    code: string;
    message: string;
    solution: string;
    httpStatus: number;
    details?: string;
    timestamp: string;
} {
    if (!isBetterAuthError(error)) {
        const errorResponse = createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR);
        return {
            ...errorResponse,
            httpStatus: errorResponse.httpStatus || 500
        };
    }
    
    const body = error.body;
    
    // Erreur d'email null ou manquant
    if (body && (body.email === null || body.email === undefined)) {
        const errorResponse = createErrorResponse(
            ERROR_CODES.EMAIL_REQUIRED,
            "L'email fourni est null ou undefined"
        );
        return {
            ...errorResponse,
            httpStatus: errorResponse.httpStatus || 400
        };
    }
    
    // Message d'erreur générique de Better Auth
    if (body?.message) {
        // Mapper certains messages connus
        // Note: Better Auth ne fournit pas de codes d'erreur structurés,
        // nous devons donc utiliser la correspondance de chaînes.
        // Ceci est intentionnel et suit les limites de l'API Better Auth.
        if (body.message.includes("already exists") || body.message.includes("déjà")) {
            const errorResponse = createErrorResponse(
                ERROR_CODES.UNIQUE_CONSTRAINT,
                body.message
            );
            return {
                ...errorResponse,
                httpStatus: errorResponse.httpStatus!
            };
        }
        
        if (body.message.includes("Invalid credentials") || body.message.includes("incorrect")) {
            const errorResponse = createErrorResponse(
                ERROR_CODES.INVALID_CREDENTIALS,
                body.message
            );
            return {
                ...errorResponse,
                httpStatus: errorResponse.httpStatus!
            };
        }
        
        const errorResponse = createErrorResponse(
            ERROR_CODES.INTERNAL_SERVER_ERROR,
            body.message
        );
        return {
            ...errorResponse,
            httpStatus: errorResponse.httpStatus!
        };
    }
    
    const errorResponse = createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR);
    return {
        ...errorResponse,
        httpStatus: errorResponse.httpStatus!
    };
}

/**
 * Wrapper principal pour gérer toutes les erreurs de manière cohérente
 */
export function handleError(error: unknown): {
    code: string;
    message: string;
    solution: string;
    httpStatus: number;
    details?: string;
    timestamp: string;
} {
    // Log l'erreur pour le débogage
    console.error("Error handled:", error);
    
    // Erreur Prisma
    if (
        isPrismaKnownError(error) ||
        isPrismaInitError(error) ||
        isPrismaValidationError(error)
    ) {
        return handlePrismaError(error);
    }
    
    // Erreur Better Auth
    if (isBetterAuthError(error)) {
        return handleBetterAuthError(error);
    }
    
    // Erreur standard JavaScript
    if (error instanceof Error) {
        // Erreur de connexion DB mentionnée dans le message
        if (error.message.includes("DATABASE_URL")) {
            const errorResponse = createErrorResponse(
                ERROR_CODES.CONNECTION_FAILED,
                error.message
            );
            return {
                ...errorResponse,
                httpStatus: errorResponse.httpStatus!
            };
        }
        
        const errorResponse = createErrorResponse(
            ERROR_CODES.INTERNAL_SERVER_ERROR,
            error.message
        );
        return {
            ...errorResponse,
            httpStatus: errorResponse.httpStatus!
        };
    }
    
    // Erreur inconnue
    const errorResponse = createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR);
    return {
        ...errorResponse,
        httpStatus: errorResponse.httpStatus!
    };
}
