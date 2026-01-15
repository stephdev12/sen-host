/**
 * 𝗦𝗘𝗡 Bot - NanoMix Command
 * Fusionne 2 images puis utilise NanoBanana pour les transformer (ex: câlin)
 * Uses: Jimp, lib/mediaUpload.js
 */

import axios from 'axios';
import mediaUploader from '../lib/mediaUpload.js';
import response from '../lib/response.js';
import { createRequire } from 'module';

// Import de JIMP (Compatible ESM/CommonJS)
const require = createRequire(import.meta.url);
let Jimp;
try {
    Jimp = require('jimp');
} catch (e) {
    console.warn('Jimp non installé. Installez-le avec: npm install jimp');
}

export async function nanomixCommand(sock, chatId, message, args) {
    if (!Jimp) {
        return await sock.sendMessage(chatId, { text: '❌ Le module "jimp" est requis pour cette commande.' }, { quoted: message });
    }

    const prompt = args.join(' ');
    if (!prompt) {
        return await sock.sendMessage(chatId, { 
            text: `👩‍❤️‍👨 ${response.font('Prompt requis')}.\nEx: .nanomix anime couple hugging` 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🧩', key: message.key } });

        // 1. RÉCUPÉRATION DES DEUX IMAGES
        // Image A : L'utilisateur qui fait la commande (Sender)
        const senderJid = message.key.participant || message.key.remoteJid;
        let bufferA, bufferB;

        try {
            const ppA = await sock.profilePictureUrl(senderJid, 'image');
            bufferA = await axios.get(ppA, { responseType: 'arraybuffer' }).then(res => res.data);
        } catch {
            // Fallback si pas de PP
            bufferA = await axios.get('https://i.ibb.co/tML08Wqw/ea6c3e422780.jpg', { responseType: 'arraybuffer' }).then(res => res.data);
        }

        // Image B : La cible (Mention ou Réponse)
        const quoted = message.message?.extendedTextMessage?.contextInfo;
        let targetJid = quoted?.participant || (quoted?.mentionedJid && quoted.mentionedJid[0]);

        if (targetJid) {
            // Si on a mentionné/répondu à quelqu'un -> On prend sa PP
            try {
                const ppB = await sock.profilePictureUrl(targetJid, 'image');
                bufferB = await axios.get(ppB, { responseType: 'arraybuffer' }).then(res => res.data);
            } catch {
                return await sock.sendMessage(chatId, { text: '❌ Impossible de récupérer la photo de la cible.' }, { quoted: message });
            }
        } else if (quoted?.quotedMessage?.imageMessage) {
            // Si on a répondu à une IMAGE -> On prend cette image
            // Note: Il faut utiliser ta méthode de téléchargement ici (importée ou locale)
            // Pour simplifier, on assume que mediaUploader a une méthode getBufferFromMessage exposée ou on réutilise downloadContentFromMessage
             const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
             const stream = await downloadContentFromMessage(quoted.quotedMessage.imageMessage, 'image');
             bufferB = Buffer.from([]);
             for await (const chunk of stream) bufferB = Buffer.concat([bufferB, chunk]);
        } else {
            return await sock.sendMessage(chatId, { text: '❌ Mentionnez quelqu\'un ou répondez à une image pour la fusionner avec vous.' }, { quoted: message });
        }

        // 2. CRÉATION DU COLLAGE AVEC JIMP
        const imageA = await Jimp.read(bufferA);
        const imageB = await Jimp.read(bufferB);

        // On redimensionne pour qu'elles aient la même hauteur (ex: 512px)
        imageA.resize(Jimp.AUTO, 512);
        imageB.resize(Jimp.AUTO, 512);

        // Création de la toile (Largeur A + Largeur B, Hauteur 512)
        const width = imageA.bitmap.width + imageB.bitmap.width;
        const height = 512;
        const canvas = new Jimp(width, height);

        canvas.composite(imageA, 0, 0);
        canvas.composite(imageB, imageA.bitmap.width, 0);

        const collageBuffer = await canvas.getBufferAsync(Jimp.MIME_JPEG);

        // 3. UPLOAD & TRAITEMENT IA
        // On crée un faux objet message pour utiliser ton mediaUploader existant si besoin,
        // OU on upload directement le buffer manuellement vers ImgBB ici pour aller plus vite.
        
        // Petite astuce : on utilise une fonction d'upload directe pour le buffer créé
        const formData = new (await import('form-data')).default();
        formData.append('image', collageBuffer.toString('base64'));
        const uploadRes = await axios.post('https://api.imgbb.com/1/upload', formData, {
            params: { key: '254b685aea07ed364f7091dee628d26b' }, // Ta clé API
            headers: { ...formData.getHeaders() }
        });
        const collageUrl = uploadRes.data.data.url;

        // 4. APPEL NANOBANANA
        await sock.sendMessage(chatId, { text: '🍌 Fusion effectuée, traitement IA en cours...' }, { quoted: message });

        const apiUrl = `https://apis.davidcyril.name.ng/nanobanana?url=${collageUrl}&prompt=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.result || !data.result.image) {
            return await sock.sendMessage(chatId, { text: '❌ Échec du traitement IA.' }, { quoted: message });
        }

        // 5. ENVOI FINAL
        await sock.sendMessage(chatId, { 
            image: { url: data.result.image },
            caption: `*SEN_AI MIX*\n> *Prompt* : ${prompt}`
        }, { quoted: message });

    } catch (error) {
        console.error('NanoMix Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur.' }, { quoted: message });
    }
}

export default { nanomixCommand };
