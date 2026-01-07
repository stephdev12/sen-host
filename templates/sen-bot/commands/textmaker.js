/**
 * 𝗦𝗘𝗡 Bot - TextMaker Command
 * Génère des logos textuels via Ephoto360 (Mumaker)
 */

import mumaker from 'mumaker';
import axios from 'axios';
import response from '../lib/response.js';
import lang from '../lib/languageManager.js';

/**
 * Fonction principale qui gère tous les styles
 */
export async function textmakerCommand(sock, chatId, message, args) {
    try {
        // 1. Récupération du texte
        const text = args.join(' ');
        
        // 2. Détection du style basé sur la commande tapée (ex: .neon -> neon)
        // On récupère le corps du message pour trouver le mot déclencheur
        const body = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || 
                     message.message?.imageMessage?.caption || "";
        
        // Enlève le préfixe et prend le premier mot (le nom de la commande)
        const commandName = body.trim().split(/\s+/)[0].slice(1).toLowerCase();

        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: `⚠️ ${response.font('Texte manquant')}.\n\n📝 Usage: .${commandName} SenBot`
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });

        let result;
        const [text1, text2] = text.split('|').map(t => t.trim());

        // 3. URLs Ephoto360
        // Tu peux ajouter ou modifier les liens ici
        const effects = {
            'metallic': "https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html",
            'ice': "https://en.ephoto360.com/ice-text-effect-online-101.html",
            'snow': "https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html",
            'impressive': "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html",
            'matrix': "https://en.ephoto360.com/matrix-text-effect-154.html",
            'light': "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
            'neon': "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html",
            'devil': "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html",
            'purple': "https://en.ephoto360.com/purple-text-effect-online-100.html",
            'thunder': "https://en.ephoto360.com/thunder-text-effect-online-97.html",
            'leaves': "https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html",
            '1917': "https://en.ephoto360.com/1917-style-text-effect-523.html",
            'arena': "https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html",
            'hacker': "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html",
            'sand': "https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html",
            'glitch': "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html",
            'fire': "https://en.ephoto360.com/flame-lettering-effect-372.html",
            'dragonball': "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html",
            'foggyglass': "https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html",
            'naruto': "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html",
            'typo': "https://en.ephoto360.com/create-online-typography-art-effects-with-multiple-layers-811.html",
            'frost': "https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html",
            'pixelglitch': "https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html",
            'neonglitch': "https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html",
            'america': "https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html",
            'erase': "https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html",
            'blackpink': "https://en.ephoto360.com/create-a-blackpink-neon-logo-text-effect-online-710.html",
            'starwars': "https://en.ephoto360.com/create-star-wars-logo-online-982.html",
            'bearlogo': "https://en.ephoto360.com/free-bear-logo-maker-online-673.html",
            'graffiti': "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html",
            'graffitiv2': "https://en.ephoto360.com/cute-girl-painting-graffiti-text-effect-667.html",
            'futuristic': "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
            'clouds': "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html"
        };

        // Gestion spéciale pour les effets à 2 textes
        if (commandName === 'pornhub' || commandName === 'marvel' || commandName === 'captainamerica') {
            if (!text1 || !text2) {
                return await sock.sendMessage(chatId, { 
                    text: `⚠️ Format requis: .${commandName} Texte1 | Texte2` 
                }, { quoted: message });
            }
            
            let url = "https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html";
            if (commandName === 'marvel') url = "https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html";
            if (commandName === 'captainamerica') url = "https://en.ephoto360.com/create-a-cinematic-captain-america-text-effect-online-715.html";
            
            result = await mumaker.ephoto(url, [text1, text2]);
        } 
        // Gestion des effets standards (1 texte)
        else if (effects[commandName]) {
            result = await mumaker.ephoto(effects[commandName], text);
        } 
        else {
            throw new Error('Style introuvable');
        }

        if (!result || !result.image) throw new Error('API Error');

        // 4. Téléchargement et Envoi
        const { data } = await axios.get(result.image, { responseType: 'arraybuffer' });
        
        await sock.sendMessage(chatId, { 
            image: data,
            caption: `🎨 ${response.font('Effect')} : ${response.font(commandName.toUpperCase())}`
        }, { quoted: message });

    } catch (error) {
        console.error('Textmaker error:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ ${lang.t('errors.commandFailed')}` 
        }, { quoted: message });
    }
}

// 👇 VOICI L'EXPORTATION IMPORTANTE 👇
// Cela permet d'importer { textmakerCommand } OU le défaut.
export default { textmakerCommand };
