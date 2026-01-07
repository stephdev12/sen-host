/**
 * 𝗦𝗘𝗡 Bot - Ping Command
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import configs from '../configs.js';
import lang from '../lib/languageManager.js';
import response from '../lib/response.js';

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function pingCommand(sock, chatId, message, args) {
    try {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: lang.t('commands.ping.pong') }, { quoted: message });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);

        await response.ping(sock, chatId, message, ping, uptimeFormatted);

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: lang.t('errors.commandFailed') });
    }
}

export default pingCommand;