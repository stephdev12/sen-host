/**
 * 𝗦𝗘𝗡 Bot - Protection Commands (FIXED ORDER)
 */

import groupProtection from '../lib/groupProtection.js';
import warningSystem from '../lib/warningSystem.js';
import { isAdmin, isOwner } from '../lib/authHelper.js';
import response from '../lib/response.js';
import lang from '../lib/languageManager.js';
import configs from '../configs.js';

// Helper interne pour toggle
async function toggle(sock, chatId, message, args, type, name, useGroupStyle = false) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('protection.groupOnly') 
        }, { quoted: message });
    }
    
    const sender = message.key.participant || message.key.remoteJid;
    const admin = await isAdmin(sock, chatId, sender);
    const owner = await isOwner(sock, message, configs);

    if (!admin && !owner) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('protection.adminOnly') 
        }, { quoted: message });
    }

    if (args.length === 0) {
        const status = groupProtection.getGroupProtectionStatus(chatId);
        // Utiliser response.group pour antipromote/antidemote, response.prot pour les autres
        if (useGroupStyle) {
            return await response.group(sock, chatId, message, name, status[type]);
        } else {
            return await response.prot(sock, chatId, message, name, status[type], 3);
        }
    }

    const enable = args[0].toLowerCase() === 'on';
    await groupProtection.toggleProtection(type, chatId, enable);
    
    if (useGroupStyle) {
        await response.group(sock, chatId, message, name, enable);
    } else {
        await response.prot(sock, chatId, message, name, enable, 3);
    }
}

// --- ANTILINK ---
export async function antilinkCommand(sock, chatId, message, args) {
    await toggle(sock, chatId, message, args, 'antilink', 'ANTILINK');
}

// --- ANTITAG ---
export async function antitagCommand(sock, chatId, message, args) {
    await toggle(sock, chatId, message, args, 'antitag', 'ANTITAG');
}

// --- ANTIMEDIA ---
export async function antimediaCommand(sock, chatId, message, args) {
    await toggle(sock, chatId, message, args, 'antimedia', 'ANTIMEDIA');
}

// --- ANTISPAM ---
export async function antispamCommand(sock, chatId, message, args) {
    await toggle(sock, chatId, message, args, 'antispam', 'ANTISPAM');
}

// --- ANTIPROMOTE ---
export async function antipromoteCommand(sock, chatId, message, args) {
    await toggle(sock, chatId, message, args, 'antipromote', 'ANTI-PROMOTE', true);
}

// --- ANTIDEMOTE ---
export async function antidemoteCommand(sock, chatId, message, args) {
    await toggle(sock, chatId, message, args, 'antidemote', 'ANTI-DEMOTE', true);
}

// --- ANTITRANSFERT ---
export async function antitransfertCommand(sock, chatId, message, args) {
    await toggle(sock, chatId, message, args, 'antitransfert', 'ANTI-TRANSFERT', true);
}

// --- ANTIMENTION ---
export async function antimentionCommand(sock, chatId, message, args) {
    await toggle(sock, chatId, message, args, 'antimention', 'ANTI-MENTION', true);
}

// --- WARNINGS ---
export async function warningsCommand(sock, chatId, message, args) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, {
                text: lang.t('protection.groupOnly')
            }, { quoted: message });
        }

        const senderId = message.key.participant || message.key.remoteJid;
        const userIsAdmin = await isAdmin(sock, chatId, senderId);
        const owner = await isOwner(sock, message, configs);
        
        if (!userIsAdmin && !owner) {
            return await sock.sendMessage(chatId, {
                text: lang.t('protection.adminOnly')
            }, { quoted: message });
        }

        let targetJid;
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
        } else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else {
            return await sock.sendMessage(chatId, {
                text: lang.t('errors.invalidUsage', { usage: 'Reply or mention a user' })
            }, { quoted: message });
        }

        const warnings = warningSystem.getWarnings(chatId, targetJid);
        
        let text = `*WARNINGS*\n\n`;
        text += `User: @${targetJid.split('@')[0]}\n`;
        text += `Total: ${warnings.count}/${warningSystem.maxWarnings}\n\n`;
        
        if (warnings.warnings.length === 0) {
            text += 'No warnings found';
        } else {
            text += 'History:\n\n';
            warnings.warnings.forEach((w, i) => {
                text += `${i + 1}. ${w.reason}\n`;
                text += `   ${new Date(w.timestamp).toLocaleString()}\n\n`;
            });
        }

        await sock.sendMessage(chatId, {
            text: text,
            mentions: [targetJid]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in warnings command:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

// --- RESET WARNINGS ---
export async function resetwarningsCommand(sock, chatId, message, args) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, {
                text: lang.t('protection.groupOnly')
            }, { quoted: message });
        }

        const senderId = message.key.participant || message.key.remoteJid;
        const userIsAdmin = await isAdmin(sock, chatId, senderId);
        const owner = await isOwner(sock, message, configs);
        
        if (!userIsAdmin && !owner) {
            return await sock.sendMessage(chatId, {
                text: lang.t('protection.adminOnly')
            }, { quoted: message });
        }

        let targetJid;
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
        } else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else {
            return await sock.sendMessage(chatId, {
                text: lang.t('errors.invalidUsage', { usage: 'Reply or mention a user' })
            }, { quoted: message });
        }

        const result = warningSystem.resetWarnings(chatId, targetJid);
        
        if (result.success) {
            await sock.sendMessage(chatId, {
                text: `*WARNINGS RESET*\n\nUser: @${targetJid.split('@')[0]}`,
                mentions: [targetJid]
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: result.message
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in resetwarnings command:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

// --- GROUP STATUS ---
export async function groupstatusCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('protection.groupOnly') 
        }, { quoted: message });
    }
    
    const status = groupProtection.getGroupProtectionStatus(chatId);
    await response.status(sock, chatId, message, status);
}

// --- EXPORT DEFAULT ---
export default {
    antilinkCommand,
    antitagCommand,
    antimediaCommand,
    antispamCommand,
    antipromoteCommand,
    antidemoteCommand,
    antitransfertCommand,
    antimentionCommand,
    warningsCommand,
    resetwarningsCommand,
    groupstatusCommand
};