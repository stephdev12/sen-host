import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { 
    default as makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    jidNormalizedUser
 } from 'baileys';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import NodeCache from 'node-cache';

import userConfigManager from './userConfigManager.js';
import {  sendReply, formatError, formatSuccess, font, translate  } from './lib/helpers.js';
import {  isAdmin, isOwner  } from './lib/isAdmin.js';
import modeCommand from './commands/mode.js';
import {  downloadContentFromMessage  } from 'baileys';
import {  writeFile  } from 'fs/promises';
import {  handleAutowrite  } from './commands/autowrite.js';
import {  handleAutoreact  } from './commands/autoreact.js';
import {  handleAutoStatus  } from './commands/autostatus.js';





const configPath = path.join(__dirname, 'config.json');
const configData = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(configData);

class WhatsAppManager {
    constructor() {
        this.sessions = new Map();
        this.sessionDatabases = new Map();
        this.messageStores = new Map();
        
        // 🔥 CACHE OPTIMISÉ
        this.miniCache = new Map();
        this.rateLimits = new Map();
        this.creatingSessions = new Set();
        this.lastMessageTime = new Map();
        
        // 🔥 CACHE GROUPE LÉGER
        this.groupCache = new NodeCache({
            stdTTL: 600,        // 10 minutes au lieu de 30
            checkperiod: 180,   // Vérifier toutes les 3 minutes
            useClones: false,
            maxKeys: 500        // Réduire de 1000 à 500
        });
        
        // 🔥 STATS GLOBALES
        this.globalStats = {
            totalSessions: 0,
            activeSessions: 0,
            messagesReceived: 0,
            messagesProcessed: 0,
            commandsExecuted: 0,
            errors: 0,
            startTime: Date.now()
        };
        
        this.setupSessionsDirectory();
        this.setupErrorHandling();
        this.loadCommands();
        this.setupTempDirectories();
        
        // 🔥 CLEANUP PLUS FRÉQUENT
        setInterval(() => this.aggressiveCleanup(), 5 * 60 * 1000);  // Toutes les 5 minutes
        setInterval(() => this.logGlobalStats(), 15 * 60 * 1000);    // Toutes les 15 minutes
    }

    // 🔥 NETTOYAGE AGRESSIF
    aggressiveCleanup() {
        try {
            const now = Date.now();
            const maxAge = 5 * 60 * 1000; // 5 minutes
            
            // Nettoyer miniCache
            let cleaned = 0;
            for (const [key, value] of this.miniCache.entries()) {
                if (value.timestamp && now - value.timestamp > maxAge) {
                    this.miniCache.delete(key);
                    cleaned++;
                }
            }
            
            // Nettoyer rate limits
            for (const [key, time] of this.rateLimits.entries()) {
                if (now - time > 60000) {
                    this.rateLimits.delete(key);
                }
            }
            
            // Nettoyer lastMessageTime
            for (const [key, time] of this.lastMessageTime.entries()) {
                if (now - time > maxAge) {
                    this.lastMessageTime.delete(key);
                }
            }
            
            // Nettoyer messageStores vieux messages
            for (const [phoneNumber, store] of this.messageStores.entries()) {
                for (const [msgId, msgData] of store.entries()) {
                    const msgTime = new Date(msgData.timestamp).getTime();
                    if (now - msgTime > 30 * 60 * 1000) { // 30 minutes
                        if (msgData.mediaPath && fs.existsSync(msgData.mediaPath)) {
                            try {
                                fs.unlinkSync(msgData.mediaPath);
                            } catch (e) {}
                        }
                        store.delete(msgId);
                    }
                }
            }
            
            // 🔥 FORCE GARBAGE COLLECTION
            if (global.gc) {
                global.gc();
            }
            
            console.log(`🧹 Cleanup: ${cleaned} cache entries, ${this.miniCache.size} remaining`);
            
        } catch (error) {
            console.error('❌ Cleanup error:', error.message);
        }
    }

     // 🔥 OPTIMISATION: Rate limiting simple
    async sendSafe(sock, jid, message) {
        const key = `${jid}`;
        const now = Date.now();
        const lastTime = this.rateLimits.get(key) || 0;
        
        if (now - lastTime < 2000) {
            await new Promise(resolve => setTimeout(resolve, 2000 - (now - lastTime)));
        }
        
        try {
            const result = await sock.sendMessage(jid, message);
            this.rateLimits.set(key, Date.now());
            return result;
        } catch (error) {
            if (error.message?.includes('rate-overlimit')) {
                console.log(`⚠️ WhatsApp rate limit hit, waiting 10s...`);
                await new Promise(resolve => setTimeout(resolve, 10000));
                return null;
            }
            throw error;
        }
    }

