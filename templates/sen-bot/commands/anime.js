/**
 * 𝗦𝗘𝗡 Bot - Anime Commands (Buffer Version)
 * Fix: "Media doesn't exist" -> On télécharge le fichier avant l'envoi.
 */

import axios from 'axios';

const BASE_URL = 'https://okatsu-rolezapiiz.vercel.app';

// Configuration des endpoints
const ENDPOINTS = {
    // GIFs
    hug: { path: '/anime/hug', type: 'gif' },
    happy: { path: '/anime/happy', type: 'gif' },
    kiss: { path: '/anime/kiss', type: 'gif' },
    
    // Images Anime
    akiyama: { path: '/anime/akiyama', type: 'image' },
    boruto: { path: '/anime/boruto', type: 'image' },
    deidara: { path: '/anime/deidara', type: 'image' },
    fanart: { path: '/anime/fanart', type: 'image' },
    sasuke: { path: '/anime/sasuke', type: 'image' },
    waifu: { path: '/anime/waifu', type: 'image' },
    
    // Random / Autres
    bluearchive: { path: '/random/ba', type: 'image' },
    loli: { path: '/random/loli', type: 'image' },
    
    // NSFW
    nsfw: { path: '/random/nsfw', type: 'image' },
    hneko: { path: '/random/nekonsfw', type: 'image' },
    hwaifu: { path: '/random/nsfwwaifu', type: 'image' }
};

// Fonction pour télécharger un fichier en Buffer
async function getBuffer(url) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return res.data;
    } catch (e) {
        console.error(`Impossible de télécharger: ${url}`);
        throw e;
    }
}

/**
 * Fonction Principale
 */
async function sendAnime(sock, chatId, message, cmdName) {
    const config = ENDPOINTS[cmdName];
    if (!config) return;

    try {
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        // 1. Récupération de la réponse API (JSON ou Image brute)
        const { data } = await axios.get(`${BASE_URL}${config.path}`, { responseType: 'arraybuffer' });
        
        let mediaBuffer;

        try {
            // Cas A : L'API renvoie un JSON contenant le lien
            const jsonString = data.toString('utf-8');
            const json = JSON.parse(jsonString);
            
            const url = json.url || json.link || json.image || json.result;
            if (!url) throw new Error('Pas d\'URL dans le JSON');

            // On télécharge le VRAI fichier depuis l'URL trouvée
            mediaBuffer = await getBuffer(url);

        } catch (e) {
            // Cas B : L'API a renvoyé l'image directement (pas de JSON)
            // Donc 'data' est déjà notre image
            mediaBuffer = data;
        }

        const caption = `> *${cmdName.toUpperCase()}*`;

        if (config.type === 'gif') {
            // Envoi Vidéo (GIF)
            await sock.sendMessage(chatId, { 
                video: mediaBuffer, // On envoie le buffer, pas l'url
                caption: caption,
                gifPlayback: true
            }, { quoted: message });
        } else {
            // Envoi Image
            await sock.sendMessage(chatId, { 
                image: mediaBuffer, // On envoie le buffer
                caption: caption
            }, { quoted: message });
        }
        
        // Réaction de succès
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error(`Erreur Anime [${cmdName}]:`, error.message);
        await sock.sendMessage(chatId, { text: '❌ Erreur de chargement du média.' }, { quoted: message });
    }
}

// --- Exports ---

export async function hugCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'hug'); }
export async function happyCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'happy'); }
export async function kissCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'kiss'); }

export async function akiyamaCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'akiyama'); }
export async function borutoCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'boruto'); }
export async function deidaraCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'deidara'); }
export async function fanartCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'fanart'); }
export async function sasukeCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'sasuke'); }
export async function waifuCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'waifu'); }

export async function bluearchiveCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'bluearchive'); }
export async function loliCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'loli'); }

export async function nsfwCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'nsfw'); }
export async function hnekoCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'hneko'); }
export async function hwaifuCommand(sock, chatId, message, args) { await sendAnime(sock, chatId, message, 'hwaifu'); }

export default { 
    hugCommand, happyCommand, kissCommand,
    akiyamaCommand, borutoCommand, deidaraCommand, fanartCommand, sasukeCommand, waifuCommand,
    bluearchiveCommand, loliCommand,
    nsfwCommand, hnekoCommand, hwaifuCommand
};
