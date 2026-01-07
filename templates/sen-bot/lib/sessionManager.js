/**
 * Session Manager - Convertit Session ID en creds.json
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

class SessionManager {
    constructor(sessionDir = './session') {
        this.sessionDir = sessionDir;
        this.credsPath = path.join(sessionDir, 'creds.json');
    }

    /**
     * Vérifie si une session existe déjà
     */
    sessionExists() {
        return fs.existsSync(this.credsPath);
    }

    /**
     * Crée le dossier session s'il n'existe pas
     */
    ensureSessionDir() {
        if (!fs.existsSync(this.sessionDir)) {
            fs.mkdirSync(this.sessionDir, { recursive: true });
        }
    }

    /**
     * Décode un Session ID et le convertit en creds.json
     * @param {string} sessionId - Le Session ID (contenu encodé ou JSON string)
     * @returns {boolean} - true si succès, false sinon
     */
    decodeSessionId(sessionId) {
        try {
            console.log(chalk.cyan('🔄 Decoding Session ID...'));

            // Nettoyer le sessionId (enlever espaces, retours à la ligne, etc.)
            sessionId = sessionId.trim();

            let credsData;

            // Essayer de parser directement comme JSON
            try {
                credsData = JSON.parse(sessionId);
                console.log(chalk.green('✅ Session ID is valid JSON'));
            } catch (jsonError) {
                // Si ce n'est pas du JSON direct, essayer de décoder en base64
                try {
                    const decodedBuffer = Buffer.from(sessionId, 'base64');
                    const decodedString = decodedBuffer.toString('utf-8');
                    credsData = JSON.parse(decodedString);
                    console.log(chalk.green('✅ Session ID decoded from Base64'));
                } catch (base64Error) {
                    throw new Error('Session ID format invalid (not JSON or Base64)');
                }
            }

            // Valider que c'est bien un objet creds valide
            if (!credsData || typeof credsData !== 'object') {
                throw new Error('Invalid creds data structure');
            }

            // Vérifier les champs essentiels
            if (!credsData.noiseKey || !credsData.signedIdentityKey || !credsData.signedPreKey) {
                throw new Error('Missing required creds fields (noiseKey, signedIdentityKey, signedPreKey)');
            }

            // Créer le dossier session
            this.ensureSessionDir();

            // Écrire le fichier creds.json
            fs.writeFileSync(
                this.credsPath,
                JSON.stringify(credsData, null, 2),
                'utf-8'
            );

            console.log(chalk.green(`✅ Session ID successfully converted to ${this.credsPath}`));
            return true;

        } catch (error) {
            console.error(chalk.red('❌ Error decoding Session ID:'), error.message);
            return false;
        }
    }

    /**
     * Encode creds.json en Session ID (pour backup)
     * @returns {string|null} - Le Session ID encodé ou null
     */
    encodeToSessionId() {
        try {
            if (!this.sessionExists()) {
                throw new Error('No creds.json file found');
            }

            const credsData = fs.readFileSync(this.credsPath, 'utf-8');
            const credsJson = JSON.parse(credsData);

            // Encoder en base64 pour faciliter le partage
            const sessionId = Buffer.from(JSON.stringify(credsJson)).toString('base64');

            console.log(chalk.green('✅ Session ID generated successfully'));
            return sessionId;

        } catch (error) {
            console.error(chalk.red('❌ Error encoding Session ID:'), error.message);
            return null;
        }
    }

    /**
     * Supprime la session actuelle
     */
    clearSession() {
        try {
            if (fs.existsSync(this.sessionDir)) {
                fs.rmSync(this.sessionDir, { recursive: true, force: true });
                console.log(chalk.yellow('🗑️ Session cleared'));
                return true;
            }
            return false;
        } catch (error) {
            console.error(chalk.red('❌ Error clearing session:'), error.message);
            return false;
        }
    }

    /**
     * Lit le Session ID depuis un fichier
     * @param {string} filePath - Chemin vers le fichier contenant le Session ID
     */
    readSessionIdFromFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            const sessionId = fs.readFileSync(filePath, 'utf-8');
            return this.decodeSessionId(sessionId);

        } catch (error) {
            console.error(chalk.red('❌ Error reading Session ID from file:'), error.message);
            return false;
        }
    }
}

export default new SessionManager();