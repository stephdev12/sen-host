import {  sendReply, formatError, formatSuccess, formatHelp, translate  } from '../lib/helpers.js';

export default { 
    name: 'setantilink',
    aliases: ['antilinklimit', 'setlinklimit'],
    description: 'Définir la limite d\'avertissements avant expulsion pour antilink',
    usage: 'setantilink <1-10>',
    
    async execute({ sock, msg, args, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');

        if (isGroup) {
            return sendReply(sock, jid, formatError('error_owner_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_owner_only'
            }), { quoted: msg });
        }

        const userConfig = userConfigManager.getUserConfig(phoneNumber);

        if (!args.length) {
            const helpText = translate(phoneNumber, 'setantilink_help', userConfigManager, {
                prefix: userConfig.prefix,
                currentLimit: userConfig.antilinkLimit,
                phoneNumber: phoneNumber
            });

            return sendReply(sock, jid, formatHelp(helpText), { quoted: msg });
        }

        if (args[0].toLowerCase() === 'reset') {
            try {
                userConfigManager.setAntilinkLimit(phoneNumber, 3);
                
                const successText = translate(phoneNumber, 'setantilink_reset', userConfigManager, {
                    phoneNumber: phoneNumber
                });
                
                return sendReply(sock, jid, formatSuccess(successText), { quoted: msg });
            } catch (error) {
                return sendReply(sock, jid, formatError(`Erreur: ${error.message}`), { quoted: msg });
            }
        }

        const newLimit = args[0];

        try {
            userConfigManager.setAntilinkLimit(phoneNumber, newLimit);
            
            const successText = translate(phoneNumber, 'setantilink_success', userConfigManager, {
                limit: newLimit,
                phoneNumber: phoneNumber
            });
            
            await sendReply(sock, jid, formatSuccess(successText), { quoted: msg });
            
            console.log(`🚫 [${phoneNumber}] Limite antilink changée: ${newLimit}`);

        } catch (error) {
            const errorText = translate(phoneNumber, 'setantilink_error', userConfigManager, {
                error: error.message,
                currentLimit: userConfig.antilinkLimit
            });
            
            await sendReply(sock, jid, formatError(errorText), { quoted: msg });
        }
    }
};