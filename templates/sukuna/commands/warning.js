import {  sendReply, formatSuccess, formatError  } from '../lib/helpers.js';
import {  isAdmin  } from '../lib/isAdmin.js';

export default { 
    name: 'warnings',
    aliases: ['warns', 'avertissements'],
    description: 'Voir les avertissements d\'un utilisateur ou de tous',
    usage: 'warnings [@utilisateur] [reset]',

    async execute({ sock, msg, args, getGroupConfig, getGroupUser, saveDB, phoneNumber  }) {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!jid.endsWith('@g.us')) {
            return await sendReply(sock, jid, formatError('Cette commande ne peut être utilisée qu\'en groupe.'), { quoted: msg });
        }

        const isUserAdmin = await isAdmin(sock, jid, sender);
        if (!isUserAdmin) {
            return await sendReply(sock, jid, formatError('Vous devez être admin pour utiliser cette commande.'), { quoted: msg });
        }

        const groupConfig = getGroupConfig(jid);
        
        // RESET des avertissements
        if (args.includes('reset')) {
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (mentionedJid.length > 0) {
                // Reset pour un utilisateur spécifique
                const targetUser = mentionedJid[0];
                const userConfig = getGroupUser(jid, targetUser);
                const phone = targetUser.split('@')[0];
                
                // Réinitialiser tous les compteurs
                userConfig.antilink_warnings = 0;
                userConfig.antispam_warnings = 0;
                userConfig.messages = [];
                
                saveDB();
                
                console.log(`🔄 [${phoneNumber}] Avertissements réinitialisés pour @${phone}`);
                
                return await sendReply(
                    sock, 
                    jid, 
                    formatSuccess(`Avertissements réinitialisés pour @${phone}\n\n📱 Session: ${phoneNumber}`),
                    { quoted: msg, mentions: [targetUser] }
                );
            } else {
                // Reset pour TOUS les utilisateurs
                const users = groupConfig.users || {};
                let resetCount = 0;
                
                Object.keys(users).forEach(userId => {
                    if (users[userId].antilink_warnings > 0 || users[userId].antispam_warnings > 0) {
                        resetCount++;
                    }
                    users[userId].antilink_warnings = 0;
                    users[userId].antispam_warnings = 0;
                    users[userId].messages = [];
                });
                
                saveDB();
                
                console.log(`🔄 [${phoneNumber}] Tous les avertissements réinitialisés (${resetCount} utilisateurs)`);
                
                return await sendReply(
                    sock, 
                    jid, 
                    formatSuccess(`Tous les avertissements ont été réinitialisés\n\n👥 ${resetCount} utilisateur(s) affecté(s)\n📱 Session: ${phoneNumber}`),
                    { quoted: msg }
                );
            }
        }

        // AFFICHAGE des avertissements d'un utilisateur spécifique
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJid.length > 0) {
            const targetUser = mentionedJid[0];
            const userConfig = getGroupUser(jid, targetUser);
            const phone = targetUser.split('@')[0];
            
            const warningText = `⚠️ **Avertissements de @${phone}**\n\n` +
                `🔗 Antilink: ${userConfig.antilink_warnings || 0}/${groupConfig.antilink?.kickThreshold || 3}\n` +
                `🚫 Antispam: ${userConfig.antispam_warnings || 0}/${groupConfig.antispam?.kickThreshold || 3}\n\n` +
                `📱 Session: ${phoneNumber}\n\n` +
                `💡 _Utilisez_ \`warnings @user reset\` _pour réinitialiser_`;

            return await sendReply(sock, jid, warningText, { 
                quoted: msg,
                mentions: [targetUser]
            });
        }
        
        // AFFICHAGE de tous les utilisateurs avec avertissements
        const users = groupConfig.users || {};
        const usersWithWarnings = Object.entries(users)
            .filter(([userId, userData]) => 
                (userData.antilink_warnings || 0) > 0 || (userData.antispam_warnings || 0) > 0
            )
            .slice(0, 15); // Limiter à 15 pour éviter les messages trop longs

        if (usersWithWarnings.length === 0) {
            return await sendReply(
                sock, 
                jid, 
                formatSuccess(`Aucun avertissement dans ce groupe\n\n📱 Session: ${phoneNumber}`),
                { quoted: msg }
            );
        }

        let warningText = `⚠️ **Avertissements du groupe**\n\n`;
        const mentions = [];
        
        usersWithWarnings.forEach(([userId, userData]) => {
            const phone = userId.split('@')[0];
            const antilink = userData.antilink_warnings || 0;
            const antispam = userData.antispam_warnings || 0;
            
            warningText += `👤 @${phone}\n`;
            if (antilink > 0) warningText += `  🔗 Antilink: ${antilink}/${groupConfig.antilink?.kickThreshold || 3}\n`;
            if (antispam > 0) warningText += `  🚫 Antispam: ${antispam}/${groupConfig.antispam?.kickThreshold || 3}\n`;
            warningText += '\n';
            
            mentions.push(userId);
        });
        
        warningText += `📊 Total: ${usersWithWarnings.length} utilisateur(s)\n`;
        warningText += `📱 Session: ${phoneNumber}\n\n`;
        warningText += `💡 _Utilisez_ \`warnings reset\` _pour tout réinitialiser_`;

        await sendReply(sock, jid, warningText, { 
            quoted: msg,
            mentions: mentions
        });
    }
};