import { PrismaClient } from "@prisma/client";

/**
 * Vérifie que la variable d'environnement DATABASE_URL est configurée
 * Cette vérification permet d'éviter des erreurs cryptiques au runtime
 */
function validateDatabaseConfig(): void {
    if (!process.env.DATABASE_URL) {
        throw new Error(
            "❌ DATABASE_URL n'est pas configurée.\n" +
            "Veuillez créer un fichier .env à la racine du projet avec:\n" +
            'DATABASE_URL="postgresql://username:password@localhost:5432/frozen_lunar?schema=public"\n' +
            "Voir .env.example pour plus de détails."
        );
    }
}

/**
 * Crée une instance singleton du client Prisma
 * Le singleton évite les problèmes de connexions multiples en développement
 */
const prismaClientSingleton = () => {
    // Valider la configuration avant de créer le client
    validateDatabaseConfig();
    
    return new PrismaClient({
        // Log des requêtes en développement pour faciliter le débogage
        log: process.env.NODE_ENV === "development" 
            ? ["error", "warn"] 
            : ["error"],
    });
};

// Déclaration TypeScript pour le singleton global
declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Utiliser le singleton global en développement, créer une nouvelle instance en production
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// Sauvegarder le singleton en développement pour éviter les reconnexions lors du HMR
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
