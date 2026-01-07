/**
 * 𝗦𝗘𝗡 Bot - Mode Manager (Public/Private)
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';

const MODE_FILE = './data/mode.json';

class ModeManager {
    constructor() {
        this.ensureDataFile();
    }

    ensureDataFile() {
        const dir = path.dirname(MODE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(MODE_FILE)) {
            fs.writeFileSync(MODE_FILE, JSON.stringify({ 
                isPublic: true,
                updatedAt: new Date().toISOString()
            }, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(MODE_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading mode file:', error);
            return { isPublic: true };
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(MODE_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing mode file:', error);
        }
    }

    /**
     * Définit le mode du bot
     */
    setMode(isPublic) {
        const data = {
            isPublic: isPublic,
            updatedAt: new Date().toISOString()
        };
        this.writeData(data);
        return { 
            success: true, 
            mode: isPublic ? 'public' : 'private',
            message: `Bot mode set to ${isPublic ? 'public' : 'private'}`
        };
    }

    /**
     * Récupère le mode actuel
     */
    getMode() {
        const data = this.readData();
        return data.isPublic;
    }

    /**
     * Vérifie si le bot est en mode public
     */
    isPublic() {
        return this.getMode();
    }

    /**
     * Vérifie si le bot est en mode privé
     */
    isPrivate() {
        return !this.getMode();
    }
}

export default new ModeManager();