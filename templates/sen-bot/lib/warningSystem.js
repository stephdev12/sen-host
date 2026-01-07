/**
 * 𝗦𝗘𝗡 Bot - Warning System
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 * Système de gestion des avertissements pour les protections de groupe
 */

import fs from 'fs';
import path from 'path';

const WARNINGS_FILE = './data/warnings.json';

class WarningSystem {
    constructor() {
        this.maxWarnings = 3; // Nombre d'avertissements avant expulsion
        this.ensureDataFile();
    }

    ensureDataFile() {
        const dir = path.dirname(WARNINGS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(WARNINGS_FILE)) {
            fs.writeFileSync(WARNINGS_FILE, JSON.stringify({}, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(WARNINGS_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading warnings file:', error);
            return {};
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(WARNINGS_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing warnings file:', error);
        }
    }

    /**
     * Ajoute un avertissement à un utilisateur
     * @param {string} groupId - ID du groupe
     * @param {string} userId - ID de l'utilisateur
     * @param {string} reason - Raison de l'avertissement
     * @returns {Object} - { count, shouldKick, warnings }
     */
    addWarning(groupId, userId, reason) {
        const data = this.readData();
        
        // Initialiser le groupe s'il n'existe pas
        if (!data[groupId]) {
            data[groupId] = {};
        }
        
        // Initialiser l'utilisateur s'il n'existe pas
        if (!data[groupId][userId]) {
            data[groupId][userId] = {
                count: 0,
                warnings: []
            };
        }
        
        // Ajouter l'avertissement
        data[groupId][userId].count++;
        data[groupId][userId].warnings.push({
            reason: reason,
            timestamp: new Date().toISOString()
        });
        
        const count = data[groupId][userId].count;
        const shouldKick = count >= this.maxWarnings;
        
        // Sauvegarder
        this.writeData(data);
        
        return {
            count: count,
            shouldKick: shouldKick,
            warnings: data[groupId][userId].warnings
        };
    }

    /**
     * Récupère les avertissements d'un utilisateur
     * @param {string} groupId - ID du groupe
     * @param {string} userId - ID de l'utilisateur
     * @returns {Object} - { count, warnings }
     */
    getWarnings(groupId, userId) {
        const data = this.readData();
        
        if (!data[groupId] || !data[groupId][userId]) {
            return {
                count: 0,
                warnings: []
            };
        }
        
        return {
            count: data[groupId][userId].count,
            warnings: data[groupId][userId].warnings
        };
    }

    /**
     * Réinitialise les avertissements d'un utilisateur
     * @param {string} groupId - ID du groupe
     * @param {string} userId - ID de l'utilisateur
     * @returns {Object} - { success, message }
     */
    resetWarnings(groupId, userId) {
        const data = this.readData();
        
        if (!data[groupId] || !data[groupId][userId]) {
            return {
                success: false,
                message: 'No warnings found for this user.'
            };
        }
        
        // Supprimer les avertissements de l'utilisateur
        delete data[groupId][userId];
        
        // Si le groupe n'a plus d'utilisateurs avec des avertissements, le supprimer aussi
        if (Object.keys(data[groupId]).length === 0) {
            delete data[groupId];
        }
        
        this.writeData(data);
        
        return {
            success: true,
            message: 'Warnings reset successfully.'
        };
    }

    /**
     * Récupère tous les utilisateurs avec des avertissements dans un groupe
     * @param {string} groupId - ID du groupe
     * @returns {Array} - Liste des utilisateurs avec leurs avertissements
     */
    getGroupWarnings(groupId) {
        const data = this.readData();
        
        if (!data[groupId]) {
            return [];
        }
        
        const users = [];
        for (const [userId, userData] of Object.entries(data[groupId])) {
            users.push({
                userId: userId,
                count: userData.count,
                warnings: userData.warnings
            });
        }
        
        return users;
    }

    /**
     * Nettoie les anciens avertissements (plus de 30 jours)
     * @param {string} groupId - ID du groupe (optionnel, sinon nettoie tous les groupes)
     */
    cleanOldWarnings(groupId = null) {
        const data = this.readData();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const groupsToClean = groupId ? [groupId] : Object.keys(data);
        
        for (const gId of groupsToClean) {
            if (!data[gId]) continue;
            
            for (const [userId, userData] of Object.entries(data[gId])) {
                // Filtrer les avertissements de moins de 30 jours
                const recentWarnings = userData.warnings.filter(w => {
                    return new Date(w.timestamp) > thirtyDaysAgo;
                });
                
                if (recentWarnings.length === 0) {
                    // Supprimer l'utilisateur s'il n'a plus d'avertissements récents
                    delete data[gId][userId];
                } else {
                    // Mettre à jour avec seulement les avertissements récents
                    data[gId][userId].warnings = recentWarnings;
                    data[gId][userId].count = recentWarnings.length;
                }
            }
            
            // Supprimer le groupe s'il n'a plus d'utilisateurs
            if (Object.keys(data[gId]).length === 0) {
                delete data[gId];
            }
        }
        
        this.writeData(data);
        console.log('✅ Old warnings cleaned');
    }
}

// Exporter une instance unique (singleton)
export default new WarningSystem();