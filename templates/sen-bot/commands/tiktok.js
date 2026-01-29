import axios from 'axios';
import lang from '../lib/languageManager.js';

export async function tiktokCommand(sock, chatId, message, args) {
    const url = args[0];

    if (!url) {
        return await sock.sendMessage(chatId, { 
            text: `🎵 Please provide a TikTok URL.\nExample: .tiktok https://vm.tiktok.com/ZMkMuEmmd` 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🎵', key: message.key } });

        const apiUrl = `https://apis.davidcyril.name.ng/download/tiktok?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.result) {
            return await sock.sendMessage(chatId, { text: '❌ Error fetching TikTok video.' }, { quoted: message });
        }

        const { video, author, desc, music } = data.result;

        const caption = `*SEN TIKTOK*\n` +
                        `> *Author*: ${author.nickname}\n` +
                        `> *Description*: ${desc}`;

        // Send Video
        await sock.sendMessage(chatId, {
            video: { url: video },
            caption: caption,
            gifPlayback: false
        }, { quoted: message });

        // Optionally send audio if needed, but usually video is enough. 
        // If users want audio, they might ask. For now, video is primary.

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('TikTok Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing request.' }, { quoted: message });
    }
}

export default tiktokCommand;
