import {  sendReply, formatError, formatSuccess, formatHelp  } from '../lib/helpers.js';
import {  isAdmin  } from '../lib/isAdmin.js';
import {  t  } from '../lib/translations.js';
import whatsappManager from '../whatsappManager.js';

export default { 
    name: 'setwelcome',
    aliases: ['welcomemsg', 'setwelcomemsg'],
    description: 'Définir un message de bienvenue personnalisé',
    usage: 'setwelcome <message>',
    
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

        // Si aucun argument, afficher le message actuel
        if (!args.length) {
            const currentMessage = groupConfig.welcome?.text || 'Message par défaut';
            const isEnabled = groupConfig.welcome?.enabled || false;
            const status = isEnabled ? '✅ Activé' : '❌ Désactivé';
            
            const helpText = `👋 **Configuration du message de bienvenue**\n\n` +
                `**Statut:** ${status}\n\n` +
                `**Message actuel:**\n${currentMessage}\n\n` +
                `**Variables disponibles:**\n` +
                `• @user - Mentionne le nouveau membre\n` +
                `• {group} - Nom du groupe\n` +
                `• {members} - Nombre de membres\n` +
                `• {desc} - Description du groupe\n\n` +
                `**Exemple:**\n` +
                `setwelcome Bienvenue @user dans {group}! Nous sommes {members} membres.\n\n` +
                `**Réinitialiser:** setwelcome reset\n` +
                `**Activer:** welcome on\n\n` +
                `📱 Session: ${phoneNumber}`;

            return sendReply(sock, jid, formatHelp(helpText), { quoted: msg });
        }

        // Réinitialiser le message
        if (args[0].toLowerCase() === 'reset') {
            groupConfig.welcome = groupConfig.welcome || {};
            groupConfig.welcome.text = '';
            saveDB();
            
            console.log(`🔄 [${phoneNumber}] Message welcome réinitialisé pour ${jid}`);
            
            return sendReply(
                sock, 
                jid, 
                formatSuccess(`Message de bienvenue réinitialisé!\n\nLe message par défaut sera utilisé.\n\n📱 Session: ${phoneNumber}`),
                { quoted: msg }
            );
        }

        // Définir un nouveau message
        const customMessage = args.join(' ');

        if (customMessage.length > 500) {
            return sendReply(
                sock, 
                jid, 
                formatError('Le message est trop long! Maximum 500 caractères.'),
                { quoted: msg }
            );
        }

        groupConfig.welcome = groupConfig.welcome || {};
        groupConfig.welcome.text = customMessage;
        saveDB();

        console.log(`✅ [${phoneNumber}] Message welcome personnalisé pour ${jid}`);

        // Aperçu avec remplacement des variables
        
          const metadata = await whatsappManager.getGroupMetadataSafe(sock, phoneNumber, jid);
        const previewMessage = customMessage
            .replace(/@user/g, `@${sender.split('@')[0]}`)
            .replace(/{group}/g, metadata.subject)
            .replace(/{members}/g, metadata.participants.length)
            .replace(/{desc}/g, metadata.desc || 'Aucune description');

        const successText = `✅ Message de bienvenue personnalisé défini!\n\n` +
            `**Aperçu:**\n${previewMessage}\n\n` +
            `💡 N'oubliez pas d'activer avec: welcome on\n\n` +
            `📱 Session: ${phoneNumber}`;

        await sendReply(
            sock, 
            jid, 
            successText,
            { quoted: msg, mentions: [sender] }
        );
    }
};