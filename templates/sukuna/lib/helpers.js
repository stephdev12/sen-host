import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import path from 'path';
import config from '../config.js';
import {  t, getTranslations  } from './translations.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DB_PATH = path.resolve(__dirname, 'db.json');
const DB_BACKUP_PATH = path.resolve(__dirname, 'db.json.bak');

let db = {};

function loadDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const content = fs.readFileSync(DB_PATH, 'utf-8');
            db = JSON.parse(content);
        } else {
            db = {};
            saveDB(); 
        }
    } catch (err) {
        console.error('❌ Erreur critique de lecture de la base de données:', err.message);
        
        try {
            if (fs.existsSync(DB_BACKUP_PATH)) {
                fs.copyFileSync(DB_BACKUP_PATH, DB_PATH);
                const content = fs.readFileSync(DB_PATH, 'utf-8');
                db = JSON.parse(content);
            } else {
                db = {};
            }
        } catch (restoreErr) {
            console.error('❌ Échec de la restauration de la base de données:', restoreErr.message);
            db = {};
        }
    }
}

function saveDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            fs.copyFileSync(DB_PATH, DB_BACKUP_PATH);
        }
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    } catch (error) {
        console.error('❌ Erreur de sauvegarde de la base de données:', error.message);
    }
}

loadDB();

function getGroupConfig(jid) {
    if (!db.groups) db.groups = {};
    if (!db.groups[jid]) {
        db.groups[jid] = {
            antilink: { enabled: false, kickThreshold: 3 },
            antispam: { enabled: false, kickThreshold: 3 },
            antimention: { enabled: false },
            antitag: { enabled: false },
            welcome: { enabled: false, text: '' },
            goodbye: { enabled: false, text: '' },
            users: {},
        };
        saveDB();
    }
    return db.groups[jid];
}

function getGroupUser(jid, sender) {
    const group = getGroupConfig(jid);
    if (!group.users) group.users = {};
    if (!group.users[sender]) {
        group.users[sender] = {
            antilink_warnings: 0,
            antispam_warnings: 0,
            messages: [],
        };
        saveDB();
    }
    return group.users[sender];
}

function font(text) {
    const normalChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fancyChars = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ';
    
    return text.split('').map(char => {
        const index = normalChars.indexOf(char);
        return index !== -1 ? fancyChars[index] : char;
    }).join('');
}

function formatMessage(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const formatted = lines.map(line => `${line}`).join('\n');
    return `${formatted}\n\n> ʙʏ sᴛᴇᴘʜ ᴛᴇᴄʜ`;
}

function buildAdReplyContext() {
    return {
        externalAdReply: {
            title: "𝗦𝗧𝗘𝗣𝗛-𝗫𝗠𝗗",
            body: "ʙʏ ꜱᴛᴇᴘʜᴛᴇᴄʜ",
            thumbnailUrl: 'https://i.postimg.cc/8cKZBMZw/lv-0-20251105211949.jpg',
            sourceUrl: 'https://whatsapp.com/channel/0029Vb6DrnUHAdNQtz2GC307',
            mediaType: 1,
            mediaUrl: 'https://whatsapp.com/channel/0029Vb6DrnUHAdNQtz2GC307',
            renderLargerThumbnail: false
        }
    };
}

function translate(phoneNumber, key, userConfigManager, variables = {}) {
    let translatedText = t(phoneNumber, key, userConfigManager);
    
    Object.keys(variables).forEach(variable => {
        const placeholder = `{${variable}}`;
        translatedText = translatedText.replace(new RegExp(placeholder, 'g'), variables[variable]);
    });
    
    return translatedText;
}

async function sendReply(sock, to, text, options = {}) {
    const { phoneNumber, userConfigManager, translationKey, translationVars, mentions, ...sendOptions } = options;
    
    let finalText = text;
    
    if (translationKey && phoneNumber && userConfigManager) {
        finalText = translate(phoneNumber, translationKey, userConfigManager, translationVars);
    }
    
    const messageOptions = {
        text: formatMessage(finalText),
        contextInfo: buildAdReplyContext()
    };
    
    if (mentions && mentions.length > 0) {
        messageOptions.mentions = mentions;
        messageOptions.contextInfo.mentionedJid = mentions;
    }

    await sock.sendMessage(to, messageOptions, {
        quoted: sendOptions.quoted || null
    });
}

async function sendReplySimple(sock, to, text, options = {}) {
    return await sendReply(sock, to, text, options);
}

async function sendImageReply(sock, to, text, imageUrl, options = {}) {
    const { phoneNumber, userConfigManager, translationKey, translationVars, mentions, ...sendOptions } = options;
    
    let finalText = text;
    
    if (translationKey && phoneNumber && userConfigManager) {
        finalText = translate(phoneNumber, translationKey, userConfigManager, translationVars);
    }
    
    const messageOptions = {
        image: { url: imageUrl },
        caption: formatMessage(finalText),
        contextInfo: buildAdReplyContext()
    };
    
    if (mentions && mentions.length > 0) {
        messageOptions.mentions = mentions;
        messageOptions.contextInfo.mentionedJid = mentions;
    }

    await sock.sendMessage(to, messageOptions, {
        quoted: sendOptions.quoted || null
    });
}

function formatError(text, options = {}) {
    const { phoneNumber, userConfigManager, translationKey, translationVars } = options;
    
    let finalText = text;
    
    if (translationKey && phoneNumber && userConfigManager) {
        finalText = translate(phoneNumber, translationKey, userConfigManager, translationVars);
    }
    
    return `❌ ${font(finalText)}`;
}

function formatSuccess(text, options = {}) {
    const { phoneNumber, userConfigManager, translationKey, translationVars } = options;
    
    let finalText = text;
    
    if (translationKey && phoneNumber && userConfigManager) {
        finalText = translate(phoneNumber, translationKey, userConfigManager, translationVars);
    }
    
    return `✅ ${font(finalText)}`;
}

function formatHelp(text, options = {}) {
    const { phoneNumber, userConfigManager, translationKey, translationVars } = options;
    
    let finalText = text;
    
    if (translationKey && phoneNumber && userConfigManager) {
        finalText = translate(phoneNumber, translationKey, userConfigManager, translationVars);
    }
    
    return `💡 ${font(finalText)}`;
}

function getLanguageTranslations(lang = 'fr') {
    return getTranslations(lang);
}

export { 
    db,
    saveDB,
    font,
    formatMessage,
    buildAdReplyContext,
    sendReply,
    sendImageReply,
    sendReplySimple,
    formatError,
    formatSuccess,
    formatHelp,
    sleep,
    getGroupConfig,
    getGroupUser,
    translate,
    getLanguageTranslations
 };