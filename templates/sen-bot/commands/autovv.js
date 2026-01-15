/**
 * 𝗦𝗘𝗡 Bot - AutoVV Command
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import autoVvManager from '../lib/autoVvManager.js';
import { isOwner } from '../lib/authHelper.js';
import configs from '../configs.js';

export async function autovvCommand(sock, chatId, message, args) {
    // Vérifier si c'est le propriétaire
    const owner = await isOwner(sock, message, configs);
    
    if (!owner) {
        return await sock.sendMessage(chatId, {
            text: '❌ Cette commande est réservée au propriétaire.'
        }, { quoted: message });
    }

    const action = args[0]?.toLowerCase();

    // Si pas d'argument, afficher le statut
    if (!action) {
        const status = autoVvManager.getStatus();
        
        let statusText = `*AUTO VIEW ONCE STATUS*\n\n`;
        statusText += `> *Status* : ${status.enabled ? '✅ Enabled' : '❌ Disabled'}\n`;
        
        if (status.enabled && status.enabledAt) {
            const date = new Date(status.enabledAt);
            statusText += `> *Enabled since* : ${date.toLocaleString()}\n`;
        }
        
        statusText += `\n*Usage:*\n`;
        statusText += `• .autovv on - Enable auto reveal\n`;
        statusText += `• .autovv off - Disable auto reveal`;
        
        return await sock.sendMessage(chatId, {
            text: statusText
        }, { quoted: message });
    }

    // Activer AutoVV
    if (action === 'on' || action === 'enable') {
        autoVvManager.enable();
        
        return await sock.sendMessage(chatId, {
            text: '✅ *Auto ViewOnce Enabled*\n\nToutes les vues uniques reçues seront automatiquement révélées et envoyées en DM.'
        }, { quoted: message });
    }

    // Désactiver AutoVV
    if (action === 'off' || action === 'disable') {
        autoVvManager.disable();
        
        return await sock.sendMessage(chatId, {
            text: '❌ *Auto ViewOnce Disabled*\n\nLes vues uniques ne seront plus révélées automatiquement.'
        }, { quoted: message });
    }

    // Commande invalide
    return await sock.sendMessage(chatId, {
        text: '❌ Usage: .autovv <on|off>'
    }, { quoted: message });
}

export default { autovvCommand };