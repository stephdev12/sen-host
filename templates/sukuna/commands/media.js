import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import { sendReply, formatError, formatSuccess, translate } from '../lib/helpers.js';
import { downloadContentFromMessage } from 'baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { isOwner } from '../lib/isAdmin.js';

const MEDIA_BASE_DIR = './user_media';

// Import conditionnel de Jimp
let Jimp = null;
(async () => {
    try {
        const jimpModule = await import('jimp');
        Jimp = jimpModule.default || jimpModule;
    } catch (error) {
        console.warn('⚠️ Jimp not available, text on stickers disabled');
    }
})();

async function ensureUserMediaDir(userId) {
    const userDir = path.join(MEDIA_BASE_DIR, userId, 'media');
    await fs.mkdir(userDir, { recursive: true });
    return userDir;
}

export default { 
    name: 'media',
    aliases: ['store', 'vd', 'ad', 'list', 'del', 's', 'sticker', 'take', 'steal'],
    description: 'Gère votre collection de médias personnels et les convertit',
    usage: 'store <nom> | vd <nom> | ad <nom> | list | del <type> <nom> | s [texte]',
    category: 'media',
    
    async execute({ sock, msg, args, command, phoneNumber, userConfigManager, config, globalConfig, jid, sender }) {
        const userId = sender;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        try {
            const userDir = await ensureUserMediaDir(userId);
            const commandName = command.toLowerCase();

            switch(commandName) {
                case 'store': {
                    if (!isOwner(msg, globalConfig)) {
                        await sock.sendMessage(jid, { react: { text: '❌', key: msg.key }});
                        return;
                    }

                    if (!quoted || (!quoted.audioMessage && !quoted.videoMessage)) {
                        await sock.sendMessage(jid, { react: { text: '❌', key: msg.key }});
                        return;
                    }

                    const name = args[0];
                    if (!name) {
                        const errorMsg = translate(phoneNumber, 'media_name_required', userConfigManager) ||
                                       'Veuillez fournir un nom pour le média';
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }

                    const mediaType = quoted.videoMessage ? 'video' : 'audio';
                    const extension = mediaType === 'video' ? '.mp4' : '.mp3';
                    const fileName = name.toLowerCase() + extension;
                    const mediaPath = path.join(userDir, fileName);

                    try {
                        await fs.access(mediaPath);
                        const errorMsg = translate(phoneNumber, 'media_already_exists', userConfigManager, {
                            name, type: mediaType
                        }) || `Un ${mediaType} nommé "${name}" existe déjà`;
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    } catch {}

                    await sock.sendMessage(jid, { react: { text: '🔥', key: msg.key }});
                    const mediaMessage = quoted.videoMessage || quoted.audioMessage;
                    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    await fs.writeFile(mediaPath, buffer);
                    
                    const successMsg = translate(phoneNumber, 'media_stored_success', userConfigManager, {
                        name, type: mediaType
                    }) || `✅ ${mediaType} "${name}" enregistré avec succès`;
                    
                    await sendReply(sock, jid, formatSuccess(successMsg), { quoted: msg });
                    console.log(`✅ [${phoneNumber}] Média stocké: ${fileName}`);
                    break;
                }

                case 'vd': {
                    const isCircular = args.includes('-c');
                    const name = args.filter(arg => arg !== '-c')[0];

                    if (!name) {
                        const errorMsg = translate(phoneNumber, 'media_video_name_required', userConfigManager) ||
                                       'Usage: vd <nom> [-c pour circulaire]';
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }

                    const mediaPath = path.join(userDir, name.toLowerCase() + '.mp4');
                    try {
                        await fs.access(mediaPath);
                    } catch {
                        const errorMsg = translate(phoneNumber, 'media_video_not_found', userConfigManager, { name }) ||
                                       `❌ Vidéo "${name}" introuvable`;
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }

                    await sock.sendMessage(jid, { react: { text: '🎬', key: msg.key }});
                    const videoBuffer = await fs.readFile(mediaPath);
                    
                    const caption = translate(phoneNumber, 'media_video_playing', userConfigManager, { name }) ||
                                  `🎬 Vidéo: ${name}`;
                    
                    await sock.sendMessage(jid, {
                        video: videoBuffer,
                        caption: caption,
                        ptv: isCircular
                    }, { quoted: msg });
                    console.log(`✅ [${phoneNumber}] Vidéo envoyée: ${name}`);
                    break;
                }

                case 'ad': {
                    const name = args[0];
                    if (!name) {
                        const errorMsg = translate(phoneNumber, 'media_audio_name_required', userConfigManager) ||
                                       'Usage: ad <nom>';
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }

                    const mediaPath = path.join(userDir, name.toLowerCase() + '.mp3');
                    try {
                        await fs.access(mediaPath);
                    } catch {
                        const errorMsg = translate(phoneNumber, 'media_audio_not_found', userConfigManager, { name }) ||
                                       `❌ Audio "${name}" introuvable`;
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }

                    await sock.sendMessage(jid, { react: { text: '🎵', key: msg.key }});
                    const audioBuffer = await fs.readFile(mediaPath);
                    await sock.sendMessage(jid, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        ptt: false,
                    }, { quoted: msg });
                    console.log(`✅ [${phoneNumber}] Audio envoyé: ${name}`);
                    break;
                }

                case 'list': {
                    let files = [];
                    try {
                        files = await fs.readdir(userDir);
                    } catch {}

                    const audios = files.filter(f => f.endsWith('.mp3')).map(f => `• ${f.replace('.mp3', '')}`);
                    const videos = files.filter(f => f.endsWith('.mp4')).map(f => `• ${f.replace('.mp4', '')}`);

                    const listText = `📚 *MES MÉDIAS*\n\n` +
                                   `🎬 *Vidéos* (${videos.length}):\n${videos.length > 0 ? videos.join('\n') : '• Aucune'}\n\n` +
                                   `🎵 *Audios* (${audios.length}):\n${audios.length > 0 ? audios.join('\n') : '• Aucun'}\n\n` +
                                   `ℹ️ Usage: ${config?.prefix || '.'}vd <nom> | ${config?.prefix || '.'}ad <nom>`;

                    await sock.sendMessage(jid, { text: listText }, { quoted: msg });
                    break;
                }

                case 'del': {
                    if (!isOwner(msg, globalConfig)) {
                        const errorMsg = translate(phoneNumber, 'error_owner_only', userConfigManager) ||
                                       '❌ Commande réservée au propriétaire';
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }

                    const type = args[0]?.toLowerCase();
                    const name = args[1];

                    if (!type || !name || !['audio', 'video'].includes(type)) {
                        const errorMsg = translate(phoneNumber, 'media_delete_usage', userConfigManager) ||
                                       'Usage: del <audio|video> <nom>';
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }

                    const extension = type === 'video' ? '.mp4' : '.mp3';
                    const mediaPath = path.join(userDir, name.toLowerCase() + extension);

                    try {
                        await fs.access(mediaPath);
                        await fs.unlink(mediaPath);
                        
                        const successMsg = translate(phoneNumber, 'media_deleted_success', userConfigManager, {
                            name, type
                        }) || `✅ ${type} "${name}" supprimé`;
                        
                        await sendReply(sock, jid, formatSuccess(successMsg), { quoted: msg });
                        console.log(`✅ [${phoneNumber}] Média supprimé: ${name}`);
                    } catch {
                        const errorMsg = translate(phoneNumber, 'media_not_found', userConfigManager, { name }) ||
                                       `❌ "${name}" introuvable`;
                        await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }
                    break;
                }

                case 'sticker':
                case 's': {
                    const stickerText = args.join(' ').trim();
                    const mediaMessage = msg.message?.imageMessage || msg.message?.videoMessage || 
                                    quoted?.imageMessage || quoted?.videoMessage;
                    
                    if (!mediaMessage) {
                        await sock.sendMessage(jid, { react: { text: '❌', key: msg.key }});
                        const errorMsg = translate(phoneNumber, 'sticker_no_media', userConfigManager) ||
                                       '❌ Envoyez ou répondez à une image/vidéo';
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }

                    try {
                        await sock.sendMessage(jid, { react: { text: '✏️', key: msg.key }});

                        const mediaType = mediaMessage.mimetype.includes('video') ? 'video' : 'image';
                        const stream = await downloadContentFromMessage(mediaMessage, mediaType);
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) {
                            buffer = Buffer.concat([buffer, chunk]);
                        }

                        if (!buffer || buffer.length === 0) throw new Error('Erreur de téléchargement');

                        // Ajouter du texte sur l'image si Jimp est disponible
                        if (mediaType === 'image' && stickerText && Jimp) {
                            try {
                                const image = await Jimp.read(buffer);
                                const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
                                const bannerHeight = 65;
                                
                                const banner = new Jimp(image.getWidth(), bannerHeight, '#000000de');
                                image.composite(banner, 0, image.getHeight() - bannerHeight);

                                const textWidth = Jimp.measureText(font, stickerText);
                                const x = (image.getWidth() - textWidth) / 2;
                                const y = (image.getHeight() - bannerHeight) + ((bannerHeight - 42) / 2);

                                image.print(font, x, y, stickerText);
                                buffer = await image.getBufferAsync(Jimp.MIME_PNG);
                            } catch (jimpError) {
                                console.error(`⚠️ [${phoneNumber}] Erreur JIMP:`, jimpError.message);
                            }
                        }

                        const sticker = new Sticker(buffer, {
                            pack: 'Sukuna',
                            author: 'By STEPHDEV',
                            type: StickerTypes.FULL,
                            quality: 70
                        });

                        await sock.sendMessage(jid, await sticker.toMessage(), { quoted: msg });
                        await sock.sendMessage(jid, { react: { text: '✅', key: msg.key }});
                        console.log(`✅ [${phoneNumber}] Sticker créé`);

                    } catch (error) {
                        console.error(`❌ [${phoneNumber}] Erreur sticker:`, error.message);
                        
                        const errorMsg = translate(phoneNumber, 'sticker_error', userConfigManager) ||
                                       '❌ Erreur lors de la création du sticker';
                        await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }
                    break;
                }

                case 'take':
                case 'steal': {
                    if (!quoted || !quoted.stickerMessage) {
                        await sock.sendMessage(jid, { react: { text: '❌', key: msg.key }});
                        const errorMsg = translate(phoneNumber, 'steal_no_sticker', userConfigManager) ||
                                       '❌ Répondez à un sticker';
                        return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }

                    try {
                        await sock.sendMessage(jid, { react: { text: '🔄', key: msg.key }});

                        const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) {
                            buffer = Buffer.concat([buffer, chunk]);
                        }

                        if (!buffer) throw new Error('Erreur de téléchargement');
                        
                        const [pack, author] = args.join(' ').split('|').map(s => s.trim());
                        const packName = pack || 'Sukuna-Bot';
                        const authorName = author || 'By StephDev';

                        const sticker = new Sticker(buffer, {
                            pack: packName,
                            author: authorName,
                            type: StickerTypes.FULL,
                            quality: 70
                        });

                        await sock.sendMessage(jid, await sticker.toMessage(), { quoted: msg });
                        await sock.sendMessage(jid, { react: { text: '✅', key: msg.key }});
                        console.log(`✅ [${phoneNumber}] Sticker volé`);

                    } catch (error) {
                        console.error(`❌ [${phoneNumber}] Erreur take:`, error.message);
                        
                        const errorMsg = translate(phoneNumber, 'sticker_steal_error', userConfigManager) ||
                                       '❌ Erreur lors du vol du sticker';
                        await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                    }
                    break;
                }
            }
        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur media:`, error.message);
            
            const errorMsg = translate(phoneNumber, 'error_occurred', userConfigManager) ||
                           '❌ Une erreur est survenue';
            await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }
    }
};