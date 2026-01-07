import { sendReply, formatSuccess, formatError, translate } from '../lib/helpers.js';
import { isOwner } from '../lib/isAdmin.js';

export default { 
    name: 'link',
    description: 'Obtenir un code de pairage pour connecter un nouveau numéro',
    usage: 'link <numéro>',
    category: 'owner',
    
    async execute({ sock, msg, args, globalConfig, phoneNumber, userConfigManager }) {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Seul le propriétaire peut utiliser cette commande
        const senderIsOwner = isOwner(msg, globalConfig);
        if (!senderIsOwner) {
            const errorMsg = translate(phoneNumber, 'error_owner_only', userConfigManager) ||
                           '❌ Commande réservée au propriétaire';
            return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }

        const targetNumber = args[0]?.replace(/[^0-9]/g, '');
        
        if (!targetNumber || targetNumber.length < 8) {
            const errorMsg = translate(phoneNumber, 'link_usage', userConfigManager, {
                prefix: globalConfig.prefix || '.'
            }) || `❌ Usage: ${globalConfig.prefix || '.'}link <numéro>`;
            return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }

        // Vérifier si le numéro est déjà connecté
        // Note: Cette partie nécessite l'accès au WhatsAppManager depuis le contexte global
        // Pour l'instant, on va juste tenter de créer la session
        
        try {
            const initMsg = translate(phoneNumber, 'link_initializing', userConfigManager, {
                number: targetNumber
            }) || `🔄 Initialisation de la connexion pour ${targetNumber}...`;
            
            await sendReply(sock, jid, initMsg, { quoted: msg });

            // Cette commande nécessite une intégration plus profonde avec WhatsAppManager
            // Pour l'instant, on informe l'utilisateur
            const infoMsg = translate(phoneNumber, 'link_manual', userConfigManager, {
                number: targetNumber
            }) || `⚠️ Cette fonctionnalité nécessite une configuration manuelle.\n\n` +
                  `Pour connecter ${targetNumber}, utilisez le système de QR code ou contactez l'administrateur.`;
            
            await sendReply(sock, jid, infoMsg, { quoted: msg });
            
            console.log(`ℹ️ [${phoneNumber}] Demande de connexion pour ${targetNumber}`);

        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur commande link:`, error.message);
            
            const errorMsg = translate(phoneNumber, 'link_error', userConfigManager, {
                error: error.message
            }) || `❌ Erreur: ${error.message}`;
            
            await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }
    }
};