/**
 * 𝗦𝗘𝗡 Bot - Group Management (Multilingual)
 */

import { isAdmin, isOwner } from '../lib/authHelper.js';
import lang from '../lib/languageManager.js';
import configs from '../configs.js';
import chalk from 'chalk';

const SUCCESS = '✅';
const ERROR = '❌';

async function react(sock, message, emoji) {
    try {
        await sock.sendMessage(message.key.remoteJid, {
            react: { text: emoji, key: message.key }
        });
    } catch (error) {
        console.error(chalk.red('Error reacting:'), error.message);
    }
}

async function checkPermissions(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) {
        await react(sock, message, ERROR);
        return false;
    }
    
    const sender = message.key.participant || message.key.remoteJid;
    const admin = await isAdmin(sock, chatId, sender);
    const owner = await isOwner(sock, message, configs);
    
    if (!admin && !owner) {
        await react(sock, message, ERROR);
        return false;
    }
    
    return true;
}

function getTargetJid(message) {
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        return message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        return message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    
    return null;
}

export async function add(sock, chatId, message, args) {
    if (!await checkPermissions(sock, chatId, message)) return;
    
    if (args.length === 0) {
        return await react(sock, message, ERROR);
    }
    
    try {
        let number = args[0].replace(/[^0-9]/g, '');
        const jid = number + '@s.whatsapp.net';
        
        await sock.groupParticipantsUpdate(chatId, [jid], 'add');
        await react(sock, message, SUCCESS);
    } catch (error) {
        console.error(chalk.red('Error adding member:'), error.message);
        await react(sock, message, ERROR);
    }
}

export async function kick(sock, chatId, message, args) {
    if (!await checkPermissions(sock, chatId, message)) return;
    
    const targetJid = getTargetJid(message);
    
    if (!targetJid) {
        return await react(sock, message, ERROR);
    }
    
    try {
        await sock.groupParticipantsUpdate(chatId, [targetJid], 'remove');
        await react(sock, message, SUCCESS);
    } catch (error) {
        console.error(chalk.red('Error kicking member:'), error.message);
        await react(sock, message, ERROR);
    }
}

export async function promote(sock, chatId, message, args) {
    if (!await checkPermissions(sock, chatId, message)) return;
    
    const targetJid = getTargetJid(message);
    
    if (!targetJid) {
        return await react(sock, message, ERROR);
    }
    
    try {
        await sock.groupParticipantsUpdate(chatId, [targetJid], 'promote');
        await react(sock, message, SUCCESS);
    } catch (error) {
        console.error(chalk.red('Error promoting member:'), error.message);
        await react(sock, message, ERROR);
    }
}

export async function demote(sock, chatId, message, args) {
    if (!await checkPermissions(sock, chatId, message)) return;
    
    const targetJid = getTargetJid(message);
    
    if (!targetJid) {
        return await react(sock, message, ERROR);
    }
    
    try {
        await sock.groupParticipantsUpdate(chatId, [targetJid], 'demote');
        await react(sock, message, SUCCESS);
    } catch (error) {
        console.error(chalk.red('Error demoting member:'), error.message);
        await react(sock, message, ERROR);
    }
}

export async function demoteall(sock, chatId, message, args) {
    if (!await checkPermissions(sock, chatId, message)) return;
    
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const admins = groupMetadata.participants
            .filter(p => p.admin && p.id !== botNumber)
            .map(p => p.id);
        
        if (admins.length === 0) {
            return await react(sock, message, ERROR);
        }
        
        await sock.groupParticipantsUpdate(chatId, admins, 'demote');
        await react(sock, message, SUCCESS);
    } catch (error) {
        console.error(chalk.red('Error demoting all:'), error.message);
        await react(sock, message, ERROR);
    }
}

export async function gname(sock, chatId, message, args) {
    if (!await checkPermissions(sock, chatId, message)) return;
    
    if (args.length === 0) {
        return await react(sock, message, ERROR);
    }
    
    try {
        const newName = args.join(' ');
        await sock.groupUpdateSubject(chatId, newName);
        await react(sock, message, SUCCESS);
    } catch (error) {
        console.error(chalk.red('Error updating group name:'), error.message);
        await react(sock, message, ERROR);
    }
}

export async function gdesc(sock, chatId, message, args) {
    if (!await checkPermissions(sock, chatId, message)) return;
    
    if (args.length === 0) {
        return await react(sock, message, ERROR);
    }
    
    try {
        const newDesc = args.join(' ');
        await sock.groupUpdateDescription(chatId, newDesc);
        await react(sock, message, SUCCESS);
    } catch (error) {
        console.error(chalk.red('Error updating group description:'), error.message);
        await react(sock, message, ERROR);
    }
}

export async function glink(sock, chatId, message, args) {
    if (!await checkPermissions(sock, chatId, message)) return;
    
    try {
        const code = await sock.groupInviteCode(chatId);
        const link = `https://chat.whatsapp.com/${code}`;
        
        await sock.sendMessage(chatId, {
            text: lang.t('commands.glink.success', { link })
        }, { quoted: message });
        
        await react(sock, message, SUCCESS);
    } catch (error) {
        console.error(chalk.red('Error getting group link:'), error.message);
        await react(sock, message, ERROR);
    }
}

export default {
    add,
    kick,
    promote,
    demote,
    demoteall,
    gname,
    gdesc,
    glink
};