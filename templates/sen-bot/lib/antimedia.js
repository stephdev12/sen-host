/**
 * 𝗦𝗘𝗡 Bot - Antimedia System
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';
import warningSystem from './warningSystem.js';

const ANTIMEDIA_FILE = './data/antimedia.json';

class AntimediaManager {
    constructor() {
        this.ensureDataFile();
    }

    ensureDataFile() {
        const dir = path.dirname(ANTIMEDIA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(ANTIMEDIA_FILE)) {
            fs.writeFileSync(ANTIMEDIA_FILE, JSON.stringify({}, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(ANTIMEDIA_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading antimedia file:', error);
            return {};
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(ANTIMEDIA_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing antimedia file:', error);
        }
    }

    /**
     * Active/désactive l'antimedia pour un groupe
     */
    toggle(groupId, enabled) {
        const data = this.readData();
        data[groupId] = { enabled };
        this.writeData(data);
        return { success: true, enabled };
    }

    /**
     * Vérifie si l'antimedia est activé pour un groupe
     */
    isEnabled(groupId) {
        const data = this.readData();
        return data[groupId]?.enabled || false;
    }

    /**
     * Vérifie si un message contient un média
     */
    hasMedia(message) {
        const msg = message.message;
        return !!(
            msg?.imageMessage ||
            msg?.videoMessage ||
            msg?.audioMessage ||
            msg?.documentMessage ||
            msg?.stickerMessage
        );
    }

    /**
     * Traite un message avec antimedia activé
     */
    async handleMessage(sock, message, groupId, senderId, isAdmin) {
        // Les admins sont exemptés
        if (isAdmin) return { action: 'none' };

        if (!this.hasMedia(message)) return { action: 'none' };

        // Ajouter un avertissement
        const warning = warningSystem.addWarning(groupId, senderId, 'Antimedia violation');

        // Supprimer le message
        try {
            await sock.sendMessage(groupId, { delete: message.key });
        } catch (error) {
            console.error('Error deleting message:', error);
        }

        // Vérifier si l'utilisateur doit être expulsé
        if (warning.shouldKick) {
            return {
                action: 'kick',
                warnings: warning.count,
                message: `⚠️ *Antimedia Warning ${warning.count}/${warningSystem.maxWarnings}*\n\nMedia files are not allowed! User will be removed.`
            };
        } else {
            return {
                action: 'warn',
                warnings: warning.count,
                message: `⚠️ *Antimedia Warning ${warning.count}/${warningSystem.maxWarnings}*\n\nMedia files are not allowed! ${warningSystem.maxWarnings - warning.count} warnings left before removal.`
            };
        }
    }
}

export default new AntimediaManager();