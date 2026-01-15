import axios from 'axios';
import lang from '../lib/languageManager.js';

// Configuration des APIs
const APIS = {
    xvideo: 'https://api.princetechn.com/api/download/xvideosdl?apikey=prince&url=',
    xnxx: 'https://api.princetechn.com/api/download/xnxxdl?apikey=prince&url=',
    ass: 'https://api.princetechn.com/api/anime/ass?apikey=prince',
    hwaifu: 'https://api.princetechn.com/api/anime/hwaifu?apikey=prince',
    hneko: 'https://api.princetechn.com/api/anime/hneko?apikey=prince',
    milf: 'https://api.princetechn.com/api/anime/milf?apikey=prince'
};

// --- IMAGES (Ass, Hwaifu, Hneko, Milf) ---
async function sendAdultImage(sock, chatId, message, type) {
    try {
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        
        const { data } = await axios.get(APIS[type], {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        // La structure de réponse est généralement { status: 200, result: "URL" }
        if (!data.success || !data.result) throw new Error('API Response invalid');
        
        await sock.sendMessage(chatId, { 
            image: { url: data.result },
            caption: `> *${type.toUpperCase()}*`
        }, { quoted: message });
        
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error(`Erreur ${type}:`, error);
        await sock.sendMessage(chatId, { text: '❌ Erreur API' }, { quoted: message });
    }
}

// --- VIDEOS (Xvideo, Xnxx) ---
async function sendAdultVideo(sock, chatId, message, args, type) {
    try {
        if (!args[0]) {
            return await sock.sendMessage(chatId, { text: '❌ Lien manquant !' }, { quoted: message });
        }

        const url = args[0];
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        const apiUrl = `${APIS[type]}${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!data.success || !data.result) {
            return await sock.sendMessage(chatId, { text: '❌ Média introuvable ou erreur API.' }, { quoted: message });
        }

        let downloadUrl;
        let title = data.result.title || 'Video';

        if (type === 'xvideo') {
            downloadUrl = data.result.download_url;
        } else if (type === 'xnxx') {
            // Préférer high quality, sinon low
            downloadUrl = data.result.files?.high || data.result.files?.low;
        }

        if (!downloadUrl) {
            return await sock.sendMessage(chatId, { text: '❌ Impossible de récupérer le lien de téléchargement.' }, { quoted: message });
        }

        // Envoi du fichier
        await sock.sendMessage(chatId, { 
            video: { url: downloadUrl },
            caption: `🔞 *${title}*`,
            mimetype: 'video/mp4'
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error(`Erreur ${type}:`, error);
        await sock.sendMessage(chatId, { text: '❌ Erreur lors du téléchargement.' }, { quoted: message });
    }
}

// --- EXPORTS ---

export async function assCommand(sock, chatId, message, args) { await sendAdultImage(sock, chatId, message, 'ass'); }
export async function hwaifuCommand(sock, chatId, message, args) { await sendAdultImage(sock, chatId, message, 'hwaifu'); }
export async function hnekoCommand(sock, chatId, message, args) { await sendAdultImage(sock, chatId, message, 'hneko'); }
export async function milfCommand(sock, chatId, message, args) { await sendAdultImage(sock, chatId, message, 'milf'); }

export async function xvideoCommand(sock, chatId, message, args) { await sendAdultVideo(sock, chatId, message, args, 'xvideo'); }
export async function xnxxCommand(sock, chatId, message, args) { await sendAdultVideo(sock, chatId, message, args, 'xnxx'); }

export default {
    assCommand, hwaifuCommand, hnekoCommand, milfCommand,
    xvideoCommand, xnxxCommand
};
