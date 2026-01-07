import {  sendReply, formatSuccess, formatError, translate  } from '../lib/helpers.js';

export default { 
    name: 'antidelete',
    aliases: ['ad', 'antisupp'],
    description: 'Active/désactive le système antidelete',
    usage: '<on|off|status>',
    
    async execute({ sock, msg, args, phoneNumber, db, saveDB, isOwner, config, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // MÊME VÉRIFICATION OWNER QUE ANTILINK
        if (!isOwner(msg, config)) {
            return await sendReply(sock, jid, formatError('error_owner_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_owner_only'
            }), { quoted: msg });
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off', 'status', 'enable', 'disable'].includes(action)) {
            const usageText = translate(phoneNumber, 'error_invalid_usage', userConfigManager, {
                usage: 'antidelete <on|off|status>'
            });
            
            const examples = translate(phoneNumber, 'antidelete_examples', userConfigManager, {
                prefix: config.prefix
            });
            
            return await sendReply(sock, jid, formatError(`${usageText}\n\n${examples}`), { quoted: msg });
        }

        if (!db.settings) db.settings = {};
        if (!db.settings.antidelete) db.settings.antidelete = { enabled: false };

        const currentStatus = db.settings.antidelete.enabled;

        if (action === 'status') {
            const statusText = translate(phoneNumber, 'antidelete_status', userConfigManager, {
                status: currentStatus ? 
                    translate(phoneNumber, 'protection_enabled', userConfigManager) : 
                    translate(phoneNumber, 'protection_disabled', userConfigManager),
                phoneNumber: phoneNumber,
                description: currentStatus ? 
                    translate(phoneNumber, 'antidelete_enabled_desc', userConfigManager) : 
                    translate(phoneNumber, 'antidelete_disabled_desc', userConfigManager)
            });
            
            return await sendReply(sock, jid, statusText, { quoted: msg });
        }

        const shouldEnable = ['on', 'enable'].includes(action);
        
        if (currentStatus === shouldEnable) {
            const alreadyText = translate(phoneNumber, 'antidelete_already', userConfigManager, {
                status: shouldEnable ? 
                    translate(phoneNumber, 'already_enabled', userConfigManager) : 
                    translate(phoneNumber, 'already_disabled', userConfigManager)
            });
                
            return await sendReply(sock, jid, formatError(alreadyText), { quoted: msg });
        }

        db.settings.antidelete.enabled = shouldEnable;
        saveDB();

        const resultText = translate(phoneNumber, shouldEnable ? 'antidelete_enabled' : 'antidelete_disabled', userConfigManager, {
            phoneNumber: phoneNumber,
            description: shouldEnable ? 
                translate(phoneNumber, 'antidelete_enabled_details', userConfigManager) :
                translate(phoneNumber, 'antidelete_disabled_details', userConfigManager)
        });

        await sendReply(sock, jid, resultText, { quoted: msg });

        console.log(`🔧 [${phoneNumber}] Antidelete ${shouldEnable ? 'activé' : 'désactivé'} par ${sender.split('@')[0]}`);
    }
};