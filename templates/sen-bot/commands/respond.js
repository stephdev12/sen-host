/**
 * 𝗦𝗘𝗡 Bot - Auto Respond (Multilingual)
 */

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { isOwner } from '../lib/authHelper.js';
import lang from '../lib/languageManager.js';
import configs from '../configs.js';
import autoRespondManager from '../lib/autoRespondManager.js';

export async function respondCommand(sock, chatId, message, args) {
    try {
        if (!await isOwner(sock, message, configs)) {
            return sock.sendMessage(chatId, { 
                text: lang.t('errors.ownerOnly') 
            }, { quoted: message });
        }

        if (args.length === 0) {
            const status = autoRespondManager.isEnabled();
            return sock.sendMessage(chatId, {
                text: lang.t('commands.respond.status', {
                    status: status ? lang.t('commands.respond.on') : lang.t('commands.respond.off')
                })
            }, { quoted: message });
        }

        const action = args[0].toLowerCase();
        
        if (action !== 'on' && action !== 'off') {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.respond.invalidOption')
            }, { quoted: message });
        }

        const enabled = action === 'on';
        autoRespondManager.setEnabled(enabled);

        await sock.sendMessage(chatId, {
            text: lang.t('commands.respond.updated', {
                status: enabled ? lang.t('commands.respond.enabled') : lang.t('commands.respond.disabled')
            })
        }, { quoted: message });

    } catch (error) {
        console.error('Respond Error:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

export async function setrespondCommand(sock, chatId, message, args) {
    try {
        if (!await isOwner(sock, message, configs)) {
            return sock.sendMessage(chatId, { 
                text: lang.t('errors.ownerOnly') 
            }, { quoted: message });
        }

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted) {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.setrespond.usage')
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { 
            react: { text: '💾', key: message.key }
        });

        let responseData = {
            type: null,
            content: null,
            caption: null
        };

        if (quoted.conversation || quoted.extendedTextMessage?.text) {
            responseData.type = 'text';
            responseData.content = quoted.conversation || quoted.extendedTextMessage.text;
        }
        else if (quoted.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            responseData.type = 'image';
            responseData.content = buffer.toString('base64');
            responseData.caption = quoted.imageMessage.caption || '';
        }
        else if (quoted.videoMessage?.ptv) {
            const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            responseData.type = 'video';
            responseData.content = buffer.toString('base64');
            responseData.ptv = true;
            responseData.caption = '';
        }
        else if (quoted.videoMessage) {
            const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            responseData.type = 'video';
            responseData.content = buffer.toString('base64');
            responseData.caption = quoted.videoMessage.caption || '';
            responseData.ptv = false;
        }
        else if (quoted.audioMessage) {
            const stream = await downloadContentFromMessage(quoted.audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            responseData.type = 'audio';
            responseData.content = buffer.toString('base64');
            responseData.ptt = quoted.audioMessage.ptt || false;
        }
        else if (quoted.stickerMessage) {
            const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            responseData.type = 'sticker';
            responseData.content = buffer.toString('base64');
        }
        else {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.setrespond.unsupported')
            }, { quoted: message });
        }

        autoRespondManager.setResponse(responseData);

        await sock.sendMessage(chatId, {
            text: lang.t('commands.setrespond.success', { 
                type: responseData.type.toUpperCase() 
            })
        }, { quoted: message });

    } catch (error) {
        console.error('SetRespond Error:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

export async function clearrespondCommand(sock, chatId, message, args) {
    try {
        if (!await isOwner(sock, message, configs)) {
            return sock.sendMessage(chatId, { 
                text: lang.t('errors.ownerOnly') 
            }, { quoted: message });
        }

        autoRespondManager.clearResponse();

        await sock.sendMessage(chatId, {
            text: lang.t('commands.clearrespond.success')
        }, { quoted: message });

    } catch (error) {
        console.error('ClearRespond Error:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

export default { 
    respondCommand, 
    setrespondCommand,
    clearrespondCommand 
};