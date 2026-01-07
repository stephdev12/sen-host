import { sendReply, formatError, formatSuccess, translate } from '../lib/helpers.js';
import { isAdmin, isOwner } from '../lib/isAdmin.js';

export default {
    name: 'group',
    aliases: ['gname', 'gdesc', 'kick', 'add', 'promote', 'demote', 'purge', 'kickall',
              'lock', 'unlock', 'grouplink', 'demoteall', 'autopromote'],
    description: 'Commandes de gestion de groupe complètes',
    usage: 'group <action>',
    category: 'group',
    adminOnly: true,

    async execute({ sock, msg, args, phoneNumber, userConfigManager, config, globalConfig, command, jid, sender, isGroup }) {
        // VÉRIFICATION GROUP
        if (!isGroup) {
            const errorMsg = translate(phoneNumber, 'error_group_only', userConfigManager) ||
                           'Cette commande fonctionne uniquement dans les groupes';
            return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }

        // VÉRIFICATION ADMIN
        const senderIsAdmin = await isAdmin(sock, jid, sender);
        const senderIsOwner = isOwner(msg, globalConfig);
        
        if (!senderIsAdmin && !senderIsOwner) {
            const errorMsg = translate(phoneNumber, 'error_admin_only', userConfigManager) ||
                           'Cette commande est réservée aux admins';
            return await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
        }

        // Utiliser le paramètre 'command' déjà parsé
        const commandName = command.toLowerCase();

        try {
            switch (commandName) {
                case 'gname':
                    await handleGroupName(sock, msg, args, phoneNumber, userConfigManager, jid);
                    break;
                    
                case 'gdesc':
                    await handleGroupDesc(sock, msg, args, phoneNumber, userConfigManager, jid);
                    break;
                    
                case 'kick':
                    await handleKick(sock, msg, args, phoneNumber, userConfigManager, jid);
                    break;
                    
                case 'add':
                    await handleAdd(sock, msg, args, phoneNumber, userConfigManager, jid);
                    break;
                    
                case 'promote':
                    await handlePromote(sock, msg, args, phoneNumber, userConfigManager, jid);
                    break;
                    
                case 'demote':
                    await handleDemote(sock, msg, args, phoneNumber, userConfigManager, jid);
                    break;
                    
                case 'purge':
                    await handlePurge(sock, msg, phoneNumber, jid);
                    break;
                    
                case 'kickall':
                    await handleKickAll(sock, msg, phoneNumber, jid);
                    break;
                    
                case 'lock':
                    await handleLock(sock, msg, phoneNumber, jid);
                    break;
                    
                case 'unlock':
                    await handleUnlock(sock, msg, phoneNumber, jid);
                    break;
                    
                case 'grouplink':
                    await handleGroupLink(sock, msg, phoneNumber, userConfigManager, jid);
                    break;
                    
                case 'demoteall':
                    await handleDemoteAll(sock, msg, phoneNumber, userConfigManager, jid);
                    break;
                    
                case 'autopromote':
                    await handleAutoPromote(sock, msg, phoneNumber, userConfigManager, jid);
                    break;
                    
                default:
                    const errorMsg = translate(phoneNumber, 'unknown_group_command', userConfigManager, {
                        command: commandName
                    }) || `Commande de groupe inconnue: ${commandName}`;
                    await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
            }
            
        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur commande groupe '${commandName}':`, error.message);
            
            if (error.data === 403) {
                const errorMsg = translate(phoneNumber, 'bot_needs_admin', userConfigManager) ||
                               'Le bot doit être admin pour exécuter cette action';
                await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
            } else {
                await sendReply(sock, jid, formatError(`Erreur: ${error.message}`), { quoted: msg });
            }
        }
    }
};

// ========== FONCTIONS DE GESTION ==========

async function getTargetUser(msg) {
    if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedParticipant = msg.message.extendedTextMessage.contextInfo.participant;
        if (quotedParticipant) {
            return quotedParticipant;
        }
    }
    
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    return mentionedJid[0] || null;
}

async function handleGroupName(sock, msg, args, phoneNumber, userConfigManager, jid) {
    const newName = args.join(' ');
    
    if (!newName) {
        const errorMsg = translate(phoneNumber, 'gname_usage', userConfigManager) ||
                       'Usage: !gname [nouveau nom]';
        return sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
    }
    
    await sock.groupUpdateSubject(jid, newName);
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
}

async function handleGroupDesc(sock, msg, args, phoneNumber, userConfigManager, jid) {
    const newDesc = args.join(' ');
    
    if (!newDesc) {
        const errorMsg = translate(phoneNumber, 'gdesc_usage', userConfigManager) ||
                       'Usage: !gdesc [nouvelle description]';
        return sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
    }
    
    await sock.groupUpdateDescription(jid, newDesc);
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
}

async function handleKick(sock, msg, args, phoneNumber, userConfigManager, jid) {
    const target = await getTargetUser(msg);
    
    if (!target) {
        const errorMsg = translate(phoneNumber, 'kick_no_target', userConfigManager) ||
                       'Mentionnez un utilisateur ou répondez à son message';
        return sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
    }
    
    await sock.groupParticipantsUpdate(jid, [target], 'remove');
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
}

async function handleAdd(sock, msg, args, phoneNumber, userConfigManager, jid) {
    const userToAdd = args[0]?.replace(/[^0-9]/g, '');
    
    if (!userToAdd) {
        const errorMsg = translate(phoneNumber, 'add_usage', userConfigManager) ||
                       'Usage: !add [numéro]';
        return sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
    }
    
    await sock.groupParticipantsUpdate(jid, [`${userToAdd}@s.whatsapp.net`], 'add');
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
}

async function handlePromote(sock, msg, args, phoneNumber, userConfigManager, jid) {
    const target = await getTargetUser(msg);
    
    if (!target) {
        const errorMsg = translate(phoneNumber, 'promote_no_target', userConfigManager) ||
                       'Mentionnez un utilisateur ou répondez à son message';
        return sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
    }
    
    await sock.groupParticipantsUpdate(jid, [target], 'promote');
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
}

async function handleDemote(sock, msg, args, phoneNumber, userConfigManager, jid) {
    const target = await getTargetUser(msg);
    
    if (!target) {
        const errorMsg = translate(phoneNumber, 'demote_no_target', userConfigManager) ||
                       'Mentionnez un utilisateur ou répondez à son message';
        return sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
    }
    
    await sock.groupParticipantsUpdate(jid, [target], 'demote');
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
}

async function handlePurge(sock, msg, phoneNumber, jid) {
    await sock.sendMessage(jid, { react: { text: '💀', key: msg.key } });
    
    const groupMetadata = await sock.groupMetadata(jid);
    const membersToKick = groupMetadata.participants
        .filter(p => !p.admin)
        .map(p => p.id);
    
    if (membersToKick.length === 0) {
        return sendReply(sock, jid, formatError('Aucun membre à expulser'), { quoted: msg });
    }
    
    await sock.groupParticipantsUpdate(jid, membersToKick, 'remove');
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
    console.log(`🔥 [${phoneNumber}] Purge: ${membersToKick.length} membres expulsés`);
}

async function handleKickAll(sock, msg, phoneNumber, jid) {
    await sock.sendMessage(jid, { react: { text: '⚠️', key: msg.key } });
    
    const groupMetadata = await sock.groupMetadata(jid);
    const membersToKick = groupMetadata.participants
        .filter(p => !p.admin)
        .map(p => p.id);
    
    if (membersToKick.length === 0) {
        return sendReply(sock, jid, formatError('Aucun membre à expulser'), { quoted: msg });
    }
    
    let kickedCount = 0;
    for (const member of membersToKick) {
        try {
            await sock.groupParticipantsUpdate(jid, [member], 'remove');
            kickedCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`❌ Erreur expulsion ${member}:`, error.message);
        }
    }
    
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
    console.log(`👋 [${phoneNumber}] KickAll: ${kickedCount}/${membersToKick.length} membres expulsés`);
}

async function handleLock(sock, msg, phoneNumber, jid) {
    await sock.groupSettingUpdate(jid, 'announcement');
    await sock.sendMessage(jid, { react: { text: '🔒', key: msg.key } });
}

async function handleUnlock(sock, msg, phoneNumber, jid) {
    await sock.groupSettingUpdate(jid, 'not_announcement');
    await sock.sendMessage(jid, { react: { text: '🔓', key: msg.key } });
}

async function handleGroupLink(sock, msg, phoneNumber, userConfigManager, jid) {
    const code = await sock.groupInviteCode(jid);
    const link = `https://chat.whatsapp.com/${code}`;
    
    const linkMsg = translate(phoneNumber, 'group_link_text', userConfigManager, { link }) ||
                   `🔗 Lien du groupe:\n${link}`;
    
    await sendReply(sock, jid, linkMsg, { quoted: msg });
}

async function handleDemoteAll(sock, msg, phoneNumber, userConfigManager, jid) {
    const sender = msg.key.participant || msg.key.remoteJid;
    
    await sock.sendMessage(jid, { react: { text: '⚡', key: msg.key } });
    
    const groupMetadata = await sock.groupMetadata(jid);
    const adminsToDemote = groupMetadata.participants
        .filter(p => p.admin && p.id !== sender)
        .map(p => p.id);
    
    if (adminsToDemote.length === 0) {
        const errorMsg = translate(phoneNumber, 'no_admins_to_demote', userConfigManager) ||
                       'Aucun admin à rétrograder';
        return sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
    }
    
    await sock.groupParticipantsUpdate(jid, adminsToDemote, 'demote');
    await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
    
    console.log(`👤 [${phoneNumber}] DemoteAll: ${adminsToDemote.length} admins rétrogradés`);
}

async function handleAutoPromote(sock, msg, phoneNumber, userConfigManager, jid) {
    const sender = msg.key.participant || msg.key.remoteJid;
    
    try {
        await sock.sendMessage(jid, { react: { text: '🔓', key: msg.key } });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await sock.groupParticipantsUpdate(jid, [sender], 'promote');
        await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
        
        console.log(`🔑 [${phoneNumber}] AutoPromote: ${sender.split('@')[0]} s'est auto-promu`);
    } catch (error) {
        console.error(`❌ [${phoneNumber}] AutoPromote error:`, error.message);
        
        const errorMsg = translate(phoneNumber, 'autopromote_failed', userConfigManager) ||
                       'Impossible de s\'auto-promouvoir (le bot doit être admin)';
        await sendReply(sock, jid, formatError(errorMsg), { quoted: msg });
    }
}
