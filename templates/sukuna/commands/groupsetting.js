import {  sendReply, formatSuccess, formatError, translate  } from '../lib/helpers.js';
import {  isAdmin  } from '../lib/isAdmin.js';

export default { 
    name: 'groupsettings',
    aliases: ['gsettings', 'config'],
    description: 'Voir et gérer tous les paramètres du groupe',
    usage: 'groupsettings [reset]',

    async execute({ sock, msg, args, getGroupConfig, saveDB, phoneNumber, userConfigManager, config  }) {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        // MÊME VÉRIFICATION GROUP QUE ANTILINK
        if (!jid.endsWith('@g.us')) {
            return await sendReply(sock, jid, formatError('error_group_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_group_only'
            }), { quoted: msg });
        }

        // MÊME VÉRIFICATION ADMIN QUE ANTILINK
        const isUserAdmin = await isAdmin(sock, jid, sender);
        if (!isUserAdmin) {
            return await sendReply(sock, jid, formatError('error_admin_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_admin_only'
            }), { quoted: msg });
        }

        const groupConfig = getGroupConfig(jid);
        
        if (args[0] === 'reset') {
            groupConfig.antilink = { enabled: false, kickThreshold: 3 };
            groupConfig.antispam = { enabled: false, kickThreshold: 3 };
            groupConfig.antimention = { enabled: false };
            groupConfig.antitag = { enabled: false };
            groupConfig.welcome = { enabled: false, text: '' };
            groupConfig.goodbye = { enabled: false, text: '' };
            saveDB();
            
            console.log(`🔧 [${phoneNumber}] Configuration reset pour le groupe ${jid}`);
            
            return await sendReply(
                sock, 
                jid, 
                formatSuccess('groupsettings_reset_success', {
                    phoneNumber,
                    userConfigManager,
                    translationKey: 'groupsettings_reset_success',
                    translationVars: { 
                        phoneNumber: phoneNumber
                    }
                }),
                { quoted: msg }
            );
        }

        const status = (enabled) => enabled ? 
            translate(phoneNumber, 'protection_enabled', userConfigManager) : 
            translate(phoneNumber, 'protection_disabled', userConfigManager);
        
        const configText = translate(phoneNumber, 'groupsettings_display', userConfigManager, {
            antilink_status: status(groupConfig.antilink?.enabled),
            antilink_threshold: groupConfig.antilink?.kickThreshold || 3,
            antispam_status: status(groupConfig.antispam?.enabled),
            antispam_threshold: groupConfig.antispam?.kickThreshold || 3,
            antimention_status: status(groupConfig.antimention?.enabled),
            antitag_status: status(groupConfig.antitag?.enabled),
            welcome_status: status(groupConfig.welcome?.enabled),
            goodbye_status: status(groupConfig.goodbye?.enabled),
            phoneNumber: phoneNumber
        });

        await sendReply(sock, jid, configText, { quoted: msg });
    }
};