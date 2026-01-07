import {  font, formatSuccess, formatError  } from '../lib/helpers.js';

export default { 
    name: 'setmenu',
    aliases: ['menuversion', 'changemenu'],
    description: 'Changer la version du menu',
    usage: 'setmenu <version>',
    
    async execute({ sock, msg, args, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        
        if (!args[0]) {
            const versionsText = `🎨 *VERSIONS DISPONIBLES DU MENU* :

🟢 v1 
🔵 v2 
🟣 v3 
🟠 v4 
⚫ v5 

📝 Utilisation: ${userConfigManager.getUserConfig(phoneNumber).prefix}setmenu v2`;
            
            return await sock.sendMessage(jid, { 
                text: font(versionsText) 
            }, { quoted: msg });
        }
        
        const version = args[0].toLowerCase();
        const validVersions = ['v1', 'v2', 'v3', 'v4', 'v5'];
        
        if (!validVersions.includes(version)) {
            return await sock.sendMessage(jid, { 
                text: formatError(`Version "${version}" invalide! Utilisez: ${validVersions.join(', ')}`) 
            }, { quoted: msg });
        }
        
        try {
            // Mettre à jour la configuration utilisateur
            userConfigManager.updateUserConfig(phoneNumber, { 
                menuVersion: version 
            });
            
            const successMessage = formatSuccess(`✅ Version du menu changée en *${version.toUpperCase()}* !\n\nUtilisez la commande *menu* pour voir le nouveau design.`);
            
            await sock.sendMessage(jid, { 
                text: font(successMessage) 
            }, { quoted: msg });
            
            console.log(`🎨 [${phoneNumber}] Version menu changée: ${version}`);
            
        } catch (error) {
            console.error(`❌ [${phoneNumber}] Erreur changement version menu:`, error.message);
            
            await sock.sendMessage(jid, { 
                text: formatError('Erreur lors du changement de version du menu') 
            }, { quoted: msg });
        }
    }
};