    logGlobalStats() {
        const uptime = Math.floor((Date.now() - this.globalStats.startTime) / 1000 / 60);
        const memUsage = process.memoryUsage();
        
        console.log(`
📊 Global Bot Stats (Uptime: ${uptime}min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sessions: ${this.sessions.size} active / ${this.globalStats.totalSessions} total
Messages: ${this.globalStats.messagesReceived} received, ${this.globalStats.messagesProcessed} processed
Commands: ${this.globalStats.commandsExecuted}
Errors: ${this.globalStats.errors}
Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB
Cache: ${this.miniCache.size} entries, ${this.groupCache.keys().length} groups
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
        
        // 🔥 ALERTE MÉMOIRE
        if (memUsage.heapUsed / 1024 / 1024 > 300) {
            console.warn('⚠️  HIGH MEMORY USAGE! Running aggressive cleanup...');
            this.aggressiveCleanup();
        }
    }

    setupErrorHandling() {
        process.on('uncaughtException', (error) => {
            console.error('🚨 UNCAUGHT EXCEPTION:', error.message);
            this.globalStats.errors++;
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('🚨 UNHANDLED REJECTION:', reason);
            this.globalStats.errors++;
        });
    }

    setupSessionsDirectory() {
        const sessionsDir = './whatsapp_sessions';
        if (!fs.existsSync(sessionsDir)) {
            fs.mkdirSync(sessionsDir, { recursive: true });
        }
    }

    setupTempDirectories() {
        const tempDir = './tmp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // 🔥 NETTOYAGE PLUS FRÉQUENT
        setInterval(() => {
            this.cleanTempFolder();
        }, 5 * 60 * 1000); // Toutes les 5 minutes
    }

    cleanTempFolder() {
        try {
            const tempDir = './tmp';
            if (!fs.existsSync(tempDir)) return;
            
            const files = fs.readdirSync(tempDir);
            let cleaned = 0;
            
            for (const file of files) {
                const filePath = path.join(tempDir, file);
                try {
                    const stats = fs.statSync(filePath);
                    // 🔥 RÉDUIRE À 15 MINUTES au lieu de 30
                    if (Date.now() - stats.mtime.getTime() > 15 * 60 * 1000) {
                        fs.unlinkSync(filePath);
                        cleaned++;
                    }
                } catch (e) {}
            }
            
            if (cleaned > 0) {
                console.log(`🗑️  Cleaned ${cleaned} temp files`);
            }
        } catch (error) {
            console.error('❌ Erreur nettoyage tmp:', error.message);
        }
    }

    getMessageStore(phoneNumber) {
        if (!this.messageStores.has(phoneNumber)) {
            this.messageStores.set(phoneNumber, new Map());
        }
        return this.messageStores.get(phoneNumber);
    }

    async streamToBuffer(stream) {
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    }

    // 🔥 CACHE DES SETTINGS OPTIMISÉ
    getCachedSettings(phoneNumber) {
        const cached = this.miniCache.get(`settings_${phoneNumber}`);
        if (cached && Date.now() - cached.timestamp < 3 * 60 * 1000) { // 3 minutes
            return cached.data;
        }
        return null;
    }

    cacheSettings(phoneNumber, settings) {
        this.miniCache.set(`settings_${phoneNumber}`, {
            data: settings,
            timestamp: Date.now()
        });
    }

    getUserWarnings(phoneNumber, jid, userId) {
        const key = `warnings_${phoneNumber}_${jid}_${userId}`;
        let warnings = this.miniCache.get(key);
        
        if (!warnings) {
            warnings = {
                data: {
                    antilink: 0,
                    antispam: 0,
                    messages: [],
                    lastReset: Date.now()
                },
                timestamp: Date.now()
            };
            this.miniCache.set(key, warnings);
        }
        
        return warnings.data;
    }

    resetUserWarnings(phoneNumber, jid, userId = null) {
        if (userId) {
            const key = `warnings_${phoneNumber}_${jid}_${userId}`;
            this.miniCache.delete(key);
        } else {
            for (const [key] of this.miniCache) {
                if (key.startsWith(`warnings_${phoneNumber}_${jid}_`)) {
                    this.miniCache.delete(key);
                }
            }
        }
    }

    // 🔥 SEND SAFE AMÉLIORÉ
    async sendSafe(sock, jid, message) {
        const key = `send_${jid}`;
        const now = Date.now();
        const lastTime = this.lastMessageTime.get(key) || 0;
        
        // 🔥 ATTENDRE 2.5 SECONDES entre messages
        if (now - lastTime < 2500) {
            await new Promise(resolve => setTimeout(resolve, 2500 - (now - lastTime)));
        }
        
        try {
            const result = await sock.sendMessage(jid, message);
            this.lastMessageTime.set(key, Date.now());
            return result;
        } catch (error) {
            if (error.message?.includes('rate-overlimit') || error.message?.includes('429')) {
                console.log(`⚠️  WhatsApp rate limit hit, waiting 15s...`);
                await new Promise(resolve => setTimeout(resolve, 15000));
                return null;
            }
            throw error;
        }
    }

    async storeMessage(msg, sock, phoneNumber) {
        try {
            const sessionDB = this.getSessionDB(phoneNumber);
            const antideleteEnabled = sessionDB.settings?.antidelete?.enabled;
            
            if (!antideleteEnabled || !msg.key?.id) return;

            const messageId = msg.key.id;
            const sender = msg.key.participant || msg.key.remoteJid;
            const messageStore = this.getMessageStore(phoneNumber);
            
            let content = '';
            let mediaType = '';
            let mediaPath = '';
            let isViewOnce = false;

            const viewOnceContainer = msg.message?.viewOnceMessageV2?.message || 
                                    msg.message?.viewOnceMessage?.message;

            if (viewOnceContainer) {
                if (viewOnceContainer.imageMessage) {
                    mediaType = 'image';
                    content = viewOnceContainer.imageMessage.caption || '';
                    try {
                        const stream = await downloadContentFromMessage(viewOnceContainer.imageMessage, 'image');
                        const buffer = await this.streamToBuffer(stream);
                        mediaPath = path.join('./tmp', `${messageId}_${phoneNumber}.jpg`);
                        await writeFile(mediaPath, buffer);
                        isViewOnce = true;
                    } catch (err) {
                        console.error(`❌ [${phoneNumber}] Error download view-once image:`, err.message);
                    }
                } else if (viewOnceContainer.videoMessage) {
                    mediaType = 'video';
                    content = viewOnceContainer.videoMessage.caption || '';
                    try {
                        const stream = await downloadContentFromMessage(viewOnceContainer.videoMessage, 'video');
                        const buffer = await this.streamToBuffer(stream);
                        mediaPath = path.join('./tmp', `${messageId}_${phoneNumber}.mp4`);
                        await writeFile(mediaPath, buffer);
                        isViewOnce = true;
                    } catch (err) {
                        console.error(`❌ [${phoneNumber}] Error download view-once video:`, err.message);
                    }
                }
            } 
            
            else if (msg.message?.conversation) {
                content = msg.message.conversation;
            } else if (msg.message?.extendedTextMessage?.text) {
                content = msg.message.extendedTextMessage.text;
            } else if (msg.message?.imageMessage) {
                mediaType = 'image';
                content = msg.message.imageMessage.caption || '';
                try {
                    const stream = await downloadContentFromMessage(msg.message.imageMessage, 'image');
                    const buffer = await this.streamToBuffer(stream);
                    mediaPath = path.join('./tmp', `${messageId}_${phoneNumber}.jpg`);
                    await writeFile(mediaPath, buffer);
                } catch (err) {
                    console.error(`❌ [${phoneNumber}] Error download image:`, err.message);
                }
            } else if (msg.message?.videoMessage) {
                mediaType = 'video';
                content = msg.message.videoMessage.caption || '';
                try {
                    const stream = await downloadContentFromMessage(msg.message.videoMessage, 'video');
                    const buffer = await this.streamToBuffer(stream);
                    mediaPath = path.join('./tmp', `${messageId}_${phoneNumber}.mp4`);
                    await writeFile(mediaPath, buffer);
                } catch (err) {
                    console.error(`❌ [${phoneNumber}] Error download video:`, err.message);
                }
            } else if (msg.message?.stickerMessage) {
                mediaType = 'sticker';
                try {
                    const stream = await downloadContentFromMessage(msg.message.stickerMessage, 'sticker');
                    const buffer = await this.streamToBuffer(stream);
                    mediaPath = path.join('./tmp', `${messageId}_${phoneNumber}.webp`);
                    await writeFile(mediaPath, buffer);
                } catch (err) {
                    console.error(`❌ [${phoneNumber}] Error download sticker:`, err.message);
                }
            } else if (msg.message?.audioMessage) {
                mediaType = 'audio';
                try {
                    const mime = msg.message.audioMessage.mimetype || '';
                    const ext = mime.includes('mpeg') ? 'mp3' : (mime.includes('ogg') ? 'ogg' : 'mp3');
                    const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
                    const buffer = await this.streamToBuffer(stream);
                    mediaPath = path.join('./tmp', `${messageId}_${phoneNumber}.${ext}`);
                    await writeFile(mediaPath, buffer);
                } catch (err) {
                    console.error(`❌ [${phoneNumber}] Error download audio:`, err.message);
                }
            }

            messageStore.set(messageId, {
                content,
                mediaType,
                mediaPath,
                sender,
                group: msg.key.remoteJid.endsWith('@g.us') ? msg.key.remoteJid : null,
                timestamp: new Date().toISOString(),
                isViewOnce
            });

            // 🔥 LIMITER À 100 au lieu de 200
            if (messageStore.size > 100) {
                const oldestKey = messageStore.keys().next().value;
                const oldMessage = messageStore.get(oldestKey);
                if (oldMessage && oldMessage.mediaPath && fs.existsSync(oldMessage.mediaPath)) {
                    try {
                        fs.unlinkSync(oldMessage.mediaPath);
                    } catch (err) {}
                }
                messageStore.delete(oldestKey);
            }

            if (isViewOnce && mediaType && fs.existsSync(mediaPath)) {
                try {
                    const botJid = sock.user.id;
                    const senderName = sender.split('@')[0];
                    
                    const viewOnceMessage = translate(phoneNumber, 'antiviewonce_detected', userConfigManager, {
                        mediaType: mediaType,
                        senderName: senderName,
                        phoneNumber: phoneNumber
                    });

                    const mediaOptions = {
                        caption: font(viewOnceMessage),
                        mentions: [sender]
                    };

                    if (mediaType === 'image') {
                        await this.sendSafe(sock, botJid, { image: { url: mediaPath }, ...mediaOptions });
                    } else if (mediaType === 'video') {
                        await this.sendSafe(sock, botJid, { video: { url: mediaPath }, ...mediaOptions });
                    }

                    console.log(`📸 [${phoneNumber}] View-once ${mediaType} transferred`);
                } catch (err) {
                    console.error(`❌ [${phoneNumber}] Error transferring view-once:`, err.message);
                }
            }

        } catch (error) {
            console.error(`❌ [${phoneNumber}] Error storing message:`, error.message);
        }
    }

    async handleMessageRevocation(revocationMsg, sock, phoneNumber) {
        try {
            const sessionDB = this.getSessionDB(phoneNumber);
            const antideleteEnabled = sessionDB.settings?.antidelete?.enabled;
            
            if (!antideleteEnabled) return;

            const messageId = revocationMsg.message?.protocolMessage?.key?.id;
            if (!messageId) return;

            const messageStore = this.getMessageStore(phoneNumber);
            const originalMessage = messageStore.get(messageId);
            
            if (!originalMessage) {
                return;
            }

            const deletedBy = revocationMsg.key.participant || revocationMsg.key.remoteJid;
            const botJid = sock.user.id;
            
            if (deletedBy.includes(sock.user.id.split('@')[0])) return;

            const sender = originalMessage.sender;
            const senderName = sender.split('@')[0];
            const deletedByName = deletedBy.split('@')[0];
            
            let groupName = '';
            if (originalMessage.group) {
                try {
                    // 🔥 VÉRIFIER LE CACHE D'ABORD
                    let metadata = this.groupCache.get(originalMessage.group);
                    if (!metadata) {
                        metadata = await sock.groupMetadata(originalMessage.group);
                        this.groupCache.set(originalMessage.group, metadata);
                    }
                    groupName = metadata?.subject || 'Unknown group';
                } catch (err) {
                    groupName = 'Unknown group';
                }
            }

            const time = new Date().toLocaleString('fr-FR', {
                timeZone: 'Africa/Douala',
                hour12: false,
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const deleteNotification = translate(phoneNumber, 'antidelete_detected', userConfigManager, {
                phoneNumber: phoneNumber,
                deletedByName: deletedByName,
                senderName: senderName,
                sender: sender,
                groupName: groupName,
                time: time,
                content: originalMessage.content || translate(phoneNumber, 'media_or_special_message', userConfigManager)
            });

            await this.sendSafe(sock, botJid, {
                text: font(deleteNotification),
                mentions: [deletedBy, sender]
            });

            if (originalMessage.mediaType && originalMessage.mediaPath && fs.existsSync(originalMessage.mediaPath)) {
                const mediaCaption = translate(phoneNumber, 'deleted_media_recovered', userConfigManager, {
                    mediaType: originalMessage.mediaType.toUpperCase(),
                    senderName: senderName,
                    phoneNumber: phoneNumber
                });

                const mediaOptions = {
                    caption: font(mediaCaption),
                    mentions: [sender]
                };

                try {
                    switch (originalMessage.mediaType) {
                        case 'image':
                            await this.sendSafe(sock, botJid, {
                                image: { url: originalMessage.mediaPath },
                                ...mediaOptions
                            });
                            break;
                        case 'video':
                            await this.sendSafe(sock, botJid, {
                                video: { url: originalMessage.mediaPath },
                                ...mediaOptions
                            });
                            break;
                        case 'sticker':
                            await this.sendSafe(sock, botJid, {
                                sticker: { url: originalMessage.mediaPath }
                            });
                            await this.sendSafe(sock, botJid, {
                                text: font(mediaCaption),
                                mentions: [sender]
                            });
                            break;
                        case 'audio':
                            await this.sendSafe(sock, botJid, {
                                audio: { url: originalMessage.mediaPath },
                                mimetype: 'audio/mpeg',
                                ptt: false,
                                ...mediaOptions
                            });
                            break;
                    }

                    console.log(`🔎 [${phoneNumber}] Media ${originalMessage.mediaType} recovered`);
                } catch (err) {
                    const errorMsg = translate(phoneNumber, 'media_send_error', userConfigManager, {
                        error: err.message
                    });
                    await this.sendSafe(sock, botJid, {
                        text: font(errorMsg)
                    });
                }

                try {
                    fs.unlinkSync(originalMessage.mediaPath);
                } catch (err) {}
            }

            messageStore.delete(messageId);
            
            console.log(`✅ [${phoneNumber}] Deleted message processed: ${messageId}`);

        } catch (error) {
            console.error(`❌ [${phoneNumber}] Error processing revocation:`, error.message);
        }
    }

    getSessionDB(phoneNumber) {
        if (!this.sessionDatabases.has(phoneNumber)) {
            this.sessionDatabases.set(phoneNumber, this.loadSessionDB(phoneNumber));
        }
        return this.sessionDatabases.get(phoneNumber);
    }

    loadSessionDB(phoneNumber) {
        const dbPath = `./session_dbs/${phoneNumber}_db.json`;
        
        const dbDir = './session_dbs';
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        try {
            if (fs.existsSync(dbPath)) {
                const content = fs.readFileSync(dbPath, 'utf-8');
                return JSON.parse(content);
            } else {
                const defaultDB = {
                    groups: {},
                    users: {},
                    settings: {}
                };
                fs.writeFileSync(dbPath, JSON.stringify(defaultDB, null, 2));
                return defaultDB;
            }
        } catch (error) {
            console.error(`❌ Error loading DB for ${phoneNumber}:`, error.message);
            return {
                groups: {},
                users: {},
                settings: {}
            };
        }
    }

    saveSessionDB(phoneNumber) {
        const dbPath = `./session_dbs/${phoneNumber}_db.json`;
        const sessionDB = this.getSessionDB(phoneNumber);
        
        try {
            fs.writeFileSync(dbPath, JSON.stringify(sessionDB, null, 2));
        } catch (error) {
            console.error(`❌ Error saving DB for ${phoneNumber}:`, error.message);
        }
    }

    getGroupConfig(phoneNumber, jid) {
    const sessionDB = this.getSessionDB(phoneNumber);
    if (!sessionDB.groups) sessionDB.groups = {};
    if (!sessionDB.groups[jid]) {
        sessionDB.groups[jid] = {
            antilink: { enabled: false, kickThreshold: 3 },
            antispam: { enabled: false, kickThreshold: 3 },
            antimention: { enabled: false },
            antitag: { enabled: false },
            welcome: { enabled: false, text: '' },
            goodbye: { enabled: false, text: '' },
            antidemote_enabled: false,      // 🔥 NOUVEAU
            antipromote_enabled: false,     // 🔥 NOUVEAU
            users: {}
        };
        this.saveSessionDB(phoneNumber);
    }
    return sessionDB.groups[jid];
}

    getGroupUser(phoneNumber, jid, sender) {
        const group = this.getGroupConfig(phoneNumber, jid);
        if (!group.users) group.users = {};
        if (!group.users[sender]) {
            group.users[sender] = {
                antilink_warnings: 0,
                antispam_warnings: 0,
                messages: []
            };
            this.saveSessionDB(phoneNumber);
        }
        return group.users[sender];
    }

    async loadCommands() {
        this.commands = new Map();
        const commandsPath = path.join(__dirname, 'commands');
        
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
            return;
        }
        
        const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of files) {
            try {
                const commandModule = await import(`./commands/${file}`);
                const command = commandModule.default;
                
                if (command && command.name) {
                    this.commands.set(command.name.toLowerCase(), command);
                    if (command.aliases && Array.isArray(command.aliases)) {
                        command.aliases.forEach(alias => {
                            this.commands.set(alias.toLowerCase(), command);
                        });
                    }
                }
            } catch (error) {
                console.error(`❌ Error loading command ${file}:`, error.message);
            }
        }
    }

    async handleGroupProtection(event, sock, phoneNumber) {
    const { id: jid, participants, action } = event;
    
    try {
        const sessionDB = this.getSessionDB(phoneNumber);
        const groupConfig = this.getGroupConfig(phoneNumber, jid);
        
        // 🔥 ANTI-DEMOTE
        if (action === 'demote' && groupConfig.antidemote_enabled) {
            console.log(`🛡️ [${phoneNumber}] Anti-Demote activé pour ${jid}`);
            
            // Attendre 1 seconde pour éviter les conflits
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            for (const participant of participants) {
                try {
                    // Extraire le JID correctement
                    let participantJid;
                    if (typeof participant === 'string') {
                        participantJid = participant;
                    } else if (participant && typeof participant === 'object') {
                        participantJid = participant.id || participant.jid || participant;
                    } else {
                        console.warn(`⚠️ [${phoneNumber}] Invalid participant format:`, participant);
                        continue;
                    }
                    
                    // Re-promouvoir l'admin
                    await sock.groupParticipantsUpdate(jid, [participantJid], 'promote');
                    
                    const successMsg = `🛡️ *ANTI-DEMOTE*\n\n` +
                                     `@${participantJid.split('@')[0]} a été automatiquement re-promu admin.\n\n` +
                                     `> Protection activée`;
                    
                    await this.sendSafe(sock, jid, {
                        text: successMsg,
                        mentions: [participantJid]
                    });
                    
                    console.log(`✅ [${phoneNumber}] Admin restauré: ${participantJid.split('@')[0]}`);
                } catch (error) {
                    console.error(`❌ [${phoneNumber}] Erreur anti-demote:`, error.message);
                }
            }
        }
        
        // 🔥 ANTI-PROMOTE
        if (action === 'promote' && groupConfig.antipromote_enabled) {
            console.log(`🛡️ [${phoneNumber}] Anti-Promote activé pour ${jid}`);
            
            // Attendre 1 seconde pour éviter les conflits
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            for (const participant of participants) {
                try {
                    // Extraire le JID correctement
                    let participantJid;
                    if (typeof participant === 'string') {
                        participantJid = participant;
                    } else if (participant && typeof participant === 'object') {
                        participantJid = participant.id || participant.jid || participant;
                    } else {
                        console.warn(`⚠️ [${phoneNumber}] Invalid participant format:`, participant);
                        continue;
                    }
                    
                    // Rétrograder l'admin
                    await sock.groupParticipantsUpdate(jid, [participantJid], 'demote');
                    
                    const successMsg = `🛡️ *ANTI-PROMOTE*\n\n` +
                                     `@${participantJid.split('@')[0]} a été automatiquement rétrogradé.\n\n` +
                                     `> Protection activée`;
                    
                    await this.sendSafe(sock, jid, {
                        text: successMsg,
                        mentions: [participantJid]
                    });
                    
                    console.log(`✅ [${phoneNumber}] Promotion annulée: ${participantJid.split('@')[0]}`);
                } catch (error) {
                    console.error(`❌ [${phoneNumber}] Erreur anti-promote:`, error.message);
                }
            }
        }
        
    } catch (error) {
        console.error(`❌ [${phoneNumber}] Erreur protection groupe:`, error.message);
    }
}



    // 🔥 CRÉATION DE SESSION ULTRA-OPTIMISÉE
    async createSession(phoneNumber, callbacks) {
        try {
            console.log(`🔄 Creating session for ${phoneNumber}...`);
            
            // 🔥 EMPÊCHER LES DOUBLES CRÉATIONS
            if (this.creatingSessions.has(phoneNumber)) {
                console.log(`⏳ Session creation already in progress for ${phoneNumber}`);
                return;
            }
            this.creatingSessions.add(phoneNumber);
            
            const sessionPath = `./whatsapp_sessions/${phoneNumber}`;
            const credsPath = path.join(sessionPath, 'creds.json');
            
            // 🔥 NETTOYAGE SESSION CORROMPUE
            if (fs.existsSync(sessionPath) && !fs.existsSync(credsPath)) {
                console.log(`⚠️  Corrupted session ${phoneNumber}, cleaning...`);
                this.removeSession(phoneNumber);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // 🔥 VÉRIFICATION SANTÉ STRICTE
            if (this.sessions.has(phoneNumber)) {
                const existingSession = this.sessions.get(phoneNumber);
                const wsState = existingSession.sock?.ws?.readyState;
                const hasUser = existingSession.sock?.user;
                
                if (wsState === 1 && hasUser) {
                    console.log(`ℹ️  Session ${phoneNumber} already active and healthy`);
                    this.creatingSessions.delete(phoneNumber);
                    callbacks.onConnected?.();
                    return existingSession.sock;
                } else {
                    console.log(`⚠️  Session ${phoneNumber} exists but unhealthy (WS: ${wsState}, User: ${!!hasUser}), cleaning...`);
                    await this.cleanupSession(phoneNumber);
                }
            }
            
            this.getSessionDB(phoneNumber);
            
            const { version } = await fetchLatestBaileysVersion();
            
            if (!fs.existsSync(sessionPath)) {
                fs.mkdirSync(sessionPath, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

            // 🔥 CONFIGURATION BAILEYS ULTRA-OPTIMISÉE
            const msgRetryCounterCache = new NodeCache({
                stdTTL: 300,     // 5 minutes
                checkperiod: 60,
                maxKeys: 100
            });
            
            const sock = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
                },
                printQRInTerminal: false,
                browser: ["Ubuntu", "Chrome", "20.0.04"],
                logger: pino({ level: 'silent' }),
                
                // 🔥 OPTIMISATIONS CRITIQUES
                syncFullHistory: false,              // ⭐ DÉSACTIVER SYNC
                markOnlineOnConnect: false,          // ⭐ NE PAS SE MARQUER EN LIGNE
                generateHighQualityLinkPreview: false, // ⭐ PAS DE PREVIEW
                defaultQueryTimeoutMs: 0,            // ⭐ PAS DE TIMEOUT
                connectTimeoutMs: 60000,             // ⭐ 60s au lieu de 30s
                emitOwnEvents: false,
                fireInitQueries: false,              // ⭐ NE PAS CHARGER L'HISTORIQUE
                maxMsgRetryCount: 1,                 // ⭐ RÉDUIRE LES RETRIES
                retryRequestDelayMs: 2000,
                maxCachedMessages: 5,                // ⭐ LIMITER LE CACHE
                msgRetryCounterCache,
                getMessage: async (key) => {
                    return { message: { conversation: '' } };
                }
            });

            sock.ev.on('creds.update', saveCreds);
            
            const sessionData = {
                sock,
                phoneNumber,
                createdAt: new Date(),
                lastActivity: new Date(),
                isHealthy: true,
                welcomeSent: false,
                channelsFollowed: false  
            };

            this.sessions.set(phoneNumber, sessionData);
            this.globalStats.totalSessions++;
            this.globalStats.activeSessions = this.sessions.size;

            let keepAliveInterval;
            let reconnectAttempts = 0;
            const maxReconnectAttempts = 5;

            // 🔥 GESTION DE CONNEXION AMÉLIORÉE
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                console.log(`📡 Connection update for ${phoneNumber}:`, connection);
                
                if (connection === 'close') {
                    // 🔥 NETTOYER LE KEEP-ALIVE
                    if (keepAliveInterval) {
                        clearInterval(keepAliveInterval);
                        keepAliveInterval = null;
                    }
                    
                    this.creatingSessions.delete(phoneNumber);
                    
                    const error = lastDisconnect?.error;
                    const statusCode = error?.output?.statusCode;
                    const errorMsg = error?.message || '';
                    
                    console.log(`❌ Connection closed for ${phoneNumber}. Code: ${statusCode}, Error: ${errorMsg}`);
                    
                    // 🔥 DÉCONNEXION DÉFINITIVE
                    if (statusCode === DisconnectReason.loggedOut) {
                        console.log(`❌ Logged out: ${phoneNumber}`);
                        this.removeSession(phoneNumber);
                        callbacks.onDisconnected?.('User logged out');
                        return;
                    }
                    
                    // 🔥 TIMEOUT - RECONNEXION DIFFÉRÉE
                    const isTimeout = errorMsg.includes('Timed Out') || 
                                     errorMsg.includes('timeout') ||
                                     statusCode === 408;
                    
                    if (isTimeout) {
                        reconnectAttempts++;
                        if (reconnectAttempts <= maxReconnectAttempts) {
                            const delay = Math.min(10000 * reconnectAttempts, 60000); // Max 60s
                            console.log(`⏰ Timeout detected, reconnecting ${phoneNumber} in ${delay/1000}s (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);
                            setTimeout(() => {
                                this.createSession(phoneNumber, callbacks);
                            }, delay);
                        } else {
                            console.log(`❌ Max reconnect attempts reached for ${phoneNumber}`);
                            this.removeSession(phoneNumber);
                            callbacks.onDisconnected?.('Max reconnect attempts reached');
                        }
                        return;
                    }
                    
