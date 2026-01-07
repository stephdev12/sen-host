import {  font  } from '../lib/helpers.js';

export default { 
    name: 'ephotomenu',
    aliases: ['textmenu', 'effectmenu'],
    description: 'Affiche le menu des effets de texte',
    
    async execute({ sock, msg, config, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        
        
        const userConfig = userConfigManager.getUserConfig(phoneNumber);
        
        const menuText = `

╭━━━━━━━━━━━━━━━✦
┃   ❏ *${userConfig.prefix}* - 𝙓𝙈𝘿 ❏
┃    *ᴍᴀᴋᴇ ʙʏ ꜱᴛᴇᴘʜᴅᴇᴠ*
╰━━━━━━━━━━━━━━━✦

╭◇ *ᴛᴇxᴛᴍᴀᴋᴇʀ ᴍᴇɴᴜ* ◇
┃❍ ᴘʀᴇғɪx : ${userConfig.prefix}
┃❍ ᴇx: ${userConfig.prefix}neon sukuna
╰❍

╭━━━❏ *ᴇғғᴇᴛꜱ 3ᴅ* ❏
┃▢ᴍᴇᴛᴀʟʟɪᴄ
┃▢ɪᴄᴇ
┃▢ꜱɴᴏᴡ
┃▢ɪᴍᴘʀᴇꜱꜱɪᴠᴇ
┃▢ᴍᴀᴛʀɪx
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ᴇғғᴇᴛꜱ ɴᴇᴏɴ* ❏
┃▢ʟɪɢʜᴛ
┃▢ɴᴇᴏɴ
┃▢ᴅᴇᴠɪʟ
┃▢ᴘᴜʀᴘʟᴇ
┃▢ᴛʜᴜɴᴅᴇʀ
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ᴇғғᴇᴛꜱ ɴᴀᴛᴜʀᴇ* ❏
┃▢ʟᴇᴀᴠᴇꜱ
┃▢1917
┃▢ꜱᴀɴᴅ
┃▢ᴄʟᴏᴜᴅꜱ
┃▢ғɪʀᴇ
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ᴇғғᴇᴛꜱ ɢʟɪᴛᴄʜ* ❏
┃▢ɢʟɪᴛᴄʜ
┃▢ᴘɪxᴇʟɢʟɪᴛᴄʜ
┃▢ɴᴇᴏɴɢʟɪᴛᴄʜ
┃▢ғᴏɢɢʏɢʟᴀꜱꜱ
┃▢ғᴏɢɢʏɢʟᴀꜱꜱᴠ2
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ᴇғғᴇᴛꜱ ᴀɴɪᴍᴇ* ❏
┃▢ᴅʀᴀɢᴏɴʙᴀʟʟ
┃▢ɴᴀʀᴜᴛᴏ
┃▢ᴛʏᴘᴏ
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ᴇғғᴇᴛꜱ ᴍᴀʀǫᴜᴇꜱ* ❏
┃▢ᴘᴏʀɴʜᴜʙ
┃▢ᴍᴀʀᴠᴇʟ
┃▢ᴄᴀᴘᴛᴀɪɴᴀᴍᴇʀɪᴄᴀ
┃▢ʙʟᴀᴄᴋᴘɪɴᴋ
┃▢ꜱᴛᴀʀᴡᴀʀꜱ
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ᴇғғᴇᴛꜱ ᴅɪᴠᴇʀꜱ* ❏
┃▢ᴀʀᴇɴᴀ
┃▢ʜᴀᴄᴋᴇʀ
┃▢ʙᴇᴀʀʟᴏɢᴏ
┃▢ɢʀᴀғғɪᴛɪ
┃▢ɢʀᴀғғɪᴛɪᴠ2
┃▢ғᴜᴛᴜʀɪꜱᴛɪᴄ
┃▢ᴀᴍᴇʀɪᴄᴀ
┃▢ᴇʀᴀꜱᴇ
┃▢ғʀᴏꜱᴛ
╰━━━━━━━━━━━━━━━╯

⚠️ *ɴᴏᴛᴇ* : ᴄᴇʀᴛᴀɪɴꜱ ᴇғғᴇᴛꜱ ɴéᴄᴇꜱꜱɪᴛᴇɴᴛ
ᴅᴇᴜx ᴛᴇxᴛᴇꜱ ꜱéᴘᴀʀéꜱ ᴘᴀʀ |
ᴇx: ${userConfig.prefix}marvel texte1 | texte2
`;

        await sock.sendMessage(jid, { react: { text: '🎨', key: msg.key } });
        
     
        let imageUrl = userConfig.ephotoMenuImage;
        
        
        if (!imageUrl || !imageUrl.startsWith('http')) {
            console.log(`⚠️ [${phoneNumber}] URL image ephoto invalide, utilisation de l'image par défaut`);
            
            
            imageUrl = 'https://i.postimg.cc/bv94M6Lp/𝘎𝘦𝘵𝘰𝘶-𝘴𝘶𝘨𝘶𝘳𝘶.jpg';
            
           
            try {
                userConfigManager.updateUserConfig(phoneNumber, { 
                    ephotoMenuImage: imageUrl 
                });
                console.log(`✅ [${phoneNumber}] Image ephoto par défaut définie`);
            } catch (error) {
                console.error(`❌ [${phoneNumber}] Erreur mise à jour config ephoto:`, error.message);
            }
        }
        
        
        try {
            new URL(imageUrl);
        } catch (error) {
            console.log(`⚠️ [${phoneNumber}] URL image ephoto mal formée, utilisation de l'image par défaut`);
            imageUrl = 'https://i.postimg.cc/TYgh0jvH/Ryomen-Sukuna.jpg';
            
            try {
                userConfigManager.updateUserConfig(phoneNumber, { 
                    ephotoMenuImage: imageUrl 
                });
            } catch (updateError) {
                console.error(`❌ [${phoneNumber}] Erreur correction config ephoto:`, updateError.message);
            }
        }
        
        console.log(`🎨 [${phoneNumber}] Envoi ephotomenu avec image: ${imageUrl}`);
        
        try {
            
            await sock.sendMessage(jid, { 
                image: { url: imageUrl }, 
                caption: font(menuText) 
            });
            
            console.log(`✅ [${phoneNumber}] Ephotomenu envoyé avec succès`);
            
        } catch (imageError) {
            console.error(`❌ [${phoneNumber}] Erreur envoi image ephotomenu:`, imageError.message);
            
            
            await sock.sendMessage(jid, { 
                text: font(menuText) 
            });
            
            console.log(`✅ [${phoneNumber}] Ephotomenu envoyé en mode texte (fallback)`);
        }
    }
};