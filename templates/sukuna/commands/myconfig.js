import userConfigManager from '../userConfigManager.js';
import {  sendReply, formatHelp, translate  } from '../lib/helpers.js';

export default { 
    name: 'myconfig',
    aliases: ['config', 'settings', 'mesparamètres'],
    description: 'Afficher vos paramètres personnels',
    
    async execute({ sock, msg, phoneNumber, userConfigManager, config  }) {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        
        if (isGroup) {
            return sendReply(sock, jid, formatError('error_group_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_group_only'
            }), { quoted: msg });
        }

        const userConfig = userConfigManager.getUserConfig(phoneNumber);
        
        const configText = translate(phoneNumber, 'myconfig_display', userConfigManager, {
            phoneNumber: phoneNumber,
            botName: userConfig.botName,
            prefix: userConfig.prefix,
            language: userConfig.language,
            createdAt: new Date(userConfig.createdAt).toLocaleDateString('fr-FR'),
            updatedAt: new Date(userConfig.updatedAt).toLocaleDateString('fr-FR'),
            prefix: userConfig.prefix
        });

        await sendReply(sock, jid, formatHelp(configText), { quoted: msg });
    }
};