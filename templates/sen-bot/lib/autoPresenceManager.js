/**
 * 𝗦𝗘𝗡 Bot - Auto Presence Manager
 * Gère les états "recording" et "typing"
 */

import fs from 'fs';
import path from 'path';
import advancedPresenceManager from './advancedPresenceManager.js';

const PRESENCE_FILE = './data/autopresence.json';

class AutoPresenceManager {
    constructor() {
        this.config = {
            recording: false,
            typing: false
        };
        this.intervals = {
            recording: null,
            typing: null
        };
        this.commandInProgress = new Set(); // Chats où une commande est en cours
        this.ensureFile();
        this.loadConfig();
    }

    ensureFile() {
        const dir = path.dirname(PRESENCE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(PRESENCE_FILE)) {
            fs.writeFileSync(PRESENCE_FILE, JSON.stringify(this.config, null, 2));
        }
    }

    loadConfig() {
        try {
            const data = JSON.parse(fs.readFileSync(PRESENCE_FILE, 'utf-8'));
            this.config = { ...this.config, ...data };
        } catch (error) {
            console.error('Error loading autopresence config:', error);
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(PRESENCE_FILE, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Error saving autopresence config:', error);
        }
    }

    /**
     * Active/désactive l'état "recording"
     */
    setRecording(enabled, sock) {
        this.config.recording = enabled;
        this.saveConfig();

        // Arrêter l'ancien intervalle
        if (this.intervals.recording) {
            clearInterval(this.intervals.recording);
            this.intervals.recording = null;
        }

        // Si activé, créer un nouvel intervalle
        if (enabled && sock) {
            this.intervals.recording = setInterval(async () => {
                try {
                    // Envoyer l'état "recording" à tous les chats actifs
                    await sock.sendPresenceUpdate('recording', null);
                } catch (error) {
                    console.error('Error sending recording presence:', error);
                }
            }, 10000); // Toutes les 10 secondes
        }
    }

    /**
     * Active/désactive l'état "typing"
     */
    setTyping(enabled, sock) {
        this.config.typing = enabled;
        this.saveConfig();

        // Arrêter l'ancien intervalle
        if (this.intervals.typing) {
            clearInterval(this.intervals.typing);
            this.intervals.typing = null;
        }

        // Si activé, créer un nouvel intervalle
        if (enabled && sock) {
            this.intervals.typing = setInterval(async () => {
                try {
                    // Envoyer l'état "composing" (typing) à tous les chats actifs
                    await sock.sendPresenceUpdate('composing', null);
                } catch (error) {
                    console.error('Error sending typing presence:', error);
                }
            }, 10000); // Toutes les 10 secondes
        }
    }

    /**
     * Restaurer les états au démarrage du bot
     */
    restore(sock) {
        if (this.config.recording) {
            this.setRecording(true, sock);
        }
        if (this.config.typing) {
            this.setTyping(true, sock);
        }
    }

    /**
     * Envoyer la présence pour un chat spécifique (utilisé lors d'un message reçu)
     * Mode "smart" : n'envoie la présence que si ce n'est pas une commande
     */
    async sendPresenceForChat(sock, chatId, messageText = '', isCommand = false) {
        try {
            // Vérifier si la présence doit être envoyée pour ce chat
            if (!advancedPresenceManager.shouldSendPresence(chatId)) {
                return;
            }

            // Si c'est une commande
            if (isCommand) {
                this.commandInProgress.add(chatId);
                
                // Vérifier la configuration pour les commandes
                const advConfig = advancedPresenceManager.getConfig();
                
                if (!advConfig.presenceOnCommand) {
                    // Annuler la présence pendant la commande
                    await sock.sendPresenceUpdate('available', chatId);
                    return;
                }
            } else {
                // Retirer de la liste des commandes en cours
                this.commandInProgress.delete(chatId);
            }

            // Obtenir la présence contextuelle si activée
            const contextualPresence = advancedPresenceManager.getContextualPresence(messageText);
            
            if (contextualPresence) {
                await sock.sendPresenceUpdate(contextualPresence, chatId);
            } else {
                // Envoyer la présence configurée
                if (this.config.recording) {
                    await sock.sendPresenceUpdate('recording', chatId);
                } else if (this.config.typing) {
                    await sock.sendPresenceUpdate('composing', chatId);
                }
            }
        } catch (error) {
            console.error('Error sending presence for chat:', error);
        }
    }

    /**
     * Marquer qu'une commande a démarré
     */
    markCommandStart(chatId) {
        this.commandInProgress.add(chatId);
    }

    /**
     * Marquer qu'une commande est terminée et rétablir la présence
     */
    async markCommandEnd(sock, chatId) {
        this.commandInProgress.delete(chatId);
        
        const advConfig = advancedPresenceManager.getConfig();
        
        // Attendre le délai configuré
        setTimeout(async () => {
            // Rétablir la présence configurée
            await this.sendPresenceForChat(sock, chatId, '', false);
        }, advConfig.presenceDelay);
    }

    /**
     * Vérifier si une commande est en cours dans ce chat
     */
    isCommandInProgress(chatId) {
        return this.commandInProgress.has(chatId);
    }

    /**
     * Réinitialiser la présence (remettre à "available")
     */
    async resetPresence(sock, chatId) {
        try {
            await sock.sendPresenceUpdate('available', chatId);
        } catch (error) {
            console.error('Error resetting presence:', error);
        }
    }

    /**
     * Envoyer une présence temporaire (pour simuler une action réelle)
     */
    async sendTemporaryPresence(sock, chatId, type, duration = 3000) {
        try {
            await sock.sendPresenceUpdate(type, chatId);
            
            // Remettre à la présence par défaut après la durée
            setTimeout(async () => {
                if (this.config.recording) {
                    await sock.sendPresenceUpdate('recording', chatId);
                } else if (this.config.typing) {
                    await sock.sendPresenceUpdate('composing', chatId);
                } else {
                    await sock.sendPresenceUpdate('available', chatId);
                }
            }, duration);
        } catch (error) {
            console.error('Error sending temporary presence:', error);
        }
    }

    isRecordingEnabled() {
        return this.config.recording;
    }

    isTypingEnabled() {
        return this.config.typing;
    }
}

export default new AutoPresenceManager();