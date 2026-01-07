import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import path from 'path';
import {  sendReply, formatSuccess, formatError, translate  } from '../lib/helpers.js';

const CONFIG_DIR = path.join(__dirname, '..', 'data', 'autoreact');

// Émojis par défaut
const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function getUserConfig(phoneNumber) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    
    const userConfigPath = path.join(CONFIG_DIR, `${phoneNumber}.json`);
    
    if (!fs.existsSync(userConfigPath)) {
        fs.writeFileSync(userConfigPath, JSON.stringify({ 
            groups: {} // Configuration par groupe POUR CET UTILISATEUR
        }, null, 2));
    }
    
    return JSON.parse(fs.readFileSync(userConfigPath));
}

function saveUserConfig(phoneNumber, config) {
    const userConfigPath = path.join(CONFIG_DIR, `${phoneNumber}.json`);
    fs.writeFileSync(userConfigPath, JSON.stringify(config, null, 2));
}

export default { 
    name: 'autoreact',
    aliases: ['autoreaction', 'autoreact'],
    description: 'Activer/désactiver les réactions automatiques dans les groupes',
    usage: 'autoreact <on/off> [emojis]',

    async execute({ sock, msg, args, phoneNumber, userConfigManager, config  }) {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');

        if (!isGroup) {
            return await sendReply(sock, jid, formatError('error_group_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_group_only'
            }), { quoted: msg });
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off', 'status', 'emojis'].includes(action)) {
            const usageText = translate(phoneNumber, 'autoreact_usage', userConfigManager, {
                prefix: config.prefix
            });
            return await sendReply(sock, jid, formatError(usageText), { quoted: msg });
        }

        const autoreactConfig = getUserConfig(phoneNumber);
        
        if (!autoreactConfig.groups[jid]) {
            autoreactConfig.groups[jid] = {
                enabled: false,
                emojis: DEFAULT_EMOJIS
            };
        }

        const groupConfig = autoreactConfig.groups[jid];

        if (action === 'status') {
            const status = groupConfig.enabled ? 'activé' : 'désactivé';
            const emojis = groupConfig.emojis.join(' ');
            const statusText = translate(phoneNumber, 'autoreact_status', userConfigManager, {
                status: status,
                emojis: emojis,
                phoneNumber: phoneNumber
            });
            return await sendReply(sock, jid, statusText, { quoted: msg });
        }

        if (action === 'emojis') {
            const newEmojis = args.slice(1);
            if (newEmojis.length === 0) {
                return await sendReply(sock, jid, formatError('autoreact_emojis_required'), { quoted: msg });
            }
            
            groupConfig.emojis = newEmojis;
            saveUserConfig(phoneNumber, autoreactConfig);
            
            const successText = translate(phoneNumber, 'autoreact_emojis_updated', userConfigManager, {
                emojis: newEmojis.join(' ')
            });
            return await sendReply(sock, jid, formatSuccess(successText), { quoted: msg });
        }

        const shouldEnable = action === 'on';
        
        if (groupConfig.enabled === shouldEnable) {
            const alreadyText = translate(phoneNumber, 'autoreact_already', userConfigManager, {
                status: shouldEnable ? 'déjà activé' : 'déjà désactivé'
            });
            return await sendReply(sock, jid, formatError(alreadyText), { quoted: msg });
        }

        groupConfig.enabled = shouldEnable;
        saveUserConfig(phoneNumber, autoreactConfig);

        const resultText = translate(phoneNumber, shouldEnable ? 'autoreact_enabled' : 'autoreact_disabled', userConfigManager, {
            phoneNumber: phoneNumber,
            emojis: groupConfig.emojis.join(' ')
        });

        await sendReply(sock, jid, formatSuccess(resultText), { quoted: msg });
        console.log(`🎭 [${phoneNumber}] Autoreact ${shouldEnable ? 'activé' : 'désactivé'} pour ${jid}`);
    }
};

// Fonction pour gérer les réactions automatiques - MAINTENANT AVEC phoneNumber
async function handleAutoreact(sock, msg, phoneNumber) {
    try {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        
        if (!isGroup || msg.key.fromMe) {
            return;
        }

        const autoreactConfig = getUserConfig(phoneNumber);
        const groupConfig = autoreactConfig.groups[jid];
        
        if (!groupConfig || !groupConfig.enabled || groupConfig.emojis.length === 0) {
            return;
        }

        // Choisir un émoji aléatoire
        const randomEmoji = groupConfig.emojis[Math.floor(Math.random() * groupConfig.emojis.length)];
        
        // Réagir au message
        await sock.sendMessage(jid, {
            react: {
                text: randomEmoji,
                key: msg.key
            }
        });

        console.log(`🎭 [${phoneNumber}] Réaction automatique: ${randomEmoji} dans ${jid}`);
        
    } catch (error) {
        console.error(`❌ [${phoneNumber}] Erreur autoreact:`, error.message);
    }
}

export { handleAutoreact }; 