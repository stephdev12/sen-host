import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import path from 'path';
import {  font, stylise  } from './helpers.js';

class PremiumManager {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'database', 'premium.json');
        this.data = this.loadData();
        
        // Vérifie périodiquement les expirations
        setInterval(() => this.checkExpirations(), 1000 * 60 * 60); // Vérifie chaque heure
    }

    loadData() {
        if (fs.existsSync(this.dbPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
                return data.users ? data : { users: {} };
            } catch (error) {
                console.error('Erreur lecture premium:', error);
                return { users: {} };
            }
        }
        // Crée le fichier s'il n'existe pas
        const defaultData = { users: {} };
        fs.writeFileSync(this.dbPath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }

    saveData() {
        try {
            // Vérifie si le dossier database existe
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde premium:', error);
            return false;
        }
    }

    addPremiumUser(phoneNumber, duration = 30) {
        // Nettoie le numéro de téléphone
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        const now = new Date();
        const expiry = new Date(now);
        expiry.setDate(expiry.getDate() + duration);
        
        this.data.users[phoneNumber] = {
            status: "premium",
            activatedAt: now.toISOString(),
            expiresAt: expiry.toISOString(),
            duration: duration
        };
        
        console.log(`Utilisateur premium ajouté: ${phoneNumber}`);
        return this.saveData();
    }

    removePremiumUser(phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        if (this.data.users[phoneNumber]) {
            delete this.data.users[phoneNumber];
            console.log(`Utilisateur premium supprimé: ${phoneNumber}`);
            return this.saveData();
        }
        return false;
    }

    isPremium(phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        console.log(`Vérification premium pour: ${phoneNumber}`);
        
        const user = this.data.users[phoneNumber];
        if (!user) {
            console.log(`${phoneNumber} n'est pas dans la base premium`);
            return false;
        }
        
        // Si l'utilisateur existe mais n'a pas de statut, c'est un ancien format
        if (!user.status) {
            user.status = "premium"; // On ajoute le statut
            this.saveData(); // On sauvegarde la mise à jour
        }
        
        const now = new Date();
        const expiry = new Date(user.expiresAt);
        const isPrem = now < expiry;
        
        console.log(`${phoneNumber} trouvé dans la base`);
        console.log(`Status: ${user.status}`);
        console.log(`Date d'expiration: ${expiry}`);
        console.log(`Premium actif: ${isPrem}`);
        
        return isPrem;
    }

    checkExpirations() {
        const now = new Date();
        let changed = false;
        
        Object.entries(this.data.users).forEach(([phoneNumber, user]) => {
            if (user.status === "premium") {
                const expiry = new Date(user.expiresAt);
                if (now >= expiry) {
                    console.log(`Premium expiré pour: ${phoneNumber}`);
                    delete this.data.users[phoneNumber];
                    changed = true;
                }
            }
        });
        
        if (changed) {
            this.saveData();
        }
    }

    getRemainingDays(phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        const user = this.data.users[phoneNumber];
        if (!user || user.status !== "premium") return 0;
        
        const now = new Date();
        const expiry = new Date(user.expiresAt);
        const diff = expiry - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    getAllPremiumUsers() {
        return Object.entries(this.data.premiumUsers).map(([phoneNumber, data]) => ({
            phoneNumber,
            activatedAt: new Date(data.activatedAt),
            expiresAt: new Date(data.expiresAt),
            remainingDays: this.getRemainingDays(phoneNumber)
        }));
    }

    formatPremiumMessage(user) {
        return stylise(`
╭━━━━━━━━⊱ ⋆ ⚡ ⋆ ⊰━━━━━━━━╮
┃       ⭓ 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐈𝐍𝐅𝐎 ⭓
┃━━━━━━━━━━━━━━━━━
┃ 📞 Numéro: ${user.phoneNumber}
┃ ⏰ Activé le: ${user.activatedAt.toLocaleDateString()}
┃ ⌛ Expire le: ${user.expiresAt.toLocaleDateString()}
┃ ✨ Jours restants: ${user.remainingDays}
╰━━━━━━━━⊱ ⋆ ⚡ ⋆ ⊰━━━━━━━━╯`);
    }
}

module.exports = new PremiumManager();