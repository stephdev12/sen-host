/**
 * 𝗦𝗘𝗡 Bot - Image Manipulation (Multilingual)
 */

import axios from 'axios';
import mediaUploader from '../lib/mediaUpload.js';
import lang from '../lib/languageManager.js';

const BASE_URL = 'https://okatsu-rolezapiiz.vercel.app/tools';

async function processImageTool(sock, chatId, message, endpoint, expectJson = false, captionKey) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const targetMsg = quoted || message.message;
    const imageMsg = targetMsg?.imageMessage;

    if (!imageMsg) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.image.noImage')
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🖌️', key: message.key } });

        const publicUrl = await mediaUploader.uploadImage(imageMsg);
        
        if (!publicUrl) {
            return await sock.sendMessage(chatId, { 
                text: lang.t('errors.uploadFailed') 
            }, { quoted: message });
        }

        const apiUrl = `${BASE_URL}${endpoint}?url=${publicUrl}`;
        
        let finalMedia;

        if (expectJson) {
            const { data } = await axios.get(apiUrl);
            if (data.status && data.result) {
                finalMedia = { url: data.result };
            } else {
                throw new Error('API JSON invalide');
            }
        } else {
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            finalMedia = res.data;
        }

        await sock.sendMessage(chatId, { 
            image: finalMedia,
            caption: lang.t(captionKey)
        }, { quoted: message });

    } catch (error) {
        console.error(`Image Tool Error [${endpoint}]:`, error.message);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.processingFailed') 
        }, { quoted: message });
    }
}

export async function removebgCommand(sock, chatId, message, args) {
    await processImageTool(sock, chatId, message, '/removebg', false, 'commands.image.removebg');
}

export async function upscaleCommand(sock, chatId, message, args) {
    await processImageTool(sock, chatId, message, '/upscale', false, 'commands.image.upscale');
}

export async function img2sketchCommand(sock, chatId, message, args) {
    await processImageTool(sock, chatId, message, '/img2sketch', true, 'commands.image.sketch');
}

export default { removebgCommand, upscaleCommand, img2sketchCommand };