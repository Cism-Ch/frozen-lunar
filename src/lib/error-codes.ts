/**
 * Système de codes d'erreur centralisé
 * Facilite le support utilisateur et le suivi des erreurs
 */

export interface ErrorCode {
    code: string;
    message: string;
    solution: string;
    httpStatus: number;
}

/**
 * Codes d'erreur pour la base de données
 */
export const DB_ERRORS = {
    CONNECTION_FAILED: {
        code: 'DB001',
        message: 'Impossible de se connecter à la base de données',
        solution: 'Vérifiez DATABASE_URL et que PostgreSQL est démarré',
        httpStatus: 500
    },
    MIGRATION_NEEDED: {
        code: 'DB002',
        message: 'Migrations de base de données manquantes',
        solution: 'Exécutez: npx prisma migrate deploy',
        httpStatus: 500
    },
    UNIQUE_CONSTRAINT: {
        code: 'DB003',
        message: 'Une entrée avec ces données existe déjà',
        solution: 'Vérifiez que les données sont uniques (email, identifiant, etc.)',
        httpStatus: 409
    },
    RECORD_NOT_FOUND: {
        code: 'DB004',
        message: 'Enregistrement introuvable',
        solution: 'Vérifiez que l\'identifiant est correct',
        httpStatus: 404
    },
    FOREIGN_KEY_CONSTRAINT: {
        code: 'DB005',
        message: 'Violation de contrainte de clé étrangère',
        solution: 'Vérifiez que les données référencées existent',
        httpStatus: 400
    }
} as const;

/**
 * Codes d'erreur pour l'authentification
 */
export const AUTH_ERRORS = {
    INVALID_CREDENTIALS: {
        code: 'AUTH001',
        message: 'Email ou mot de passe incorrect',
        solution: 'Vérifiez vos identifiants et réessayez',
        httpStatus: 401
    },
    SESSION_EXPIRED: {
        code: 'AUTH002',
        message: 'Session expirée',
        solution: 'Veuillez vous reconnecter',
        httpStatus: 401
    },
    UNAUTHORIZED: {
        code: 'AUTH003',
        message: 'Non authentifié',
        solution: 'Veuillez vous connecter pour accéder à cette ressource',
        httpStatus: 401
    },
    INSUFFICIENT_PERMISSIONS: {
        code: 'AUTH004',
        message: 'Permissions insuffisantes',
        solution: 'Vous n\'avez pas les droits nécessaires pour cette action',
        httpStatus: 403
    },
    ADMIN_ALREADY_EXISTS: {
        code: 'AUTH005',
        message: 'Un administrateur existe déjà',
        solution: 'Utilisez la page de connexion pour vous authentifier',
        httpStatus: 403
    },
    INVALID_ROLE: {
        code: 'AUTH006',
        message: 'Rôle utilisateur invalide',
        solution: 'Contactez un administrateur pour obtenir les bonnes permissions',
        httpStatus: 403
    }
} as const;

/**
 * Codes d'erreur pour la validation des données
 */
export const VALIDATION_ERRORS = {
    INVALID_EMAIL: {
        code: 'VAL001',
        message: 'Format d\'email invalide',
        solution: 'Entrez une adresse email valide (ex: utilisateur@example.com)',
        httpStatus: 400
    },
    WEAK_PASSWORD: {
        code: 'VAL002',
        message: 'Mot de passe trop faible',
        solution: 'Le mot de passe doit contenir au moins 12 caractères, incluant majuscules, minuscules, chiffres et caractères spéciaux',
        httpStatus: 400
    },
    REQUIRED_FIELD: {
        code: 'VAL003',
        message: 'Champ requis manquant',
        solution: 'Tous les champs obligatoires doivent être remplis',
        httpStatus: 400
    },
    INVALID_FORMAT: {
        code: 'VAL004',
        message: 'Format de données invalide',
        solution: 'Vérifiez que les données sont dans le format attendu',
        httpStatus: 400
    },
    EMAIL_REQUIRED: {
        code: 'VAL005',
        message: 'L\'adresse email est requise',
        solution: 'Veuillez fournir une adresse email valide',
        httpStatus: 400
    },
    PASSWORD_REQUIRED: {
        code: 'VAL006',
        message: 'Le mot de passe est requis',
        solution: 'Veuillez fournir un mot de passe',
        httpStatus: 400
    }
} as const;

/**
 * Codes d'erreur pour le système d'emails
 */
export const EMAIL_ERRORS = {
    SEND_FAILED: {
        code: 'EMAIL001',
        message: 'Échec de l\'envoi de l\'email',
        solution: 'Vérifiez la configuration Resend (RESEND_KEY)',
        httpStatus: 500
    },
    INVALID_RECIPIENT: {
        code: 'EMAIL002',
        message: 'Destinataire invalide',
        solution: 'Vérifiez que l\'adresse email du destinataire est valide',
        httpStatus: 400
    },
    RESEND_NOT_CONFIGURED: {
        code: 'EMAIL003',
        message: 'Service d\'email non configuré',
        solution: 'Configurez RESEND_KEY dans les variables d\'environnement',
        httpStatus: 500
    }
} as const;

/**
 * Codes d'erreur génériques
 */
export const GENERAL_ERRORS = {
    INTERNAL_SERVER_ERROR: {
        code: 'SYS001',
        message: 'Erreur interne du serveur',
        solution: 'Veuillez réessayer. Si le problème persiste, contactez le support',
        httpStatus: 500
    },
    NOT_FOUND: {
        code: 'SYS002',
        message: 'Ressource non trouvée',
        solution: 'Vérifiez l\'URL ou l\'identifiant de la ressource',
        httpStatus: 404
    },
    RATE_LIMIT_EXCEEDED: {
        code: 'SYS003',
        message: 'Trop de requêtes',
        solution: 'Veuillez patienter avant de réessayer',
        httpStatus: 429
    }
} as const;

/**
 * Tous les codes d'erreur combinés
 */
export const ERROR_CODES = {
    ...DB_ERRORS,
    ...AUTH_ERRORS,
    ...VALIDATION_ERRORS,
    ...EMAIL_ERRORS,
    ...GENERAL_ERRORS
} as const;

/**
 * Helper pour créer une réponse d'erreur standardisée
 */
export function createErrorResponse(errorCode: ErrorCode, additionalDetails?: string) {
    return {
        ...errorCode,
        details: additionalDetails,
        timestamp: new Date().toISOString()
    };
}

/**
 * Helper pour mapper les erreurs Prisma aux codes d'erreur
 */
export function mapPrismaError(code: string): ErrorCode {
    switch (code) {
        case 'P2002':
            return DB_ERRORS.UNIQUE_CONSTRAINT;
        case 'P2025':
            return DB_ERRORS.RECORD_NOT_FOUND;
        case 'P2003':
            return DB_ERRORS.FOREIGN_KEY_CONSTRAINT;
        case 'P1001':
        case 'P1002':
            return DB_ERRORS.CONNECTION_FAILED;
        case 'P3006':
            return DB_ERRORS.MIGRATION_NEEDED;
        default:
            return GENERAL_ERRORS.INTERNAL_SERVER_ERROR;
    }
}
