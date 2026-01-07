/**
 * Exemples d'utilisation du système de réponses
 */

import response from '../lib/response.js';
import { isOwner, isAdmin } from '../lib/authHelper.js';
import configs from '../configs.js';

// ==========================================
// EXEMPLE 1: Commande PING
// ==========================================
export async function pingCommand(sock, chatId, message, args) {
    const start = Date.now();
    const ping = Date.now() - start;
    const uptime = process.uptime();
    
    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    await response.ping(sock, chatId, message, `${ping}ms`, formatUptime(uptime));
}

// ==========================================
// EXEMPLE 2: Commande MODE (Public/Private)
// ==========================================
export async function publicCommand(sock, chatId, message, args) {
    const owner = await isOwner(sock, message, configs);
    if (!owner) {
        return await response.error(sock, chatId, message, 'Only the bot owner can use this command.');
    }

    // Changer le mode
    // modeManager.setMode(true);
    
    await response.mode(sock, chatId, message, 'public');
}

export async function privateCommand(sock, chatId, message, args) {
    const owner = await isOwner(sock, message, configs);
    if (!owner) {
        return await response.error(sock, chatId, message, 'Only the bot owner can use this command.');
    }

    // Changer le mode
    // modeManager.setMode(false);
    
    await response.mode(sock, chatId, message, 'private');
}

// ==========================================
// EXEMPLE 3: Commande SUDO
// ==========================================
export async function sudoCommand(sock, chatId, message, args) {
    const owner = await isOwner(sock, message, configs);
    if (!owner) {
        return await response.error(sock, chatId, message, 'Only the bot owner can use this command.');
    }

    // Récupérer l'utilisateur mentionné
    const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    
    if (!mentionedJid) {
        return await response.error(sock, chatId, message, 'Please mention a user to add as sudo.');
    }

    // Ajouter comme sudo
    // sudoManager.addSudo(phoneNumber, mentionedJid);
    
    // Envoyer avec image (optionnel)
    await response.sudo(sock, chatId, message, 'add', mentionedJid, './media/sudo.jpg');
}

// ==========================================
// EXEMPLE 4: Commande ANTILINK
// ==========================================
export async function antilinkCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) {
        return await response.error(sock, chatId, message, 'This command can only be used in groups.');
    }

    const senderId = message.key.participant || message.key.remoteJid;
    const userIsAdmin = await isAdmin(sock, chatId, senderId);
    
    if (!userIsAdmin) {
        return await response.error(sock, chatId, message, 'Only group admins can use this command.');
    }

    if (args.length === 0) {
        return await response.error(sock, chatId, message, 'Usage: .antilink on/off');
    }

    const action = args[0].toLowerCase();
    const enabled = action === 'on';
    
    // Activer/désactiver antilink
    // antilink.toggle(chatId, enabled);
    
    await response.prot(sock, chatId, message, 'ANTILINK', enabled, 3);
}

// ==========================================
// EXEMPLE 5: Commande GROUP STATUS
// ==========================================
export async function groupstatusCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) {
        return await response.error(sock, chatId, message, 'This command can only be used in groups.');
    }

    // Récupérer le statut des protections
    const protections = {
        antilink: true,   // groupProtection.getGroupProtectionStatus(chatId).antilink
        antitag: false,   // groupProtection.getGroupProtectionStatus(chatId).antitag
        antimedia: false, // groupProtection.getGroupProtectionStatus(chatId).antimedia
        antispam: true    // groupProtection.getGroupProtectionStatus(chatId).antispam
    };

    await response.status(sock, chatId, message, protections);
}

// ==========================================
// EXEMPLE 6: Commande HELP/MENU
// ==========================================
export async function helpCommand(sock, chatId, message, args) {
    const menuData = {
        user: 'sen',
        prefix: '.',
        categories: [
            'GENERAL',
            'PROTECTION',
            'OWNER',
            'GROUP'
        ]
    };

    // Avec image (optionnel)
    await response.menu(sock, chatId, message, menuData, './media/menu.jpg');
}

// ==========================================
// EXEMPLE 7: Liste des utilisateurs SUDO
// ==========================================
export async function listsudoCommand(sock, chatId, message, args) {
    const owner = await isOwner(sock, message, configs);
    if (!owner) {
        return await response.error(sock, chatId, message, 'Only the bot owner can use this command.');
    }

    // Récupérer la liste des sudo
    const sudoUsers = [
        '237694530506',
        '237612345678'
    ]; // sudoManager.getSudoList()

    if (sudoUsers.length === 0) {
        return await response.info(sock, chatId, message, 'SUDO USERS', {
            'Total': '0 users'
        });
    }

    await response.list(sock, chatId, message, 'SUDO USERS', sudoUsers);
}

// ==========================================
// EXEMPLE 8: Utilisation dans les protections
// ==========================================
// Dans antilink.js, antitag.js, etc., remplacer les messages par:

async function sendWarning(sock, chatId, message, type, warning, userJid) {
    if (warning.shouldKick) {
        await response.warn(sock, chatId, message, type, warning.count, 3, userJid);
        
        // Kick l'utilisateur
        try {
            await sock.groupParticipantsUpdate(chatId, [userJid], 'remove');
        } catch (error) {
            console.error('Error kicking user:', error);
        }
    } else {
        await response.warn(sock, chatId, message, type, warning.count, 3, userJid);
    }
}

// ==========================================
// EXEMPLE 9: Messages d'information
// ==========================================
export async function infoCommand(sock, chatId, message, args) {
    const botInfo = {
        'Name': '𝗦𝗘𝗡',
        'Version': '2.0.0',
        'Developer': '𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑',
        'Commands': '25+',
        'Status': 'Online'
    };

    await response.info(sock, chatId, message, 'BOT INFORMATION', botInfo);
}