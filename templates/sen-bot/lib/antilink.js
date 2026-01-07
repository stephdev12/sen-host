/**
 * 𝗦𝗘𝗡 Bot - Antilink System (FIXED)
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';
import warningSystem from './warningSystem.js';

const ANTILINK_FILE = './data/antilink.json';

class AntilinkManager {
    constructor() {
        this.ensureDataFile();
        
        // ✅ FIX: Regex plus puissante pour détecter TOUS les liens
        this.linkRegex = [
            // URLs complètes (http/https)
            /https?:\/\/[^\s]+/gi,
            
            // URLs sans http (www.)
            /www\.[^\s]+/gi,
            
            // Domaines avec extensions populaires
            /[a-zA-Z0-9-]+\.(com|net|org|io|xyz|me|co|tv|gg|tk|ml|ga|cf|gq|be|fr|de|uk|us|ca|au|in|ru|br|jp|cn|it|es|nl|se|no|dk|fi|pl|cz|pt|gr|tr|za|ng|ke|gh|tz|ug|et|ma|dz|eg|sd|ao|cm|ci|sn|ml|bf|ne|cd|mg|zm|zw|mw|rw|bi|so|dj|er|ss|lr|sl|gm|gn|gw|cv|st|mz|bw|na|sz|ls|re|mu|sc|km|yt|tf)[^\s]*/gi,
            
            // Liens WhatsApp
            /chat\.whatsapp\.com\/[^\s]+/gi,
            /wa\.me\/[^\s]+/gi,
            
            // Liens Telegram
            /t\.me\/[^\s]+/gi,
            /telegram\.me\/[^\s]+/gi,
            
            // Liens YouTube
            /youtu\.be\/[^\s]+/gi,
            /youtube\.com\/[^\s]+/gi,
            
            // Liens raccourcis
            /bit\.ly\/[^\s]+/gi,
            /tinyurl\.com\/[^\s]+/gi,
            
            // Liens sans espace avec point
            /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*/gi
        ];
    }

    ensureDataFile() {
        const dir = path.dirname(ANTILINK_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(ANTILINK_FILE)) {
            fs.writeFileSync(ANTILINK_FILE, JSON.stringify({}, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(ANTILINK_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading antilink file:', error);
            return {};
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(ANTILINK_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing antilink file:', error);
        }
    }

    /**
     * Active/désactive l'antilink pour un groupe
     */
    toggle(groupId, enabled) {
        const data = this.readData();
        data[groupId] = { enabled };
        this.writeData(data);
        return { success: true, enabled };
    }

    /**
     * Vérifie si l'antilink est activé pour un groupe
     */
    isEnabled(groupId) {
        const data = this.readData();
        return data[groupId]?.enabled || false;
    }

    /**
     * ✅ FIX: Détecte si un message contient un lien (AMÉLIORATION)
     */
    hasLink(text) {
        if (!text) return false;
        
        // Nettoyer le texte (enlever les emojis, etc.)
        const cleanText = text.trim();
        
        // Tester avec chaque regex
        for (const regex of this.linkRegex) {
            if (regex.test(cleanText)) {
                console.log(`🔗 Link detected with regex: ${regex}`);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Traite un message avec antilink activé
     */
    async handleMessage(sock, message, groupId, senderId, isAdmin) {
        // Les admins sont exemptés
        if (isAdmin) return { action: 'none' };

        // ✅ FIX: Récupérer le texte de TOUTES les sources possibles
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || 
                    message.message?.imageMessage?.caption || 
                    message.message?.videoMessage?.caption ||
                    message.message?.documentMessage?.caption ||
                    message.message?.buttonsResponseMessage?.selectedButtonId ||
                    '';

        // Debug: Afficher le texte analysé
        if (text) {
            console.log(`📝 Analyzing text for links: "${text.substring(0, 50)}..."`);
        }

        if (!this.hasLink(text)) return { action: 'none' };

        console.log(`🚫 Link detected! Deleting message from ${senderId}`);

        // Ajouter un avertissement
        const warning = warningSystem.addWarning(groupId, senderId, 'Antilink violation');

        // Supprimer le message
        try {
            await sock.sendMessage(groupId, { delete: message.key });
            console.log(`✅ Message deleted successfully`);
        } catch (error) {
            console.error('❌ Error deleting message:', error.message);
        }

        // Vérifier si l'utilisateur doit être expulsé
        if (warning.shouldKick) {
            return {
                action: 'kick',
                warnings: warning.count,
                message: `*Antilink Warning ${warning.count}/${warningSystem.maxWarnings}*\n\nLinks are not allowed\nUser will be removed`
            };
        } else {
            return {
                action: 'warn',
                warnings: warning.count,
                message: `*Antilink Warning ${warning.count}/${warningSystem.maxWarnings}*\n\nLinks are not allowed\n${warningSystem.maxWarnings - warning.count} warnings left before removal`
            };
        }
    }
}

export default new AntilinkManager();