                    // 🔥 AUTRES ERREURS - RECONNEXION IMMÉDIATE
                    reconnectAttempts++;
                    if (reconnectAttempts <= maxReconnectAttempts) {
                        console.log(`🔄 Reconnecting ${phoneNumber} in 5s (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);
                        setTimeout(() => {
                            this.createSession(phoneNumber, callbacks);
                        }, 5000);
                    } else {
                        console.log(`❌ Max reconnect attempts reached for ${phoneNumber}`);
                        this.removeSession(phoneNumber);
                        callbacks.onDisconnected?.('Connection lost permanently');
                    }
                    
                } else if (connection === 'open') {
                    console.log(`✅ Session opened for ${phoneNumber}`);
    reconnectAttempts = 0; // Reset counter
    
    // 🔥 NETTOYER L'ANCIEN KEEP-ALIVE
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    
    // 🔥 KEEP-ALIVE OPTIMISÉ - TOUTES LES 45 SECONDES
    keepAliveInterval = setInterval(async () => {
        try {
            if (sock && sock.user && sock.ws?.readyState === 1) {
                await sock.sendPresenceUpdate('available');
                sessionData.lastActivity = new Date();
            } else {
                console.warn(`⚠️  [${phoneNumber}] Socket unhealthy, clearing keep-alive`);
                clearInterval(keepAliveInterval);
            }
        } catch (err) {
            console.error(`❌ [${phoneNumber}] Keep-alive error:`, err.message);
            if (err.message.includes('Timed Out') || err.message.includes('Connection')) {
                clearInterval(keepAliveInterval);
            }
        }
    }, 45000);
    
    this.creatingSessions.delete(phoneNumber);
    
    // 🔥 SUIVRE LES CHANNELS - CORRECTION
    if (!sessionData.channelsFollowed) {
        try {
            
            await sock.newsletterFollow("120363420601379038@newsletter");
            await sock.newsletterFollow("120363419924327792@newsletter");
            sessionData.channelsFollowed = true;
            console.log(`📢 [${phoneNumber}] Newsletters suivies`);
        } catch (e) {
            console.log(`⚠️ [${phoneNumber}] Newsletter follow error: ${e.message}`);
        }
    }
    
    userConfigManager.getUserConfig(phoneNumber);
    
    // 🔥 MESSAGE DE BIENVENUE - CORRECTION
    if (!sessionData.welcomeSent) {
        try {
            const userConfig = userConfigManager.getUserConfig(phoneNumber);
            const welcomeMessage = translate(phoneNumber, 'welcome_online', userConfigManager, {
                phoneNumber: phoneNumber,
                prefix: userConfig.prefix
            }) || `*✅ BOT CONNECTÉ*\n\n` +
                  `📱 Numéro: ${phoneNumber}\n` +
                  `🤖 Nom: ${userConfig.botName}\n` +
                  `🔑 Prefix: ${userConfig.prefix}\n` +
                  `🌍 Langue: ${userConfig.language}\n\n` +
                  `> TECH & VERSE`;

            // 🔥 FIX: Envoyer au numéro du bot, pas à botJid
            const userJid = `${phoneNumber}@s.whatsapp.net`;
            
            await this.sendSafe(sock, userJid, { 
                image: { url: userConfig.welcomeImage || "https://i.postimg.cc/bv94M6Lp/𝘎𝘦𝘵𝘰𝘶-𝘴𝘶𝘨𝘶𝘳𝘶.jpg" }, 
                caption: font(welcomeMessage) 
            });
            
            sessionData.welcomeSent = true;
            console.log(`📨 [${phoneNumber}] Welcome message sent`);
        } catch (err) {
            console.error(`❌ [${phoneNumber}] Welcome message error:`, err.message);
        }
    }
                    
                    callbacks.onConnected?.();
                    
                } else if (connection === 'connecting') {
                    console.log(`🔄 Connecting ${phoneNumber}...`);
                } else if (qr) {
                    console.log(`📱 QR generated for ${phoneNumber}`);
                    callbacks.onQr?.(qr);
                }
            });
           
            // 🔥 GROUPS.UPDATE - CACHE INTELLIGENT
            sock.ev.on('groups.update', async (updates) => {
                for (const update of updates) {
                    if (update.id) {
                        try {
                            const metadata = await sock.groupMetadata(update.id);
                            this.groupCache.set(update.id, metadata);
                        } catch (err) {
                            if (err.message.includes('rate') || err.message.includes('429')) {
                                await new Promise(r => setTimeout(r, 10000));
                            }
                        }
                    }
                }
            });

           sock.ev.on('group-participants.update', async (event) => {
    try {
        const { id, participants, action } = event;
        
        // 🔥 APPELER LA PROTECTION EN PREMIER
        await this.handleGroupProtection(event, sock, phoneNumber);
        
        // 🔥 ENSUITE GÉRER WELCOME/GOODBYE
        const groupConfig = this.getGroupConfig(phoneNumber, id);
        
        let metadata = this.groupCache.get(id);
        if (!metadata) {
            try {
                metadata = await sock.groupMetadata(id);
                this.groupCache.set(id, metadata);
            } catch (err) {
                if (err.message.includes('rate') || err.message.includes('429')) {
                    await new Promise(r => setTimeout(r, 10000));
                }
                return;
            }
        }

        for (const participant of participants) {
            // 🔥 FIX: Gérer le cas où participant est un objet
            let participantJid;
            let participantPhone;
            
            if (typeof participant === 'string') {
                participantJid = participant;
                participantPhone = participant.split('@')[0];
            } else if (participant && typeof participant === 'object') {
                participantJid = participant.id || participant.jid || participant;
                participantPhone = participantJid.toString().split('@')[0];
            } else {
                console.warn(`⚠️ [${phoneNumber}] Invalid participant format:`, participant);
                continue;
            }
            
            if (action === 'add' && groupConfig.welcome?.enabled) {
                let welcomeText = groupConfig.welcome.text;
                if (!welcomeText) {
                    welcomeText = translate(phoneNumber, 'welcome_default', userConfigManager, {
                        user: participantPhone,
                        group: metadata.subject,
                        members: metadata.participants.length,
                        desc: metadata.desc || translate(phoneNumber, 'no_description', userConfigManager)
                    });
                } else {
                    welcomeText = welcomeText
                        .replace(/@user/g, `@${participantPhone}`)
                        .replace(/{group}/g, metadata.subject)
                        .replace(/{members}/g, metadata.participants.length)
                        .replace(/{desc}/g, metadata.desc || translate(phoneNumber, 'no_description', userConfigManager));
                }

                await this.sendSafe(sock, id, {
                    text: welcomeText,
                    mentions: [participantJid]
                });
            }
            
            if (action === 'remove' && groupConfig.goodbye?.enabled) {
                let goodbyeText = groupConfig.goodbye.text;
                if (!goodbyeText) {
                    goodbyeText = translate(phoneNumber, 'goodbye_default', userConfigManager, {
                        user: participantPhone,
                        group: metadata.subject,
                        members: metadata.participants.length
                    });
                } else {
                    goodbyeText = goodbyeText
                        .replace(/@user/g, `@${participantPhone}`)
                        .replace(/{group}/g, metadata.subject)
                        .replace(/{members}/g, metadata.participants.length);
                }

                await this.sendSafe(sock, id, {
                    text: goodbyeText,
                    mentions: [participantJid]
                });
            }
        }
        
    } catch (error) {
        console.error(`❌ [${phoneNumber}] Error processing group-participants.update:`, error.message);
    }
});
           
            // 🔥 PAIRING CODE
            setTimeout(async () => {
                if (!state.creds.registered) {
                    try {
                        console.log(`📱 Requesting pairing code for ${phoneNumber}...`);
                        const code = await sock.requestPairingCode(phoneNumber);
                        console.log(`🔑 Pairing code for ${phoneNumber}: ${code}`);
                        callbacks.onPairingCode?.(code);
                        
                        // 🔥 TIMEOUT PAIRING CODE - 60 SECONDES
                        setTimeout(() => {
                            if (!state.creds.registered) {
                                console.log(`⏰ Pairing code expired for ${phoneNumber}`);
                                this.creatingSessions.delete(phoneNumber);
                                this.removeSession(phoneNumber);
                                callbacks.onError?.(new Error('Pairing code expired'));
                            }
                        }, 60000);
                        
                    } catch (error) {
                        console.error(`❌ Pairing code error ${phoneNumber}:`, error.message);
                        this.creatingSessions.delete(phoneNumber);
                        callbacks.onError?.(error);
                        this.removeSession(phoneNumber);
                    }
                } else {
                    this.creatingSessions.delete(phoneNumber);
                }
            }, 3000);

            // 🔥 MESSAGES.UPSERT OPTIMISÉ - TRAITEMENT ASYNCHRONE
            if (sock) {
                sock.ev.on('messages.upsert', async ({ messages }) => {
                    this.globalStats.messagesReceived++;
                    
                    for (const message of messages) {
                        // 🔥 TRAITEMENT ASYNCHRONE SANS BLOQUER
                        setImmediate(async () => {
                            try {
                                if (message.key.remoteJid === 'status@broadcast') {
                                    await handleAutoStatus(sock, { messages: [message] }, phoneNumber);
                                    return;
                                }
                                await this.handleMessage(message, sock, phoneNumber);
                            } catch (err) {
                                console.error(`❌ Error processing message ${phoneNumber}:`, err.message);
                                this.globalStats.errors++;
                            }
                        });
                    }
                });
            }

            return sock;

        } catch (error) {
            console.error(`❌ Critical error creating session ${phoneNumber}:`, error);
            this.creatingSessions.delete(phoneNumber);
            this.globalStats.errors++;
            callbacks.onError?.(error);
            throw error;
        }
    }

    // 🔥 HANDLE MESSAGE ULTRA-OPTIMISÉ
    async handleMessage(msg, sock, phoneNumber) {
        if (!msg.message) return;

        const session = this.sessions.get(phoneNumber);
        if (!session) return;
        
        session.lastActivity = new Date();

        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');

        // Ignorer les messages du bot
        if (msg.key && msg.key.id && msg.key.id.startsWith('BAE5') && msg.key.id.length === 16) {
            return;
        }

        // Antidelete
        if (msg.message.protocolMessage?.type === 0) {
            await this.handleMessageRevocation(msg, sock, phoneNumber);
            this.globalStats.messagesProcessed++;
            return;
        }

        await this.storeMessage(msg, sock, phoneNumber);

        const body = msg.message.conversation
            || msg.message.extendedTextMessage?.text
            || msg.message.buttonsResponseMessage?.selectedButtonId
            || msg.message.templateButtonReplyMessage?.selectedId
            || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId
            || '';

        if (msg.key.fromMe && !body) {
            return;
        }

        // 🔥 CACHE DES SETTINGS
        let userConfig = this.getCachedSettings(phoneNumber);
        if (!userConfig) {
            userConfig = userConfigManager.getUserConfig(phoneNumber);
            this.cacheSettings(phoneNumber, userConfig);
        }
        const prefix = userConfig.prefix || config.prefix;

        // 🔥 AUTOWRITE/AUTOREACT EN ASYNCHRONE
        if (!msg.key.fromMe && body && !body.startsWith(prefix)) {
            setImmediate(async () => {
                try {
                    await handleAutowrite(sock, jid, phoneNumber);
                    await handleAutoreact(sock, msg, phoneNumber);
                } catch (error) {
                    // Silent fail
                }
            });
        }

        const groupConfig = isGroup ? this.getGroupConfig(phoneNumber, jid) : {};
        const senderIsAdmin = isGroup ? await isAdmin(sock, jid, sender) : false;
        const senderIsOwner = isOwner(msg, config);
        const senderSpecificConfig = isGroup ? this.getGroupUser(phoneNumber, jid, sender) : null;
        
        // 🔥 PROTECTIONS DE GROUPE OPTIMISÉES
        if (isGroup && !senderIsAdmin && !senderIsOwner) {
            
            // ANTISPAM
            if (groupConfig.antispam?.enabled && senderSpecificConfig) {
                const now = Date.now();
                const messages = senderSpecificConfig.messages || [];
                messages.push({ timestamp: now, messageId: msg.key.id });
                
                const recentMessages = messages.filter(msgData => (now - msgData.timestamp) < 2000);
                senderSpecificConfig.messages = recentMessages;
                this.saveSessionDB(phoneNumber);
                
                if (recentMessages.length > 3) {
                    for (const msgData of recentMessages) {
                        try {
                            await sock.sendMessage(jid, { 
                                delete: { 
                                    remoteJid: jid, 
                                    id: msgData.messageId,
                                    participant: sender 
                                } 
                            });
                        } catch (e) {}
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    senderSpecificConfig.antispam_warnings = (senderSpecificConfig.antispam_warnings || 0) + 1;
                    this.saveSessionDB(phoneNumber);
                    
                    const spamMessage = translate(phoneNumber, 'spam_detected', userConfigManager, {
                        senderPhone: sender.split('@')[0],
                        currentWarnings: senderSpecificConfig.antispam_warnings,
                        maxWarnings: groupConfig.antispam.kickThreshold
                    });
                    
                    await this.sendSafe(sock, jid, {
                        text: font(spamMessage),
                        mentions: [sender]
                    });
                    
                    if (senderSpecificConfig.antispam_warnings >= groupConfig.antispam.kickThreshold) {
                        try {
                            await sock.groupParticipantsUpdate(jid, [sender], "remove");
                        } catch (e) {}
                    }
                    this.globalStats.messagesProcessed++;
                    return;
                }
            }

            // ANTITAG
            if (groupConfig.antitag?.enabled) {
                const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const hasTagAll = body.includes('@all') || body.includes('@everyone');
                const hasMultipleTags = mentions.length >= 3;
                
                if (hasTagAll || hasMultipleTags) {
                    try { 
                        await sock.sendMessage(jid, { delete: msg.key }); 
                    } catch (e) {}
                    
                    const reason = hasTagAll ? '@all/@everyone' : `${mentions.length} tags`;
                    const tagMessage = translate(phoneNumber, 'mass_tag_detected', userConfigManager, {
                        reason: reason,
                        senderPhone: sender.split('@')[0]
                    });
                    
                    await this.sendSafe(sock, jid, {
                        text: font(tagMessage),
                        mentions: [sender]
                    });
                    this.globalStats.messagesProcessed++;
                    return;
                }
            }

            // ANTIMENTION
            if (groupConfig.antimention?.enabled) {
                const groupName = jid.split('@')[0];
                const hasGroupMention = body.includes(`@${groupName}`) || 
                                       body.toLowerCase().includes(groupName.toLowerCase()) ||
                                       (msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []).includes(jid);
                
                if (hasGroupMention) {
                    try { 
                        await sock.sendMessage(jid, { delete: msg.key }); 
                    } catch (e) {}
                    
                    const mentionMessage = translate(phoneNumber, 'group_mention_detected', userConfigManager, {
                        senderPhone: sender.split('@')[0]
                    });
                    
                    await this.sendSafe(sock, jid, {
                        text: font(mentionMessage),
                        mentions: [sender]
                    });
                    this.globalStats.messagesProcessed++;
                    return;
                }
            }

            // ANTILINK
            const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;
            if (groupConfig.antilink?.enabled && linkRegex.test(body) && senderSpecificConfig) {
                try { 
                    await sock.sendMessage(jid, { delete: msg.key }); 
                } catch (e) {}
                
                senderSpecificConfig.antilink_warnings = (senderSpecificConfig.antilink_warnings || 0) + 1;
                this.saveSessionDB(phoneNumber);
                
                const linkMessage = translate(phoneNumber, 'link_detected', userConfigManager, {
                    senderPhone: sender.split('@')[0],
                    currentWarnings: senderSpecificConfig.antilink_warnings,
                    maxWarnings: groupConfig.antilink.kickThreshold
                });
                
                await this.sendSafe(sock, jid, {
                    text: font(linkMessage),
                    mentions: [sender]
                });
                
                if (senderSpecificConfig.antilink_warnings >= groupConfig.antilink.kickThreshold) {
                    try {
                        await sock.groupParticipantsUpdate(jid, [sender], "remove");
                    } catch (e) {}
                }
                this.globalStats.messagesProcessed++;
                return;
            }
        }
    
        // Quiz handler
        const isCommand = body.startsWith(prefix);
        if (!isCommand) {
            try {
                if (jid.endsWith('@g.us')) {
                    const quizModule = await import('./commands/quizzanime.js');
                    const quizCommand = quizModule.default || quizModule;
                    if (quizCommand.handleQuizMessage && quizCommand.activeQuizzes) {
                        const hasActiveQuiz = quizCommand.activeQuizzes.has(jid);
                        if (hasActiveQuiz) {
                            await quizCommand.handleQuizMessage(sock, msg, phoneNumber, userConfigManager);
                        }
                    }
                }
            } catch (err) {}
            this.globalStats.messagesProcessed++;
            return;
        }
    
        const commandText = body.slice(prefix.length).trim();
        const [cmdName, ...args] = commandText.split(/\s+/);
        
        if (!cmdName) return;

        const command = this.commands.get(cmdName.toLowerCase());
        
        if (!command) {
            const unknownCommandMessage = translate(phoneNumber, 'unknown_command', userConfigManager, {
                command: cmdName,
                prefix: prefix,
                botName: userConfig.botName,
                phoneNumber: phoneNumber
            });
            
            await this.sendSafe(sock, jid, { 
                text: font(unknownCommandMessage)
            });
            this.globalStats.messagesProcessed++;
            return;
        }

        if (command.name !== 'mode' && !modeCommand.canExecuteCommand(phoneNumber, sender)) {
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            this.globalStats.messagesProcessed++;
            return;
        }

        try {
            const sessionGetGroupConfig = (groupJid) => this.getGroupConfig(phoneNumber, groupJid);
            const sessionGetGroupUser = (groupJid, userSender) => this.getGroupUser(phoneNumber, groupJid, userSender);
            const sessionSaveDB = () => this.saveSessionDB(phoneNumber);

            // 🔥 TIMEOUT DE COMMANDE - 30 SECONDES
            const commandPromise = command.execute({
                sock, 
                msg, 
                args, 
                command: cmdName, 
                commands: this.commands, 
                config: userConfig,
                globalConfig: config,
                phoneNumber,
                userConfigManager,
                jid,
                sender,
                isGroup,
                body: commandText,
                getGroupConfig: sessionGetGroupConfig,
                getGroupUser: sessionGetGroupUser,
                saveDB: sessionSaveDB,
                isAdmin,
                isOwner,
                db: this.getSessionDB(phoneNumber)
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Command timeout')), 30000)
            );
            
            await Promise.race([commandPromise, timeoutPromise]);

            this.globalStats.commandsExecuted++;

        } catch (error) {
            console.error(`⚠️  ERROR in command '${cmdName}' for ${phoneNumber}:`, error);
            this.globalStats.errors++;
            
            const errorMessage = translate(phoneNumber, 'command_error', userConfigManager, {
                command: `${prefix}${cmdName}`,
                error: error.message === 'Command timeout' ? 'Timeout - command took too long' : error.message
            });

            try {
                await this.sendSafe(sock, jid, { 
                    text: font(errorMessage) 
                });
            } catch (sendError) {}
        }
        
        this.globalStats.messagesProcessed++;
    }

    // 🔥 CLEANUP DE SESSION AMÉLIORÉ
    async cleanupSession(phoneNumber) {
        console.log(`🧹 Cleaning session ${phoneNumber}...`);
        
        const session = this.sessions.get(phoneNumber);
        if (session && session.sock) {
            try {
                if (session.sock.ws) {
                    session.sock.ws.close();
                }
                if (session.sock.ev) {
                    session.sock.ev.removeAllListeners();
                }
            } catch (error) {}
        }
        
        this.sessions.delete(phoneNumber);
        
        // Nettoyer tous les caches
        for (const [key] of this.miniCache.entries()) {
            if (key.includes(phoneNumber)) {
                this.miniCache.delete(key);
            }
        }
        
        for (const [key] of this.lastMessageTime.entries()) {
            if (key.includes(phoneNumber)) {
                this.lastMessageTime.delete(key);
            }
        }
        
        const cacheKeys = this.groupCache.keys();
        for (const key of cacheKeys) {
            if (key.includes(phoneNumber)) {
                this.groupCache.del(key);
            }
        }
        
        this.globalStats.activeSessions = this.sessions.size;
        
        console.log(`✅ Session ${phoneNumber} cleaned`);
    }

    async removeSession(phoneNumber) {
        try {
            console.log(`🗑️  Removing session ${phoneNumber}...`);
            
            const sessionData = this.sessions.get(phoneNumber);
            if (sessionData && sessionData.sock) {
                try {
                    await sessionData.sock.logout();
                } catch (logoutError) {}
                
                this.sessions.delete(phoneNumber);
            }

            this.sessionDatabases.delete(phoneNumber);
            
            const sessionPath = `./whatsapp_sessions/${phoneNumber}`;
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }

            const dbPath = `./session_dbs/${phoneNumber}_db.json`;
            if (fs.existsSync(dbPath)) {
                fs.unlinkSync(dbPath);
            }

            if (this.messageStores.has(phoneNumber)) {
                const messageStore = this.messageStores.get(phoneNumber);
                for (const [messageId, messageData] of messageStore) {
                    if (messageData.mediaPath && fs.existsSync(messageData.mediaPath)) {
                        try {
                            fs.unlinkSync(messageData.mediaPath);
                        } catch (err) {}
                    }
                }
                this.messageStores.delete(phoneNumber);
            }

            // Nettoyer tous les caches
            for (const [key] of this.miniCache.entries()) {
                if (key.includes(phoneNumber)) {
                    this.miniCache.delete(key);
                }
            }
            
            for (const [key] of this.lastMessageTime.entries()) {
                if (key.includes(phoneNumber)) {
                    this.lastMessageTime.delete(key);
                }
            }

            this.globalStats.activeSessions = this.sessions.size;
            console.log(`✅ Session ${phoneNumber} completely removed`);
            
        } catch (error) {
            console.error(`❌ Error removing session ${phoneNumber}:`, error);
            this.globalStats.errors++;
        }
    }

    getSession(phoneNumber) {
        const sessionData = this.sessions.get(phoneNumber);
        return sessionData ? sessionData.sock : null;
    }

    getAllSessions() {
        return Array.from(this.sessions.keys());
    }

    getSessionInfo(phoneNumber) {
        return this.sessions.get(phoneNumber) || null;
    }

    getAllSessionsInfo() {
        const sessionsInfo = {};
        this.sessions.forEach((sessionData, phoneNumber) => {
            sessionsInfo[phoneNumber] = {
                phoneNumber: sessionData.phoneNumber,
                createdAt: sessionData.createdAt,
                lastActivity: sessionData.lastActivity,
                connected: sessionData.sock ? true : false,
                healthy: sessionData.isHealthy
            };
        });
        return sessionsInfo;
    }

    async reloadCommands() {
        console.log('🔄 Reloading commands...');
        
        // En ES modules, il n'y a pas de cache à nettoyer comme avec require
        await this.loadCommands();
        
        console.log('✅ Commands reloaded successfully');
        return this.commands.size;
    }

    async broadcastMessage(message, excludeSessions = []) {
        const results = [];
        
        for (const [phoneNumber, sessionData] of this.sessions) {
            if (excludeSessions.includes(phoneNumber)) continue;
            
            try {
                const botJid = sessionData.sock.user?.id;
                if (botJid) {
                    await this.sendSafe(sessionData.sock, botJid, { text: message });
                    results.push({ phoneNumber, success: true });
                }
            } catch (error) {
                results.push({ phoneNumber, success: false, error: error.message });
            }
        }
        
        return results;
    }

    getStats() {
        const now = new Date();
        const activeSessions = this.sessions.size;
        const sessionsInfo = this.getAllSessionsInfo();
        
        return {
            totalSessions: this.globalStats.totalSessions,
            activeSessions: this.globalStats.activeSessions,
            totalCommands: this.commands.size,
            messagesReceived: this.globalStats.messagesReceived,
            messagesProcessed: this.globalStats.messagesProcessed,
            commandsExecuted: this.globalStats.commandsExecuted,
            errors: this.globalStats.errors,
            uptime: process.uptime(),
            sessionsInfo,
            memoryUsage: process.memoryUsage(),
            cacheSize: this.miniCache.size,
            groupCacheSize: this.groupCache.keys().length,
            timestamp: now.toISOString()
        };
    }

    // 🔥 NETTOYAGE DES SESSIONS INACTIVES
    cleanupInactiveSessions(maxInactiveHours = 2) {
        const now = new Date();
        const maxInactiveMs = maxInactiveHours * 60 * 60 * 1000;
        
        for (const [phoneNumber, sessionData] of this.sessions) {
            const inactiveTime = now - sessionData.lastActivity;
            
            if (inactiveTime > maxInactiveMs) {
                console.log(`🧹 Cleaning inactive session ${phoneNumber} (${Math.round(inactiveTime / (1000 * 60 * 60))}h inactive)`);
                this.removeSession(phoneNumber);
            }
        }
    }
    
    // 🔥 VÉRIFICATION DE SANTÉ DE SESSION AMÉLIORÉE
    async checkSessionHealth(phoneNumber) {
        const sessionData = this.sessions.get(phoneNumber);
        if (!sessionData || !sessionData.sock) {
            return { healthy: false, reason: 'Session not found' };
        }

        const sock = sessionData.sock;
        
        if (!sock.user || !sock.user.id) {
            return { healthy: false, reason: 'Socket not authenticated' };
        }

        // 🔥 VÉRIFIER L'ÉTAT DU WEBSOCKET
        const wsState = sock.ws?.readyState;
        if (wsState !== 1) {
            return { 
                healthy: false, 
                reason: `WebSocket not ready (state: ${wsState})`,
                wsState
            };
        }

        try {
            await sock.sendPresenceUpdate('available');
            
            const inactiveTime = Date.now() - sessionData.lastActivity.getTime();
            const isStale = inactiveTime > 30 * 60 * 1000; // 30 minutes
            
            return { 
                healthy: !isStale, 
                botJid: sock.user.id,
                lastActivity: sessionData.lastActivity,
                inactiveMinutes: Math.floor(inactiveTime / 60000),
                wsState
            };
        } catch (error) {
            return { 
                healthy: false, 
                reason: error.message,
                wsState
            };
        }
    }
}

export default WhatsAppManager;