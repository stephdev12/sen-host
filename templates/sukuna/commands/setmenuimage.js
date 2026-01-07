import {  sendReply, formatError, formatSuccess, formatHelp, translate  } from '../lib/helpers.js';
import axios from 'axios';
import FormData from 'form-data';
import {  downloadContentFromMessage  } from 'baileys';

export default { 
    name: 'setmenuimage',
    aliases: ['menuimage', 'menuimg'],
    description: 'Définir l\'image du menu principal',
    usage: 'setmenuimage <url> ou répondre à une image',
    
    async execute({ sock, msg, args, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');

        if (isGroup) {
            return sendReply(sock, jid, formatError('error_owner_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_owner_only'
            }), { quoted: msg });
        }

        const userConfig = userConfigManager.getUserConfig(phoneNumber);

        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const helpText = translate(phoneNumber, 'setmenuimage_help', userConfigManager, {
                prefix: userConfig.prefix,
                currentImage: userConfig.menuImage,
                phoneNumber: phoneNumber
            });

            return sendReply(sock, jid, formatHelp(helpText), { quoted: msg });
        }

        if (args[0]?.toLowerCase() === 'reset') {
            try {
                const defaultImage = 'https://i.postimg.cc/gjZbjhfx/b19c205e79afb89db484c2fcfe29e978.jpg';
                userConfigManager.setMenuImage(phoneNumber, defaultImage);
                
                const successText = translate(phoneNumber, 'setmenuimage_reset', userConfigManager, {
                    phoneNumber: phoneNumber
                });
                
                return sendReply(sock, jid, formatSuccess(successText), { quoted: msg });
            } catch (error) {
                return sendReply(sock, jid, formatError(`Erreur: ${error.message}`), { quoted: msg });
            }
        }

        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (quotedMessage?.imageMessage) {
            try {
                await sendReply(sock, jid, formatSuccess('upload_in_progress', {
                    phoneNumber,
                    userConfigManager,
                    translationKey: 'upload_in_progress'
                }), { quoted: msg });
                
                const imageUrl = await this.uploadImageToImgBB(quotedMessage.imageMessage);
                
                if (!imageUrl) {
                    throw new Error(translate(phoneNumber, 'upload_failed', userConfigManager));
                }

                userConfigManager.setMenuImage(phoneNumber, imageUrl);
                
                const successText = translate(phoneNumber, 'setmenuimage_upload_success', userConfigManager, {
                    phoneNumber: phoneNumber
                });
                
                await sendReply(sock, jid, formatSuccess(successText), { quoted: msg });
                
                console.log(`🖼️ [${phoneNumber}] Image menu changée via upload: ${imageUrl}`);

            } catch (error) {
                const errorText = translate(phoneNumber, 'setmenuimage_upload_error', userConfigManager, {
                    error: error.message
                });
                
                await sendReply(sock, jid, formatError(errorText), { quoted: msg });
            }
            return;
        }

        const imageUrl = args[0];

        try {
            userConfigManager.setMenuImage(phoneNumber, imageUrl);
            
            const successText = translate(phoneNumber, 'setmenuimage_url_success', userConfigManager, {
                url: imageUrl,
                phoneNumber: phoneNumber
            });
            
            await sendReply(sock, jid, formatSuccess(successText), { quoted: msg });
            
            console.log(`🖼️ [${phoneNumber}] Image menu changée: ${imageUrl}`);

        } catch (error) {
            const errorText = translate(phoneNumber, 'setmenuimage_url_error', userConfigManager, {
                error: error.message,
                currentImage: userConfig.menuImage
            });
            
            await sendReply(sock, jid, formatError(errorText), { quoted: msg });
        }
    },

    async uploadImageToImgBB(imageMessage) {
        try {
            const stream = await downloadContentFromMessage(imageMessage, 'image');
            if (!stream) {
                throw new Error('Impossible de télécharger l\'image');
            }

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            if (!buffer || buffer.length === 0) {
                throw new Error('Buffer vide - échec du téléchargement');
            }
            
            const formData = new FormData();
            formData.append('image', buffer.toString('base64'));
            
            const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
                params: {
                    key: '254b685aea07ed364f7091dee628d26b'
                },
                headers: {
                    ...formData.getHeaders()
                },
                timeout: 30000
            });

            if (response.data && response.data.data && response.data.data.url) {
                console.log('✅ Image uploadée sur imgBB:', response.data.data.url);
                return response.data.data.url;
            } else {
                throw new Error('Réponse invalide de imgBB');
            }

        } catch (error) {
            console.error('❌ Erreur upload imgBB:', error.message);
            if (error.response) {
                console.error('Détails imgBB:', error.response.data);
            }
            throw new Error(`Échec de l'upload: ${error.message}`);
        }
    }
};