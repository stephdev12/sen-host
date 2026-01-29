import axios from 'axios';

export async function celebCommand(sock, chatId, message, args) {
    try {
        await sock.sendMessage(chatId, { react: { text: '🔞', key: message.key } });

        const apiUrl = `https://apis.davidcyril.name.ng/celeb`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.data) {
            return await sock.sendMessage(chatId, { text: '❌ Content unavailable.' }, { quoted: message });
        }

        const { title, thumbnail, downloadUrl } = data.data;

        await sock.sendMessage(chatId, {
            video: { url: downloadUrl },
            caption: `*CELEB EXPOSED*\n> ${title}`,
            gifPlayback: false,
            mimetype: 'video/mp4'
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Celeb Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing request.' }, { quoted: message });
    }
}

export default celebCommand;
