import {  sendReply, formatSuccess, formatError, translate  } from '../lib/helpers.js';
import {  isAdmin, isOwner  } from '../lib/isAdmin.js';

export default { 
    name: 'antispam',
    description: 'Activer/désactiver la protection contre le spam',
    usage: 'antispam <on/off> [seuil]',

    async execute({ sock, msg, args, getGroupConfig, saveDB, phoneNumber, userConfigManager, config  }) {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');

        // MÊME VÉRIFICATION GROUP QUE ANTILINK
        if (!isGroup) {
            return await sendReply(sock, jid, formatError('error_group_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_group_only'
            }), { quoted: msg });
        }

        // MÊME VÉRIFICATION ADMIN QUE ANTILINK
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
                translationVars: { usage: 'antispam <on/off> [seuil]' }
            }), { quoted: msg });
        }

        const groupConfig = getGroupConfig(jid);
        const threshold = parseInt(args[1]) || 3;

        if (threshold < 2 || threshold > 10) {
            const errorText = translate(phoneNumber, 'antispam_threshold_error', userConfigManager, {
                min: 2,
                max: 10
            });
            return await sendReply(sock, jid, formatError(errorText), { quoted: msg });
        }

        groupConfig.antispam = groupConfig.antispam || {};
        groupConfig.antispam.enabled = (action === 'on');
        groupConfig.antispam.kickThreshold = threshold;
        saveDB();

        console.log(`🔧 [${phoneNumber}] Antispam ${action} (seuil: ${threshold}) pour le groupe ${jid}`);
        
        const statusKey = action === 'on' ? 'success_activated' : 'success_deactivated';
        const featureName = translate(phoneNumber, 'antispam_label', userConfigManager);
        
        const successText = translate(phoneNumber, 'antispam_' + action, userConfigManager, {
            phoneNumber: phoneNumber,
            threshold: threshold
        });
        
        await sendReply(
            sock, 
            jid, 
            formatSuccess(successText),
            { quoted: msg }
        );
    }
};