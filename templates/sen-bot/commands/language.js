/**
 * 𝗦𝗘𝗡 Bot - Language Command
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import lang from '../lib/languageManager.js';
import { isOwner } from '../lib/authHelper.js';
import configs from '../configs.js';

/**
 * Commande .language - Change la langue du bot
 */
export async function languageCommand(sock, chatId, message, args) {
    try {
        // Vérifier si l'utilisateur est owner
        const owner = await isOwner(sock, message, configs);
        if (!owner) {
            return await sock.sendMessage(chatId, {
                text: lang.t('errors.ownerOnly')
            }, { quoted: message });
        }

        // Si pas d'argument, afficher la langue actuelle et les langues disponibles
        if (args.length === 0) {
            const currentLang = lang.getLanguage();
            const available = lang.getAvailableLanguages();
            
            let text = `╭━━━━━━━━━━━━━━━━━━━╮\n`;
            text += `│  🌍 *${lang.t('language.title')}*  │\n`;
            text += `╰━━━━━━━━━━━━━━━━━━━╯\n\n`;
            text += `📌 *${lang.t('language.current')}:* ${currentLang.toUpperCase()}\n\n`;
            text += `🗣️ *${lang.t('language.available')}:*\n\n`;
            
            available.forEach(l => {
                text += `${l.flag} ${l.code.toUpperCase()} - ${l.name}\n`;
            });
            
            text += `\n${lang.t('language.usage')}`;
            
            return await sock.sendMessage(chatId, {
                text: text
            }, { quoted: message });
        }

        const newLang = args[0].toLowerCase();
        const result = lang.setLanguage(newLang);

        if (result.success) {
            await sock.sendMessage(chatId, {
                text: lang.t('language.success', { lang: newLang.toUpperCase() })
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: `❌ ${result.message}\n\n${lang.t('language.available')}`
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in language command:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

export default languageCommand;