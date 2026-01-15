/**
 * 𝗦𝗘𝗡 Bot - NanoBanana Command
 * Transforme une image selon un prompt via l'API David Cyril
 * Uses: lib/mediaUpload.js (ImgBB)
 */

import axios from 'axios';
import mediaUploader from '../lib/mediaUpload.js'; // Ton utilitaire
import response from '../lib/response.js';

export async function nanobananaCommand(sock, chatId, message, args) {
    const prompt = args.join(' ');
    
    // Vérification du prompt
    if (!prompt) {
        return await sock.sendMessage(chatId, { 
            text: `🎨 ${response.font('Veuillez décrire la modification')}.\nEx: .nano make him cyborg` 
        }, { quoted: message });
    }

    // Récupération du message média (Quoted ou Direct)
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const targetMsg = quoted || message.message;
    
    // On récupère l'objet imageMessage spécifique
    const imageMsg = targetMsg?.imageMessage;

    if (!imageMsg) {
        return await sock.sendMessage(chatId, { 
            text: `❌ ${response.font('Veuillez répondre à une image')}.` 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🍌', key: message.key } });

        // 1. Upload de l'image vers ImgBB via ton utilitaire
        // Ton utilitaire gère le téléchargement du buffer et l'upload
        const imageUrl = await mediaUploader.uploadImage(imageMsg);

        if (!imageUrl) {
            return await sock.sendMessage(chatId, { text: '❌ Erreur lors de l\'upload de l\'image.' }, { quoted: message });
        }

        // 2. Appel API NanoBanana avec l'URL ImgBB obtenue
        const apiUrl = `https://apis.davidcyril.name.ng/nanobanana?url=${imageUrl}&prompt=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.result || !data.result.image) {
            return await sock.sendMessage(chatId, { text: '❌ Échec du traitement IA.' }, { quoted: message });
        }

        // 3. Envoi du résultat
        await sock.sendMessage(chatId, { 
            image: { url: data.result.image },
            caption: `*SEN_AI ART*\n> *Prompt* : ${prompt}`
        }, { quoted: message });

    } catch (error) {
        console.error('NanoBanana Error:', error.message);
        await sock.sendMessage(chatId, { text: '❌ Une erreur est survenue.' }, { quoted: message });
    }
}

export default { nanobananaCommand };
