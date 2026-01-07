/**
 * 𝗦𝗘𝗡 Bot - Response Manager
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 * Gestionnaire centralisé de tous les styles de réponses
 */

import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import fs from 'fs';
import StephUI from 'stephtech-ui'; // ✅ Import Ajouté pour le bouton menu
import lang from './languageManager.js';

import settings from './settingsManager.js';
import configs from '../configs.js';


class ResponseManager {
    constructor() {
        this.thumbnail = 'https://i.ibb.co/tML08Wqw/ea6c3e422780.jpg';
        this.botName = configs.botName || '𝗦𝗘𝗡';
        this.footer = '𝘽𝙔 𝙎𝙀𝙉 𝙎𝙏𝙐𝘿𝙄𝙊';
        
        // Lien de la chaîne (Placeholder)
        this.channelLink = 'https://whatsapp.com/channel/0029VbAK3nYEquiZ3Ajpd90f'; 
    }

    /**
     * Convertit le texte en police fancy (small caps)
     */
    font(text) {
        const normalChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const fancyChars = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ';
        
        return text.split('').map(char => {
            const index = normalChars.indexOf(char);
            return index !== -1 ? fancyChars[index] : char;
        }).join('');
    }

    /**
     * Construit le contexte AdReply
     */
    ctx() {
        return {
            externalAdReply: {
                title: this.botName,
                body: this.footer,
                thumbnailUrl: this.thumbnail,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        };
    }

    /**
     * Style PING
     */
    async ping(sock, chatId, message, speed, uptime) {
        const speedLabel = lang.t('ping.speed') || 'SPEED';
        const uptimeLabel = lang.t('ping.uptime') || 'UPTIME';
        const text = `*${speedLabel}* : ${speed} ms\n*${uptimeLabel}* : ${uptime}\n\n> ${this.footer}`;
        
        return await sock.sendMessage(chatId, {
            image: { url: this.thumbnail },
            caption: text,
            contextInfo: this.ctx()
        }, { quoted: message });
    }

    /**
     * Style PROTECTION
     */
    async prot(sock, chatId, message, protectionName, status, maxWarnings = 3) {
        const statusText = status ? 'ENABLED' : 'DISABLED';
        let text = `*SEN_GROUP_PROTECTION*\n> *${protectionName} ${statusText}*`;
        
        if (status && maxWarnings) {
            text += `\n> *max warning* : ${maxWarnings}`;
        }
        
        return await sock.sendMessage(chatId, {
            text: text,
            contextInfo: this.ctx()
        }, { quoted: message });
    }

    /**
     * Style SUDO
     */
    async sudo(sock, chatId, message, action, userJid) {
        const actions = {
            add: 'IS NOW SUDO',
            remove: 'IS NO LONGER SUDO'
        };

        const text = `*@${userJid.split('@')[0]} ${actions[action] || actions.add}*`;
        
        return await sock.sendMessage(chatId, {
            image: { url: 'https://i.postimg.cc/SKRqQH6T/e4cb6d07b749fc4a2ac9c1858da5af86.jpg' },
            caption: text,
            contextInfo: this.ctx(),
            mentions: [userJid]
        }, { quoted: message });
    }

    /**
     * Style MENU - Modifié avec bouton CTA
     */
    get conf() {
        return settings.getAll();
    }

    async menu(sock, chatId, message, menuData) {
        const ui = new StephUI(sock); // Initialisation UI
        const conf = this.conf;
        const { user, categories } = menuData;
        const prefix = conf.prefix;
        const botName = conf.botName;
        
        let text = '';
        
        // Entête
        text += `╭━━━━━━━━━━━━━━━✦\n`;
        text += `┃ ❏ *${botName}*\n`;
        text += `┃ ❏ ${this.font('User')} : ${this.font(user)}\n`;
        text += `┃ ❏ ${this.font('Prefix')} : ${prefix}\n`;
        text += `╰━━━━━━━━━━━━━━━✦\n\n`;

        // Style Boxed (1)
        if (conf.menuStyle === 1) {
            for (const [category, commands] of Object.entries(categories)) {
                // On garde la catégorie telle quelle ou on la traduit juste pour l'affichage si besoin
                // Mais l'utilisateur a dit "pas besoin de la traduction de la liste des commandes"
                // Je traduis le header de catégorie uniquement pour que ce soit propre
                const categoryName = lang.t(`categories.${category}`) || category; 
                text += `╭━━━❏ *${this.font(categoryName)}* ❏\n`;
                commands.sort().forEach(cmd => text += `┃◇ ${this.font(cmd)}\n`);
                text += `╰━━━━━━━━━━━━━━━╯\n\n`;
            }
        }
        // Style Modern (2)
        else if (conf.menuStyle === 2) {
            for (const [category, commands] of Object.entries(categories)) {
                const categoryName = (lang.t(`categories.${category}`) || category).toUpperCase();
                text += `┌─── ❖ ${this.font(categoryName)} \n`;
                commands.sort().forEach(cmd => text += `│ ◦ ${this.font(cmd)}\n`);
                text += `└─────────────\n\n`;
            }
        }
        // Style Minimalist (3)
        else {
            text += `*— ${this.font('COMMAND LIST')} —*\n\n`;
            for (const [category, commands] of Object.entries(categories)) {
                const categoryName = (lang.t(`categories.${category}`) || category).toUpperCase();
                text += `*${this.font(categoryName)}*\n`;
                text += commands.map(c => `• ${this.font(c)}`).join('\n');
                text += `\n\n`;
            }
        }

        text += `> ${this.font(configs.footer || 'By Sen Studio')}`;

        // 🔥 ENVOI AVEC BOUTON CTA (Lien Chaîne)
        await ui.urlButtons(chatId, {
            text: text,
            image: conf.menuImage,
            footer: this.botName, // Petit texte en bas du message
            buttons: [
                {
                    text: "SEN STUDIO", // Texte du bouton
                    url: this.channelLink // Lien de la chaîne
                }
            ],
            // On peut mettre quoted: message si tu veux que le menu cite la commande
            quoted: null 
        });

        // Envoi Audio (Optionnel)
        if (conf.audioEnabled && conf.audioUrl && conf.audioUrl.startsWith('http')) {
            await sock.sendMessage(chatId, {
                audio: { url: conf.audioUrl },
                mimetype: 'audio/mp4',
                ptt: false 
            }, { quoted: null });
        }
    }

    /**
     * Style WARNING
     */
    async warn(sock, chatId, message, type, count, max, userJid) {
        const remaining = max - count;
        const isKick = count >= max;
        const types = { antilink: 'ANTILINK', antitag: 'ANTITAG', antimedia: 'ANTIMEDIA', antispam: 'ANTISPAM' };

        let text = `*${types[type] || type.toUpperCase()} WARNING ${count}/${max}*\n\n`;
        text += isKick ? `User @${userJid.split('@')[0]} will be removed` : `${remaining} warning${remaining > 1 ? 's' : ''} left before removal`;

        return await sock.sendMessage(chatId, {
            text: text,
            contextInfo: this.ctx(),
            mentions: [userJid]
        }, { quoted: message });
    }

    /**
     * Style LIST
     */
    async list(sock, chatId, message, title, items) {
        let text = `╭━━━ *${title}* ━━━╮\n\n`;
        items.forEach((item, index) => text += `${index + 1}. ${item}\n`);
        text += `\n╰━━━━━━━━━━━━━━━━╯`;
        
        return await sock.sendMessage(chatId, { text: text, contextInfo: this.ctx() }, { quoted: message });
    }

    /**
     * Style GROUP STATUS
     */
    async status(sock, chatId, message, protections) {
        let text = `╭━━━━━━━━━━━━━━━✦\n┃  *GROUP PROTECTION*\n╰━━━━━━━━━━━━━━━✦\n\n┏━━〔 Status 〕━━┓\n`;
        for (const [key, value] of Object.entries(protections)) {
            text += `┃ ${key.toUpperCase().padEnd(12)} : ${value ? 'ON' : 'OFF'}\n`;
        }
        text += `┗━━━━━━━━━━━━━━━┛\n\n> ${this.footer}`;
        
        return await sock.sendMessage(chatId, { text: text, contextInfo: this.ctx() }, { quoted: message });
    }
    
    async group(sock, chatId, message, featureName, status) {
        const statusText = status ? 'ENABLED' : 'DISABLED';
        const text = `*SEN_GROUP*\n> *${featureName} ${statusText}*`;
        return await sock.sendMessage(chatId, { text: text, contextInfo: this.ctx() }, { quoted: message });
    }

    /**
     * Style MODE
     */
    async mode(sock, chatId, message, mode) {
        const isPublic = mode === 'public';
        let text = `*BOT MODE CHANGED*\n\nMode: ${mode.toUpperCase()}\n`;
        text += isPublic ? 'Everyone can now use the bot' : 'Only owner and sudo users can use the bot';
        
        return await sock.sendMessage(chatId, {
            image: { url: this.thumbnail },
            caption: text,
            contextInfo: this.ctx()
        }, { quoted: message });
    }
}

export default new ResponseManager();