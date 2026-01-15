/**
 * 𝗦𝗘𝗡 Bot - Welcome Commands (COMPLETE)
 */

import groupProtection from '../lib/groupProtection.js';
import { isAdmin, isOwner } from '../lib/authHelper.js';
import response from '../lib/response.js';
import lang from '../lib/languageManager.js';
import configs from '../configs.js';

async function checkAdmin(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { 
            text: lang.t('protection.groupOnly') 
        }, { quoted: message });
        return false;
    }
    
    const sender = message.key.participant || message.key.remoteJid;
    const admin = await isAdmin(sock, chatId, sender);
    const owner = await isOwner(sock, message, configs);
    
    if (!admin && !owner) {
        await sock.sendMessage(chatId, { 
            text: lang.t('protection.adminOnly') 
        }, { quoted: message });
        return false;
    }
    
    return true;
}

// --- WELCOME ON/OFF ---
export async function welcome(sock, chatId, message, args) {
    if (!await checkAdmin(sock, chatId, message)) return;
    
    if (args.length === 0) {
        const config = groupProtection.getGroupConfig(chatId);
        const status = config.welcome?.enabled || false;
        return await response.prot(sock, chatId, message, 'WELCOME', status);
    }
    
    const enable = args[0].toLowerCase() === 'on';
    await groupProtection.toggleProtection('welcome', chatId, enable);
    await response.group(sock, chatId, message, 'WELCOME', enable);
}

// --- GOODBYE ON/OFF ---
export async function goodbye(sock, chatId, message, args) {
    if (!await checkAdmin(sock, chatId, message)) return;
    
    if (args.length === 0) {
        const config = groupProtection.getGroupConfig(chatId);
        const status = config.goodbye?.enabled || false;
        return await response.prot(sock, chatId, message, 'GOODBYE', status);
    }

    const enable = args[0].toLowerCase() === 'on';
    await groupProtection.toggleProtection('goodbye', chatId, enable);
    await response.group(sock, chatId, message, 'GOODBYE', enable);
}

// --- SET WELCOME MESSAGE ---
export async function setwelcome(sock, chatId, message, args) {
    if (!await checkAdmin(sock, chatId, message)) return;
    
    const text = args.join(' ');
    if (!text) {
        return await sock.sendMessage(chatId, { 
            text: '*SETWELCOME*\n\nUsage: .setwelcome <message>\n\nVariables:\n{group} - Group name\n{user} - User mention\n{members} - Member count\n{desc} - Group description\n\nExample:\n.setwelcome Welcome @user to {group}!'
        }, { quoted: message });
    }
    
    groupProtection.updateGroupConfig(chatId, 'welcome', { 
        text: text, 
        enabled: true 
    });
    
    await sock.sendMessage(chatId, { 
        text: '*WELCOME MESSAGE SAVED*\n\nMessage: ' + text + '\n\nWelcome is now enabled!'
    }, { quoted: message });
}

// --- SET GOODBYE MESSAGE ---
export async function setgoodbye(sock, chatId, message, args) {
    if (!await checkAdmin(sock, chatId, message)) return;
    
    const text = args.join(' ');
    if (!text) {
        return await sock.sendMessage(chatId, { 
            text: '*SETGOODBYE*\n\nUsage: .setgoodbye <message>\n\nVariables:\n{group} - Group name\n{user} - User mention\n{members} - Member count\n\nExample:\n.setgoodbye Goodbye @user from {group}'
        }, { quoted: message });
    }
    
    groupProtection.updateGroupConfig(chatId, 'goodbye', { 
        text: text, 
        enabled: true 
    });
    
    await sock.sendMessage(chatId, { 
        text: '*GOODBYE MESSAGE SAVED*\n\nMessage: ' + text + '\n\nGoodbye is now enabled!'
    }, { quoted: message });
}

// --- EXPORT DEFAULT (pour compatibilité) ---
export default {
    welcome,
    goodbye,
    setwelcome,
    setgoodbye
};