/**
 * 𝗦𝗘𝗡 Bot - Antispam System
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';
import warningSystem from './warningSystem.js';

const ANTISPAM_FILE = './data/antispam.json';

class AntispamManager {
    constructor() {
        this.ensureDataFile();
        this.messageTracker = new Map(); // { userId: [timestamps] }
        this.spamThreshold = 5; // Nombre de messages
        this.timeWindow = 5000; // dans 5 secondes = spam
    }

    ensureDataFile() {
        const dir = path.dirname(ANTISPAM_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(ANTISPAM_FILE)) {
            fs.writeFileSync(ANTISPAM_FILE, JSON.stringify({}, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(ANTISPAM_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading antispam file:', error);
            return {};
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(ANTISPAM_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing antispam file:', error);
        }
    }

    /**
     * Active/désactive l'antispam pour un groupe
     */
    toggle(groupId, enabled) {
        const data = this.readData();
        data[groupId] = { enabled };
        this.writeData(data);
        return { success: true, enabled };
    }

    /**
     * Vérifie si l'antispam est activé pour un groupe
     */
    isEnabled(groupId) {
        const data = this.readData();
        return data[groupId]?.enabled || false;
    }

    /**
     * Vérifie si un utilisateur spam
     */
    isSpamming(userId) {
        const now = Date.now();
        const userMessages = this.messageTracker.get(userId) || [];

        // Nettoyer les messages hors de la fenêtre de temps
        const recentMessages = userMessages.filter(timestamp => 
            now - timestamp < this.timeWindow
        );

        // Mettre à jour le tracker
        recentMessages.push(now);
        this.messageTracker.set(userId, recentMessages);

        // Vérifier si spam (plus de X messages dans Y secondes)
        return recentMessages.length > this.spamThreshold;
    }

    /**
     * Réinitialise le compteur de messages d'un utilisateur
     */
    resetUser(userId) {
        this.messageTracker.delete(userId);
    }

    /**
     * Traite un message avec antispam activé
     */
    async handleMessage(sock, message, groupId, senderId, isAdmin) {
        // Les admins sont exemptés
        if (isAdmin) {
            this.resetUser(senderId);
            return { action: 'none' };
        }

        if (!this.isSpamming(senderId)) return { action: 'none' };

        // Ajouter un avertissement
        const warning = warningSystem.addWarning(groupId, senderId, 'Antispam violation');

        // Supprimer le message
        try {
            await sock.sendMessage(groupId, { delete: message.key });
        } catch (error) {
            console.error('Error deleting message:', error);
        }

        // Réinitialiser le compteur après détection
        this.resetUser(senderId);

        // Vérifier si l'utilisateur doit être expulsé
        if (warning.shouldKick) {
            return {
                action: 'kick',
                warnings: warning.count,
                message: `⚠️ *Antispam Warning ${warning.count}/${warningSystem.maxWarnings}*\n\nSpamming is not allowed! User will be removed.`
            };
        } else {
            return {
                action: 'warn',
                warnings: warning.count,
                message: `⚠️ *Antispam Warning ${warning.count}/${warningSystem.maxWarnings}*\n\nSpamming is not allowed! ${warningSystem.maxWarnings - warning.count} warnings left before removal.`
            };
        }
    }
}

export default new AntispamManager();