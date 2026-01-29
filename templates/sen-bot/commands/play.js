/**
 * 𝗦𝗘𝗡 Bot - Play Command
 * Télécharge l'audio via l'API David Cyril
 */

import axios from 'axios';
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

        // 2. Appel API David Cyril
        const apiUrl = `https://apis.davidcyril.name.ng/song?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.result) {
            return await sock.sendMessage(chatId, { text: '❌ Audio introuvable.' }, { quoted: message });
        }

        const song = data.result;

        // 3. Préparation du message
        const caption = `*SEN_DOWNLOADER*\n` +
                        `> *titre* : ${song.title}\n` +
                        `> *durée* : ${song.duration}\n` +
                        `> *vues* : ${song.views}\n` +
                        `> *auteur* : ${song.creator || 'Inconnu'}`;

        // 4. Envoi de l'image avec caption
        await sock.sendMessage(chatId, { 
            image: { url: song.thumbnail },
            caption: caption
        }, { quoted: message });

        // 5. Envoi de l'audio
        await sock.sendMessage(chatId, {
            audio: { url: song.audio.download_url },
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${song.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: song.title,
                    body: "SEN MUSIC PLAYER",
                    thumbnailUrl: song.thumbnail,
                    sourceUrl: song.video_url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Play Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur lors du téléchargement.' }, { quoted: message });
    }
}

export default { playCommand };
