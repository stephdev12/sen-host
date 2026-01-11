import settings from './settingsManager.js';

class PresenceManager {
    constructor() {
        this.socket = null;
        this.timeouts = new Map();
    }

    init(socket) {
        this.socket = socket;
    }

    async handleMessage(chatId) {
        if (!this.socket) return;

        const isAutowrite = settings.get('autowrite');
        const isAutorecord = settings.get('autorecord');

        // Clear existing timeout for this chat if any
        if (this.timeouts.has(chatId)) {
            clearTimeout(this.timeouts.get(chatId));
            this.timeouts.delete(chatId);
        }

        if (isAutowrite) {
            await this.socket.sendPresenceUpdate('composing', chatId);
            const timeout = setTimeout(async () => {
                await this.socket.sendPresenceUpdate('paused', chatId);
                this.timeouts.delete(chatId);
            }, 10000);
            this.timeouts.set(chatId, timeout);

        } else if (isAutorecord) {
            await this.socket.sendPresenceUpdate('recording', chatId);
            const timeout = setTimeout(async () => {
                await this.socket.sendPresenceUpdate('paused', chatId);
                this.timeouts.delete(chatId);
            }, 10000);
            this.timeouts.set(chatId, timeout);
        }
    }
}

export default new PresenceManager();