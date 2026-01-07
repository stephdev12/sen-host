import {  sendReply, formatError, formatSuccess, formatHelp  } from '../lib/helpers.js';
import {  isAdmin  } from '../lib/isAdmin.js';
import {  t  } from '../lib/translations.js';
import whatsappManager from '../whatsappManager.js';

export default { 
    name: 'setgoodbye',
    aliases: ['goodbyemsg', 'setgoodbyemsg'],
    description: 'Définir un message d\'au revoir personnalisé',
    usage: 'setgoodbye <message>',
    
    async execute({ sock, msg, args, phoneNumber, getGroupConfig, saveDB, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');

        if (!isGroup) {
            return sendReply(sock, jid, formatError(t(phoneNumber, 'error_group_only', userConfigManager)), { quoted: msg });
        }

        const isUserAdmin = await isAdmin(sock, jid, sender);
        if (!isUserAdmin) {
            return sendReply(sock, jid, formatError(t(phoneNumber, 'error_admin_only', userConfigManager)), { quoted: msg });
        }

        const groupConfig = getGroupConfig(jid);

        if (!args.length) {
            const currentMessage = groupConfig.goodbye?.text || 'Message par défaut';
            const isEnabled = groupConfig.goodbye?.enabled || false;
            const status = isEnabled ? '✅ Activé' : '❌ Désactivé';
            
            const helpText = `👋 **Configuration du message d'au revoir**\n\n` +
                `**Statut:** ${status}\n\n` +
                `**Message actuel:**\n${currentMessage}\n\n` +
                `**Variables disponibles:**\n` +
                `• @user - Mentionne le membre qui part\n` +
                `• {group} - Nom du groupe\n` +
                `• {members} - Nombre de membres restants\n\n` +
                `**Exemple:**\n` +
                `setgoodbye Au revoir @user! Il reste {members} membres dans {group}.\n\n` +
                `**Réinitialiser:** setgoodbye reset\n` +
                `**Activer:** goodbye on\n\n` +
                `📱 Session: ${phoneNumber}`;

            return sendReply(sock, jid, formatHelp(helpText), { quoted: msg });
        }

        if (args[0].toLowerCase() === 'reset') {
            groupConfig.goodbye = groupConfig.goodbye || {};
            groupConfig.goodbye.text = '';
            saveDB();
            
            console.log(`🔄 [${phoneNumber}] Message goodbye réinitialisé pour ${jid}`);
            
            return sendReply(
                sock, 
                jid, 
                formatSuccess(`Message d'au revoir réinitialisé!\n\nLe message par défaut sera utilisé.\n\n📱 Session: ${phoneNumber}`),
                { quoted: msg }
            );
        }

        const customMessage = args.join(' ');

        if (customMessage.length > 500) {
            return sendReply(
                sock, 
                jid, 
                formatError('Le message est trop long! Maximum 500 caractères.'),
                { quoted: msg }
            );
        }

        groupConfig.goodbye = groupConfig.goodbye || {};
        groupConfig.goodbye.text = customMessage;
        saveDB();

        console.log(`✅ [${phoneNumber}] Message goodbye personnalisé pour ${jid}`);

         
          const metadata = await whatsappManager.getGroupMetadataSafe(sock, phoneNumber, jid);
        const previewMessage = customMessage
            .replace(/@user/g, `@${sender.split('@')[0]}`)
            .replace(/{group}/g, metadata.subject)
            .replace(/{members}/g, metadata.participants.length);

        const successText = `✅ Message d'au revoir personnalisé défini!\n\n` +
            `**Aperçu:**\n${previewMessage}\n\n` +
            `💡 N'oubliez pas d'activer avec: goodbye on\n\n` +
            `📱 Session: ${phoneNumber}`;

        await sendReply(
            sock, 
            jid, 
            successText,
            { quoted: msg, mentions: [sender] }
        );
    }
};