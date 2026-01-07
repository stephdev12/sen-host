/**
 * 𝗦𝗘𝗡 Bot - Settings Manager
 * Gère la configuration dynamique (JSON)
 */

import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = './data/settings.json';

class SettingsManager {
    constructor() {
        this.defaults = {
            botName: '𝗦𝗘𝗡 𝗕𝗢𝗧',
            prefix: '.',
            menuStyle: 1, // 1, 2, 3...
            menuImage: 'https://i.postimg.cc/8cKZBMZw/lv-0-20251105211949.jpg',
            audioUrl: '', // URL de l'audio du menu
            audioEnabled: true
        };
        this.ensureFile();
    }

    ensureFile() {
        const dir = path.dirname(SETTINGS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        if (!fs.existsSync(SETTINGS_FILE)) {
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(this.defaults, null, 2));
        }
    }

    getAll() {
        try {
            const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
            return { ...this.defaults, ...data }; // Fusion avec défauts pour sécurité
        } catch (e) {
            return this.defaults;
        }
    }

    get(key) {
        const settings = this.getAll();
        return settings[key];
    }

    update(key, value) {
        const settings = this.getAll();
        settings[key] = value;
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        return settings;
    }
}

export default new SettingsManager();
