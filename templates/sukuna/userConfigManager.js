import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserConfigManager {
    constructor() {
        this.configFile = './userConfigs.json';
        this.configs = this.loadConfigs();
    }

    loadConfigs() {
        if (fs.existsSync(this.configFile)) {
            try {
                return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
            } catch (error) {
                console.error('Erreur lecture config utilisateurs:', error);
                return {};
            }
        }
        return {};
    }

    saveConfigs() {
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(this.configs, null, 2));
        } catch (error) {
            console.error('Erreur sauvegarde config utilisateurs:', error);
        }
    }

    getUserConfig(phoneNumber) {
        if (!this.configs[phoneNumber]) {
            this.configs[phoneNumber] = {
                prefix: '!',
                botName: '𝗦𝗧𝗘𝗣𝗛-𝗫𝗠𝗗',
                language: 'fr', // Langue par défaut
                menuImage: 'https://i.postimg.cc/8cKZBMZw/lv-0-20251105211949.jpg',
                ephotoMenuImage: 'https://i.postimg.cc/bv94M6Lp/𝘎𝘦𝘵𝘰𝘶-𝘴𝘶𝘨𝘶𝘳𝘶.jpg',
                welcomeImage: 'https://i.postimg.cc/bv94M6Lp/𝘎𝘦𝘵𝘰𝘶-𝘴𝘶𝘨𝘶𝘳𝘶.jpg',
                menuVersion: 'v1',
                antilinkLimit: 3, // Limite avant expulsion
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.saveConfigs();
        }
        return this.configs[phoneNumber];
    }

    updateUserConfig(phoneNumber, updates) {
        const config = this.getUserConfig(phoneNumber);
        Object.assign(config, updates, {
            updatedAt: new Date().toISOString()
        });
        this.saveConfigs();
        return config;
    }

    setPrefix(phoneNumber, newPrefix) {
        if (!newPrefix || newPrefix.length > 3) {
            throw new Error('Le préfixe doit faire entre 1 et 3 caractères');
        }
        
        const forbidden = /[\s\n\r\t]/;
        if (forbidden.test(newPrefix)) {
            throw new Error('Le préfixe ne peut pas contenir d\'espaces');
        }

        return this.updateUserConfig(phoneNumber, { prefix: newPrefix });
    }

    setBotName(phoneNumber, newName) {
        if (!newName || newName.length < 2 || newName.length > 30) {
            throw new Error('Le nom doit faire entre 2 et 30 caractères');
        }

        const cleanName = newName.replace(/[^\w\s\-_.]/g, '').trim();
        if (cleanName.length < 2) {
            throw new Error('Le nom contient trop de caractères spéciaux');
        }

        return this.updateUserConfig(phoneNumber, { botName: cleanName });
    }

    setLanguage(phoneNumber, lang) {
        const supportedLangs = ['fr', 'en', 'es', 'ht', 'id'];
    if (!supportedLangs.includes(lang.toLowerCase())) {
        throw new Error('Langues supportées : fr, en, es, ht, id'); 
    }

        return this.updateUserConfig(phoneNumber, { language: lang.toLowerCase() });
    }

    setMenuImage(phoneNumber, imageUrl) {
        if (!imageUrl || !this.isValidUrl(imageUrl)) {
            throw new Error('URL d\'image invalide');
        }

        return this.updateUserConfig(phoneNumber, { menuImage: imageUrl });
    }

    setEphotoMenuImage(phoneNumber, imageUrl) {
        if (!imageUrl || !this.isValidUrl(imageUrl)) {
            throw new Error('URL d\'image invalide');
        }

        return this.updateUserConfig(phoneNumber, { ephotoMenuImage: imageUrl });
    }

    setWelcomeImage(phoneNumber, imageUrl) {
        if (!imageUrl || !this.isValidUrl(imageUrl)) {
            throw new Error('URL d\'image invalide');
        }

        return this.updateUserConfig(phoneNumber, { welcomeImage: imageUrl });
    }

    setAntilinkLimit(phoneNumber, limit) {
        const numLimit = parseInt(limit);
        if (isNaN(numLimit) || numLimit < 1 || numLimit > 10) {
            throw new Error('La limite doit être entre 1 et 10');
        }

        return this.updateUserConfig(phoneNumber, { antilinkLimit: numLimit });
    }

    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    getAllUserConfigs() {
        return this.configs;
    }

    deleteUserConfig(phoneNumber) {
        if (this.configs[phoneNumber]) {
            delete this.configs[phoneNumber];
            this.saveConfigs();
            return true;
        }
        return false;
    }

    resetToDefaults(phoneNumber) {
        if (this.configs[phoneNumber]) {
            delete this.configs[phoneNumber];
            this.saveConfigs();
            return this.getUserConfig(phoneNumber);
        }
        return null;
    }
}
const userConfigManager = new UserConfigManager();
export default userConfigManager;