/**
 * 𝗦𝗘𝗡 Bot - Instagram Command
 */

import axios from 'axios';
import lang from '../lib/languageManager.js';

export async function instagramCommand(sock, chatId, message, args) {
    const url = args[0];
    
    if (!url) {
        return await sock.sendMessage(chatId, { 
            text: '❌ Veuillez fournir un lien Instagram.' 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '📸', key: message.key } });

        const apiUrl = `https://api.princetechn.com/api/download/instadl?apikey=prince&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!data.success || !data.result) {
            return await sock.sendMessage(chatId, { text: '❌ Média introuvable.' }, { quoted: message });
        }

        const { download_url, thumbnail } = data.result;

        // Check if it's a video (URL often ends with .mp4 or contains .mp4) or image
        const isVideo = download_url.includes('.mp4');

        if (isVideo) {
            await sock.sendMessage(chatId, { 
                video: { url: download_url }, 
                caption: '📸 Instagram Video\n> BY SEN STUDIO'
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                image: { url: download_url }, 
                caption: '📸 Instagram Image\n> BY SEN STUDIO'
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Instagram Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur lors du téléchargement.' }, { quoted: message });
    }
}

export default { instagramCommand };
