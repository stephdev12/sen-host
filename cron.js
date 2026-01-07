const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const treeKill = require('tree-kill'); // Ensure this is installed or use require

async function main() {
    console.log('Running daily deduction cron...');
    
    // Find bots that are running or stopped but active?
    // "les coins sont deduis chaque 24h" implies for *active* bots or just for keeping the instance?
    // Usually for running instances.
    // Let's assume for ALL instances that are not deleted? Or just running?
    // "pour pouvoir creer un bot l'utilisateur doit avoir au moins 10 coins pour 24h."
    // This implies cost of *existence* or *running*? Usually running.
    // Let's assume running bots cost 10 coins/24h.

    const runningBots = await prisma.bot.findMany({
        where: { status: 'running' },
        include: { owner: true }
    });

    for (const bot of runningBots) {
        // Logique de sécurité temporelle (24h = 86400000 ms)
        const now = new Date();
        const lastRun = bot.lastDeductionAt ? new Date(bot.lastDeductionAt) : new Date(bot.createdAt);
        const diff = now.getTime() - lastRun.getTime();
        
        // Si moins de 24h se sont écoulées, on ignore (sauf si jamais déduit et bot vieux de +24h)
        // Cas spécial: Si lastDeductionAt est null, on vérifie createdAt.
        // Si lastDeductionAt est null, cela signifie première exécution depuis création.
        // Si le bot a été créé il y a moins de 24h, on ne déduit pas encore (car il a payé à la création).
        
        // CORRECTION: La création coûte 10 coins pour les PREMIÈRES 24h.
        // Donc on ne doit redéduire QUE 24h après la création, puis toutes les 24h.
        
        if (diff < 24 * 60 * 60 * 1000) {
            continue; // Pas encore l'heure
        }

        if (bot.owner.coins >= 10) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: bot.owner.id },
                    data: { coins: { decrement: 10 } }
                }),
                prisma.bot.update({
                    where: { id: bot.id },
                    data: { lastDeductionAt: now } // Marquer comme payé maintenant
                })
            ]);
            console.log(`Deducted 10 coins from ${bot.owner.username} for bot ${bot.name}`);
        } else {
            console.log(`User ${bot.owner.username} has insufficient coins. Stopping bot ${bot.name}.`);
            // Stop bot
            if (bot.processId) {
                try {
                    // This requires tree-kill to be available in this script context
                    // We might need to exec it.
                    require('tree-kill')(bot.processId, 'SIGTERM');
                } catch (e) {
                    console.error(e);
                }
            }
            await prisma.bot.update({
                where: { id: bot.id },
                data: { status: 'stopped', processId: null }
            });
        }
    }
}

// Run immediately then exit? Or loop?
// If this is a cron script, it runs once.
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
