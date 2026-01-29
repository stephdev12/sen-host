import axios from 'axios';

export async function naijaCommand(sock, chatId, message, args) {
    try {
        await sock.sendMessage(chatId, { react: { text: '🔞', key: message.key } });

        const apiUrl = `https://apis.davidcyril.name.ng/naijacum`;
        const { data } = await axios.get(apiUrl);

        if (!data.downloadUrl) {
            return await sock.sendMessage(chatId, { text: '❌ Content unavailable.' }, { quoted: message });
        }

        const { title, thumbnail, downloadUrl } = data;

        await sock.sendMessage(chatId, {
            video: { url: downloadUrl },
            caption: `*NAIJA LEAK*\n> ${title}`,
            gifPlayback: false,
            mimetype: 'video/mp4'
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Naija Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing request.' }, { quoted: message });
    }
}

export default naijaCommand;
