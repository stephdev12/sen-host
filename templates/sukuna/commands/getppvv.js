import {  sendReply, formatError, formatSuccess, translate  } from '../lib/helpers.js';

export default { 
    name: 'getpp',
    aliases: ['pp', 'profilepic', 'avatar'],
    description: 'Récupère la photo de profil d\'un groupe ou utilisateur',
    usage: 'getpp [@mention | répondre]',
    category: 'utils',
    cooldown: 3,

    async execute({ sock, msg, args, phoneNumber, jid, isGroup, userConfigManager  }) {
        try {
            let targetJid = null;
            let targetName = '';
            let isGroupPic = false;

            // CAS 1: Dans un groupe sans arguments → Photo du groupe
            if (isGroup && args.length === 0 && !msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetJid = jid;
                isGroupPic = true;
                
                try {
                    const metadata = await sock.groupMetadata(jid);
                    targetName = metadata.subject;
                } catch (err) {
                    targetName = 'Groupe';
                }
            }
            // CAS 2: Réponse à un message → Photo de l'utilisateur cité
            else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quotedParticipant = msg.message.extendedTextMessage.contextInfo.participant;
                targetJid = quotedParticipant;
                targetName = quotedParticipant.split('@')[0];
            }
            // CAS 3: Mention d'un utilisateur → Photo de l'utilisateur mentionné
            else if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                const mentionedJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
                targetJid = mentionedJid;
                targetName = mentionedJid.split('@')[0];
            }
            // CAS 4: Numéro fourni en argument
            else if (args.length > 0) {
                let number = args[0].replace(/[^0-9]/g, '');
                if (number.length < 8) {
                    const errorMsg = translate(phoneNumber, 'getpp_invalid_number', userConfigManager) || 
                                   'Numéro invalide. Format: getpp 237xxxxxxxxx';
                    return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
                }
                targetJid = number + '@s.whatsapp.net';
                targetName = number;
            }
            // CAS 5: En privé sans arguments → Photo de l'interlocuteur
            else if (!isGroup) {
                targetJid = jid;
                targetName = jid.split('@')[0];
            }
            // CAS 6: Aucune cible identifiable
            else {
                const helpMsg = translate(phoneNumber, 'getpp_usage', userConfigManager) || 
                               `❓ *Utilisation:*\n\n` +
                               `• Dans un groupe: \`getpp\` → Photo du groupe\n` +
                               `• Répondre à un message: \`getpp\` → Photo de l'utilisateur\n` +
                               `• Mentionner: \`getpp @user\` → Photo de l'utilisateur\n` +
                               `• Numéro: \`getpp 237xxxxxxxxx\` → Photo du contact`;
                return await sendReply(sock, jid, helpMsg, { quoted: msg });
            }

            // Réaction de chargement
            await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });

            // Récupérer la photo de profil
            let ppUrl = null;
            try {
                ppUrl = await sock.profilePictureUrl(targetJid, 'image');
            } catch (err) {
                // Si pas de photo de profil
                if (err.message.includes('404') || err.message.includes('not-found')) {
                    const noPhotoMsg = translate(phoneNumber, 'getpp_no_photo', userConfigManager, {
                        target: targetName
                    }) || `❌ *Aucune photo de profil*\n\n${isGroupPic ? 'Ce groupe' : targetName} n'a pas de photo de profil.`;
                    
                    await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                    return await sendReply(sock, jid, noPhotoMsg, { quoted: msg });
                }
                throw err;
            }

            if (!ppUrl) {
                const noPhotoMsg = translate(phoneNumber, 'getpp_no_photo', userConfigManager, {
                    target: targetName
                }) || `❌ *Aucune photo de profil*\n\n${isGroupPic ? 'Ce groupe' : targetName} n'a pas de photo de profil.`;
                
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                return await sendReply(sock, jid, noPhotoMsg, { quoted: msg });
            }

            // Envoyer la photo sans caption
            await sock.sendMessage(jid, {
                image: { url: ppUrl }
            }, { quoted: msg });

            await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            console.log(`✅ [${phoneNumber}] Photo de profil récupérée: ${targetName}`);

        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur getpp:`, error);
            
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
            
            const errorMsg = translate(phoneNumber, 'getpp_error', userConfigManager, {
                error: error.message
            }) || `❌ *Erreur*\n\nImpossible de récupérer la photo de profil.\n\nErreur: ${error.message}`;
            
            await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }
    }
};