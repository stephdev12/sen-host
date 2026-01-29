/**
 * 𝗦𝗘𝗡 Bot - Auto Status Manager
 * Gère la visualisation et les réactions automatiques aux status
 */

import fs from 'fs';
import path from 'path';

const STATUS_FILE = './data/autostatus.json';

class AutoStatusManager {
    constructor() {
        this.config = {
            view: false,
            react: false,
            reactEmoji: '👀'
        };
        this.viewedStatus = new Set(); // Pour éviter de voir plusieurs fois le même status
        this.ensureFile();
        this.loadConfig();
    }

    ensureFile() {
        const dir = path.dirname(STATUS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(STATUS_FILE)) {
            fs.writeFileSync(STATUS_FILE, JSON.stringify(this.config, null, 2));
        }
    }

    loadConfig() {
        try {
            const data = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
            this.config = { ...this.config, ...data };
        } catch (error) {
            console.error('Error loading autostatus config:', error);
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(STATUS_FILE, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Error saving autostatus config:', error);
        }
    }

    /**
     * Active/désactive la visualisation automatique des status
     */
    setView(enabled) {
        this.config.view = enabled;
        this.saveConfig();
        
        // Réinitialiser la liste des status vus
        if (!enabled) {
            this.viewedStatus.clear();
        }
    }

    /**
     * Active/désactive les réactions automatiques aux status
     */
    setReact(enabled) {
        this.config.react = enabled;
        this.saveConfig();
    }

    /**
     * Définir l'emoji de réaction
     */
    setReactEmoji(emoji) {
        this.config.reactEmoji = emoji;
        this.saveConfig();
    }

    /**
     * Traiter un nouveau status
     */
    async handleStatus(sock, message) {
        try {
            // Vérifier si c'est bien un status
            const isStatus = message.key.remoteJid === 'status@broadcast';
            if (!isStatus) return;

            // Créer un ID unique pour ce status
            const statusId = `${message.key.participant}_${message.messageTimestamp}`;
            
            // Éviter de traiter plusieurs fois le même status
            if (this.viewedStatus.has(statusId)) return;
            this.viewedStatus.add(statusId);

            // Auto-view
            if (this.config.view) {
                await sock.readMessages([message.key]);
                console.log(`Auto-viewed status from ${message.key.participant}`);
            }

            // Auto-react
            if (this.config.react) {
                await sock.sendMessage(message.key.remoteJid, {
                    react: {
                        text: this.config.reactEmoji,
                        key: message.key
                    }
                });
                console.log(`Auto-reacted to status from ${message.key.participant} with ${this.config.reactEmoji}`);
            }

        } catch (error) {
            console.error('Error handling status:', error);
        }
    }

    isViewEnabled() {
        return this.config.view;
    }

    isReactEnabled() {
        return this.config.react;
    }

    getReactEmoji() {
        return this.config.reactEmoji;
    }

    /**
     * Nettoyer les anciens status vus (garder uniquement les 1000 derniers)
     */
    cleanupViewedStatus() {
        if (this.viewedStatus.size > 1000) {
            const arr = Array.from(this.viewedStatus);
            this.viewedStatus = new Set(arr.slice(-1000));
        }
    }
}

export default new AutoStatusManager();