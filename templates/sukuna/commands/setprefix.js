import userConfigManager from '../userConfigManager.js';
import {  sendReply, formatError, formatSuccess, formatHelp  } from '../lib/helpers.js';

export default { 
    name: 'setprefix',
    aliases: ['prefix', 'changeprefix'],
    description: 'Définir votre préfixe personnel pour les commandes',
    usage: 'setprefix <nouveau_préfixe>',
    
    async execute({ sock, msg, args, phoneNumber  }) {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        
        if (isGroup) {
            return sendReply(sock, jid, formatError('ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ɴᴇ ᴘᴇᴜᴛ ᴇᴛʀᴇ ᴜᴛɪʟɪꜱᴇᴇ ǫᴜᴇ ᴇɴ ᴘʀɪᴠᴇ ᴘᴀʀ ʟᴇ ᴘʀᴏᴘʀɪᴇᴛᴀɪʀᴇ ᴅᴜ ʙᴏᴛ.'), { quoted: msg });
        }

        if (!args[0]) {
            const currentConfig = userConfigManager.getUserConfig(phoneNumber);
            const helpText = `ᴄᴏɴꜰɪɢᴜʀᴀᴛɪᴏɴ ᴅᴜ ᴘʀᴇꜰɪxᴇ

ᴘʀᴇꜰɪxᴇ ᴀᴄᴛᴜᴇʟ: ${currentConfig.prefix}

ᴜꜱᴀɢᴇ: ${currentConfig.prefix}ꜱᴇᴛᴘʀᴇꜰɪx <ɴᴏᴜᴠᴇᴀᴜ_ᴘʀᴇꜰɪxᴇ>

ᴇxᴇᴍᴘʟᴇꜱ:
• ${currentConfig.prefix}ꜱᴇᴛᴘʀᴇꜰɪx .
• ${currentConfig.prefix}ꜱᴇᴛᴘʀᴇꜰɪx /
• ${currentConfig.prefix}ꜱᴇᴛᴘʀᴇꜰɪx !

ʀᴇɢʟᴇꜱ:
• 1-3 ᴄᴀʀᴀᴄᴛᴇʀᴇꜱ ᴍᴀxɪᴍᴜᴍ
• ᴘᴀꜱ ᴅ'ᴇꜱᴘᴀᴄᴇꜱ
• ᴄᴀʀᴀᴄᴛᴇʀᴇꜱ ʀᴇᴄᴏᴍᴍᴀɴᴅᴇꜱ: ! . / # $ %`;

            return sendReply(sock, jid, formatHelp(helpText), { quoted: msg });
        }

        const newPrefix = args[0];

        try {
            const updatedConfig = userConfigManager.setPrefix(phoneNumber, newPrefix);
            const successText = `ᴘʀᴇꜰɪxᴇ ᴍɪꜱ ᴀ ᴊᴏᴜʀ ᴀᴠᴇᴄ ꜱᴜᴄᴄᴇꜱ!

ᴀɴᴄɪᴇɴ ᴘʀᴇꜰɪxᴇ: ${args[0] === '!' ? '.' : '!'}
ɴᴏᴜᴠᴇᴀᴜ ᴘʀᴇꜰɪxᴇ: ${updatedConfig.prefix}

ᴇxᴇᴍᴘʟᴇ ᴅ'ᴜᴛɪʟɪꜱᴀᴛɪᴏɴ:
${updatedConfig.prefix}ᴍᴇɴᴜ - ᴀꜰꜰɪᴄʜᴇʀ ʟᴇ ᴍᴇɴᴜ
${updatedConfig.prefix}ᴘɪɴɢ - ᴛᴇꜱᴛ ᴅᴇ ᴄᴏɴɴᴇxɪᴏɴ

ᴠᴏᴛʀᴇ ᴘʀᴇꜰɪxᴇ ᴘᴇʀꜱᴏɴɴᴇʟ ᴇꜱᴛ ᴍᴀɪɴᴛᴇɴᴀɴᴛ ᴄᴏɴꜰɪɢᴜʀᴇ! 🎉`;
            
            await sendReply(sock, jid, formatSuccess(successText), { quoted: msg });

        } catch (error) {
            const errorText = `ᴇʀʀᴇᴜʀ ʟᴏʀꜱ ᴅᴇ ʟᴀ ᴄᴏɴꜰɪɢᴜʀᴀᴛɪᴏɴ ᴅᴜ ᴘʀᴇꜰɪxᴇ

${error.message}

ᴘʀᴇꜰɪxᴇ ᴀᴄᴛᴜᴇʟ ᴄᴏɴꜱᴇʀᴠᴇ: ${userConfigManager.getUserConfig(phoneNumber).prefix}`;
            
            await sendReply(sock, jid, formatError(errorText), { quoted: msg });
        }
    }
};
