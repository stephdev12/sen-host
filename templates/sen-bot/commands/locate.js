/**
 * 𝗦𝗘𝗡 Bot - Location Request (Multilingual)
 */

import { createRequire } from 'module';
import lang from '../lib/languageManager.js';
const require = createRequire(import.meta.url);
const { sendInteractiveMessage } = require('gifted-btns');

export async function locateCommand(sock, chatId, message, args) {
    try {
        await sock.sendMessage(chatId, { react: { text: '📍', key: message.key } });

        await sendInteractiveMessage(sock, chatId, {
            text: lang.t('commands.locate.request'),
            footer: lang.t('commands.locate.footer'),
            header: lang.t('commands.locate.header'),
            interactiveButtons: [
                {
                    name: 'send_location',
                    buttonParamsJson: JSON.stringify({
                        display_text: lang.t('commands.locate.button')
                    })
                }
            ]
        }, { 
            quoted: message 
        });

    } catch (error) {
        console.error('Locate Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.commandFailed') 
        }, { quoted: message });
    }
}

export default { locateCommand };