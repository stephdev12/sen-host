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
        // Check if 24h passed since last deduction (or createdAt)
        // We can store `lastDeductionAt`. 
        // For now, let's assume this script runs once a day.
        
        if (bot.owner.coins >= 10) {
            await prisma.user.update({
                where: { id: bot.owner.id },
                data: { coins: { decrement: 10 } }
            });
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
