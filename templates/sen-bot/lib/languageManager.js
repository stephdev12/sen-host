/**
 * 𝗦𝗘𝗡 Bot - Language Manager
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';

const LANG_FILE = './data/language.json';
const LANG_DIR = './lang';

class LanguageManager {
    constructor() {
        this.translations = {};
        this.defaultLang = 'en';
        this.currentLang = 'en';
        this.ensureFiles();
        this.loadTranslations();
        this.loadCurrentLanguage();
    }

    ensureFiles() {
        // Créer le dossier locales
        if (!fs.existsSync(LANG_DIR)) {
            fs.mkdirSync(LANG_DIR, { recursive: true });
        }

        // Créer le fichier de config de langue
        const dir = path.dirname(LANG_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(LANG_FILE)) {
            fs.writeFileSync(LANG_FILE, JSON.stringify({ 
                language: 'en',
                updatedAt: new Date().toISOString()
            }, null, 2));
        }
    }

    loadTranslations() {
        // Charger tous les fichiers de traduction
        const langFiles = ['en.json', 'fr.json', 'es.json'];
        
        for (const file of langFiles) {
            const filePath = path.join(LANG_DIR, file);
            if (fs.existsSync(filePath)) {
                try {
                    const lang = path.basename(file, '.json');
                    this.translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                } catch (error) {
                    console.error(`Error loading translation file ${file}:`, error);
                }
            }
        }
    }

    loadCurrentLanguage() {
        try {
            const data = JSON.parse(fs.readFileSync(LANG_FILE, 'utf-8'));
            this.currentLang = data.language || this.defaultLang;
        } catch (error) {
            this.currentLang = this.defaultLang;
        }
    }

    setLanguage(lang) {
        if (!this.translations[lang]) {
            return { success: false, message: `Language '${lang}' not available` };
        }

        this.currentLang = lang;
        fs.writeFileSync(LANG_FILE, JSON.stringify({
            language: lang,
            updatedAt: new Date().toISOString()
        }, null, 2));

        return { success: true, language: lang };
    }

    getLanguage() {
        return this.currentLang;
    }

    /**
     * Obtenir une traduction
     * @param {string} key - Clé de traduction (ex: "commands.ping.description")
     * @param {object} params - Paramètres à remplacer dans la traduction
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLang];

        // Naviguer dans l'objet de traduction
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                // Fallback sur l'anglais si la traduction n'existe pas
                translation = this.translations[this.defaultLang];
                for (const k2 of keys) {
                    if (translation && translation[k2]) {
                        translation = translation[k2];
                    } else {
                        return key; // Retourner la clé si aucune traduction trouvée
                    }
                }
                break;
            }
        }

        // Remplacer les paramètres {param}
        if (typeof translation === 'string') {
            return translation.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] !== undefined ? params[param] : match;
            });
        }

        return translation || key;
    }

    /**
     * Liste toutes les langues disponibles
     */
    getAvailableLanguages() {
        return Object.keys(this.translations).map(lang => ({
            code: lang,
            name: this.translations[lang].meta?.name || lang,
            flag: this.translations[lang].meta?.flag || ''
        }));
    }
}

export default new LanguageManager();