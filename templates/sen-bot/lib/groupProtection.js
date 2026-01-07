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

            // On vérifie d'abord tes anciennes protections
            const userIsAdmin = await isAdmin(sock, groupId, senderId);

            if (antispam?.isEnabled(groupId)) {
                const res = await antispam.handleMessage(sock, message, groupId, senderId, userIsAdmin);
                if (res?.action !== 'none') return this.handleViolation(sock, groupId, senderId, res);
            }
            if (antilink?.isEnabled(groupId)) {
                const res = await antilink.handleMessage(sock, message, groupId, senderId, userIsAdmin);
                if (res?.action !== 'none') return this.handleViolation(sock, groupId, senderId, res);
            }
            if (antitag?.isEnabled(groupId)) {
                const res = await antitag.handleMessage(sock, message, groupId, senderId, userIsAdmin);
                if (res?.action !== 'none') return this.handleViolation(sock, groupId, senderId, res);
            }
            if (antimedia?.isEnabled(groupId)) {
                const res = await antimedia.handleMessage(sock, message, groupId, senderId, userIsAdmin);
                if (res?.action !== 'none') return this.handleViolation(sock, groupId, senderId, res);
            }

        } catch (error) {
            console.error('Error group protection:', error.message);
        }
    }

    async handleViolation(sock, groupId, senderId, result) {
        if (result.message) await sock.sendMessage(groupId, { text: result.message, mentions: [senderId] });
        if (result.action === 'kick') {
            try { await sock.groupParticipantsUpdate(groupId, [senderId], 'remove'); } catch {}
        }
    }

    // --- TOGGLE (ON/OFF) ---
    async toggleProtection(type, groupId, enabled) {
        switch(type) {
            // Anciens systèmes
            case 'antilink': return antilink.toggle(groupId, enabled);
            case 'antitag': return antitag.toggle(groupId, enabled);
            case 'antimedia': return antimedia.toggle(groupId, enabled);
            case 'antispam': return antispam.toggle(groupId, enabled);
            
            // Nouveaux systèmes (JSON)
            case 'antipromote':
            case 'antidemote':
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
            welcome: config.welcome?.enabled || false,
            goodbye: config.goodbye?.enabled || false
        };
    }
}

export default new GroupProtectionManager();
