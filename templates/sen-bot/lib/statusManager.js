import settings from './settingsManager.js';
import { jidNormalizedUser } from '@whiskeysockets/baileys';

class StatusManager {
    constructor() {
        this.socket = null;
    }

    init(socket) {
        this.socket = socket;
    }

    async handleStatus(msg) {
        if (!this.socket) return;
        if (msg.key.remoteJid !== 'status@broadcast') return;
        if (msg.key.fromMe) return;

        const isAutostatus = settings.get('autostatus');
        const reactEmoji = settings.get('autostatus_react');

        if (isAutostatus) {
            // Vue automatique
            await this.socket.readMessages([msg.key]);

            // Réaction automatique
            if (reactEmoji) {
                try {
                    await this.socket.sendMessage(
                        'status@broadcast',
                        {
                            react: {
                                text: reactEmoji,
                                key: msg.key
                            }
                        },
                        { statusJidList: [msg.key.participant] }
                    );
                } catch (e) {
                    console.error('Auto status react failed:', e);
                }
            }
        }
    }
}

export default new StatusManager();
