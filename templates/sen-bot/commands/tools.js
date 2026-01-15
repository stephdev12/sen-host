/**
 * 𝗦𝗘𝗡 Bot - Tools Commands
 * Correction: Fancy Text Logic
 */

import axios from 'axios';
import response from '../lib/response.js';

// ... (Garde tes fonctions dns, obfuscate, dbinary comme avant) ...
export async function dnsCommand(sock, chatId, message, args) {
    const domain = args.join('');
    if (!domain) return sock.sendMessage(chatId, { text: 'Ex: .dns google.com' });
    try {
        const { data } = await axios.get(`https://api.giftedtech.co.ke/api/tools/dns-check?apikey=gifted&domain=${domain}`);
        if (!data.success) throw new Error();
        let text = `🌐 *DNS RECORDS: ${domain}*\n\n`;
        data.result.records.forEach(rec => {
            text += `🔹 *Type:* ${rec.type}\n   TTL: ${rec.ttl}\n`;
            if (rec.ip) text += `   IP: ${rec.ip}\n`;
            if (rec.target) text += `   Target: ${rec.target}\n`;
            text += '\n';
        });
        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (e) { sock.sendMessage(chatId, { text: '❌ Erreur.' }); }
}

export async function obfuscateCommand(sock, chatId, message, args) {
    const code = args.join(' ');
    if (!code) return sock.sendMessage(chatId, { text: 'Entrez du code JS.' });
    try {
        const { data } = await axios.get(`https://api.giftedtech.co.ke/api/tools/encryptv3?apikey=gifted&code=${encodeURIComponent(code)}`);
        await sock.sendMessage(chatId, { text: data.result.encrypted_code }, { quoted: message });
    } catch (e) { sock.sendMessage(chatId, { text: '❌ Erreur.' }); }
}

export async function dbinaryCommand(sock, chatId, message, args) {
    const binary = args.join(' ');
    if (!binary) return sock.sendMessage(chatId, { text: 'Entrez du binaire.' });
    try {
        const { data } = await axios.get(`https://api.giftedtech.co.ke/api/tools/dbinary?apikey=gifted&query=${encodeURIComponent(binary)}`);
        await sock.sendMessage(chatId, { text: `🔓 *Décodé:* ${data.result}` }, { quoted: message });
    } catch (e) { sock.sendMessage(chatId, { text: '❌ Erreur.' }); }
}

// 🔥 CORRECTION ICI POUR FANCY
export async function fancyCommand(sock, chatId, message, args) {
    if (args.length === 0) return sock.sendMessage(chatId, { text: 'Usage: .fancy <texte> [numéro]\nEx: .fancy SenBot 1' });

    let text = "";
    let styleIndex = null;

    // Nouvelle logique : On regarde si le DERNIER argument est un nombre
    const lastArg = args[args.length - 1];

    if (!isNaN(lastArg) && args.length > 1) {
        // C'est un chiffre ! On l'utilise comme index
        styleIndex = parseInt(lastArg);
        // On récupère tout le texte SAUF le dernier chiffre
        text = args.slice(0, -1).join(' ');
    } else {
        // Pas de chiffre à la fin, tout est du texte
        text = args.join(' ');
    }

    try {
        const { data } = await axios.get(`https://api.giftedtech.co.ke/api/tools/fancy?apikey=gifted&text=${encodeURIComponent(text)}`);
        
        if (styleIndex !== null) {
            // Si l'utilisateur a donné un numéro valide (ex: 1 pour le premier élément)
            const idx = styleIndex - 1; // Le tableau commence à 0
            if (data.results[idx]) {
                return await sock.sendMessage(chatId, { text: data.results[idx].result }, { quoted: message });
            }
        }

        // Sinon, on affiche la liste
        let list = `✨ *FANCY STYLES*\nTexte: ${text}\n\n`;
        data.results.forEach((item, i) => {
            list += `*${i + 1}.* ${item.name} : ${item.result}\n`;
        });
        list += `\n💡 *Astuce:* Utilisez .fancy ${text} 5 (pour choisir le style 5 direct).`;
        
        await sock.sendMessage(chatId, { text: list }, { quoted: message });

    } catch (e) { 
        console.error(e);
        sock.sendMessage(chatId, { text: '❌ Erreur API.' }); 
    }
}

/**
 * Commande WALINK (Générateur de lien WhatsApp court)
 * API: Keith
 */
export async function walinkCommand(sock, chatId, message, args) {
    // On attend : .walink <numero> <message>
    // Ex: .walink 237xxxx Salut cv
    
    const number = args[0];
    const text = args.slice(1).join(' ');

    if (!number || !text) {
        return await sock.sendMessage(chatId, { 
            text: `🔗 ${response.font('Usage invalide')}.\nEx: .walink 237690000000 Salut ça va ?` 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🔗', key: message.key } });

        const apiUrl = `https://apiskeith.vercel.app/tools/walink?q=${encodeURIComponent(text)}&number=${number}`;
        const { data } = await axios.get(apiUrl);

        if (data.status && data.result && data.result.shortUrl) {
            await sock.sendMessage(chatId, { 
                text: `✅ *LIEN GÉNÉRÉ*\n\n${data.result.shortUrl}` 
            }, { quoted: message });
        } else {
            throw new Error('API invalide');
        }

    } catch (error) {
        console.error('Walink Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur de création du lien.' }, { quoted: message });
    }
}

/**
 * Commande LYRICS (Paroles de chansons)
 * API: Keith
 */
export async function lyricsCommand(sock, chatId, message, args) {
    const query = args.join(' ');

    if (!query) {
        return await sock.sendMessage(chatId, { 
            text: `🎵 ${response.font('Titre requis')}.\nEx: .lyrics faded` 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🎶', key: message.key } });

        const apiUrl = `https://apiskeith.vercel.app/search/lyrics?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl);

        if (data.status && data.result && data.result.length > 0) {
            // On prend le premier résultat
            const song = data.result[0];
            
            const caption = `╭─── 🎵 *LYRICS* ───╮\n` +
                            `│ 🎤 *Artiste:* ${song.artist}\n` +
                            `│ 🎼 *Titre:* ${song.song}\n` +
                            `╰──────────────────╯\n\n` +
                            `${song.lyrics}`;

            // Envoi avec l'image de la chanson
            await sock.sendMessage(chatId, { 
                image: { url: song.thumbnail },
                caption: caption
            }, { quoted: message });

        } else {
            await sock.sendMessage(chatId, { text: '❌ Paroles introuvables.' }, { quoted: message });
        }

    } catch (error) {
        console.error('Lyrics Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur de recherche.' }, { quoted: message });
    }
}


/**
 * Commande GITCLONE (Téléchargement de repo GitHub)
 * API: PrinceTech
 */
export async function gitcloneCommand(sock, chatId, message, args) {
    const url = args[0];
    if (!url) {
        return await sock.sendMessage(chatId, { 
            text: `❌ ${response.font('Veuillez entrer un lien GitHub')}.\nEx: .gitclone https://github.com/user/repo` 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '📦', key: message.key } });

        const apiUrl = `https://api.princetechn.com/api/download/gitclone?apikey=prince&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.result) {
            return await sock.sendMessage(chatId, { text: '❌ Repository introuvable.' }, { quoted: message });
        }

        const { name, download_url } = data.result;

        await sock.sendMessage(chatId, {
            document: { url: download_url },
            fileName: `${name}.zip`,
            mimetype: 'application/zip',
            caption: `📦 *GITCLONE*\n> *Nom:* ${name}\n> *Lien:* ${url}`
        }, { quoted: message });

    } catch (error) {
        console.error('GitClone Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Erreur de téléchargement.' }, { quoted: message });
    }
}

export default { dnsCommand, obfuscateCommand, dbinaryCommand, fancyCommand, walinkCommand, lyricsCommand, gitcloneCommand };
