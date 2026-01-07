// commands/tiktok.js
import { sendReply, formatError, formatSuccess, translate } from '../lib/helpers.js';
import { sendCarousel } from 'stephtech-ui';
import axios from 'axios';

// Stocker les vidéos pour les téléchargements
const videoCache = new Map();

export default { 
    name: 'tiktok',
    aliases: ['tt', 'tiktoksearch'],
    description: 'Recherche des vidéos TikTok et affiche les résultats',
    usage: 'tiktok <requête> | tiktok dl<index>',
    category: 'media',
    
    async execute({ sock, msg, args, phoneNumber, userConfigManager, config }) {
        const jid = msg.key.remoteJid;
        const prefix = config?.prefix || '.';
        
        // Vérifier si c'est une commande de téléchargement
        if (args[0] && args[0].startsWith('dl')) {
            const index = args[0].replace('dl', '');
            const cacheKey = `${jid}_${index}`;
            
            if (!videoCache.has(cacheKey)) {
                const errorMsg = translate(phoneNumber, 'tiktok_expired', userConfigManager) || 
                               '❌ Vidéo expirée ou introuvable. Veuillez refaire une recherche.';
                return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
            }
            
            const videoData = videoCache.get(cacheKey);
            
            try {
                await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });
                
                console.log('🔗 URL TikTok:', videoData.tiktokUrl);
                console.log('🔗 API Download URL:', videoData.downloadUrl);
                
                // Appeler votre API pour obtenir les liens de téléchargement
                const apiResponse = await axios.get(videoData.downloadUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 30000
                });
                
                console.log('📦 Réponse API:', JSON.stringify(apiResponse.data, null, 2));
                
                if (!apiResponse.data?.success || !apiResponse.data?.data) {
                    throw new Error('Réponse API invalide');
                }
                
                const data = apiResponse.data.data;
                
                // Récupérer l'URL de la vidéo
                let videoUrl = null;
                if (data.downloads) {
                    videoUrl = data.downloads.noWatermark || 
                              (data.downloads.videos && data.downloads.videos[0]) || 
                              data.downloads.watermark;
                }
                
                if (!videoUrl) {
                    throw new Error('URL de vidéo non disponible');
                }
                
                console.log('🔥 Téléchargement depuis:', videoUrl);
                
                // Télécharger le fichier vidéo
                const videoBuffer = await axios.get(videoUrl, {
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 60000,
                    maxContentLength: 100 * 1024 * 1024
                });
                
                console.log('✅ Vidéo téléchargée, taille:', videoBuffer.data.byteLength, 'bytes');
                
                // Préparer le caption
                const caption = `🎵 *TikTok Download*\n\n` +
                    `👤 Auteur: ${data.creator || videoData.author}\n` +
                    `📝 ${data.title || data.description || videoData.title}\n\n` +
                    `> powered by sukuna`;
                
                // Envoyer la vidéo
                await sock.sendMessage(jid, {
                    video: Buffer.from(videoBuffer.data),
                    caption: caption,
                    mimetype: 'video/mp4'
                });
                
                await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
                console.log(`✅ [${phoneNumber}] Vidéo TikTok envoyée`);
                
            } catch (error) {
                console.error(`❌ [${phoneNumber}] Erreur téléchargement TikTok:`, error.message);
                
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                
                let errorMessage = translate(phoneNumber, 'tiktok_download_error', userConfigManager) || 
                                  '❌ Erreur lors du téléchargement.';
                
                if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                    errorMessage += '\n⏱️ Temps d\'attente dépassé. La vidéo est peut-être trop volumineuse.';
                }
                
                await sendReply(sock, jid, formatError(errorMessage), { quoted: msg });
            }
            
            return;
        }
        
        // Vérifier si une requête est fournie
        if (args.length === 0) {
            const usageMsg = translate(phoneNumber, 'tiktok_usage', userConfigManager, { prefix }) ||
                           `❌ Veuillez fournir une requête de recherche.\nExemple: ${prefix}tiktok marvel edit`;
            return await sendReply(sock, jid, formatError(usageMsg), { quoted: msg });
        }
        
        const query = args.join(' ');
        
        try {
            await sock.sendMessage(jid, { react: { text: '🔍', key: msg.key } });
            
            console.log('🔍 Recherche TikTok pour:', query);
            
            // Appel à l'API de recherche TikTok
            const searchResponse = await axios.get(`https://api.siputzx.my.id/api/s/tiktok`, {
                params: { query },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });
            
            console.log('📦 Réponse recherche:', searchResponse.data.status, '- Résultats:', searchResponse.data.data?.length);
            
            if (!searchResponse.data?.status || !searchResponse.data?.data || searchResponse.data.data.length === 0) {
                const noResultMsg = translate(phoneNumber, 'tiktok_no_results', userConfigManager, { query }) ||
                                  `❌ Aucun résultat trouvé pour "${query}"`;
                return await sendReply(sock, jid, formatError(noResultMsg), { quoted: msg });
            }
            
            // Récupérer 5 résultats aléatoires
            const allResults = searchResponse.data.data;
            const shuffled = allResults.sort(() => 0.5 - Math.random());
            const selectedResults = shuffled.slice(0, Math.min(5, allResults.length));
            
            // Nettoyer l'ancien cache pour ce chat
            for (let key of videoCache.keys()) {
                if (key.startsWith(jid)) {
                    videoCache.delete(key);
                }
            }
            
            // Créer les cartes pour le carousel
            const cards = selectedResults.map((video, index) => {
                const tiktokUrl = `https://www.tiktok.com/@${video.author.unique_id}/video/${video.video_id}`;
                const downloadUrl = `https://steph-api.vercel.app/api/media/tiktok?url=${encodeURIComponent(tiktokUrl)}`;
                
                console.log(`[${index}] TikTok URL:`, tiktokUrl);
                
                // Stocker les infos dans le cache
                videoCache.set(`${jid}_${index}`, {
                    tiktokUrl,
                    downloadUrl,
                    author: video.author.nickname || video.author.unique_id,
                    title: video.title || 'No description'
                });
                
                return {
                    title: `${video.author.nickname || video.author.unique_id}`,
                    body: (video.title || 'No description').substring(0, 100) + ((video.title || '').length > 100 ? '...' : ''),
                    image: video.cover || video.origin_cover,
                    buttons: [
                        { 
                            id: `${prefix}tiktok dl${index}`, 
                            text: "🔥 Télécharger"
                        },
                        { 
                            id: `.viewtt${index}`, 
                            text: "👁️ Voir sur TikTok", 
                            type: "cta_url", 
                            url: tiktokUrl 
                        }
                    ]
                };
            });
            
            // Envoyer le carousel
            await sendCarousel(sock, jid, {
                header: `🎵 Résultats TikTok pour "${query}"`,
                cards: cards
            });
            
            await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            console.log(`✅ [${phoneNumber}] Carousel envoyé avec ${cards.length} vidéos`);
            
            // Nettoyer le cache après 10 minutes
            setTimeout(() => {
                for (let key of videoCache.keys()) {
                    if (key.startsWith(jid)) {
                        videoCache.delete(key);
                    }
                }
                console.log(`🗑️ [${phoneNumber}] Cache nettoyé pour ${jid}`);
            }, 10 * 60 * 1000);
            
        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur commande tiktok:`, error.message);
            
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
            
            let errorMessage = translate(phoneNumber, 'tiktok_search_error', userConfigManager) ||
                              '❌ Erreur lors de la recherche TikTok';
            
            if (error.code === 'ECONNABORTED') {
                errorMessage += '\n⏱️ Temps d\'attente dépassé';
            }
            
            await sendReply(sock, jid, formatError(errorMessage), { quoted: msg });
        }
    }
};
