/**
 * 𝗦𝗘𝗡 Bot - Save Status
 */

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import lang from '../lib/languageManager.js';

export async function saveStatusCommand(sock, chatId, message, args) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
        return sock.sendMessage(chatId, { text: lang.t('save.no_quoted') }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '⬇️', key: message.key }});

        let buffer, type;

        if (quoted.imageMessage) {
            type = 'image';
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        } else if (quoted.videoMessage) {
            type = 'video';
            const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
            buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        } else {
            return sock.sendMessage(chatId, { text: '❌ Type non supporté' });
        }

        // Renvoi direct
        if (type === 'image') {
            await sock.sendMessage(chatId, { image: buffer, caption: lang.t('save.saved') }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { video: buffer, caption: lang.t('save.saved') }, { quoted: message });
        }

    } catch (error) {
        console.error('Save Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur téléchargement' });
    }
}

export default { saveStatusCommand };
