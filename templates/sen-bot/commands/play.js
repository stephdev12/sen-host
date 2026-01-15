/**
 * 𝗦𝗘𝗡 Bot - Play Command
 * Télécharge l'audio via l'API David Cyril
 */

import axios from 'axios';
import yts from 'yt-search';
import response from '../lib/response.js'; // Pour la police si besoin

export async function playCommand(sock, chatId, message, args) {
    const query = args.join(' ');

    if (!query) {
        return await sock.sendMessage(chatId, { 
            text: `🎵 Veuillez donner un titre.\nEx: .play Faded` 
        }, { quoted: message });
    }

    try {
        // 1. Réaction de chargement
        await sock.sendMessage(chatId, { react: { text: '🎧', key: message.key } });

        // 2. Recherche Youtube
        const searchResult = await yts(query);
        const video = searchResult.videos[0];

        if (!video) {
            return await sock.sendMessage(chatId, { text: '❌ Vidéo introuvable.' }, { quoted: message });
        }

        // 3. Appel API Download
        const url = `https://apis.davidcyril.name.ng/youtube/mp3?url=${video.url}&apikey=`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!data.success || !data.result) {
            return await sock.sendMessage(chatId, { text: '❌ Audio introuvable.' }, { quoted: message });
        }

        const song = data.result;

        // Astuce pour trouver l'auteur si le titre est "Auteur - Titre"
        let author = video.author.name || "Inconnu";
        let title = song.title;
        
        if (song.title.includes('-')) {
            const parts = song.title.split('-');
            if (!video.author.name) author = parts[0].trim();
            title = parts.slice(1).join('-').trim();
        }

        // 3. Préparation du message (Format demandé)
        const caption = `*SEN_DOWNLOADER*\n` +
                        `> *title / titre* : ${title}\n` +
                        `> *auteur* : ${author}`;

        // 4. Envoi de l'audio avec le contexte (image en thumbnail)
        await sock.sendMessage(chatId, {
            audio: { url: song.download_url },
            mimetype: 'audio/mpeg',
            ptt: false, // Met à true si tu veux que ce soit comme une note vocale
            fileName: `${title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: "SEN MUSIC PLAYER",
                    thumbnailUrl: song.thumbnail,
                    sourceUrl: video.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: message });

        // Option choisie : On envoie le message texte AVANT l'audio pour respecter ton format visuel
        await sock.sendMessage(chatId, { 
            image: { url: song.thumbnail },
            caption: caption
        }, { quoted: message });

    } catch (error) {
        console.error('Play Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur lors du téléchargement.' }, { quoted: message });
    }
}

export default { playCommand };
