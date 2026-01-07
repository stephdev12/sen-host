import NodeCache from 'node-cache';
import sudoManager from './sudoManager.js';

const groupMetadataCache = new NodeCache({ stdTTL: 1800 });
const pendingRequests = new Map();
const rateLimitCache = new NodeCache({ stdTTL: 60 });

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getGroupMetadataWithCache(sock, chatId) {
    try {
        const cached = groupMetadataCache.get(chatId);
        if (cached) return cached;

        if (pendingRequests.has(chatId)) {
            return await pendingRequests.get(chatId);
        }

        const requestCount = rateLimitCache.get(chatId) || 0;
        if (requestCount > 5) {
            const backoffTime = Math.min(1000 * (requestCount - 5), 30000);
            await wait(backoffTime);
        }

        const requestPromise = (async () => {
            try {
                rateLimitCache.set(chatId, requestCount + 1);
                const metadata = await sock.groupMetadata(chatId);
                groupMetadataCache.set(chatId, metadata);
                return metadata;
            } catch (error) {
                if (error.data === 429) {
                    await wait(5000);
                    const metadata = await sock.groupMetadata(chatId);
                    groupMetadataCache.set(chatId, metadata);
                    return metadata;
                }
                if (cached) {
                    return cached;
                }
                throw error;
            }
        })();

        pendingRequests.set(chatId, requestPromise);
        const result = await requestPromise;
        pendingRequests.delete(chatId);

        return result;
    } catch (error) {
        console.error('Erreur métadonnées groupe:', error);
        throw error;
    }
}

const getParticipantInfo = async (sock, chatId, userIdentifier) => {
    const groupMetadata = await getGroupMetadataWithCache(sock, chatId);
    const participants = groupMetadata.participants;
    const participant = participants.find(p =>
        [p.jid, p.lid, p.id].some(id => id === userIdentifier ||
        (typeof userIdentifier === 'string' && id && id.includes(userIdentifier.split('@')[0])))
    );
    return participant || {};
};

async function isAdmin(sock, jid, user) {
    try {
        const participantInfo = await getParticipantInfo(sock, jid, user);
        if (participantInfo && (participantInfo.jid || participantInfo.id)) {
            return !!participantInfo.admin;
        }

        const metadata = await getGroupMetadataWithCache(sock, jid);
        const participants = metadata.participants.map(p => ({
            id: p.id,
            lid: p.lid || null,
            admin: p.admin || null,
        }));

        const participant = participants.find(p =>
            p.id === user ||
            p.lid === user ||
            (p.id && p.id.includes(user.split('@')[0])) ||
            (p.lid && p.lid.includes(user.split('@')[0]))
        );

        if (participant) {
            return !!participant.admin;
        }
        return false;
    } catch (error) {
        console.error("Erreur critique dans la fonction isAdmin:", error);
        return false;
    }
}

function isOwner(msg, config) {
    if (msg.key.fromMe) return true;

    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = sender.split('@')[0].split(':')[0];

    if (config && config.owner) {
        const ownerNumber = config.owner.replace(/[^0-9]/g, '');
        return senderNumber === ownerNumber;
    }
    return false;
}

async function isPremium(phoneNumber) {
    try {
        return await Database.isPremiumUser(phoneNumber);
    } catch (error) {
        console.error('❌ Error checking premium status:', error);
        return false;
    }
}

/**
 * Vérifie si l'utilisateur est sudo
 */
function isSudoUser(phoneNumber, userJid) {
    try {
        return sudoManager.isSudoUser(phoneNumber, userJid);
    } catch (error) {
        console.error('❌ Error checking sudo status:', error);
        return false;
    }
}


export { 
  isAdmin,
  isOwner,
  isPremium,
  isSudoUser
};