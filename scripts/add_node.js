const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== Ajouter un Node VPS ===");

rl.question('Nom du VPS (ex: VPS-France-1): ', (name) => {
  rl.question('URL (ex: http://192.168.1.50:4000): ', (url) => {
    rl.question('API Key (définie dans le .env du node): ', (apiKey) => {
        
        // Validation basique
        if (!name || !url || !apiKey) {
            console.error("Tous les champs sont requis.");
            process.exit(1);
        }

        prisma.node.create({
            data: {
                name,
                url,
                apiKey,
                enabled: true
            }
        }).then((node) => {
            console.log(`\n✅ Node ajouté avec succès ! ID: ${node.id}`);
            console.log(`Le système va maintenant commencer à déployer des bots sur ce node.`);
            process.exit(0);
        }).catch((e) => {
            console.error("Erreur:", e);
            process.exit(1);
        });

    });
  });
});
