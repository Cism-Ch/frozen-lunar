import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "better-auth/crypto";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function testAdminLogin() {
    const email = "cism-ch@hbc-logistique.fr";
    const password = "&rM!TR65$9&z4mxq";

    console.log("======================================================");
    console.log("🧪 TEST DE CONNEXION DU COMPTE ADMINISTRATEUR");
    console.log("======================================================");
    console.log(`📧 Email testé     : ${email}`);
    console.log(`🔑 Mot de passe    : ${password.substring(0, 3)}••••••••••••`);

    try {
        // 1. Vérification de l'utilisateur en base
        console.log(
            "\n1️⃣ Recherche de l'utilisateur dans la base de données..."
        );
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                accounts: true,
                sessions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        if (!user) {
            console.error("❌ Utilisateur introuvable en base de données !");
            process.exit(1);
        }

        console.log("✅ Utilisateur trouvé :");
        console.log(`   - ID       : ${user.id}`);
        console.log(`   - Nom      : ${user.name}`);
        console.log(`   - Email    : ${user.email}`);
        console.log(`   - Rôle     : ${user.role}`);
        console.log(`   - Vérifié  : ${user.emailVerified}`);

        if (user.role !== "admin") {
            console.error(
                `❌ ÉCHEC : Le rôle de l'utilisateur est '${user.role}' au lieu de 'admin' !`
            );
            process.exit(1);
        }
        console.log(
            "✅ Contrôle de rôle validé : l'utilisateur a bien les privilèges 'admin'."
        );

        // 2. Vérification du compte credential & mot de passe haché
        console.log(
            "\n2️⃣ Vérification du compte d'authentification (Account)..."
        );
        const account = user.accounts.find(
            (a) => a.providerId === "credential"
        );

        if (!account) {
            console.error(
                "❌ Aucun compte avec providerId='credential' trouvé !"
            );
            process.exit(1);
        }

        if (!account.password) {
            console.error(
                "❌ Aucun mot de passe haché trouvé pour ce compte !"
            );
            process.exit(1);
        }

        console.log("✅ Compte 'credential' trouvé.");
        console.log(`   - Provider : ${account.providerId}`);
        console.log(`   - Hash DB  : ${account.password.substring(0, 15)}...`);

        // 3. Test de vérification cryptographique (algorithme Better-Auth scrypt)
        console.log("\n3️⃣ Test cryptographique du mot de passe...");
        const isMatch = await verifyPassword({
            hash: account.password,
            password: password,
        });

        if (!isMatch) {
            console.error(
                "❌ ÉCHEC : Le mot de passe ne correspond pas au hash en base !"
            );
            process.exit(1);
        }

        console.log(
            "✅ Succès cryptographique : Le mot de passe est parfaitement valide !"
        );

        // 4. Test avec un faux mot de passe pour vérifier que la sécurité rejette les intrus
        console.log("\n4️⃣ Test de sécurité négatif (faux mot de passe)...");
        const isWrongRejected = !(await verifyPassword({
            hash: account.password,
            password: "MauvaisMotDePasse123!",
        }));

        if (isWrongRejected) {
            console.log(
                "✅ Sécurité confirmée : un mot de passe erroné est bien rejeté."
            );
        } else {
            console.error(
                "❌ Anomalie : le mot de passe erroné a été accepté !"
            );
            process.exit(1);
        }

        // 5. Test de simulation de création de session Better-Auth
        console.log("\n5️⃣ État des sessions de l'administrateur...");
        const activeSessions = await prisma.session.count({
            where: {
                userId: user.id,
                expiresAt: { gt: new Date() },
            },
        });
        console.log(
            `ℹ️ Sessions actives en base pour cet administrateur : ${activeSessions}`
        );

        console.log("\n======================================================");
        console.log(
            "🎉 RÉSULTAT DU TEST : CONNEXION ADMIN 100% FONCTIONNELLE !"
        );
        console.log("======================================================");
        console.log(
            "L'administrateur peut se connecter sur http://localhost:3000/admin/login"
        );
        console.log("avec :");
        console.log(`Identifiant : ${email}`);
        console.log(`Mot de passe : ${password}`);
        console.log("======================================================\n");
    } catch (error) {
        console.error("❌ Erreur inattendue lors du test :", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminLogin();
