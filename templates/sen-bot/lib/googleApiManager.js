/**
 * 𝗦𝗘𝗡 Bot - Google API Manager
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 * Using official @google/genai SDK
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const API_FILE = './data/google_api.json';

class GoogleApiManager {
    constructor() {
        this.ensureDataFile();
        this.client = null;
    }

    ensureDataFile() {
        const dir = path.dirname(API_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(API_FILE)) {
            const defaultData = {
                apiKey: null,
                addedAt: null
            };
            fs.writeFileSync(API_FILE, JSON.stringify(defaultData, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(API_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading Google API file:', error);
            return { apiKey: null, addedAt: null };
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(API_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing Google API file:', error);
        }
    }

    /**
     * Définit la clé API Google et initialise le client
     */
    setApiKey(apiKey) {
        const data = {
            apiKey: apiKey,
            addedAt: new Date().toISOString()
        };
        this.writeData(data);
        this.initClient(apiKey);
    }

    /**
     * Initialise le client GoogleGenAI
     */
    initClient(apiKey) {
        try {
            // Selon la doc: new GoogleGenAI({ apiKey }) OU new GoogleGenAI({})
            // Si apiKey n'est pas fourni, le SDK cherche GEMINI_API_KEY dans l'environnement
            this.client = new GoogleGenAI({ apiKey });
        } catch (error) {
            console.error('Error initializing Google AI client:', error);
            this.client = null;
        }
    }

    /**
     * Récupère la clé API Google
     */
    getApiKey() {
        const data = this.readData();
        return data.apiKey;
    }

    /**
     * Récupère le client GoogleGenAI (l'initialise si nécessaire)
     */
    getClient() {
        if (!this.client) {
            const apiKey = this.getApiKey();
            if (apiKey) {
                this.initClient(apiKey);
            }
        }
        return this.client;
    }

    /**
     * Supprime la clé API
     */
    removeApiKey() {
        const data = {
            apiKey: null,
            addedAt: null
        };
        this.writeData(data);
        this.client = null;
    }

    /**
     * Teste si une clé API est valide
     */
    async testApiKey(apiKey) {
        try {
            const testClient = new GoogleGenAI({ apiKey });
            
            // Test simple avec generateContent selon la doc
            const response = await testClient.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: 'Hi'
            });

            if (response && response.text) {
                console.log('✅ API key is valid');
                return true;
            }

            return false;

        } catch (error) {
            console.error('API Key Test Error:', error.message);
            
            // Si l'erreur mentionne quota ou rate limit, la clé est valide
            if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
                console.log('✅ API key valid (quota/rate limit)');
                return true;
            }
            
            // Si l'erreur mentionne "invalid" ou "API key", la clé est invalide
            if (error.message?.toLowerCase().includes('invalid') || 
                error.message?.toLowerCase().includes('api_key_invalid')) {
                console.log('❌ API key invalid');
                return false;
            }
            
            console.log('⚠️ Could not validate key, assuming valid');
            return true;
        }
    }

    /**
     * Vérifie si une clé API est configurée
     */
    hasApiKey() {
        const apiKey = this.getApiKey();
        return !!apiKey;
    }
}

export default new GoogleApiManager();