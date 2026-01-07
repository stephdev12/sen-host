
import { sendReply, formatError, formatSuccess, translate } from '../lib/helpers.js';
import { downloadMediaMessage } from 'baileys';

export default {
    name: 'utils',
    aliases: ['getpp', 'pp', 'profilepic', 'avatar', 'setpp', 'jid', 'idch'],
    description: 'Commandes utilitaires diverses',
    usage: 'getpp [@mention] | setpp [répondre à image] | jid | idch',
    category: 'utils',

    async execute({ sock, msg, args, phoneNumber, userConfigManager, config, command, jid, isGroup }) {
        const commandName = command.toLowerCase();

        try {
            switch (commandName) {
                case 'getpp':
                case 'pp':
                case 'profilepic':
                case 'avatar':
                    await handleGetPP(sock, msg, args, phoneNumber, userConfigManager, jid, isGroup);
                    break;
                    
                case 'setpp':
                    await handleSetPP(sock, msg, phoneNumber, userConfigManager, jid, isGroup);
                    break;
                    
                case 'jid':
                    await handleJID(sock, msg, phoneNumber, userConfigManager, jid, isGroup);
                    break;
                    
                case 'idch':
                    await handleIDCH(sock, msg, phoneNumber, userConfigManager, jid);
                    break;
            }
        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur ${commandName}:`, error.message);
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
            
            const errorMsg = translate(phoneNumber, 'utils_error', userConfigManager, {
                error: error.message
            }) || `❌ Erreur: ${error.message}`;
            
            await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }
    }
};

// ========== GETPP ==========
async function handleGetPP(sock, msg, args, phoneNumber, userConfigManager, jid, isGroup) {
    try {
        let targetJid = null;
        let targetName = '';
        let isGroupPic = false;

        // Déterminer la cible
        if (isGroup && args.length === 0 && !msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetJid = jid;
            isGroupPic = true;
            try {
                const metadata = await sock.groupMetadata(jid);
                targetName = metadata.subject;
            } catch (err) {
                targetName = 'Groupe';
            }
        } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetJid = msg.message.extendedTextMessage.contextInfo.participant;
            targetName = targetJid.split('@')[0];
        } else if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            targetName = targetJid.split('@')[0];
        } else if (args.length > 0) {
            let number = args[0].replace(/[^0-9]/g, '');
            if (number.length < 8) {
                const errorMsg = translate(phoneNumber, 'getpp_invalid_number', userConfigManager) ||
                               'Numéro invalide. Format: getpp 237xxxxxxxxx';
                return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
            }
            targetJid = number + '@s.whatsapp.net';
            targetName = number;
        } else if (!isGroup) {
            targetJid = jid;
            targetName = jid.split('@')[0];
        } else {
            const helpMsg = translate(phoneNumber, 'getpp_usage', userConfigManager) ||
                           `📸 *GetPP - Usage*\n\n` +
                           `• Dans un groupe: getpp → Photo du groupe\n` +
                           `• Répondre: getpp → Photo de l'utilisateur\n` +
                           `• Mentionner: getpp @user\n` +
                           `• Numéro: getpp 237xxx`;
            return await sendReply(sock, jid, helpMsg, { quoted: msg });
        }

        await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });

        let ppUrl = null;
        try {
            ppUrl = await sock.profilePictureUrl(targetJid, 'image');
        } catch (err) {
            if (err.message.includes('404') || err.message.includes('not-found')) {
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                const noPhotoMsg = translate(phoneNumber, 'getpp_no_photo', userConfigManager, { target: targetName }) ||
                                 `❌ ${isGroupPic ? 'Ce groupe' : targetName} n'a pas de photo de profil.`;
                return await sendReply(sock, jid, noPhotoMsg, { quoted: msg });
            }
            throw err;
        }

        if (!ppUrl) {
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
            const noPhotoMsg = translate(phoneNumber, 'getpp_no_photo', userConfigManager, { target: targetName }) ||
                             `❌ ${isGroupPic ? 'Ce groupe' : targetName} n'a pas de photo de profil.`;
            return await sendReply(sock, jid, noPhotoMsg, { quoted: msg });
        }

        await sock.sendMessage(jid, {
            image: { url: ppUrl },
            caption: `> pp: ${targetName}`
        }, { quoted: msg });

        await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
        console.log(`✅ [${phoneNumber}] Photo de profil récupérée: ${targetName}`);

    } catch (error) {
        console.error(`❌ [${phoneNumber}] Erreur getpp:`, error.message);
        throw error;
    }
}

