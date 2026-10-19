import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const prisma = new PrismaClient();

function generateStrongPassword() {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";
    let password = "";
    // Ensure at least one uppercase, lowercase, number, special
    password += "ABCDEFGHJKLMNPQRSTUVWXYZ"[crypto.randomInt(0, 24)];
    password += "abcdefghjkmnpqrstuvwxyz"[crypto.randomInt(0, 23)];
    password += "23456789"[crypto.randomInt(0, 8)];
    password += "!@#$%^&*"[crypto.randomInt(0, 8)];
    for (let i = 4; i < 16; i++) {
        password += chars[crypto.randomInt(0, chars.length)];
    }
    // Shuffle
    return password
        .split("")
        .sort(() => crypto.randomInt(-1, 2))
        .join("");
}

async function resetAdminPassword() {
    const targetEmail = process.argv[3] || "cism-ch@hbc-logistique.fr";
    const rawPassword = process.argv[2] || generateStrongPassword();

    console.log(`\n======================================================`);
    console.log(`🔐 RÉINITIALISATION DU MOT DE PASSE ADMINISTRATEUR`);
    console.log(`======================================================`);
    console.log(`📧 Compte cible : ${targetEmail}`);

    try {
        // 1. Rechercher l'utilisateur dans la base
        let user = await prisma.user.findUnique({
            where: { email: targetEmail },
            include: { accounts: true },
        });

        if (!user) {
            console.log(
                `⚠️ Utilisateur non trouvé. Création du compte administrateur racine...`
            );
            user = await prisma.user.create({
                data: {
                    name: "Cism-Ch",
                    email: targetEmail,
                    role: "admin",
                    emailVerified: true,
                },
                include: { accounts: true },
            });
        } else if (user.role !== "admin") {
            // S'assurer qu'il a bien le rôle admin
            await prisma.user.update({
                where: { id: user.id },
                data: { role: "admin", emailVerified: true },
            });
        }

        // 2. Hacher le mot de passe selon l'algorithme officiel de Better-Auth
        const hashedPassword = await hashPassword(rawPassword);

        // 3. Mettre à jour ou créer le compte credential lié
        const credentialAccount = user.accounts.find(
            (acc) => acc.providerId === "credential"
        );

        if (credentialAccount) {
            await prisma.account.update({
                where: { id: credentialAccount.id },
                data: { password: hashedPassword, updatedAt: new Date() },
            });
        } else {
            await prisma.account.create({
                data: {
                    userId: user.id,
                    accountId: user.email,
                    providerId: "credential",
                    password: hashedPassword,
                },
            });
        }

        // 4. Invalider les sessions existantes pour forcer une nouvelle connexion sécurisée
        const deletedSessions = await prisma.session.deleteMany({
            where: { userId: user.id },
        });

        // 5. Vérification cryptographique interne immédiate
        const isValid = await verifyPassword({
            hash: hashedPassword,
            password: rawPassword,
        });

        if (!isValid) {
            throw new Error(
                "Échec du test de vérification cryptographique du mot de passe."
            );
        }

        console.log(
            `✅ Mot de passe mis à jour et validé cryptographiquement avec succès !`
        );
        console.log(`🔒 Sessions actives révoquées : ${deletedSessions.count}`);
        console.log(`------------------------------------------------------`);
        console.log(`🔑 IDENTIFIANTS ADMIN MIS À JOUR :`);
        console.log(`   Email        : ${user.email}`);
        console.log(`   Mot de passe : ${rawPassword}`);
        console.log(`   Rôle         : admin`);
        console.log(`   URL de login : http://localhost:3000/admin/login`);
        console.log(`======================================================\n`);
    } catch (error) {
        console.error("❌ Erreur lors de la réinitialisation :", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword();
