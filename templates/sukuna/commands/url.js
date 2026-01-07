import {  sendReply, formatError, formatSuccess, translate  } from '../lib/helpers.js';
import axios from 'axios';
import FormData from 'form-data';
import {  downloadContentFromMessage  } from 'baileys';

export default { 
    name: 'url',
    aliases: ['tourl', 'imgtourl', 'imageurl'],
    description: 'Convertir une image en URL directe',
    usage: 'url (en réponse à une image)',

    async execute({ sock, msg, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage?.imageMessage) {
            return await sendReply(sock, jid, formatError('url_no_image', {
                phoneNumber,
                userConfigManager,
                translationKey: 'url_no_image'
            }), { quoted: msg });
        }

        try {
            await sendReply(sock, jid, formatSuccess('url_uploading', {
                phoneNumber,
                userConfigManager,
                translationKey: 'url_uploading'
            }), { quoted: msg });

            const imageUrl = await this.uploadImageToImgBB(quotedMessage.imageMessage);
            
            if (!imageUrl) {
                throw new Error('Échec de l\'upload');
            }

            // ⭐⭐ JUSTE L'URL SANS DÉTAILS ⭐⭐
            await sock.sendMessage(jid, { 
                text: imageUrl 
            }, { quoted: msg });

            console.log(`🔗 [${phoneNumber}] Image convertie en URL: ${imageUrl}`);

        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur conversion URL:`, error);
            
            await sendReply(sock, jid, formatError('url_error', {
                phoneNumber,
                userConfigManager,
                translationKey: 'url_error',
                translationVars: { error: error.message }
            }), { quoted: msg });
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