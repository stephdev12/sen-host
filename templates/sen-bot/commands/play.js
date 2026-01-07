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

        // 2. Appel API
        const url = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(query)}&apikey=`;
        const { data } = await axios.get(url);

        if (!data.status || !data.result) {
            return await sock.sendMessage(chatId, { text: '❌ Audio introuvable.' }, { quoted: message });
        }

        const song = data.result;

        // Astuce pour trouver l'auteur si le titre est "Auteur - Titre"
        let author = "Inconnu";
        let title = song.title;
        
        if (song.title.includes('-')) {
            const parts = song.title.split('-');
            author = parts[0].trim();
            title = parts.slice(1).join('-').trim();
        }

        // 3. Préparation du message (Format demandé)
        // On utilise response.font() si tu veux le style fancy, sinon texte brut.
        // Ici je respecte ton format strict :
        const caption = `*SEN_DOWNLOADER*\n` +
                        `> *title / titre* : ${song.title}\n` +
                        `> *auteur* : ${author}`;

        // 4. Envoi de l'audio avec le contexte (image en thumbnail)
        await sock.sendMessage(chatId, {
            audio: { url: song.download_url },
            mimetype: 'audio/mpeg',
            ptt: false, // Met à true si tu veux que ce soit comme une note vocale
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

        // Envoi du texte de détails séparément ou en légende ? 
        // WhatsApp ne permet pas de mettre de légende sur un message AUDIO pur.
        // Donc on envoie d'abord l'image avec le texte, puis l'audio, OU juste l'audio avec les métadonnées.
        
        // Option choisie : On envoie le message texte AVANT l'audio pour respecter ton format visuel
        // Car on ne peut pas mettre de caption visible sur un fichier audio standard.
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
