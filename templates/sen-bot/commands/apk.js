/**
 * 𝗦𝗘𝗡 Bot - APK Download (Multilingual)
 */

import axios from 'axios';
import StephUI from 'stephtech-ui';
import lang from '../lib/languageManager.js';

export async function apkCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    const query = args.join(' ');

    if (!query) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.apk.noQuery')
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '📲', key: message.key } });

        const apiUrl = `https://apis.davidcyriltech.my.id/download/apk?text=${encodeURIComponent(query)}&apikey=`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.apk) {
            return await sock.sendMessage(chatId, { 
                text: lang.t('commands.apk.notFound') 
            }, { quoted: message });
        }

        const app = data.apk;

        const caption = lang.t('commands.apk.info', {
            name: app.name,
            package: app.package,
            updated: app.lastUpdated
        });

        await ui.urlButtons(chatId, {
            text: caption,
            footer: lang.t('commands.apk.footer'),
            image: app.icon,
            buttons: [
                {
                    text: lang.t('commands.apk.downloadButton'),
                    url: app.downloadLink
                }
            ],
            quoted: message
        });

    } catch (error) {
        console.error('APK Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.searchFailed') 
        }, { quoted: message });
    }
}

export default { apkCommand };