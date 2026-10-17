import { PrismaClient } from "@prisma/client";
import fs from "fs";

/**
 * Script de diagnostic de connectivité à la base de données PostgreSQL / Supabase.
 * Détecte notamment si le projet Supabase a été mis en pause (free tier).
 */
async function checkDatabaseHealth() {
    const dbUrl = process.env.DATABASE_URL || "";

    // Si aucune URL ou si c'est l'URL factice du runner CI par défaut
    if (!dbUrl || dbUrl.includes("dummy:dummy@localhost")) {
        console.log(
            "ℹ️ Aucune base de données distante fournie (mode CI factice). Test de connectivité sauté."
        );
        process.exit(0);
    }

    console.log(
        "⏳ Vérification de la connectivité avec PostgreSQL / Supabase..."
    );

    const prisma = new PrismaClient({
        datasources: {
            db: { url: dbUrl },
        },
    });

    try {
        // Timeout de sécurité de 7 secondes
        const checkQuery = prisma.$queryRawUnsafe("SELECT 1 as health_check;");
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
                () =>
                    reject(
                        new Error("ETIMEDOUT: Délai d'attente dépassé (7s)")
                    ),
                7000
            )
        );

        await Promise.race([checkQuery, timeoutPromise]);

        console.log(
            "✅ Connexion réussie : la base de données est active et répond parfaitement !"
        );
        process.exit(0);
    } catch (err) {
        const errorMsg = String(err?.message || err);
        console.error("\n❌ ÉCHEC DE LA CONNEXION À LA BASE DE DONNÉES\n");

        let summaryAlert = "";

        if (
            errorMsg.includes("tenant/user") &&
            errorMsg.includes("not found")
        ) {
            console.error(
                "=================================================================="
            );
            console.error("🚨 ALERTE : VOTRE PROJET SUPABASE EST EN PAUSE !");
            console.error(
                "Sur l'offre gratuite de Supabase, le projet s'endort après 7 jours."
            );
            console.error(
                "👉 Solution : Connectez-vous sur https://supabase.com/dashboard"
            );
            console.error(
                "   Ouvrez votre projet et cliquez sur 'Restore project'."
            );
            console.error(
                "==================================================================\n"
            );

            summaryAlert = `### 🚨 Alerte : Projet Supabase en pause
Le pooler Supabase indique que le tenant/user est introuvable (\`tenant/user not found\`).
Votre projet Supabase est très probablement **en pause** pour cause d'inactivité.

👉 **Action requise :**
1. Rendez-vous sur le [Dashboard Supabase](https://supabase.com/dashboard).
2. Cliquez sur votre projet puis sur **Restore project** (ou Resume).
3. Relancez ensuite le build/déploiement.`;
        } else if (
            errorMsg.includes("ETIMEDOUT") ||
            errorMsg.includes("timeout")
        ) {
            console.error(
                "🚨 ALERTE : La base de données ne répond pas (délai d'attente dépassé)."
            );
            summaryAlert = `### ⚠️ Alerte : Timeout Base de Données
Le serveur de base de données n'a pas répondu dans le délai imparti (7 secondes).`;
        } else {
            console.error("🚨 Erreur retournée :", errorMsg);
            summaryAlert = `### ❌ Erreur de Connexion Base de Données
\`\`\`text
${errorMsg}
\`\`\``;
        }

        // Si exécuté dans l'environnement GitHub Actions, injecter dans le Step Summary
        const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;
        if (stepSummaryFile && summaryAlert) {
            try {
                fs.appendFileSync(stepSummaryFile, `\n${summaryAlert}\n`);
            } catch (fsErr) {
                console.error(
                    "Impossible d'écrire dans GITHUB_STEP_SUMMARY:",
                    fsErr
                );
            }
        }

        process.exit(1);
    } finally {
        await prisma.$disconnect().catch(() => {});
    }
}

checkDatabaseHealth();
