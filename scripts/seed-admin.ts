import prisma from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

async function main() {
    const name = process.env.ADMIN_INITIAL_NAME || "Cism-Ch";
    const email =
        process.env.ADMIN_INITIAL_EMAIL || "cism-ch@hbc-logistique.fr";
    const password =
        process.env.ADMIN_INITIAL_PASSWORD ||
        process.env.SEED_ADMIN_PASSWORD ||
        "dev-only-password-please-change-in-env";

    console.log(`⏳ Création du compte administrateur ${name} (${email})...`);

    // Supprimer tout utilisateur existant avec cet email si nécessaire
    await prisma.user.deleteMany({
        where: { email },
    });

    // Inscrire l'utilisateur via Better-Auth (hachage sécurisé du mot de passe)
    const result = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        },
    });

    if (!result) {
        throw new Error("Échec de la création via Better-Auth");
    }

    // Mettre à jour le rôle en 'admin' et emailVerified à true
    const updatedUser = await prisma.user.update({
        where: { email },
        data: {
            role: "admin",
            emailVerified: true,
        },
    });

    console.log("✅ Compte Administrateur créé et vérifié avec succès !");
    console.log("-----------------------------------------");
    console.log(`ID : ${updatedUser.id}`);
    console.log(`Nom : ${updatedUser.name}`);
    console.log(`Email : ${updatedUser.email}`);
    console.log(`Rôle : ${updatedUser.role}`);
    console.log(`Statut Vérifié : ${updatedUser.emailVerified}`);
    console.log("-----------------------------------------");
}

main()
    .catch((err) => {
        console.error("❌ Erreur de création du compte admin:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
