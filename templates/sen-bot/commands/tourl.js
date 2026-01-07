/**
 * 𝗦𝗘𝗡 Bot - Tourl Command
 * Convertit les médias en URL directe (ImgBB / Catbox)
 */

import uploader from '../lib/mediaUpload.js';
import lang from '../lib/languageManager.js';

/**
 * Commande .tourl
 */
export async function tourlCommand(sock, chatId, message, args) {
    try {
        // 1. Récupérer le message cité (Reply)
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // 2. Vérifier si un média est présent
        const imageMessage = quotedMsg?.imageMessage;
        const audioMessage = quotedMsg?.audioMessage;
        // Optionnel : Support des messages "View Once" (Vue unique)
        const viewOnceImage = quotedMsg?.viewOnceMessageV2?.message?.imageMessage;

        if (!imageMessage && !audioMessage && !viewOnceImage) {
            return await sock.sendMessage(chatId, { 
                text: lang.t('commands.tourl.noMedia') 
            }, { quoted: message });
        }

        // 3. Envoyer le message d'attente
        await sock.sendMessage(chatId, { 
            text: lang.t('commands.tourl.uploading') 
        }, { quoted: message });

        let url = '';
        let type = '';

        try {
            // 4. Traitement IMAGE (ImgBB)
            if (imageMessage || viewOnceImage) {
                type = 'Image (ImgBB)';
                // On passe le bon objet message à l'uploader
                url = await uploader.uploadImage(imageMessage || viewOnceImage);
            }
            // 5. Traitement AUDIO (Catbox)
            else if (audioMessage) {
                type = 'Audio (Catbox)';
                url = await uploader.uploadAudio(audioMessage);
            }

            // 6. Succès
            if (url) {
                await sock.sendMessage(chatId, {
                    text: lang.t('commands.tourl.success', { url: url, type: type })
                }, { quoted: message });
            } else {
                throw new Error('Url vide');
            }

        } catch (uploadError) {
            console.error('Erreur Upload:', uploadError);
            await sock.sendMessage(chatId, { 
                text: lang.t('commands.tourl.error') 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Erreur critique tourl:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.commandFailed') 
        }, { quoted: message });
    }
}

export default { tourlCommand };
