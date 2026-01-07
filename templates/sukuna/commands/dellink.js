import {  sendReply, formatSuccess, formatError, translate  } from '../lib/helpers.js';
import {  isOwner  } from '../lib/isAdmin.js';
import fs from 'fs';
import path from 'path';
import WhatsAppManager from '../whatsappManager.js';

export default { 
    name: 'dellink',
    aliases: ['unlink', 'disconnect'],
    description: 'Déconnecter une session WhatsApp',
    usage: 'dellink <numéro>',

    async execute({ sock, msg, args, config, phoneNumber, userConfigManager  }) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            
            // Seul le propriétaire peut utiliser cette commande
            const senderIsOwner = isOwner(msg, config);
            if (!senderIsOwner) {
                return await sendReply(sock, jid, formatError('error_owner_only', {
                    phoneNumber,
                    userConfigManager,
                    translationKey: 'error_owner_only'
                }), { quoted: msg });
            }

            const targetNumber = args[0]?.replace(/[^0-9]/g, '');
            
            if (!targetNumber || targetNumber.length < 8) {
                return await sendReply(sock, jid, formatError('error_invalid_usage', {
                    phoneNumber,
                    userConfigManager,
                    translationKey: 'error_invalid_usage',
                    translationVars: { usage: `${config.prefix}dellink <numéro>` }
                }), { quoted: msg });
            }

            const whatsappManagerInstance = sock.whatsappManager || new WhatsAppManager();
            
            // Vérifier si la session existe
            if (!whatsappManagerInstance.sessions.has(targetNumber)) {
                const sessionPath = `./whatsapp_sessions/${targetNumber}`;
                const sessionExists = fs.existsSync(sessionPath);
                
                if (!sessionExists) {
                    return await sendReply(sock, jid, formatError('error_not_found', {
                        phoneNumber,
                        userConfigManager,
                        translationKey: 'error_not_found',
                        translationVars: { item: `Session ${targetNumber}` }
                    }), { quoted: msg });
                }
                
                // Session existe dans les fichiers mais pas active
                const deletingMessage = translate(phoneNumber, 'dellink_deleting_inactive', userConfigManager, {
                    number: targetNumber
                });
                await sendReply(sock, jid, deletingMessage, { quoted: msg });
                
                // Supprimer les fichiers
                fs.rmSync(sessionPath, { recursive: true, force: true });
                
                const deletedMessage = translate(phoneNumber, 'dellink_deleted', userConfigManager, {
                    number: targetNumber
                });
                await sendReply(sock, jid, formatSuccess('success_updated', {
                    phoneNumber,
                    userConfigManager,
                    translationKey: 'success_updated',
                    translationVars: { feature: deletedMessage }
                }));
                
                console.log(`🗑️ [${phoneNumber}] Session inactive ${targetNumber} supprimée`);
                return;
            }

            // Session active - déconnexion propre
            const disconnectingMessage = translate(phoneNumber, 'dellink_disconnecting', userConfigManager, {
                number: targetNumber
            });
            await sendReply(sock, jid, disconnectingMessage, { quoted: msg });
            
            // Appeler removeSession
            await whatsappManagerInstance.removeSession(targetNumber);
            
            const successMessage = translate(phoneNumber, 'dellink_success', userConfigManager, {
                number: targetNumber
            });
            
            await sendReply(sock, jid, formatSuccess('success_updated', {
                phoneNumber,
                userConfigManager,
                translationKey: 'success_updated',
                translationVars: { feature: successMessage }
            }), { quoted: msg });
            
            console.log(`✅ [${phoneNumber}] Session ${targetNumber} déconnectée avec succès`);
        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur commande dellink pour ${targetNumber}:`, error);
            
            await sendReply(sock, jid, formatError('error_occurred', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_occurred',
                translationVars: { details: error.message }
            }), { quoted: msg });
        }
    }
};