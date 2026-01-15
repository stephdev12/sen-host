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

        const apiUrl = `https://api.princetechn.com/api/download/apkdl?apikey=prince&appName=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!data.success || !data.result) {
            return await sock.sendMessage(chatId, { 
                text: lang.t('commands.apk.notFound') 
            }, { quoted: message });
        }

        const app = data.result;

        const caption = lang.t('commands.apk.info', {
            name: app.appname,
            package: app.package || 'N/A',
            updated: 'N/A' // API doesn't provide update date anymore
        });

        await ui.urlButtons(chatId, {
            text: caption,
            footer: lang.t('commands.apk.footer'),
            image: app.appicon,
            buttons: [
                {
                    text: lang.t('commands.apk.downloadButton'),
                    url: app.download_url
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