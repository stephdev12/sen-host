/**
 * 𝗦𝗘𝗡 Bot - Mode Commands (Public/Private)
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import modeManager from '../lib/modeManager.js';
import lang from '../lib/languageManager.js';
import { isOwner } from '../lib/authHelper.js';
import configs from '../configs.js';

/**
 * Commande .public - Active le mode public
 */
export async function publicCommand(sock, chatId, message, args) {
    try {
        // Vérifier si l'utilisateur est owner
        const owner = await isOwner(sock, message, configs);
        if (!owner) {
            return await sock.sendMessage(chatId, {
                text: lang.t('errors.ownerOnly')
            }, { quoted: message });
        }

        const result = modeManager.setMode(true);
        
        await sock.sendMessage(chatId, {
            text: lang.t('mode.public.success')
        }, { quoted: message });

    } catch (error) {
        console.error('Error in public command:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

/**
 * Commande .private - Active le mode privé
 */
export async function privateCommand(sock, chatId, message, args) {
    try {
        // Vérifier si l'utilisateur est owner
        const owner = await isOwner(sock, message, configs);
        if (!owner) {
            return await sock.sendMessage(chatId, {
                text: lang.t('errors.ownerOnly')
            }, { quoted: message });
        }

        const result = modeManager.setMode(false);
        
        await sock.sendMessage(chatId, {
            text: lang.t('mode.private.success')
        }, { quoted: message });

    } catch (error) {
        console.error('Error in private command:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

export default { publicCommand, privateCommand };