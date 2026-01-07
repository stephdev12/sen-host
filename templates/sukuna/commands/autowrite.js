import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import path from 'path';
import {  sendReply, formatSuccess, formatError, translate  } from '../lib/helpers.js';

// Chemin pour stocker la configuration PAR UTILISATEUR
const CONFIG_DIR = path.join(__dirname, '..', 'data', 'autowrite');

// Initialiser la configuration pour un utilisateur spécifique
function getUserConfig(phoneNumber) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    
    const userConfigPath = path.join(CONFIG_DIR, `${phoneNumber}.json`);
    
    if (!fs.existsSync(userConfigPath)) {
        fs.writeFileSync(userConfigPath, JSON.stringify({ 
            enabled: false 
        }, null, 2));
    }
    
    return JSON.parse(fs.readFileSync(userConfigPath));
}

// Sauvegarder la configuration utilisateur
function saveUserConfig(phoneNumber, config) {
    const userConfigPath = path.join(CONFIG_DIR, `${phoneNumber}.json`);
    fs.writeFileSync(userConfigPath, JSON.stringify(config, null, 2));
}

export default { 
    name: 'autowrite',
    aliases: ['autotype', 'fakewrite'],
    description: 'Activer/désactiver la simulation d\'écriture automatique',
    usage: 'autowrite <on/off>',

    async execute({ sock, msg, args, phoneNumber, userConfigManager, config  }) {
        const jid = msg.key.remoteJid;
        
        // Vérification owner seulement
        if (!msg.key.fromMe) {
            return await sendReply(sock, jid, formatError('error_owner_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_owner_only'
            }), { quoted: msg });
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off', 'status'].includes(action)) {
            const usageText = translate(phoneNumber, 'autowrite_usage', userConfigManager, {
                prefix: config.prefix
            });
            return await sendReply(sock, jid, formatError(usageText), { quoted: msg });
        }

        const autowriteConfig = getUserConfig(phoneNumber);

        if (action === 'status') {
            const status = autowriteConfig.enabled ? 'activé' : 'désactivé';
            const statusText = translate(phoneNumber, 'autowrite_status', userConfigManager, {
                status: status,
                phoneNumber: phoneNumber
            });
            return await sendReply(sock, jid, statusText, { quoted: msg });
        }

        const shouldEnable = action === 'on';
        
        if (autowriteConfig.enabled === shouldEnable) {
            const alreadyText = translate(phoneNumber, 'autowrite_already', userConfigManager, {
                status: shouldEnable ? 'déjà activé' : 'déjà désactivé'
            });
            return await sendReply(sock, jid, formatError(alreadyText), { quoted: msg });
        }

        autowriteConfig.enabled = shouldEnable;
        saveUserConfig(phoneNumber, autowriteConfig);

        const resultText = translate(phoneNumber, shouldEnable ? 'autowrite_enabled' : 'autowrite_disabled', userConfigManager, {
            phoneNumber: phoneNumber
        });

        await sendReply(sock, jid, formatSuccess(resultText), { quoted: msg });
        console.log(`✍️ [${phoneNumber}] Autowrite ${shouldEnable ? 'activé' : 'désactivé'}`);
    }
};

// Fonction pour gérer l'écriture automatique - MAINTENANT AVEC phoneNumber
async function handleAutowrite(sock, chatId, phoneNumber) {
    try {
        const autowriteConfig = getUserConfig(phoneNumber);
        
        if (!autowriteConfig.enabled) {
            return false;
        }

        // S'abonner aux présences
        await sock.presenceSubscribe(chatId);
        
        // Montrer le statut "en train d'écrire"
        await sock.sendPresenceUpdate('composing', chatId);
        
        // Durée aléatoire entre 2 et 8 secondes
        const typingTime = Math.floor(Math.random() * 6000) + 2000;
        await new Promise(resolve => setTimeout(resolve, typingTime));
        
        // Arrêter l'écriture
        await sock.sendPresenceUpdate('paused', chatId);
        
        return true;
    } catch (error) {
        console.error(`❌ [${phoneNumber}] Erreur autowrite:`, error.message);
        return false;
    }
}

export { handleAutowrite};