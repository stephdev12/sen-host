import {  sendReply, formatSuccess, formatError, translate  } from '../lib/helpers.js';
import {  isAdmin, isOwner  } from '../lib/isAdmin.js';

export default { 
    name: 'antilink',
    description: 'Activer/désactiver la protection contre les liens',
    usage: 'antilink <on/off>',

    async execute({ sock, msg, args, getGroupConfig, config, saveDB, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
    	const sender = msg.key.participant || msg.key.remoteJid;
    	const isGroup = jid.endsWith('@g.us');

        if (!isGroup) {
            return await sendReply(sock, jid, formatError('error_group_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_group_only'
            }), { quoted: msg });
        }

        const senderIsAdmin = isGroup ? await isAdmin(sock, jid, sender) : false;
        const senderIsOwner = isOwner(msg, config);
        if (!senderIsAdmin && !senderIsOwner) {
            return await sendReply(sock, jid, formatError('error_admin_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_admin_only'
            }), { quoted: msg });
        }

        const action = args[0]?.toLowerCase();
        if (!['on', 'off'].includes(action)) {
            return await sendReply(sock, jid, formatError('error_invalid_usage', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_invalid_usage',
                translationVars: { usage: 'antilink <on/off>' }
            }), { quoted: msg });
        }

        const groupConfig = getGroupConfig(jid);
        groupConfig.antilink = groupConfig.antilink || {};
        groupConfig.antilink.enabled = (action === 'on');
        saveDB();

        console.log(`🔧 [${phoneNumber}] Antilink ${action} pour le groupe ${jid}`);
        
        const statusKey = action === 'on' ? 'antilink_enabled' : 'antilink_disabled';
        const kickThreshold = groupConfig.antilink.kickThreshold || 3;
        
        await sendReply(
            sock, 
            jid, 
            formatSuccess(statusKey, {
                phoneNumber,
                userConfigManager,
                translationKey: statusKey,
                translationVars: { 
                    phoneNumber: phoneNumber,
                    threshold: kickThreshold 
                }
            }),
            { quoted: msg }
        );
    }
};