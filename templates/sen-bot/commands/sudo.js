/**
 * 𝗦𝗘𝗡 Bot - Sudo Commands (Version Corrigée & Flexible)
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import sudoManager from '../lib/sudoManager.js';
import { isOwner, getPhoneNumber } from '../lib/authHelper.js';
import configs from '../configs.js';
import response from '../lib/response.js';
import chalk from 'chalk';
import lang from '../lib/languageManager.js';

// Fonction utilitaire pour nettoyer les JIDs
const cleanJid = (jid) => jid.split('@')[0].split(':')[0] + '@s.whatsapp.net';

/**
 * Commande .sudo - Ajoute un utilisateur sudo
 */
export async function sudoCommand(sock, chatId, message, args) {
    try {
        // 1. Vérification Owner avec logs
        const owner = await isOwner(sock, message, configs);
        if (!owner) {
            console.log(chalk.red(`⛔ Commande Sudo refusée : L'utilisateur n'est pas reconnu comme Owner.`));
            // Optionnel : tu peux décommenter la ligne suivante si tu veux que le bot réponde qu'il refuse
            // await sock.sendMessage(chatId, { text: '❌ Commande réservée au propriétaire.' }, { quoted: message });
            return;
        }

        let targetJid, targetPhone;

        // 2. Récupération de la cible (Plus flexible)
        
        // Cas A : Tu as répondu à un message
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
            targetPhone = await getPhoneNumber(sock, targetJid);
        }
        // Cas B : Tu as mentionné quelqu'un (@user)
        else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            targetPhone = await getPhoneNumber(sock, targetJid);
        }
        // Cas C : Tu as écrit le numéro directement (ex: .sudo 2376555555)
        else if (args.length > 0) {
            // On nettoie le numéro (enlève les espaces, +, etc)
            targetPhone = args[0].replace(/[^0-9]/g, '');
            targetJid = targetPhone + '@s.whatsapp.net';
        }
        else {
            return await sock.sendMessage(chatId, {
                text: lang.t('sudo.usage')
            }, { quoted: message });
        }

        // 3. Action
        const result = sudoManager.addSudoUser(targetPhone, targetJid);

        if (result.success) {
            console.log(chalk.green(`✅ Sudo ajouté : ${targetPhone}`));
            // On appelle response.sudo avec les bons arguments
            await response.sudo(sock, chatId, message, 'add', targetJid);
        } else {
            await sock.sendMessage(chatId, {
                text: lang.t('sudo.already')
            }, { quoted: message });
        }

    } catch (error) {
        console.error('❌ Erreur sudo command:', error);
        await sock.sendMessage(chatId, { text: lang.t('errors.commandFailed') }, { quoted: message });
    }
}

/**
 * Commande .delsudo - Retire un utilisateur sudo
 */
export async function delsudoCommand(sock, chatId, message, args) {
    try {
        const owner = await isOwner(sock, message, configs);
        if (!owner) return;

        let targetJid, targetPhone;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
            targetPhone = await getPhoneNumber(sock, targetJid);
        }
        else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            targetPhone = await getPhoneNumber(sock, targetJid);
        }
        else if (args.length > 0) {
            targetPhone = args[0].replace(/[^0-9]/g, '');
            targetJid = targetPhone + '@s.whatsapp.net';
        }
        else {
            return await sock.sendMessage(chatId, {
                text: lang.t('sudo.usage_del')
            }, { quoted: message });
        }

        const result = sudoManager.removeSudoUser(targetPhone);

        if (result.success) {
            console.log(chalk.green(`🗑️ Sudo retiré : ${targetPhone}`));
            await response.sudo(sock, chatId, message, 'remove', targetJid);
        } else {
            await sock.sendMessage(chatId, {
                text: lang.t('sudo.notFound')
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in delsudo command:', error);
        await sock.sendMessage(chatId, { text: lang.t('errors.commandFailed') }, { quoted: message });
    }
}

/**
 * Commande .listsudo - Liste tous les utilisateurs sudo
 */
export async function listsudoCommand(sock, chatId, message, args) {
    try {
        const owner = await isOwner(sock, message, configs);
        if (!owner) return;

        const sudoUsers = sudoManager.listSudoUsers();

        if (!sudoUsers || sudoUsers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: lang.t('sudo.empty')
            }, { quoted: message });
        }

        // On formate la liste joliment
        const items = sudoUsers.map(user => 
            `👤 +${user.phone}\n   📅 ${new Date(user.addedAt).toLocaleDateString()}`
        );

        await response.list(sock, chatId, message, lang.t('sudo.list_title', { count: sudoUsers.length }), items);

    } catch (error) {
        console.error('Error in listsudo command:', error);
        await sock.sendMessage(chatId, { text: lang.t('errors.commandFailed') }, { quoted: message });
    }
}

export default { sudoCommand, delsudoCommand, listsudoCommand };
