/**
 * 𝗦𝗘𝗡 Bot - Auth Helper
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 * Version : Inspired by WhatsAppManager (Stable)
 */

import NodeCache from 'node-cache';
import chalk from 'chalk';
import configs from '../configs.js';
import sudoManager from './sudoManager.js';

// Configuration du cache identique au fichier qui fonctionne
const groupMetadataCache = new NodeCache({
    stdTTL: 600,        // 10 minutes de mémoire
    checkperiod: 180,   // Vérification toutes les 3 minutes
    useClones: false
});

/**
 * Normalise un JID
 */
function normalizeJid(jid) {
    if (!jid) return "";
    return jid.split('@')[0].split(':')[0];
}

/**
 * Récupère les métadonnées avec gestion d'erreur silencieuse (Style WhatsAppManager)
 */
async function getGroupMetadataSafe(sock, chatId) {
    // 1. Vérifier le cache
    const cached = groupMetadataCache.get(chatId);
    if (cached) return cached;

    try {
        // 2. Tenter de récupérer les infos
        const metadata = await sock.groupMetadata(chatId);
        
        // 3. Sauvegarder dans le cache si succès
        if (metadata) {
            groupMetadataCache.set(chatId, metadata);
        }
        return metadata;

    } catch (error) {
        // 4. GESTION DES ERREURS (Le secret de la stabilité)
        const errCode = error?.output?.statusCode || 0;
        
        if (errCode === 428 || errCode === 429 || error.message.includes('rate-overlimit')) {
            // C'est l'erreur que tu as ! On l'ignore silencieusement.
            console.warn(chalk.yellow(`⚠️ Metadata ignoré pour ${chatId} (Erreur ${errCode} - Connexion instable)`));
            return null; // On retourne null sans planter
        }
        
        console.error(`Erreur metadata mineure: ${error.message}`);
        return null;
    }
}

async function isAdmin(sock, chatId, user) {
    if (!chatId.endsWith('@g.us')) return false;

    try {
        const metadata = await getGroupMetadataSafe(sock, chatId);
        
        // Si la connexion bug (428) et qu'on a pas les infos, on assume FALSE pour ne pas crash
        if (!metadata || !metadata.participants) {
            return false; 
        }

        const participant = metadata.participants.find(p => normalizeJid(p.id) === normalizeJid(user));
        
        // Vérification admin
        return !!(participant && (participant.admin === 'admin' || participant.admin === 'superadmin'));

    } catch (error) {
        return false;
    }
}

async function isOwner(sock, msg) {
    try {
        // Si le message vient du bot
        if (msg.key.fromMe) return true;

        const senderId = msg.key.participant || msg.key.remoteJid;
        if (!senderId) return false;

        const ownerNumber = configs.ownerNumber.replace(/[^0-9]/g, '');
        const senderNumber = normalizeJid(senderId);

        return ownerNumber === senderNumber;
    } catch (e) {
        return false;
    }
}

function isSudoUser(phoneNumber, userJid) {
    try {
        return sudoManager.isSudoUser(phoneNumber, userJid);
    } catch (e) { return false; }
}

async function getPhoneNumber(sock, jid) {
    return normalizeJid(jid);
}

export { 
    isAdmin,
    isOwner,
    isSudoUser,
    getPhoneNumber,
    getGroupMetadataSafe // On l'exporte au cas où
};
