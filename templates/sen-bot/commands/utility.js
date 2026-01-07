/**
 * 𝗦𝗘𝗡 Bot - Utility Commands (Multilingual)
 */

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import lang from '../lib/languageManager.js';

export async function getppCommand(sock, chatId, message, args) {
    try {
        let targetJid;
        const isGroup = chatId.endsWith('@g.us');
        const quoted = message.message?.extendedTextMessage?.contextInfo;

        if (quoted?.participant) {
            targetJid = quoted.participant; 
        } else if (quoted?.mentionedJid?.length > 0) {
            targetJid = quoted.mentionedJid[0]; 
        } else if (args.length > 0) {
            const num = args[0].replace(/[^0-9]/g, '');
            targetJid = num + '@s.whatsapp.net'; 
        } else {
            if (isGroup) {
                targetJid = chatId;
            } else {
                targetJid = message.key.participant || message.key.remoteJid;
            }
        }

        await sock.sendMessage(chatId, { 
            react: { text: '📸', key: message.key }
        });

        try {
            const ppUrl = await sock.profilePictureUrl(targetJid, 'image');
            
            await sock.sendMessage(chatId, { 
                image: { url: ppUrl },
                caption: lang.t('commands.getpp.success')
            }, { quoted: message });
            
        } catch (error) {
            await sock.sendMessage(chatId, { 
                text: lang.t('commands.getpp.notFound') 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('GetPP Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.fetchFailed') 
        }, { quoted: message });
    }
}

export async function saveCommand(sock, chatId, message, args) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.save.usage') 
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { 
            react: { text: '⬇️', key: message.key }
        });

        let buffer, type;

        if (quoted.imageMessage) {
            type = 'image';
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
        } else if (quoted.videoMessage) {
            type = 'video';
            const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
        } else {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.save.unsupported') 
            }, { quoted: message });
        }

        if (type === 'image') {
            await sock.sendMessage(chatId, { 
                image: buffer, 
                caption: lang.t('commands.save.success') 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                video: buffer, 
                caption: lang.t('commands.save.success') 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Save Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.saveFailed') 
        }, { quoted: message });
    }
}

export default { 
    getppCommand, 
    saveCommand 
};