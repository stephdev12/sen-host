/**
 * 𝗦𝗘𝗡 Bot - Antitag System
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';
import warningSystem from './warningSystem.js';

const ANTITAG_FILE = './data/antitag.json';

class AntitagManager {
    constructor() {
        this.ensureDataFile();
        this.massTagThreshold = 5; // Nombre minimum de mentions pour considérer comme mention de masse
    }

    ensureDataFile() {
        const dir = path.dirname(ANTITAG_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(ANTITAG_FILE)) {
            fs.writeFileSync(ANTITAG_FILE, JSON.stringify({}, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(ANTITAG_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading antitag file:', error);
            return {};
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(ANTITAG_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing antitag file:', error);
        }
    }

    /**
     * Active/désactive l'antitag pour un groupe
     */
    toggle(groupId, enabled) {
        const data = this.readData();
        data[groupId] = { enabled };
        this.writeData(data);
        return { success: true, enabled };
    }

    /**
     * Vérifie si l'antitag est activé pour un groupe
     */
    isEnabled(groupId) {
        const data = this.readData();
        return data[groupId]?.enabled || false;
    }

    /**
     * Vérifie si un message contient une mention de masse
     */
    isMassTag(message) {
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        return mentions.length >= this.massTagThreshold;
    }

    /**
     * Traite un message avec antitag activé
     */
    async handleMessage(sock, message, groupId, senderId, isAdmin) {
        // Les admins sont exemptés
        if (isAdmin) return { action: 'none' };

        if (!this.isMassTag(message)) return { action: 'none' };

        // Ajouter un avertissement
        const warning = warningSystem.addWarning(groupId, senderId, 'Antitag violation (mass mention)');

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
                message: `⚠️ *Antitag Warning ${warning.count}/${warningSystem.maxWarnings}*\n\nMass tagging is not allowed! User will be removed.`
            };
        } else {
            return {
                action: 'warn',
                warnings: warning.count,
                message: `⚠️ *Antitag Warning ${warning.count}/${warningSystem.maxWarnings}*\n\nMass tagging is not allowed! ${warningSystem.maxWarnings - warning.count} warnings left before removal.`
            };
        }
    }
}

export default new AntitagManager();