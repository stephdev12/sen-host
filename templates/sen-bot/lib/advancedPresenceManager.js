/**
 * 𝗦𝗘𝗡 Bot - Options avancées de présence
 * Configuration fine du comportement
 */

import fs from 'fs';
import path from 'path';

const ADVANCED_CONFIG_FILE = './data/presence_advanced.json';

class AdvancedPresenceManager {
    constructor() {
        this.config = {
            // Activer la présence uniquement dans certains chats
            enabledChats: [], // [] = tous, ou ['chatId1', 'chatId2']
            disabledChats: [], // Chats où la présence est désactivée
            
            // Mode de présence par type de message
            presenceOnCommand: false, // Afficher présence pendant les commandes
            presenceDelay: 2000, // Délai avant de rétablir la présence (ms)
            
            // Présence dynamique
            dynamicPresence: false, // Changer la présence selon le contexte
            
            // Intervalle de rafraîchissement
            refreshInterval: 10000, // 10 secondes
            
            // Mode discret
            stealthMode: false // Ne pas envoyer de présence aux chats individuels
        };
        this.ensureFile();
        this.loadConfig();
    }

    ensureFile() {
        const dir = path.dirname(ADVANCED_CONFIG_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(ADVANCED_CONFIG_FILE)) {
            fs.writeFileSync(ADVANCED_CONFIG_FILE, JSON.stringify(this.config, null, 2));
        }
    }

    loadConfig() {
        try {
            const data = JSON.parse(fs.readFileSync(ADVANCED_CONFIG_FILE, 'utf-8'));
            this.config = { ...this.config, ...data };
        } catch (error) {
            console.error('Error loading advanced presence config:', error);
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(ADVANCED_CONFIG_FILE, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Error saving advanced presence config:', error);
        }
    }

    /**
     * Vérifier si la présence doit être envoyée pour ce chat
     */
    shouldSendPresence(chatId) {
        // Mode furtif activé
        if (this.config.stealthMode) {
            return false;
        }

        // Si enabledChats est défini et non vide, vérifier si le chat est dedans
        if (this.config.enabledChats.length > 0) {
            return this.config.enabledChats.includes(chatId);
        }

        // Si le chat est dans disabledChats, ne pas envoyer
        if (this.config.disabledChats.includes(chatId)) {
            return false;
        }

        return true;
    }

    /**
     * Ajouter un chat à la liste blanche
     */
    enableChat(chatId) {
        if (!this.config.enabledChats.includes(chatId)) {
            this.config.enabledChats.push(chatId);
            this.saveConfig();
        }
    }

    /**
     * Retirer un chat de la liste blanche
     */
    disableChat(chatId) {
        this.config.enabledChats = this.config.enabledChats.filter(id => id !== chatId);
        if (!this.config.disabledChats.includes(chatId)) {
            this.config.disabledChats.push(chatId);
            this.saveConfig();
        }
    }

    /**
     * Activer/désactiver le mode furtif
     */
    setStealthMode(enabled) {
        this.config.stealthMode = enabled;
        this.saveConfig();
    }

    /**
     * Définir si la présence doit être affichée pendant les commandes
     */
    setPresenceOnCommand(enabled) {
        this.config.presenceOnCommand = enabled;
        this.saveConfig();
    }

    /**
     * Obtenir la présence appropriée selon le contexte
     */
    getContextualPresence(messageText) {
        if (!this.config.dynamicPresence) {
            return null; // Utiliser la présence par défaut
        }

        // Exemples de présence dynamique
        const text = messageText.toLowerCase();
        
        if (text.includes('voice') || text.includes('audio') || text.includes('record')) {
            return 'recording';
        }
        
        if (text.includes('type') || text.includes('write') || text.includes('message')) {
            return 'composing';
        }

        return null; // Présence par défaut
    }

    getConfig() {
        return this.config;
    }
}

export default new AdvancedPresenceManager();