/**
 * 𝗦𝗘𝗡 Bot - Get Profile Picture
 */

import lang from '../lib/languageManager.js';

export async function getProfilePicCommand(sock, chatId, message, args) {
    try {
        let targetJid;
        const isGroup = chatId.endsWith('@g.us');
        const quoted = message.message?.extendedTextMessage?.contextInfo;

        // 1. Déterminer la cible (Logique prioritaire)
        if (quoted?.participant) {
            // Cas Réponse
            targetJid = quoted.participant; 
        } else if (quoted?.mentionedJid?.length > 0) {
            // Cas Mention
            targetJid = quoted.mentionedJid[0]; 
        } else if (args.length > 0) {
            // Cas Numéro direct
            targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'; 
        } else {
            // Cas Par défaut (Groupe ou Soi-même en privé)
            targetJid = isGroup ? chatId : (message.key.participant || message.key.remoteJid);
        }

        await sock.sendMessage(chatId, { react: { text: '📸', key: message.key }});

        // 2. Récupérer la PP
        try {
            const ppUrl = await sock.profilePictureUrl(targetJid, 'image');
            await sock.sendMessage(chatId, { 
                image: { url: ppUrl },
                caption: `> *PROFILE PIC*`
            }, { quoted: message });
        } catch (e) {
            // Pas de photo ou privé
            await sock.sendMessage(chatId, { text: lang.t('getpp.missing') }, { quoted: message });
        }

    } catch (error) {
        console.error('GetPP Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur' });
    }
}

export default { getProfilePicCommand };
