/**
 * 𝗦𝗘𝗡 Bot - Pinterest Command
 * API: Siputzx | Style: Carousel sans boutons
 */

import axios from 'axios';
import StephUI from 'stephtech-ui';
import response from '../lib/response.js';

export async function pinterestCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    const query = args.join(' ');

    if (!query) {
        return await sock.sendMessage(chatId, { 
            text: `📌 ${response.font('Veuillez entrer une recherche')}.\nEx: .pinterest cat` 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '📌', key: message.key } });

        const url = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}&type=image`;
        const { data } = await axios.get(url);

        if (!data.status || !data.data || data.data.length === 0) {
            return await sock.sendMessage(chatId, { text: '❌ Aucune image trouvée.' }, { quoted: message });
        }

        const pins = data.data.slice(0, 6);
        const cards = [];

        for (const pin of pins) {
            const title = pin.grid_title || pin.description || query;
            const cleanTitle = title.length > 40 ? title.substring(0, 37) + '...' : title;
            const author = pin.pinner ? pin.pinner.full_name : 'Unknown';

            cards.push({
                title: cleanTitle.toUpperCase(),
                body: `> Author: ${author}\n> BY SEN STUDIO`,
                image: pin.image_url,
                buttons: [] // Tableau vide = Pas de boutons
            });
        }

        await ui.carousel(chatId, {
            header: `PINTEREST: ${query.toUpperCase()}`,
            cards: cards,
            quoted: message
        });

    } catch (error) {
        console.error('Pinterest Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur API Pinterest.' }, { quoted: message });
    }
}

export default { pinterestCommand };
