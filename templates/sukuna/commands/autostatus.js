import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import path from 'path';
import {  sendReply, formatSuccess, formatError, translate  } from '../lib/helpers.js';

const CONFIG_DIR = path.join(__dirname, '..', 'data', 'autostatus');

function getUserConfig(phoneNumber) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    
    const userConfigPath = path.join(CONFIG_DIR, `${phoneNumber}.json`);
    
    if (!fs.existsSync(userConfigPath)) {
        fs.writeFileSync(userConfigPath, JSON.stringify({ 
            viewEnabled: false,
            reactEnabled: false,
            reactEmoji: '❤️'
        }, null, 2));
    }
    
    return JSON.parse(fs.readFileSync(userConfigPath));
}

function saveUserConfig(phoneNumber, config) {
    const userConfigPath = path.join(CONFIG_DIR, `${phoneNumber}.json`);
    fs.writeFileSync(userConfigPath, JSON.stringify(config, null, 2));
}

export default { 
    name: 'autostatus',
    aliases: ['autostatusview', 'autostatusreact'],
    description: 'Gérer la visualisation et réaction automatique aux status',
    usage: 'autostatus <view/react> <on/off> [emoji]',

    async execute({ sock, msg, args, phoneNumber, userConfigManager, config  }) {
        const jid = msg.key.remoteJid;
        
        // Owner seulement
        if (!msg.key.fromMe) {
            return await sendReply(sock, jid, formatError('error_owner_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_owner_only'
            }), { quoted: msg });
        }

        const action = args[0]?.toLowerCase();
        const subAction = args[1]?.toLowerCase();
        
        if (!action || !['view', 'react', 'status'].includes(action)) {
            const usageText = translate(phoneNumber, 'autostatus_usage', userConfigManager, {
                prefix: config.prefix
            });
            return await sendReply(sock, jid, formatError(usageText), { quoted: msg });
        }

        const autostatusConfig = getUserConfig(phoneNumber);

        if (action === 'status') {
            const statusText = translate(phoneNumber, 'autostatus_status', userConfigManager, {
                viewStatus: autostatusConfig.viewEnabled ? 'activé' : 'désactivé',
                reactStatus: autostatusConfig.reactEnabled ? 'activé' : 'désactivé',
                reactEmoji: autostatusConfig.reactEmoji,
                phoneNumber: phoneNumber
            });
            return await sendReply(sock, jid, statusText, { quoted: msg });
        }

        if (action === 'view') {
            if (!subAction || !['on', 'off'].includes(subAction)) {
                return await sendReply(sock, jid, formatError('autostatus_view_usage'), { quoted: msg });
            }

            const shouldEnable = subAction === 'on';
            autostatusConfig.viewEnabled = shouldEnable;
            saveUserConfig(phoneNumber, autostatusConfig);

            const resultText = translate(phoneNumber, shouldEnable ? 'autostatus_view_enabled' : 'autostatus_view_disabled', userConfigManager, {
                phoneNumber: phoneNumber
            });

            await sendReply(sock, jid, formatSuccess(resultText), { quoted: msg });
            console.log(`👁️ [${phoneNumber}] Autostatus view ${shouldEnable ? 'activé' : 'désactivé'}`);
        }

        if (action === 'react') {
            if (!subAction || !['on', 'off', 'emoji'].includes(subAction)) {
                return await sendReply(sock, jid, formatError('autostatus_react_usage'), { quoted: msg });
            }

            if (subAction === 'emoji') {
                const newEmoji = args[2];
                if (!newEmoji) {
                    return await sendReply(sock, jid, formatError('autostatus_emoji_required'), { quoted: msg });
                }
                
                autostatusConfig.reactEmoji = newEmoji;
                saveUserConfig(phoneNumber, autostatusConfig);
                
                const successText = translate(phoneNumber, 'autostatus_emoji_updated', userConfigManager, {
                    emoji: newEmoji
                });
                return await sendReply(sock, jid, formatSuccess(successText), { quoted: msg });
            }

            const shouldEnable = subAction === 'on';
            autostatusConfig.reactEnabled = shouldEnable;
            saveUserConfig(phoneNumber, autostatusConfig);

            const resultText = translate(phoneNumber, shouldEnable ? 'autostatus_react_enabled' : 'autostatus_react_disabled', userConfigManager, {
                phoneNumber: phoneNumber,
                emoji: autostatusConfig.reactEmoji
            });

            await sendReply(sock, jid, formatSuccess(resultText), { quoted: msg });
            console.log(`❤️ [${phoneNumber}] Autostatus react ${shouldEnable ? 'activé' : 'désactivé'}`);
        }
    }
};

// Fonction pour gérer les status automatiques - MAINTENANT AVEC phoneNumber
async function handleAutoStatus(sock, status, phoneNumber) {
    try {
        const autostatusConfig = getUserConfig(phoneNumber);
        
        if (!autostatusConfig.viewEnabled && !autostatusConfig.reactEnabled) {
            return;
        }

        // Délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Gérer les messages de status
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                
                // Voir le status si activé
                if (autostatusConfig.viewEnabled) {
                    await sock.readMessages([msg.key]);
                }
                
                // Réagir au status si activé
                if (autostatusConfig.reactEnabled) {
                    await reactToStatus(sock, msg.key, autostatusConfig.reactEmoji);
                }
                return;
            }
        }

        // Gérer les status directs
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            if (autostatusConfig.viewEnabled) {
                await sock.readMessages([status.key]);
            }
            if (autostatusConfig.reactEnabled) {
                await reactToStatus(sock, status.key, autostatusConfig.reactEmoji);
            }
            return;
        }

    } catch (error) {
        console.error(`❌ [${phoneNumber}] Erreur autostatus:`, error.message);
    }
}

// Fonction pour réagir aux status
async function reactToStatus(sock, statusKey, emoji) {
    try {
        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: emoji
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
    } catch (error) {
        console.error('❌ Erreur réaction status:', error.message);
    }
}

export { handleAutoStatus };