// ========== SETPP ==========
async function handleSetPP(sock, msg, phoneNumber, userConfigManager, jid, isGroup) {
    try {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quotedMessage?.imageMessage;

        if (!imageMessage) {
            const errorMsg = translate(phoneNumber, 'setpp_no_image', userConfigManager) ||
                           '❌ Répondez à une image avec la commande setpp';
            return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }

        await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });

        const buffer = await downloadMediaMessage(
            { message: quotedMessage },
            'buffer',
            {},
            { 
                logger: { level: 'silent', log: () => {} },
                reuploadRequest: sock.updateMediaMessage
            }
        );

        if (isGroup) {
            await sock.updateProfilePicture(jid, buffer);
            const successMsg = translate(phoneNumber, 'setpp_success_group', userConfigManager) ||
                             '✅ Photo de profil du groupe mise à jour';
            await sendReply(sock, jid, formatSuccess(successMsg), { quoted: msg });
        } else {
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            await sock.updateProfilePicture(botJid, buffer);
            const successMsg = translate(phoneNumber, 'setpp_success_bot', userConfigManager) ||
                             '✅ Photo de profil du bot mise à jour';
            await sendReply(sock, jid, formatSuccess(successMsg), { quoted: msg });
        }

        await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
        console.log(`✅ [${phoneNumber}] Photo de profil mise à jour`);

    } catch (error) {
        console.error(`❌ [${phoneNumber}] Erreur setpp:`, error.message);
        
        if (error.message.includes('forbidden') || error.message.includes('403')) {
            const errorMsg = translate(phoneNumber, 'setpp_no_permission', userConfigManager) ||
                           '❌ Permission refusée. Le bot doit être admin pour changer la photo du groupe.';
            return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }
        
        throw error;
    }
}

// ========== JID ==========
async function handleJID(sock, msg, phoneNumber, userConfigManager, jid, isGroup) {
    try {
        if (!isGroup) {
            const errorMsg = translate(phoneNumber, 'jid_group_only', userConfigManager) ||
                           '❌ Cette commande fonctionne uniquement dans les groupes';
            return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }

        const metadata = await sock.groupMetadata(jid);

        const response = `📋 *INFORMATIONS DU GROUPE*\n\n` +
                        `Nom: ${metadata.subject}\n` +
                        `JID: \`${jid}\`\n` +
                        `Membres: ${metadata.participants.length}\n` +
                        `Créé: ${new Date(metadata.creation * 1000).toLocaleDateString()}\n` +
                        `Propriétaire: ${metadata.owner ? '@' + metadata.owner.split('@')[0] : 'Inconnu'}`;

        await sendReply(sock, jid, response, { 
            quoted: msg,
            mentions: metadata.owner ? [metadata.owner] : []
        });

        console.log(`✅ [${phoneNumber}] JID du groupe récupéré: ${jid}`);

    } catch (error) {
        console.error(`❌ [${phoneNumber}] Erreur jid:`, error.message);
        throw error;
    }
}

// ========== IDCH ==========
async function handleIDCH(sock, msg, phoneNumber, userConfigManager, jid) {
    try {
        const isNewsletter = jid.includes('@newsletter');

        if (!isNewsletter) {
            const errorMsg = translate(phoneNumber, 'idch_channel_only', userConfigManager) ||
                           '❌ Cette commande fonctionne uniquement dans les chaînes WhatsApp';
            return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }

        const channelId = jid.split('@')[0];

        const response = `*Informations Channel*\n\n` +
                        `Channel JID: \`${jid}\`\n` +
                        `Channel ID: \`${channelId}\``;

        await sendReply(sock, jid, response, { quoted: msg });

        console.log(`✅ [${phoneNumber}] JID de la chaîne récupéré: ${jid}`);

    } catch (error) {
        console.error(`❌ [${phoneNumber}] Erreur idch:`, error.message);
        throw error;
    }
}