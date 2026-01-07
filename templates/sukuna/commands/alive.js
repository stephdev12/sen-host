import {  sendReplySimple, translate  } from '../lib/helpers.js';

export default { 
    name: 'alive',
    description: 'Statut du bot',
    async execute({ sock, msg, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        const uptime = process.uptime();
        const hrs = Math.floor(uptime / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        
        const statusText = translate(phoneNumber, 'alive_status', userConfigManager, {
            hours: hrs,
            minutes: mins
        });
        
        await sendReplySimple(sock, jid, statusText, { 
            quoted: msg,
            phoneNumber,
            userConfigManager
        });
    }
};