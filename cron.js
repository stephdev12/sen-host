const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const treeKill = require('tree-kill');

const fs = require('fs');
const path = require('path');

console.log(">>> CHARGEMENT DE CRON.JS VERSION SÉCURISÉE (v2) <<<");

// Fonction pour nettoyer les images de la communauté > 3 jours
async function cleanupCommunityImages() {
    console.log(`\n--- [${new Date().toLocaleString()}] Nettoyage des images communautaires ---`);
    const communityDir = path.join(__dirname, 'public', 'uploads', 'community');
    
    if (!fs.existsSync(communityDir)) {
        console.log("Dossier community inexistant, rien à nettoyer.");
        return;
    }

    try {
        const files = fs.readdirSync(communityDir);
        const now = Date.now();
        const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
        let deletedCount = 0;

        for (const file of files) {
            const filePath = path.join(communityDir, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtimeMs > THREE_DAYS_MS) {
                fs.unlinkSync(filePath);
                deletedCount++;
                // Optionnel : Supprimer de la DB si nécessaire, mais le path suffit.
                // Idéalement on synchronise avec la DB, mais pour l'instant le FS est prioritaire pour l'espace.
            }
        }
        console.log(`Images supprimées : ${deletedCount}`);
    } catch (err) {
        console.error("Erreur nettoyage images:", err.message);
    }
}

async function checkAndDeduct() {
    const now = new Date();
    console.log(`\n--- [${now.toLocaleString()}] Démarrage de la vérification des coins et premium ---`);
    
    try {
        // --- NOUVEAU: VÉRIFICATION EXPIRATION PREMIUM ---
        const expiredPremiumUsers = await prisma.user.updateMany({
            where: {
                isPremium: true,
                premiumExpiresAt: { lt: now }
            },
            data: {
                isPremium: false
            }
        });
        if (expiredPremiumUsers.count > 0) {
            console.log(`${expiredPremiumUsers.count} abonnements Premium ont expiré.`);
        }

        const runningBots = await prisma.bot.findMany({
            where: { status: 'running' },
            include: { owner: true }
        });

        console.log(`Bots actifs trouvés : ${runningBots.length}`);

        for (const bot of runningBots) {
            // --- NOUVEAU: VÉRIFICATION EXPIRATION DATE ---
            if (bot.expiresAt && new Date(bot.expiresAt) < now) {
                console.log(`  [EXPIRED] Bot ${bot.name} a expiré (Date: ${bot.expiresAt}). Arrêt.`);
                if (bot.processId) {
                    treeKill(bot.processId, 'SIGTERM', () => {});
                }
                await prisma.bot.update({
                    where: { id: bot.id },
                    data: { status: 'stopped', processId: null }
                });
                continue; // On passe au bot suivant
            }

            // Vérifier si l'utilisateur est Premium
            const isPremium = bot.owner.isPremium && bot.owner.premiumExpiresAt && new Date(bot.owner.premiumExpiresAt) > now;
            
            if (isPremium) {
                console.log(`> Bot: ${bot.name} | Proprio: ${bot.owner.username} (PREMIUM) | Pas de déduction.`);
                continue;
            }

            // Calcul du temps écoulé
            const lastRun = bot.lastDeductionAt ? new Date(bot.lastDeductionAt) : new Date(bot.createdAt);
            const diffMs = now.getTime() - lastRun.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            console.log(`> Bot: ${bot.name} | Proprio: ${bot.owner.username} | Dernier prélèvement: ${diffHours.toFixed(2)}h ago`);

            // On ne déduit que si plus de 23.9h sont passées (marge de sécurité)
            if (diffHours < 23.9) {
                console.log(`  [SKIP] Trop tôt.`);
                continue;
            }

            if (bot.owner.coins >= 10) {
                console.log(`  [OK] Déduction de 10 coins...`);
                try {
                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: bot.owner.id },
                            data: { coins: { decrement: 10 } }
                        }),
                        prisma.bot.update({
                            where: { id: bot.id },
                            data: { lastDeductionAt: now }
                        })
                    ]);
                    console.log(`  [SUCCESS] Nouveau solde : ${bot.owner.coins - 10} coins.`);
                } catch (err) {
                    console.error(`  [ERROR] Échec de la transaction pour ${bot.name}:`, err.message);
                }
            } else {
                console.log(`  [WARN] Coins insuffisants (${bot.owner.coins}). Arrêt du bot.`);
                if (bot.processId) {
                    treeKill(bot.processId, 'SIGTERM', () => {});
                }
                await prisma.bot.update({
                    where: { id: bot.id },
                    data: { status: 'stopped', processId: null }
                });
            }
        }
        
        // Exécuter le nettoyage des images
        await cleanupCommunityImages();

    } catch (error) {
        console.error("Erreur globale Cron:", error);
    }
    console.log(`--- Fin de la vérification ---\n
`);
}

// Lancement initial
checkAndDeduct();

// Puis toutes les heures (3600000 ms)
// Cela évite que PM2 ne relance le script en boucle s'il se termine.
// On le transforme en service permanent.
setInterval(checkAndDeduct, 60 * 60 * 1000);

// Empêcher le script de quitter
console.log("Cron persistant activé. Vérification toutes les 60 minutes.");
process.stdin.resume();