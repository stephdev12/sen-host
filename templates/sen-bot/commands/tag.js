/**
 * 𝗦𝗘𝗡 Bot - Tag Commands
 * Gère les mentions de groupe (TagAll, HideTag)
 */

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { isOwner } from '../lib/authHelper.js';
import configs from '../configs.js';

// Fonction utilitaire pour vérifier si l'utilisateur est admin
async function isAdmin(sock, chatId, userJid) {
    try {
        const metadata = await sock.groupMetadata(chatId);
        const participant = metadata.participants.find(p => p.id === userJid);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (e) {
        return false;
    }
}

/**
 * Commande TAGALL - Mentionne tout le monde visiblement
 */
export async function tagAllCommand(sock, chatId, message, args) {
    // 1. Vérification Groupe
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ Cette commande ne fonctionne que dans les groupes.' }, { quoted: message });
    }

    // 2. Vérification Admin/Owner
    const sender = message.key.participant || message.key.remoteJid;
    const admin = await isAdmin(sock, chatId, sender);
    const owner = await isOwner(sock, message, configs);

    if (!admin && !owner) {
        return await sock.sendMessage(chatId, { text: '❌ Commande réservée aux administrateurs.' }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '📢', key: message.key } });

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const mentions = participants.map(p => p.id);
        const customMessage = args.join(' ').trim();

        let text = '';
        if (customMessage) text += `*Message :* ${customMessage}\n\n`;

        text += '╭─── 🔔 *TAG ALL* ───╮\n';
        participants.forEach((p, i) => {
            text += `│ ${i + 1}. @${p.id.split('@')[0]}\n`;
        });
        text += '╰──────────────────╯\n';
        text += `👥 *Total :* ${participants.length}`;

        await sock.sendMessage(chatId, {
            text: text,
            mentions: mentions
        }, { quoted: message });

    } catch (error) {
        console.error('TagAll Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur lors du tagall.' }, { quoted: message });
    }
}

/**
 * Commande HIDETAG - Mentionne tout le monde "silencieusement"
 */
export async function hideTagCommand(sock, chatId, message, args) {
    // 1. Vérification Groupe
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ Groupe uniquement.' }, { quoted: message });
    }

    // 2. Vérification Admin/Owner
    const sender = message.key.participant || message.key.remoteJid;
    const admin = await isAdmin(sock, chatId, sender);
    const owner = await isOwner(sock, message, configs);

    if (!admin && !owner) {
        return await sock.sendMessage(chatId, { text: '❌ Admin uniquement.' }, { quoted: message });
    }

    try {
        // Récupérer les membres pour la mention cachée
        const groupMetadata = await sock.groupMetadata(chatId);
        const mentions = groupMetadata.participants.map(p => p.id);

        // Gérer le message cité (Quoted)
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const customMessage = args.join(' ').trim();
        
        // Texte à afficher
        let msgText = customMessage || '📢 Mention Générale';
        
        // Si un message est cité et qu'il contient du texte, on l'utilise
        if (quoted) {
            const qText = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || quoted.videoMessage?.caption;
            if (qText) msgText = qText;
        }

        // Cas 1 : Réponse à une Image
        if (quoted?.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await sock.sendMessage(chatId, {
                image: buffer,
                caption: msgText,
                mentions: mentions // C'est ici que la magie opère
            });
        }
        // Cas 2 : Réponse à une Vidéo
        else if (quoted?.videoMessage) {
            const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await sock.sendMessage(chatId, {
                video: buffer,
                caption: msgText,
                mentions: mentions
            });
        }
        // Cas 3 : Réponse à un Sticker
        else if (quoted?.stickerMessage) {
            const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await sock.sendMessage(chatId, {
                sticker: buffer,
                mentions: mentions
            });
        }
        // Cas 4 : Texte seul (ou image/vidéo envoyé directement avec la commande)
        else {
            // Si l'utilisateur envoie une image AVEC la commande .hidetag
            const directImage = message.message?.imageMessage;
            const directVideo = message.message?.videoMessage;

            if (directImage) {
                const stream = await downloadContentFromMessage(directImage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                await sock.sendMessage(chatId, { image: buffer, caption: msgText, mentions });
            } 
            else if (directVideo) {
                const stream = await downloadContentFromMessage(directVideo, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                await sock.sendMessage(chatId, { video: buffer, caption: msgText, mentions });
            }
            else {
                // Texte simple
                await sock.sendMessage(chatId, {
                    text: msgText,
                    mentions: mentions
                });
            }
        }

    } catch (error) {
        console.error('HideTag Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur hidetag.' }, { quoted: message });
    }
}

export default { tagAllCommand, hideTagCommand };
