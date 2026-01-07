import WhatsAppManager from './whatsappManager.js';
import fs from 'fs';
import path from 'path';
import { font } from './lib/helpers.js';
import userConfigManager from './userConfigManager.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSIONS_DIR = './whatsapp_sessions';
const whatsappManager = new WhatsAppManager();

// 🎨 Fonction pour afficher le logo
function displayLogo() {
    console.clear();
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ███████╗██╗   ██╗██╗  ██╗██╗   ██╗                      ║
║   ██╔════╝██║   ██║██║ ██╔╝██║   ██║                      ║
║   ███████╗██║   ██║█████╔╝ ██║   ██║                      ║
║   ╚════██║██║   ██║██╔═██╗ ██║   ██║                      ║
║   ███████║╚██████╔╝██║  ██╗╚██████╔╝                      ║
║   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝                       ║
║                                                           ║
║                       STEPH-MD                           ║
║                    Made by STEPHDEV                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `));
}

// 📱 Fonction pour valider le numéro de téléphone
function validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
        console.log(chalk.red('\n❌ ERREUR: Aucun numéro de téléphone trouvé dans .env'));
        console.log(chalk.yellow('👉 Veuillez remplir PHONE_NUMBER dans le fichier .env'));
        console.log(chalk.gray('   Exemple: PHONE_NUMBER=237698711207\n'));
        process.exit(1);
    }

    // Nettoyer le numéro
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (cleanNumber.length < 8) {
        console.log(chalk.red('\n❌ ERREUR: Numéro de téléphone invalide'));
        console.log(chalk.yellow('👉 Le numéro doit contenir au moins 8 chiffres'));
        console.log(chalk.gray(`   Numéro actuel: ${cleanNumber}\n`));
        process.exit(1);
    }

    return cleanNumber;
}

// 🔄 Fonction pour charger la session existante
async function loadExistingSession(phoneNumber) {
    const sessionPath = path.join(SESSIONS_DIR, phoneNumber);
    const credsPath = path.join(sessionPath, 'creds.json');
    
    if (fs.existsSync(credsPath)) {
        console.log(chalk.blue('\n📂 Session existante détectée...'));
        return true;
    }
    return false;
}

// 🚀 Fonction principale de démarrage
async function startBot() {
    displayLogo();
    
    console.log(chalk.green('🔧 Chargement de la configuration...\n'));
    
    // Récupérer et valider le numéro
    const phoneNumber = validatePhoneNumber(process.env.PHONE_NUMBER);
    
    console.log(chalk.cyan('📱 Configuration détectée:'));
    console.log(chalk.gray(`   • Numéro: ${phoneNumber}`));
    console.log(chalk.gray(`   • Préfixe: ${process.env.PREFIX || '!'}`));
    console.log(chalk.gray(`   • Nom du bot: ${process.env.BOT_NAME || 'SUKUNA-MD'}`));
    console.log(chalk.gray(`   • Langue: ${process.env.LANGUAGE || 'fr'}\n`));
    
    // Appliquer la configuration utilisateur
    try {
        userConfigManager.updateUserConfig(phoneNumber, {
            prefix: process.env.PREFIX || '!',
            botName: process.env.BOT_NAME || 'SUKUNA-MD',
            language: process.env.LANGUAGE || 'fr',
            menuImage: process.env.MENU_IMAGE || 'https://i.postimg.cc/8cKZBMZw/lv-0-20251105211949.jpg',
            ephotoMenuImage: process.env.EPHOTO_MENU_IMAGE || 'https://i.postimg.cc/bv94M6Lp/Getou-suguru.jpg',
            welcomeImage: process.env.WELCOME_IMAGE || 'https://i.postimg.cc/bv94M6Lp/Getou-suguru.jpg',
            antilinkLimit: parseInt(process.env.ANTILINK_LIMIT) || 3
        });
        console.log(chalk.green('✅ Configuration utilisateur appliquée\n'));
    } catch (error) {
        console.log(chalk.yellow(`⚠️  Avertissement configuration: ${error.message}\n`));
    }
    
    // Vérifier si une session existe déjà
    const hasExistingSession = await loadExistingSession(phoneNumber);
    
    if (hasExistingSession) {
        console.log(chalk.blue('🔄 Reconnexion en cours...\n'));
    } else {
        console.log(chalk.yellow('🆕 Nouvelle session - Code de pairage requis\n'));
        console.log(chalk.cyan('⏳ Préparation du code de pairage...'));
        console.log(chalk.gray('   (Attente de 2 secondes pour éviter les erreurs)\n'));
    }
    
    // Créer la session
    let pairingCodeDisplayed = false;
    
    try {
        await whatsappManager.createSession(phoneNumber, {
            onPairingCode: (code) => {
                if (!pairingCodeDisplayed) {
                    pairingCodeDisplayed = true;
                    
                    console.log(chalk.green('\n╔═══════════════════════════════════════╗'));
                    console.log(chalk.green('║                                       ║'));
                    console.log(chalk.green('║        📱 CODE DE PAIRAGE 📱         ║'));
                    console.log(chalk.green('║                                       ║'));
                    console.log(chalk.green('╚═══════════════════════════════════════╝\n'));
                    
                    console.log(chalk.cyan('   Numéro:'), chalk.white(phoneNumber));
                    console.log(chalk.cyan('   Code:  '), chalk.yellow.bold(code));
                   
                    
                    console.log(chalk.gray('⏰ Le code expire dans 60 secondes...\n'));
                }
            },
            
            onConnected: () => {
                console.log(chalk.green('\n✅ ══════════════════════════════════════'));
                console.log(chalk.green('✅  CONNEXION RÉUSSIE !'));
                console.log(chalk.green('✅ ══════════════════════════════════════\n'));
                
                console.log(chalk.cyan('📱 Session active:'), chalk.white(phoneNumber));
                console.log(chalk.cyan('🤖 Bot:'), chalk.white(process.env.BOT_NAME || 'SUKUNA-MD'));
                console.log(chalk.cyan('🔧 Préfixe:'), chalk.white(process.env.PREFIX || '!'));
                console.log(chalk.cyan('🌍 Langue:'), chalk.white(process.env.LANGUAGE || 'fr'));
                
                console.log(chalk.green('\n🎉 Le bot est maintenant en ligne et prêt à être utilisé!\n'));
                console.log(chalk.gray('═══════════════════════════════════════════\n'));
            },
            
            onDisconnected: (reason) => {
                console.log(chalk.red(`\n❌ Session déconnectée: ${reason}`));
                console.log(chalk.yellow('🔄 Tentative de reconnexion...\n'));
            },
            
            onError: (error) => {
                console.log(chalk.red(`\n❌ Erreur: ${error.message}`));
                
                if (error.message.includes('Pairing code expired')) {
                    console.log(chalk.yellow('\n⚠️  Le code de pairage a expiré'));
                    console.log(chalk.cyan('🔄 Redémarrez le bot pour obtenir un nouveau code\n'));
                } else {
                    console.log(chalk.yellow('🔄 Le bot va tenter de se reconnecter...\n'));
                }
            }
        });
        
    } catch (error) {
        console.log(chalk.red(`\n❌ Erreur critique: ${error.message}`));
        console.log(chalk.yellow('🔄 Veuillez redémarrer le bot\n'));
        process.exit(1);
    }
}

// 🛡️ Gestion des erreurs non gérées
process.on('uncaughtException', (error) => {
    console.error(chalk.red('\n🚨 ERREUR NON GÉRÉE:'), error.message);
    console.log(chalk.yellow('🔄 Le bot continue de fonctionner...\n'));
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('\n🚨 PROMESSE REJETÉE:'), reason);
    console.log(chalk.yellow('🔄 Le bot continue de fonctionner...\n'));
});

// 🎬 Démarrage du bot
console.log(chalk.blue('\n🚀 Démarrage de SUKUNA-MD...\n'));

// Délai de 2 secondes avant de demander le code de pairage
setTimeout(() => {
    startBot().catch(err => {
        console.error(chalk.red('\n❌ Erreur lors du démarrage:'), err.message);
        process.exit(1);
    });
}, 2000);