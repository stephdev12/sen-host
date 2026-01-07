import {  sendReply, formatError, translate  } from '../lib/helpers.js';
import {  downloadContentFromMessage  } from 'baileys';

export default { 
    name: 'vv',
    aliases: ['viewonce', 'revealonce'],
    description: 'Dévoiler les messages à vue unique',
    usage: 'vv (en réponse à un message à vue unique)',

    async execute({ sock, msg, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        
        if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            return await sendReply(sock, jid, formatError('vv_no_quoted', {
                phoneNumber,
                userConfigManager,
                translationKey: 'vv_no_quoted'
            }), { quoted: msg });
        }

        const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        
        const quotedImage = quotedMessage.imageMessage;
        const quotedVideo = quotedMessage.videoMessage;

        try {
            if (quotedImage && quotedImage.viewOnce) {
                console.log(`🔍 [${phoneNumber}] Dévoilement vue unique: IMAGE`);
                
                const stream = await downloadContentFromMessage(quotedImage, 'image');
                let buffer = Buffer.from([]);
                
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                if (buffer.length === 0) {
                    throw new Error('Buffer vide - impossible de télécharger l\'image');
                }

                const revealCaption = translate(phoneNumber, 'vv_image_revealed', userConfigManager, {
                    caption: quotedImage.caption ? quotedImage.caption : ''
                });

                await sock.sendMessage(jid, {
                    image: buffer,
                    fileName: 'view_once_revealed.jpg',
                    caption: revealCaption
                }, { quoted: msg });

                console.log(`✅ [${phoneNumber}] Image vue unique dévoilée avec succès`);
                return;
            }

            if (quotedVideo && quotedVideo.viewOnce) {
                console.log(`🔍 [${phoneNumber}] Dévoilement vue unique: VIDÉO`);
                
                const stream = await downloadContentFromMessage(quotedVideo, 'video');
                let buffer = Buffer.from([]);
                
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                if (buffer.length === 0) {
                    throw new Error('Buffer vide - impossible de télécharger la vidéo');
                }

                const revealCaption = translate(phoneNumber, 'vv_video_revealed', userConfigManager, {
                    caption: quotedVideo.caption ? quotedVideo.caption : ''
                });

                await sock.sendMessage(jid, {
                    video: buffer,
                    fileName: 'view_once_revealed.mp4',
                    caption: revealCaption
                }, { quoted: msg });

                console.log(`✅ [${phoneNumber}] Vidéo vue unique dévoilée avec succès`);
                return;
            }

            await sendReply(sock, jid, formatError('vv_invalid_message', {
                phoneNumber,
                userConfigManager,
                translationKey: 'vv_invalid_message'
            }), { quoted: msg });

        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur dévoilement vue unique:`, error);
            
            let errorKey = 'vv_generic_error';
            
            if (error.message.includes('Buffer vide')) {
                errorKey = 'vv_buffer_empty';
            } else if (error.message.includes('not found')) {
                errorKey = 'vv_media_expired';
            } else if (error.message.includes('download')) {
                errorKey = 'vv_download_failed';
            }
            
            await sendReply(sock, jid, formatError(errorKey, {
                phoneNumber,
                userConfigManager,
                translationKey: errorKey,
                translationVars: { error: error.message }
            }), { quoted: msg });
        }
    }
};