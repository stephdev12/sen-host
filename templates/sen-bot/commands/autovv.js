/**
 * 𝗦𝗘𝗡 Bot - AutoVV Command
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import autoVvManager from '../lib/autoVvManager.js';
import { isOwner } from '../lib/authHelper.js';
import lang from '../lib/languageManager.js';
import configs from '../configs.js';

export async function autovvCommand(sock, chatId, message, args) {
    // Vérifier si c'est le propriétaire
    const owner = await isOwner(sock, message, configs);
    
    if (!owner) {
        return await sock.sendMessage(chatId, {
            text: lang.t('errors.ownerOnly')
        }, { quoted: message });
    }

    const action = args[0]?.toLowerCase();

    // Si pas d'argument, afficher le statut
    if (!action) {
        const status = autoVvManager.getStatus();
        
        let dateStr = '';
        if (status.enabled && status.enabledAt) {
            const date = new Date(status.enabledAt);
            dateStr = lang.t('autovv.since', { date: date.toLocaleString() });
        }
        
        const statusText = lang.t('autovv.status', {
            status: status.enabled ? lang.t('autovv.enabled') : lang.t('autovv.disabled'),
            date: dateStr
        }) + lang.t('autovv.usage');
        
        return await sock.sendMessage(chatId, {
            text: statusText
        }, { quoted: message });
    }

    // Activer AutoVV
    if (action === 'on' || action === 'enable') {
        autoVvManager.enable();
        
        return await sock.sendMessage(chatId, {
            text: lang.t('autovv.onMsg')
        }, { quoted: message });
    }

    // Désactiver AutoVV
    if (action === 'off' || action === 'disable') {
        autoVvManager.disable();
        
        return await sock.sendMessage(chatId, {
            text: lang.t('autovv.offMsg')
        }, { quoted: message });
    }

    // Commande invalide
    return await sock.sendMessage(chatId, {
        text: lang.t('autovv.invalid')
    }, { quoted: message });
}

export default { autovvCommand };