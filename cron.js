const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const treeKill = require('tree-kill');

console.log(">>> CHARGEMENT DE CRON.JS VERSION SÉCURISÉE (v2) <<<");

async function checkAndDeduct() {
    const now = new Date();
    console.log(`\n--- [${now.toLocaleString()}] Démarrage de la vérification des coins ---`);
    
    try {
        const runningBots = await prisma.bot.findMany({
            where: { status: 'running' },
            include: { owner: true }
        });

        console.log(`Bots actifs trouvés : ${runningBots.length}`);

        for (const bot of runningBots) {
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