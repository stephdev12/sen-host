// tag.js
import { sendReply, formatError, formatSuccess, translate } from '../lib/helpers.js';
import { isAdmin, isOwner } from '../lib/isAdmin.js';

export default {
    name: 'tag',
    aliases: ['tagall', 'hidetag'],
    description: 'Commandes de mention de groupe',
    usage: 'tag [message] | tagall [message]',
    category: 'group',
    adminOnly: true,

    async execute({ sock, msg, args, command, phoneNumber, userConfigManager, config, globalConfig, jid, sender, isGroup }) {
        // Vérification groupe uniquement
        if (!isGroup) {
            return await sendReply(sock, jid, formatError(translate(phoneNumber, 'error_group_only', userConfigManager) || 
                'Cette commande fonctionne uniquement dans les groupes'), { quoted: msg });
        }

        // Vérification admin
        const senderIsAdmin = await isAdmin(sock, jid, sender);
        const senderIsOwner = isOwner(msg, globalConfig);
        
        if (!senderIsAdmin && !senderIsOwner) {
            return await sendReply(sock, jid, formatError(translate(phoneNumber, 'error_admin_only', userConfigManager) || 
                'Cette commande est réservée aux admins'), { quoted: msg });
        }

        // Utiliser le paramètre 'command' qui est déjà passé par whatsappManager
        const commandName = command.toLowerCase();

        try {
            if (commandName === 'tagall') {
                await handleTagAll(sock, msg, args, phoneNumber, userConfigManager);
            } else if (commandName === 'tag' || commandName === 'hidetag') {
                await handleHideTag(sock, msg, args, phoneNumber, userConfigManager);
            }
        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur ${commandName}:`, error.message);
            
            const errorMsg = translate(phoneNumber, 'tag_error', userConfigManager, {
                error: error.message
            }) || `❌ Erreur: ${error.message}`;
            
            await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }
    }
};

// ========== TAGALL - Mention visible de tous ==========
async function handleTagAll(sock, msg, args, phoneNumber, userConfigManager) {
    const jid = msg.key.remoteJid;

    try {
        // Réaction de chargement
        await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });
        
        const groupMetadata = await sock.groupMetadata(jid);
        const participants = groupMetadata.participants;

        // Créer la liste des mentions
        const mentions = participants.map(p => p.id);

        // Message personnalisé
        const customMessage = args.join(' ').trim();

        // Construire le message
        let messageText = '';
        
        if (customMessage) {
            messageText = `${customMessage}\n\n`;
        }

        // Ajouter l'en-tête
        messageText += '╭─────────────────╮\n';
        messageText += '│    🔔 MENTION   │\n';
        messageText += '╰─────────────────╯\n\n';

        // Lister tous les membres
        participants.forEach((participant, index) => {
            messageText += `${index + 1}. @${participant.id.split('@')[0]}\n`;
        });

        messageText += `\n╭─────────────────╮\n`;
        messageText += `│ 👥 Total: ${participants.length} membres\n`;
        messageText += `╰─────────────────╯\n`;

        // Envoyer le message avec les mentions
        await sock.sendMessage(jid, {
            text: messageText,
            mentions: mentions
        }, { quoted: msg });

        // Réaction de succès
        await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });

        console.log(`📢 [${phoneNumber}] TagAll: ${participants.length} membres mentionnés`);

    } catch (error) {
        console.error(`❌ [${phoneNumber}] TagAll error:`, error.message);
        await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
        
        const errorMsg = translate(phoneNumber, 'tagall_error', userConfigManager) || 
                        'Impossible de récupérer les membres du groupe';
        throw new Error(errorMsg);
    }
}

// ========== TAG (HIDETAG) - Mention silencieuse ==========
async function handleHideTag(sock, msg, args, phoneNumber, userConfigManager) {
    const jid = msg.key.remoteJid;

    try {
        // Récupérer les métadonnées du groupe
        const groupMetadata = await sock.groupMetadata(jid);
        const participants = groupMetadata.participants;

        // Créer la liste des mentions
        const mentions = participants.map(p => p.id);

        // Vérifier si c'est une réponse à un message
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quotedMessage?.conversation || 
                          quotedMessage?.extendedTextMessage?.text || 
                          quotedMessage?.imageMessage?.caption ||
                          quotedMessage?.videoMessage?.caption || '';

        let messageToSend;

        if (quotedText) {
            // Si c'est une réponse, utiliser le texte du message cité
            messageToSend = quotedText;
        } else {
            // Sinon, utiliser le message personnalisé
            const customMessage = args.join(' ').trim();
            messageToSend = customMessage || translate(phoneNumber, 'hidetag_default', userConfigManager) || 
                           '📢 Mention silencieuse';
        }

        // Supprimer le message de commande
        try {
            await sock.sendMessage(jid, { delete: msg.key });
        } catch (error) {
            console.log(`⚠️ [${phoneNumber}] Impossible de supprimer le message de commande`);
        }

        // Attendre un peu avant d'envoyer le nouveau message
        await new Promise(resolve => setTimeout(resolve, 500));

        // Envoyer le message avec mentions cachées
        if (quotedMessage?.imageMessage) {
            // Si le message cité est une image
            try {
                const buffer = await sock.downloadMediaMessage(msg.message.extendedTextMessage.contextInfo);
                await sock.sendMessage(jid, {
                    image: buffer,
                    caption: messageToSend,
                    mentions: mentions
                });
            } catch (downloadError) {
                console.error(`❌ [${phoneNumber}] Erreur téléchargement image:`, downloadError.message);
                // Fallback: message texte seulement
                await sock.sendMessage(jid, {
                    text: messageToSend,
                    mentions: mentions
                });
            }
        } else if (quotedMessage?.videoMessage) {
            // Si le message cité est une vidéo
            try {
                const buffer = await sock.downloadMediaMessage(msg.message.extendedTextMessage.contextInfo);
                await sock.sendMessage(jid, {
                    video: buffer,
                    caption: messageToSend,
                    mentions: mentions
                });
            } catch (downloadError) {
                console.error(`❌ [${phoneNumber}] Erreur téléchargement vidéo:`, downloadError.message);
                // Fallback: message texte seulement
                await sock.sendMessage(jid, {
                    text: messageToSend,
                    mentions: mentions
                });
            }
        } else {
            // Message texte normal
            await sock.sendMessage(jid, {
                text: messageToSend,
                mentions: mentions
            });
        }

        console.log(`🔕 [${phoneNumber}] HideTag: ${participants.length} membres mentionnés silencieusement`);

    } catch (error) {
        console.error(`❌ [${phoneNumber}] HideTag error:`, error.message);
        
        const errorMsg = translate(phoneNumber, 'hidetag_error', userConfigManager) || 
                        'Impossible d\'envoyer la mention silencieuse';
        throw new Error(errorMsg);
    }
}