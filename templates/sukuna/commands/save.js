import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import path from 'path';
import {  sendReply, formatError, formatSuccess, translate  } from '../lib/helpers.js';
import {  downloadContentFromMessage  } from 'baileys';

export default { 
    name: 'save',
    aliases: ['savestatus', 'downloadstatus'],
    description: 'Télécharger et sauvegarder un status',
    usage: 'save (en réponse à un status)',

    async execute({ sock, msg, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        
        if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            return await sendReply(sock, jid, formatError('save_no_quoted', {
                phoneNumber,
                userConfigManager,
                translationKey: 'save_no_quoted'
            }), { quoted: msg });
        }

        const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        
        try {
            await sendReply(sock, jid, formatSuccess('save_downloading', {
                phoneNumber,
                userConfigManager,
                translationKey: 'save_downloading'
            }), { quoted: msg });

            let buffer, mimeType, fileName, mediaType;

            // Vérifier le type de média
            if (quotedMessage.imageMessage) {
                mediaType = 'image';
                mimeType = quotedMessage.imageMessage.mimetype || 'image/jpeg';
                fileName = `status_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
                const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
                buffer = await streamToBuffer(stream);
            } 
            else if (quotedMessage.videoMessage) {
                mediaType = 'video';
                mimeType = quotedMessage.videoMessage.mimetype || 'video/mp4';
                fileName = `status_${Date.now()}.${mimeType.split('/')[1] || 'mp4'}`;
                const stream = await downloadContentFromMessage(quotedMessage.videoMessage, 'video');
                buffer = await streamToBuffer(stream);
            }
            else {
                return await sendReply(sock, jid, formatError('save_unsupported', {
                    phoneNumber,
                    userConfigManager,
                    translationKey: 'save_unsupported'
                }), { quoted: msg });
            }

            if (!buffer || buffer.length === 0) {
                throw new Error('Échec du téléchargement');
            }

            // Sauvegarder le fichier
            const saveDir = path.join(__dirname, '..', 'saved_status');
            if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
            }
            
            const filePath = path.join(saveDir, fileName);
            fs.writeFileSync(filePath, buffer);

            // Envoyer le média sauvegardé
            const caption = translate(phoneNumber, 'save_success', userConfigManager, {
                type: mediaType,
                fileName: fileName
            });

            if (mediaType === 'image') {
                await sock.sendMessage(jid, {
                    image: { url: filePath },
                    caption: caption
                }, { quoted: msg });
            } else {
                await sock.sendMessage(jid, {
                    video: { url: filePath },
                    caption: caption
                }, { quoted: msg });
            }

            console.log(`💾 [${phoneNumber}] Status sauvegardé: ${fileName}`);

        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur sauvegarde status:`, error);
            
            await sendReply(sock, jid, formatError('save_error', {
                phoneNumber,
                userConfigManager,
                translationKey: 'save_error',
                translationVars: { error: error.message }
            }), { quoted: msg });
        }
    }
};

// Fonction utilitaire pour convertir stream en buffer
async function streamToBuffer(stream) {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}