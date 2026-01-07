import {  font  } from '../lib/helpers.js';

export default { 
    name: 'menu',
    aliases: ['help', 'commands'],
    description: 'Affiche le menu des commandes',
    
    async execute({ sock, msg, config, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        const userConfig = userConfigManager.getUserConfig(phoneNumber);
        
        // Récupérer la version du menu (v1 par défaut)
        const menuVersion = userConfig.menuVersion || 'v1';
        
        let menuText;
        
        // ===== VERSION 1 - CLASSIQUE =====
        if (menuVersion === 'v1') {
            menuText = `

╭━━━━━━━━━━━━━━━✦
┃   ❏ _*${userConfig.botName}*_ - 𝙈𝘿 ❏
┃    *ᴍᴀᴋᴇ ʙʏ ꜱᴛᴇᴘʜᴅᴇᴠ*
╰━━━━━━━━━━━━━━━✦

╭◇ *ᴘʀᴏꜰɪʟ* ◇
┃❍ ᴜꜱᴇʀ : ${userConfig.botName} 
┃❍ ᴘʀᴇғɪx : ${userConfig.prefix} 
╰❍

╭━━━❏ *menu* ❏
┃▢ᴇᴘʜᴏᴛᴏᴍᴇɴᴜ
┃▢ᴍᴇɴᴜ
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ɢᴇɴᴇʀᴀʟ* ❏
┃▢ᴘɪɴɢ
┃▢setmenu v1/v2/..
┃▢mode
┃▢ꜱᴇᴛᴘʀᴇꜰɪx
┃▢ꜱᴇᴛname
┃▢ꜱᴇᴛmenuimage
┃▢ꜱᴇᴛephotoimage
┃▢ꜱᴇᴛlang
┃▢ꜱᴇᴛwelcomeimage
┃▢ᴀʟɪᴠᴇ
┃▢autowrite
┃▢autostatus
┃▢save
┃▢url
┃▢getpp
┃▢link
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ᴘᴇʀꜱᴏ* ❏
┃▢ꜱᴛᴏʀᴇ [ɴᴏᴍ]
┃▢ᴅᴇʟ [ᴛʏᴘᴇ] [ɴᴏᴍ]
┃▢ʟɪꜱᴛ
┃▢ᴀᴅ [ɴᴏᴍ]
┃▢ꜱᴅ [ɴᴏᴍ]
┃▢ꜱᴛɪᴄᴋᴇʀ [ᴍᴏᴛ]
┃▢ᴛᴀᴋᴇ
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ɢʀᴏᴜᴘᴇ* ❏
┃▢ᴀᴅᴅ [ɴᴜᴍéʀᴏ]
┃▢ᴋɪᴄᴋ [@ᴜsᴇʀ]
┃▢ᴘʀᴏᴍᴏᴛᴇ [@ᴜsᴇʀ]
┃▢ᴅᴇᴍᴏᴛᴇ [@ᴜsᴇʀ]
┃▢ᴘᴜʀɢᴇ
┃▢ɢɴᴀᴍᴇ [ᴛᴇxᴛᴇ]
┃▢ɢᴅᴇsᴄ [ᴛᴇxᴛᴇ]
┃▢ɢʀᴏᴜᴘʟɪɴᴋ
┃▢ʟᴏᴄᴋ / ᴜɴʟᴏᴄᴋ
┃▢ᴛᴀɢᴀʟʟ [ᴍᴇssᴀɢᴇ]
┃▢ᴛᴀɢ
┃▢ᴀntidemote
┃▢ᴀntipromote
╰━━━━━━━━━━━━━━━╯

╭━━━❏ *ᴘʀᴏᴘ* ❏
┃▢ᴡᴇʟᴄᴏᴍᴇ [ᴏɴ/ᴏғғ]
┃▢ɢᴏᴏᴅʙʏᴇ [ᴏɴ/ᴏғғ]
┃▢ꜱᴇᴛwelcome
┃▢ꜱᴇᴛgoodbye
┃▢ꜱᴇᴛantilink
┃▢ᴀɴᴛɪʟɪɴᴋ [ᴏɴ/ᴏғғ]
┃▢ᴀɴᴛɪᴛᴀɢ
┃▢ᴀɴᴛɪᴍᴇɴᴛɪᴏɴ
┃▢autoreact
┃▢ᴀɴᴛɪᴅᴇʟᴇᴛᴇ
┃▢ᴠᴠ
┃▢gsettings
┃▢warnings
┃▢ᴀɴᴛɪꜱᴘᴀᴍ [ᴏɴ/ᴏғғ]
╰━━━━━━━━━━━━━━━╯

╭❏ *ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛꜱ* ❏
┃▢ᴘʟᴀʏ [ᴛᴇxᴛᴇ]
┃▢ʏᴛᴍᴘ4 [ʟɪᴇɴ]
┃▢ᴛɪᴋᴛᴏᴋ [ʟɪᴇɴ]
┃▢ɪɴsᴛᴀɢʀᴀᴍ [ʟɪᴇɴ]
┃▢ғᴀᴄᴇʙᴏᴏᴋ [ʟɪᴇɴ]
┃▢ᴛᴡɪᴛᴛᴇʀ [ʟɪᴇɴ]
┃▢ᴘɪɴᴛᴇʀᴇsᴛ [ʟɪᴇɴ]
┃▢ᴄᴀᴘᴄᴜᴛ [ʟɪᴇɴ]
┃▢sᴘᴏᴛɪғʏ [ʟɪᴇɴ]
┃▢sᴏᴜɴᴅᴄʟᴏᴜᴅ [ʟɪᴇɴ]
┃▢ᴀᴘᴘʟᴇᴍᴜsɪᴄ [ʟɪᴇɴ]
┃▢ᴍᴇᴅɪᴀғɪʀᴇ [ʟɪᴇɴ]
┃▢ɢᴅʀɪᴠᴇ [ʟɪᴇɴ]
┃▢ɢɪᴛʜᴜʙ [ʟɪᴇɴ]
╰━━━━━━━━━━━━━━━╯
`;
        }
        
        // ===== VERSION 2 - MODERNE =====
        else if (menuVersion === 'v2') {
            menuText = `
╭─❏ ${userConfig.botName} - 𝙈𝘿 ❏
│ 𝙱𝚢 𝚂𝚝𝚎𝚙𝚑𝙳𝚎𝚟
╰─────────────❏

╭─── ✦ ᴘʀᴏғɪʟ ✦
│• 𝚄𝚜𝚎𝚛: ${userConfig.botName}
│• 𝙿𝚛𝚎𝚏𝚒𝚡: ${userConfig.prefix}
╰─────────────❏

╭─── ✦ ɢᴇɴᴇʀᴀʟ ✦
│• ping
│• setmenu
│• menu
│• ephotomenu
│• mode
│• setprefix
│• setname
│• setmenuimage
│• setephotoimage
│• setlang
│• setwelcomeimage
│• alive
│• autowrite
│• autostatus
│• save
│• url
│• getpp
│• link
│• justbe
╰─────────────❏

╭─── ✦ ᴘᴇʀꜱᴏ ✦
│• store [nom]
│• del [type] [nom]
│• list
│• ad [nom]
│• sd [nom]
│• sticker [mot]
│• take
╰─────────────❏

╭─── ✦ ɢʀᴏᴜᴘᴇ ✦
│• add [numéro]
│• kick [@user]
│• promote [@user]
│• demote [@user]
│• purge
│• gname [texte]
│• gdesc [texte]
│• grouplink
│• lock / unlock
│• tagall [message]
│• tag
│• antidemote
│• antipromote
╰─────────────❏

╭─── ✦ ᴘʀᴏᴘ ✦
│• welcome [on/off]
│• goodbye [on/off]
│• setwelcome
│• setgoodbye
│• setantilink
│• antilink [on/off]
│• antitag
│• antimention
│• autoreact
│• antidelete
│• vv
│• gsettings
│• warnings
│• antispam [on/off]
╰─────────────❏

╭─── ✦ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛꜱ ✦
│• play [texte]
│• ytmp4 [lien]
│• tiktok [lien]
│• instagram [lien]
│• facebook [lien]
│• twitter [lien]
│• pinterest [lien]
│• capcut [lien]
│• spotify [lien]
│• soundcloud [lien]
│• applemusic [lien]
│• mediafire [lien]
│• gdrive [lien]
│• github [lien]
╰─────────────❏          `;
        }
        
        // ===== VERSION 3 - MINIMALISTE =====
        else if (menuVersion === 'v3') {
            menuText = `
╭━❖ ${userConfig.botName} | ᴮᵞ ˢᵗᵉᵖʰᴰᵉᵛ ❖━╮

╭─ PROFILE ─╮
│ USER     : ${userConfig.botName}
│ PREFIX   : ${userConfig.prefix}
╰──────────╯

╭─ GENERAL ─╮
│ ping
│ setmenu
│ menu
│ ephotomenu
│ mode
│ setprefix
│ setname
│ setmenuimage
│ setephotoimage
│ setlang
│ setwelcomeimage
│ alive
│ autowrite
│ autostatus
│ save
│ url
│ getpp
│ link
│ justbe
╰───────────╯

╭─ PERSONNALISÉ ─╮
│ store [nom]
│ del [type] [nom]
│ list
│ ad [nom]
│ sd [nom]
│ sticker [mot]
│ take
╰────────────────╯

╭─ GROUPE ─╮
│ add [numéro]
│ kick [@user]
│ promote [@user]
│ demote [@user]
│ purge
│ gname [texte]
│ gdesc [texte]
│ grouplink
│ lock / unlock
│ tagall [message]
│ tag
│ antidemote
│ antipromote
╰──────────╯

╭─ PROTECTION ─╮
│ welcome [on/off]
│ goodbye [on/off]
│ setwelcome
│ setgoodbye
│ setantilink
│ antilink [on/off]
│ antitag
│ antimention
│ autoreact
│ antidelete
│ vv
│ gsettings
│ warnings
│ antispam [on/off]
╰───────────────╯

╭─ TÉLÉCHARGEMENTS ─╮
│ play [texte]
│ ytmp4 [lien]
│ tiktok [lien]
│ instagram [lien]
│ facebook [lien]
│ twitter [lien]
│ pinterest [lien]
│ capcut [lien]
│ spotify [lien]
│ soundcloud [lien]
│ applemusic [lien]
│ mediafire [lien]
│ gdrive [lien]
│ github [lien]
╰──────────────────╯
            `;
        }
        
        // ===== VERSION 4 - INTERACTIF =====
        else if (menuVersion === 'v4') {
            menuText = `
⬣ 卍 ${userConfig.botName} | 𝙼𝙳 卍 ⬣
     ʙʏ ꜱᴛᴇᴘʜᴅᴇᴠ

⬣ ◇ ᴘʀᴏғɪʟ ◇
  ◇ ᴜꜱᴇʀ : ${userConfig.botName}
  ◇ ᴘʀᴇғɪx : ${userConfig.prefix}

⬣ ◇ ɢᴇɴᴇʀᴀʟ ◇
  ◇ ping
  ◇ menu
  ◇ setmenu
  ◇ ephotomenu
  ◇ mode
  ◇ setprefix
  ◇ setname
  ◇ setmenuimage
  ◇ setephotoimage
  ◇ setlang
  ◇ setwelcomeimage
  ◇ alive
  ◇ autowrite
  ◇ autostatus
  ◇ save
  ◇ url
  ◇ getpp
  ◇ link
  ◇ justbe

⬣ ◇ ᴘᴇʀꜱᴏ ◇
  ◇ store [nom]
  ◇ del [type] [nom]
  ◇ list
  ◇ ad [nom]
  ◇ sd [nom]
  ◇ sticker [mot]
  ◇ take

⬣ ◇ ɢʀᴏᴜᴘᴇ ◇
  ◇ add [numéro]
  ◇ kick [@user]
  ◇ promote [@user]
  ◇ demote [@user]
  ◇ purge
  ◇ gname [texte]
  ◇ gdesc [texte]
  ◇ grouplink
  ◇ lock / unlock
  ◇ tagall [message]
  ◇ tag
  ◇ antipromote
  ◇ antidemote

⬣ ◇ ᴘʀᴏᴘ ◇
  ◇ welcome [on/off]
  ◇ goodbye [on/off]
  ◇ setwelcome
  ◇ setgoodbye
  ◇ setantilink
  ◇ antilink [on/off]
  ◇ antitag
  ◇ antimention
  ◇ autoreact
  ◇ antidelete
  ◇ vv
  ◇ gsettings
  ◇ warnings
  ◇ antispam [on/off]

⬣ ◇ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛꜱ ◇
  ◇ play [texte]
  ◇ ytmp4 [lien]
  ◇ tiktok [lien]
  ◇ instagram [lien]
  ◇ facebook [lien]
  ◇ twitter [lien]
  ◇ pinterest [lien]
  ◇ capcut [lien]
  ◇ spotify [lien]
  ◇ soundcloud [lien]
  ◇ applemusic [lien]
  ◇ mediafire [lien]
  ◇ gdrive [lien]
  ◇ github [lien]

⬣ 卍 ᴇɴᴅ ᴏғ ᴍᴇɴᴜ 卍 ⬣
            `;
        }
        
        // ===== VERSION 5 - DARK MODE =====
        else if (menuVersion === 'v5') {
            menuText = `
╭── ${userConfig.botName} ──╮
│         𝘿𝙚𝙫 : 𝚂𝚝𝚎𝚙𝚑𝙳𝚎𝚟             │
╰──────────────────╯

╭⟡ ᴘʀᴏꜰɪʟ
│- ᴜꜱᴇʀ : ${userConfig.botName}
│- ᴘʀᴇғɪx : ${userConfig.prefix}
╰───────────

╭⟡ ɢᴇɴᴇʀᴀʟ
│- ping
│- menu
│- setmenu
│- ephotomenu
│- mode
│- setprefix
│- setname
│- setmenuimage
│- setephotoimage
│- setlang
│- setwelcomeimage
│- alive
│- autowrite
│- autostatus
│- save
│- url
│- getpp
│- link
│- justbe
╰───────────

╭⟡ ᴘᴇʀꜱᴏ
│- store [nom]
│- del [type] [nom]
│- list
│- ad [nom]
│- sd [nom]
│- sticker [mot]
│- take
╰───────────

╭⟡ ɢʀᴏᴜᴘᴇ
│- add [numéro]
│- kick [@user]
│- promote [@user]
│- demote [@user]
│- purge
│- gname [texte]
│- gdesc [texte]
│- grouplink
│- lock / unlock
│- tagall [message]
│- tag
│- antidemote
│- antipromote
╰───────────

╭⟡ ᴘʀᴏᴘ
│- welcome [on/off]
│- goodbye [on/off]
│- setwelcome
│- setgoodbye
│- setantilink
│- antilink [on/off]
│- antitag
│- antimention
│- autoreact
│- antidelete
│- vv
│- gsettings
│- warnings
│- antispam [on/off]
╰───────────

╭⟡ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛꜱ
│- play [texte]
│- ytmp4 [lien]
│- tiktok [lien]
│- instagram [lien]
│- facebook [lien]
│- twitter [lien]
│- pinterest [lien]
│- capcut [lien]
│- spotify [lien]
│- soundcloud [lien]
│- applemusic [lien]
│- mediafire [lien]
│- gdrive [lien]
│- github [lien]
╰───────────
            `;
        }

        await sock.sendMessage(jid, { react: { text: '📖', key: msg.key } });
        
        let imageUrl = userConfig.menuImage;
        
        if (!imageUrl || !imageUrl.startsWith('http')) {
            imageUrl = 'https://i.postimg.cc/8cKZBMZw/lv-0-20251105211949.jpg';
            try {
                userConfigManager.updateUserConfig(phoneNumber, { 
                    menuImage: imageUrl 
                });
            } catch (error) {
                console.error(`❌ [${phoneNumber}] Erreur mise à jour config menu:`, error.message);
            }
        }
        
        try {
            new URL(imageUrl);
        } catch (error) {
            imageUrl = 'https://i.postimg.cc/8cKZBMZw/lv-0-20251105211949.jpg';
        }
        
        console.log(`📱 [${phoneNumber}] Envoi menu version ${menuVersion} avec image`);
        
        try {
            await sock.sendMessage(jid, { 
                image: { url: imageUrl }, 
                caption: font(menuText) 
            }, { quoted: null });
            
        } catch (imageError) {
            await sock.sendMessage(jid, { 
                text: font(menuText) 
            }, { quoted: null });
        }
         
        if (!jid.endsWith('@newsletter')) {
            try {
                await sock.sendMessage(jid, { 
                    audio: { url: "./media/menu.mp3" }, 
                    mimetype: 'audio/mpeg' 
                });
            } catch (audioError) {
                console.error(`❌ [${phoneNumber}] Erreur envoi audio menu:`, audioError.message);
            }
        }
    }
};