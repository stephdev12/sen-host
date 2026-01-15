/**
 * 𝗦𝗘𝗡 Bot - ViewOnce Command (VV)
 * Version : ULTIMATE - Avec support AutoVV
 */

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import configs from '../configs.js';
import chalk from 'chalk';

/**
 * Fonction principale de révélation (utilisable par .vv ET autovv)
 */
export async function revealViewOnce(sock, quotedMessage, sender, chatId, ownerJid) {
    const isGroup = chatId.endsWith('@g.us');

    // ✅ 1. Vérifier les 3 formats possibles
    const quotedImage = quotedMessage.imageMessage;
    const quotedVideo = quotedMessage.videoMessage;
    const quotedAudio = quotedMessage.audioMessage;
    
    // Format viewOnceV2 ou viewOnceV1
    const viewOnceV2 = quotedMessage.viewOnceMessageV2?.message;
    const viewOnceV1 = quotedMessage.viewOnceMessage?.message;
    const viewOnceContainer = viewOnceV2 || viewOnceV1;

    // ✅ 2. DÉTECTION : 2 formats possibles
    let mediaMessage = null;
    let mediaType = null;
    let isViewOnce = false;

    // FORMAT 1 : Vue unique classique (viewOnceMessage)
    if (viewOnceContainer) {
        if (viewOnceContainer.imageMessage) {
            mediaMessage = viewOnceContainer.imageMessage;
            mediaType = 'image';
            isViewOnce = true;
        } else if (viewOnceContainer.videoMessage) {
            mediaMessage = viewOnceContainer.videoMessage;
            mediaType = 'video';
            isViewOnce = true;
        } else if (viewOnceContainer.audioMessage) {
            mediaMessage = viewOnceContainer.audioMessage;
            mediaType = 'audio';
            isViewOnce = true;
        }
    }
    // FORMAT 2 : Vue unique dévoilée (imageMessage.viewOnce = true)
    else if (quotedImage && quotedImage.viewOnce) {
        mediaMessage = quotedImage;
        mediaType = 'image';
        isViewOnce = true;
    } else if (quotedVideo && quotedVideo.viewOnce) {
        mediaMessage = quotedVideo;
        mediaType = 'video';
        isViewOnce = true;
    } else if (quotedAudio && quotedAudio.viewOnce) {
        mediaMessage = quotedAudio;
        mediaType = 'audio';
        isViewOnce = true;
    }

    if (!isViewOnce || !mediaMessage) {
        return { success: false, message: 'Not a view once message' };
    }

    try {
        console.log(chalk.cyan(`🔍 [VV] Dévoilement vue unique: ${mediaType.toUpperCase()}`));

        // ✅ 3. Télécharger le média
        const stream = await downloadContentFromMessage(mediaMessage, mediaType);
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        if (buffer.length === 0) {
            throw new Error('Buffer vide - impossible de télécharger le média');
        }

        // ✅ 4. Préparer les infos contextuelles
        let contextInfo = '';
        
        if (isGroup) {
            try {
                const groupMetadata = await sock.groupMetadata(chatId);
                const senderName = sender.split('@')[0];
                contextInfo = `📍 *Groupe:* ${groupMetadata.subject}\n👤 *Expéditeur:* @${senderName}\n\n`;
            } catch (err) {
                const senderName = sender.split('@')[0];
                contextInfo = `📍 *Groupe:* ${chatId.split('@')[0]}\n👤 *Expéditeur:* @${senderName}\n\n`;
            }
        } else {
            const senderName = sender.split('@')[0];
            contextInfo = `💬 *Chat privé avec:* @${senderName}\n\n`;
        }

        const caption = `🔓 *${mediaType.toUpperCase()} à vue unique révélé${mediaType === 'image' ? 'e' : ''}*\n\n${contextInfo}${mediaMessage.caption ? `📝 *Caption:* ${mediaMessage.caption}` : ''}`;

        // ✅ 5. Envoyer au propriétaire
        if (mediaType === 'image') {
            await sock.sendMessage(ownerJid, {
                image: buffer,
                caption: caption,
                mentions: [sender]
            });
        } else if (mediaType === 'video') {
            await sock.sendMessage(ownerJid, {
                video: buffer,
                caption: caption,
                mentions: [sender]
            });
        } else if (mediaType === 'audio') {
            await sock.sendMessage(ownerJid, {
                text: caption,
                mentions: [sender]
            });
            await sock.sendMessage(ownerJid, {
                audio: buffer,
                mimetype: mediaMessage.mimetype || 'audio/mpeg',
                ptt: mediaMessage.ptt || false
            });
        }

        console.log(chalk.green(`✅ [VV] ${mediaType} vue unique dévoilé (envoyé au owner)`));
        
        return { success: true, mediaType: mediaType };

    } catch (error) {
        console.error(chalk.red(`❌ [VV] Erreur dévoilement vue unique:`), error);
        return { success: false, message: error.message };
    }
}

/**
 * Commande .vv (manuelle)
 */
export async function viewOnceCommand(sock, chatId, message, args) {
    const jid = chatId;
    const msg = message;
    
    // Récupérer le JID du propriétaire
    const ownerNumber = configs.ownerNumber.replace(/[^0-9]/g, '');
    const ownerJid = `${ownerNumber}@s.whatsapp.net`;
    
    const sender = msg.key.participant || msg.key.remoteJid;

    // ✅ 1. Extraire le message cité
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quoted) {
        return await sock.sendMessage(chatId, {
            text: '❌ Veuillez répondre à une image ou vidéo en *Vue Unique*.'
        }, { quoted: msg });
    }

    // Réaction pour indiquer le traitement (Désactivé pour mode silencieux)
    // await sock.sendMessage(chatId, { react: { text: '🔓', key: msg.key } });

    // ✅ 2. Appeler la fonction de révélation
    const result = await revealViewOnce(sock, quoted, sender, chatId, ownerJid);

    if (!result.success) {
        if (result.message === 'Not a view once message') {
            return await sock.sendMessage(chatId, {
                text: '❌ Ce message n\'est pas une vue unique valide.'
            }, { quoted: msg });
        } else {
            return await sock.sendMessage(chatId, {
                text: `❌ Impossible de récupérer le média. ${result.message}`
            }, { quoted: msg });
        }
    }

    // ✅ 3. Confirmation discrète (Désactivé pour mode silencieux)
    // await sock.sendMessage(chatId, { 
    //    text: '✅ Vue unique envoyée au propriétaire.' 
    // }, { quoted: msg });
}

export default { viewOnceCommand, revealViewOnce };