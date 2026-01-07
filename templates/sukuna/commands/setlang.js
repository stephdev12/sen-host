import userConfigManager from '../userConfigManager.js';
import {  sendReply, formatError, formatSuccess, formatHelp, translate  } from '../lib/helpers.js';

export default { 
    name: 'setlang',
    aliases: ['language', 'lang', 'setlanguage'],
    description: 'Définir la langue du bot',
    usage: 'setlang <fr/en/es/ht/id>',
    
    async execute({ sock, msg, args, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        
        if (isGroup) {
            return sendReply(sock, jid, formatError('error_group_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_group_only'
            }), { quoted: msg });
        }

        if (!args.length) {
            const currentConfig = userConfigManager.getUserConfig(phoneNumber);
            
            // ⭐ MISE À JOUR DES LANGUES DISPONIBLES ⭐
            const langNames = {
                'fr': 'Français 🇫🇷',
                'en': 'English 🇺🇸', 
                'es': 'Español 🇪🇸',
                'ht': 'Kreyòl Ayisyen 🇭🇹',
                'id': 'Bahasa Indonesia 🇮🇩'
            };
            
            const currentLangName = langNames[currentConfig.language] || 'Français 🇫🇷';
            
            const helpText = translate(phoneNumber, 'setlang_help', userConfigManager, {
                currentLang: currentLangName,
                prefix: currentConfig.prefix
            });

            return sendReply(sock, jid, formatHelp(helpText, {
                phoneNumber,
                userConfigManager
            }), { quoted: msg });
        }

        const newLang = args[0].toLowerCase();

        try {
            const updatedConfig = userConfigManager.setLanguage(phoneNumber, newLang);
            
            
            const langNames = {
                'fr': 'Français 🇫🇷',
                'en': 'English 🇺🇸',
                'es': 'Español 🇪🇸', 
                'ht': 'Kreyòl Ayisyen 🇭🇹',
                'id': 'Bahasa Indonesia 🇮🇩'
            };
            
            const langName = langNames[newLang] || newLang;
            
            const successText = translate(phoneNumber, 'setlang_success', userConfigManager, {
                langName: langName,
                phoneNumber: phoneNumber
            });
            
            await sendReply(sock, jid, formatSuccess(successText), { quoted: msg });

        } catch (error) {
            const errorText = translate(phoneNumber, 'setlang_error', userConfigManager, {
                error: error.message,
                currentLang: userConfigManager.getUserConfig(phoneNumber).language
            });
            
            await sendReply(sock, jid, formatError(errorText), { quoted: msg });
        }
    }
};