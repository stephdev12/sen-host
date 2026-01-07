/**
 * 𝗦𝗘𝗡 Bot - Sora AI Video Command
 * API: Keith (Text2Video)
 */

import axios from 'axios';
import response from '../lib/response.js';

export async function soraCommand(sock, chatId, message, args) {
    const prompt = args.join(' ');

    if (!prompt) {
        return await sock.sendMessage(chatId, { 
            text: `🎥 ${response.font('Veuillez décrire la vidéo')}.\nEx: .sora a cat dancing` 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🎬', key: message.key } });

        // Appel API
        const apiUrl = `https://apiskeith.vercel.app/text2video?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.results) {
            return await sock.sendMessage(chatId, { text: '❌ Génération échouée.' }, { quoted: message });
        }

        // Envoi de la vidéo
        await sock.sendMessage(chatId, { 
            video: { url: data.results },
            caption: `*SORA GENERATOR*\n> *Prompt* : ${prompt}`,
            gifPlayback: false
        }, { quoted: message });

    } catch (error) {
        console.error('Sora Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Une erreur est survenue.' }, { quoted: message });
    }
}

export default { soraCommand };
