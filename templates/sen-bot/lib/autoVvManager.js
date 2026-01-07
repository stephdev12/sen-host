/**
 * 𝗦𝗘𝗡 Bot - Auto ViewOnce Manager
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';

const AUTO_VV_FILE = './data/auto_vv.json';

class AutoVvManager {
    constructor() {
        this.ensureDataFile();
    }

    ensureDataFile() {
        const dir = path.dirname(AUTO_VV_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(AUTO_VV_FILE)) {
            const defaultData = {
                enabled: false,
                enabledAt: null
            };
            fs.writeFileSync(AUTO_VV_FILE, JSON.stringify(defaultData, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(AUTO_VV_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading auto VV file:', error);
            return { enabled: false, enabledAt: null };
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(AUTO_VV_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing auto VV file:', error);
        }
    }

    /**
     * Active AutoVV
     */
    enable() {
        const data = {
            enabled: true,
            enabledAt: new Date().toISOString()
        };
        this.writeData(data);
        return true;
    }

    /**
     * Désactive AutoVV
     */
    disable() {
        const data = {
            enabled: false,
            enabledAt: null
        };
        this.writeData(data);
        return true;
    }

    /**
     * Vérifie si AutoVV est activé
     */
    isEnabled() {
        const data = this.readData();
        return data.enabled === true;
    }

    /**
     * Récupère le statut complet
     */
    getStatus() {
        const data = this.readData();
        return {
            enabled: data.enabled || false,
            enabledAt: data.enabledAt || null
        };
    }
}

export default new AutoVvManager();