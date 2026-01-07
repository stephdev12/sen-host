// commands/pinterest.js

import { sendReplySimple } from '../lib/helpers.js';
import { sendCarousel } from 'stephtech-ui';
import axios from 'axios';

export default {
    name: 'pinterest',
    aliases: ['pin', 'pinsearch'],
    description: 'Recherche des images Pinterest et affiche les résultats',
    
    async execute({ sock, msg, args }) {
        const jid = msg.key.remoteJid;
        
        // Vérifier si une requête est fournie
        if (args.length === 0) {
            return await sendReplySimple(
                sock,
                jid,
                '❌ Veuillez fournir une requête de recherche.\nExemple: `.pinterest cat`',
                { quoted: msg }
            );
        }
        
        const query = args.join(' ');
        
        try {
            // Réaction pour montrer que la commande est en cours
            await sock.sendMessage(jid, { react: { text: '🔍', key: msg.key } });
            
            // Appel à l'API de recherche Pinterest avec headers de navigateur
            const searchResponse = await axios.get(`https://api.siputzx.my.id/api/s/pinterest`, {
                params: { 
                    query,
                    type: 'image'
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Referer': 'https://www.pinterest.com/'
                }
            });
            
            if (!searchResponse.data || !searchResponse.data.status || !searchResponse.data.data || searchResponse.data.data.length === 0) {
                return await sendReplySimple(
                    sock,
                    jid,
                    `❌ Aucun résultat trouvé pour "${query}"`,
                    { quoted: msg }
                );
            }
            
            // Récupérer 5 résultats aléatoires
            const allResults = searchResponse.data.data;
            const shuffled = allResults.sort(() => 0.5 - Math.random());
            const selectedResults = shuffled.slice(0, Math.min(5, allResults.length));
            
            // Créer les cartes pour le carousel
            const cards = selectedResults.map((item) => {
                // Utiliser la description ou un texte par défaut
                const description = item.description || item.grid_title || 'Image Pinterest';
                const truncatedDesc = description.substring(0, 80) + (description.length > 80 ? '...' : '');
                
                return {
                    title: item.pinner.full_name || item.pinner.username,
                    body: `${truncatedDesc}\n\n> powered by sukuna`,
                    image: item.image_url
                };
            });
            
            // Envoyer le carousel
            await sendCarousel(sock, jid, {
                header: `📌 Résultats Pinterest pour "${query}"`,
                cards: cards
            });
            
            // Réaction de succès
            await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            
        } catch (error) {
            console.error('❌ Erreur commande pinterest:', error);
            
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
            
            await sendReplySimple(
                sock, 
                jid, 
                `❌ Erreur lors de la recherche Pinterest:\n${error.message}`, 
                { quoted: msg }
            );
        }
    }
};