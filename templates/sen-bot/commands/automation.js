import settings from '../lib/settingsManager.js';
import lang from '../lib/languageManager.js';

export async function autowriteCommand(sock, chatId, message, args) {
    const arg = args[0]?.toLowerCase();
    
    if (arg === 'on') {
        settings.update('autowrite', true);
        settings.update('autorecord', false); // Mutually exclusive
        await sock.sendMessage(chatId, { text: lang.t('commands.autowrite.enabled') }, { quoted: message });
    } else if (arg === 'off') {
        settings.update('autowrite', false);
        await sock.sendMessage(chatId, { text: lang.t('commands.autowrite.disabled') }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { text: lang.t('commands.autowrite.usage') }, { quoted: message });
    }
}

export async function autorecordCommand(sock, chatId, message, args) {
    const arg = args[0]?.toLowerCase();
    
    if (arg === 'on') {
        settings.update('autorecord', true);
        settings.update('autowrite', false); // Mutually exclusive
        await sock.sendMessage(chatId, { text: lang.t('commands.autorecord.enabled') }, { quoted: message });
    } else if (arg === 'off') {
        settings.update('autorecord', false);
        await sock.sendMessage(chatId, { text: lang.t('commands.autorecord.disabled') }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { text: lang.t('commands.autorecord.usage') }, { quoted: message });
    }
}

export async function autostatusCommand(sock, chatId, message, args) {
    const arg = args[0]?.toLowerCase();
    const emoji = args[1]; // .autostatus react ❤️ (react=0, emoji=1)

    if (arg === 'on') {
        settings.update('autostatus', true);
        await sock.sendMessage(chatId, { text: lang.t('commands.autostatus.enabled') }, { quoted: message });
    } else if (arg === 'off') {
        settings.update('autostatus', false);
        settings.update('autostatus_react', null);
        await sock.sendMessage(chatId, { text: lang.t('commands.autostatus.disabled') }, { quoted: message });
    } else if (arg === 'react') {
        if (emoji) {
            settings.update('autostatus', true); // Enable main feature
            settings.update('autostatus_react', emoji);
            await sock.sendMessage(chatId, { text: lang.t('commands.autostatus.reactEnabled', { emoji }) }, { quoted: message });
        } else {
            settings.update('autostatus_react', null);
            await sock.sendMessage(chatId, { text: lang.t('commands.autostatus.reactDisabled') }, { quoted: message });
        }
    } else {
        await sock.sendMessage(chatId, { text: lang.t('commands.autostatus.usage') }, { quoted: message });
    }
}

export async function antideleteCommand(sock, chatId, message, args) {
    const arg = args[0]?.toLowerCase();
    
    if (arg === 'on') {
        settings.update('antidelete', true);
        await sock.sendMessage(chatId, { text: lang.t('commands.antidelete.enabled') }, { quoted: message });
    } else if (arg === 'off') {
        settings.update('antidelete', false);
        await sock.sendMessage(chatId, { text: lang.t('commands.antidelete.disabled') }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { text: lang.t('commands.antidelete.usage') }, { quoted: message });
    }
}
