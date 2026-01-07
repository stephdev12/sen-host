import {  sendReply, formatSuccess, formatError, translate  } from '../lib/helpers.js';
import {  isAdmin, isOwner  } from '../lib/isAdmin.js';

export default { 
    name: 'antimention',
    description: 'Activer/désactiver la protection contre les mentions du groupe',
    usage: 'antimention <on/off>',

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
                translationVars: { usage: 'antimention <on/off>' }
            }), { quoted: msg });
        }

        const groupConfig = getGroupConfig(jid);
        groupConfig.antimention = groupConfig.antimention || {};
        groupConfig.antimention.enabled = (action === 'on');
        saveDB();

        console.log(`🔧 [${phoneNumber}] Antimention ${action} pour le groupe ${jid}`);
        
        const statusKey = action === 'on' ? 'antimention_enabled' : 'antimention_disabled';
        
        await sendReply(
            sock, 
            jid, 
            formatSuccess(statusKey, {
                phoneNumber,
                userConfigManager,
                translationKey: statusKey
            }),
            { quoted: msg }
        );
    }
};