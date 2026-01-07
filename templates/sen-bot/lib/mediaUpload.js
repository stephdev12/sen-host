/**
 * 𝗦𝗘𝗡 Bot - Media Uploader
 * Gère l'upload vers ImgBB (Images) et Catbox (Audio)
 */

import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

class MediaUploader {
    
    /**
     * Télécharge le média depuis le message WhatsApp
     */
    async getBufferFromMessage(message, type) {
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    }

    /**
     * Upload Image vers ImgBB (Ton code intégré)
     */
    async uploadImage(imageMessage) {
        try {
            const buffer = await this.getBufferFromMessage(imageMessage, 'image');
            
            const formData = new FormData();
            formData.append('image', buffer.toString('base64'));
            
            const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
                params: { key: '254b685aea07ed364f7091dee628d26b' }, // Ton API Key
                headers: { ...formData.getHeaders() }
            });

            if (response.data?.data?.url) {
                return response.data.data.url;
            }
            throw new Error('Réponse ImgBB invalide');
        } catch (error) {
            console.error('Erreur ImgBB:', error.message);
            throw new Error('Échec upload image');
        }
    }

    /**
     * Upload Audio vers Catbox.moe (URL Directe Gratuite)
     */
    async uploadAudio(audioMessage) {
        try {
            const buffer = await this.getBufferFromMessage(audioMessage, 'audio');
            
            const formData = new FormData();
            formData.append('reqtype', 'fileupload');
            formData.append('userhash', ''); // Pas besoin de compte pour des fichiers temporaires
            formData.append('fileToUpload', buffer, { filename: 'audio.mp3' });

            const response = await axios.post('https://catbox.moe/user/api.php', formData, {
                headers: { ...formData.getHeaders() }
            });

            if (response.data && response.data.startsWith('http')) {
                return response.data; // Retourne l'URL directe (ex: https://files.catbox.moe/xyz.mp3)
            }
            throw new Error('Réponse Catbox invalide');
        } catch (error) {
            console.error('Erreur Catbox:', error.message);
            throw new Error('Échec upload audio');
        }
    }
}

export default new MediaUploader();
