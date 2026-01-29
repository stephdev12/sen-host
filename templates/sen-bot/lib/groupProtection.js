/**
 * 𝗦𝗘𝗡 Bot - Group Protection Manager (FINAL STABLE)
 * Gère TOUTES les protections (Anciennes + Nouvelles)
 */

import fs from 'fs';
import path from 'path';

// Tes anciens modules (Assure-toi que ces fichiers existent toujours dans lib/)
import antilink from './antilink.js';
import antitag from './antitag.js';
import antimedia from './antimedia.js';
import antispam from './antispam.js';
import { isAdmin } from './authHelper.js';

const GROUPS_FILE = './data/groups.json';

class GroupProtectionManager {
    constructor() {
        this.ensureFile();
    }

    // --- GESTION FICHIER JSON ---
    ensureFile() {
        const dir = path.dirname(GROUPS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(GROUPS_FILE)) fs.writeFileSync(GROUPS_FILE, JSON.stringify({}, null, 2));
    }

    readData() {
        try {
            return JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf-8'));
        } catch { return {}; }
    }

    writeData(data) {
        fs.writeFileSync(GROUPS_FILE, JSON.stringify(data, null, 2));
    }

    // Récupérer la config
    getGroupConfig(chatId) {
        const data = this.readData();
        return data[chatId] || {};
    }

    // Sauvegarder la config (Welcome, Goodbye, Antipromote...)
    updateGroupConfig(chatId, key, value) {
        const data = this.readData();
        if (!data[chatId]) data[chatId] = {};
        
        // Fusion intelligente
        if (typeof value === 'object' && !Array.isArray(value) && data[chatId][key]) {
            data[chatId][key] = { ...data[chatId][key], ...value };
        } else {
            data[chatId][key] = value;
        }
        this.writeData(data);
    }

    // --- TRAITEMENT DES MESSAGES ---
    async handleMessage(sock, message, groupId, senderId) {
        try {
            if (!groupId.endsWith('@g.us')) return;

            // 1. GLOBAL ADMIN IMMUNITY (CORRECTION CRITIQUE)
            const userIsAdmin = await isAdmin(sock, groupId, senderId);
            if (userIsAdmin) return; // Les admins ne sont JAMAIS punis

            const config = this.getGroupConfig(groupId);

            // 2. ANTITRANSFERT (NOUVEAU)
            if (config.antitransfert?.enabled) {
                const msg = message.message;
                const isForwarded = msg?.extendedTextMessage?.contextInfo?.isForwarded || 
                                    msg?.imageMessage?.contextInfo?.isForwarded || 
                                    msg?.videoMessage?.contextInfo?.isForwarded ||
                                    msg?.conversation?.contextInfo?.isForwarded; // Cas rares

                if (isForwarded) {
                    return this.handleViolation(sock, groupId, senderId, { 
                        action: 'delete', 
                        message: '🚫 Les messages transférés sont interdits ici.' 
                    }, message);
                }
            }

            // 3. ANTIMENTION (NOUVEAU - Detecte > 3 mentions ou mention de groupe)
            if (config.antimention?.enabled) {
                const contextInfo = message.message?.extendedTextMessage?.contextInfo;
                const mentions = contextInfo?.mentionedJid || [];
                const groupMentions = contextInfo?.groupMentions || [];

                if (mentions.length > 3 || groupMentions.length > 0) {
                     return this.handleViolation(sock, groupId, senderId, { 
                        action: 'delete', 
                        message: '🚫 Les mentions de masse ou de groupe sont interdites.' 
                    }, message);
                }
            }

            // On vérifie d'abord tes anciennes protections
            if (antispam?.isEnabled(groupId)) {
                const res = await antispam.handleMessage(sock, message, groupId, senderId, userIsAdmin);
                if (res?.action !== 'none') return this.handleViolation(sock, groupId, senderId, res, message);
            }
            if (antilink?.isEnabled(groupId)) {
                const res = await antilink.handleMessage(sock, message, groupId, senderId, userIsAdmin);
                if (res?.action !== 'none') return this.handleViolation(sock, groupId, senderId, res, message);
            }
            if (antitag?.isEnabled(groupId)) { // Antitag = Hidden tags
                const res = await antitag.handleMessage(sock, message, groupId, senderId, userIsAdmin);
                if (res?.action !== 'none') return this.handleViolation(sock, groupId, senderId, res, message);
            }
            if (antimedia?.isEnabled(groupId)) {
                const res = await antimedia.handleMessage(sock, message, groupId, senderId, userIsAdmin);
                if (res?.action !== 'none') return this.handleViolation(sock, groupId, senderId, res, message);
            }

        } catch (error) {
            console.error('Error group protection:', error.message);
        }
    }

    async handleViolation(sock, groupId, senderId, result, message) {
        if (result.message) await sock.sendMessage(groupId, { text: result.message, mentions: [senderId] }, { quoted: message });
        
        // Suppression du message (Si delete est demandé)
        if (result.action === 'delete' || result.action === 'kick') {
             try { await sock.sendMessage(groupId, { delete: message.key }); } catch {}
        }

        if (result.action === 'kick') {
            try { await sock.groupParticipantsUpdate(groupId, [senderId], 'remove'); } catch {}
        }
    }

    // --- TOGGLE (ON/OFF) ---
    async toggleProtection(type, groupId, enabled) {
        switch(type) {
            // Anciens systèmes (Compatibilité)
            case 'antilink': return antilink.toggle(groupId, enabled);
            case 'antitag': return antitag.toggle(groupId, enabled);
            case 'antimedia': return antimedia.toggle(groupId, enabled);
            case 'antispam': return antispam.toggle(groupId, enabled);
            
            // Nouveaux systèmes (JSON)
            case 'antipromote':
            case 'antidemote':
            case 'antitransfert': // Nouveau
            case 'antimention': // Nouveau
            case 'welcome':
            case 'goodbye':
                this.updateGroupConfig(groupId, type, { enabled: enabled });
                return { success: true };
                
            default: return { success: false };
        }
    }

    // --- STATUS ---
    getGroupProtectionStatus(groupId) {
        const config = this.getGroupConfig(groupId);
        return {
            antilink: antilink?.isEnabled(groupId) || false,
            antitag: antitag?.isEnabled(groupId) || false,
            antimedia: antimedia?.isEnabled(groupId) || false,
            antispam: antispam?.isEnabled(groupId) || false,
            antipromote: config.antipromote?.enabled || false,
            antidemote: config.antidemote?.enabled || false,
            antitransfert: config.antitransfert?.enabled || false, // Nouveau
            antimention: config.antimention?.enabled || false, // Nouveau
            welcome: config.welcome?.enabled || false,
            goodbye: config.goodbye?.enabled || false
        };
    }
}

export default new GroupProtectionManager();
