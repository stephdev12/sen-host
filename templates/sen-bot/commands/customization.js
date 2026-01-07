/**
 * 𝗦𝗘𝗡 Bot - Customization Commands (Multilingual)
 */

import settings from '../lib/settingsManager.js';
import uploader from '../lib/mediaUpload.js';
import { isOwner } from '../lib/authHelper.js';
import lang from '../lib/languageManager.js';
import configs from '../configs.js';

const ensureOwner = async (sock, chatId, message) => {
    const owner = await isOwner(sock, message, configs);
    if (!owner) {
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.ownerOnly') 
        }, { quoted: message });
        return false;
    }
    return true;
};

export async function setname(sock, chatId, message, args) {
    if (!await ensureOwner(sock, chatId, message)) return;

    const newName = args.join(' ');
    if (!newName) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.setname.usage') 
        }, { quoted: message });
    }

    settings.update('botName', newName);
    await sock.sendMessage(chatId, { 
        text: lang.t('commands.setname.success', { name: newName }) 
    }, { quoted: message });
}

export async function setprefix(sock, chatId, message, args) {
    if (!await ensureOwner(sock, chatId, message)) return;

    const newPrefix = args[0];
    if (!newPrefix) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.setprefix.usage') 
        }, { quoted: message });
    }

    settings.update('prefix', newPrefix);
    await sock.sendMessage(chatId, { 
        text: lang.t('commands.setprefix.success', { prefix: newPrefix }) 
    }, { quoted: message });
}

export async function setmenu(sock, chatId, message, args) {
    if (!await ensureOwner(sock, chatId, message)) return;

    const targetMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage 
                       || message.message?.imageMessage;

    if (!targetMessage) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.setmenu.usage') 
        }, { quoted: message });
    }

    await sock.sendMessage(chatId, { 
        text: lang.t('commands.setmenu.uploading') 
    }, { quoted: message });

    try {
        const url = await uploader.uploadImage(targetMessage);
        settings.update('menuImage', url);

        await sock.sendMessage(chatId, { 
            image: { url: url }, 
            caption: lang.t('commands.setmenu.success') 
        }, { quoted: message });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.uploadFailed') 
        }, { quoted: message });
    }
}

export async function setaudio(sock, chatId, message, args) {
    if (!await ensureOwner(sock, chatId, message)) return;

    const targetMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage 
                       || message.message?.audioMessage;

    if (!targetMessage) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.setaudio.usage') 
        }, { quoted: message });
    }

    await sock.sendMessage(chatId, { 
        text: lang.t('commands.setaudio.uploading') 
    }, { quoted: message });

    try {
        const url = await uploader.uploadAudio(targetMessage);
        
        settings.update('audioUrl', url);
        settings.update('audioEnabled', true);

        await sock.sendMessage(chatId, { 
            audio: { url: url }, 
            mimetype: 'audio/mp4',
            ptt: false,
            caption: lang.t('commands.setaudio.success') 
        }, { quoted: message });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.uploadFailed') 
        }, { quoted: message });
    }
}

export async function setstyle(sock, chatId, message, args) {
    if (!await ensureOwner(sock, chatId, message)) return;

    const style = parseInt(args[0]);
    if (!style || style < 1 || style > 3) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.setstyle.usage') 
        }, { quoted: message });
    }

    settings.update('menuStyle', style);
    await sock.sendMessage(chatId, { 
        text: lang.t('commands.setstyle.success', { style }) 
    }, { quoted: message });
}

export async function audio(sock, chatId, message, args) {
    if (!await ensureOwner(sock, chatId, message)) return;

    if (args.length === 0) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.audio.usage') 
        }, { quoted: message });
    }

    const state = args[0].toLowerCase() === 'on';
    settings.update('audioEnabled', state);

    await sock.sendMessage(chatId, { 
        text: lang.t('commands.audio.success', { 
            status: state ? lang.t('commands.audio.enabled') : lang.t('commands.audio.disabled') 
        }) 
    }, { quoted: message });
}

export default {
    setname,
    setprefix,
    setmenu,
    setaudio,
    setstyle,
    audio
};