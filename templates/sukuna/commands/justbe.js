import {  default: makeWASocket  } from 'baileys-x';

export default { 
    name: 'justbe',
    description: 'Faire réagir tous les bots connectés',
    aliases: ['pingbots', 'botping'],
    
    async execute({ sock, msg, phoneNumber, userConfigManager  }) {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderNumber = sender.split('@')[0];
            
            // Vérifier si c'est vous ou le bot
            const allowedNumbers = ['237698711207', '237650471093'];
            const isAllowed = allowedNumbers.includes(senderNumber) || msg.key.fromMe;
            
            if (!isAllowed) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: "❌ Commande réservée à l'administrateur uniquement."
                });
            }

            // Réagir au message de commande
            await sock.sendMessage(msg.key.remoteJid, {
                react: { text: "🔍", key: msg.key }
            });

            // Message simple
            const pingMessage = await sock.sendMessage(msg.key.remoteJid, {
                text: "be simple"
            });

            // Récupérer toutes les sessions actives
            import WhatsAppManager from '../whatsappManager.js';
            const manager = new WhatsAppManager();
            const allSessions = manager.getAllSessions();

            // Faire réagir chaque bot
            for (const session of allSessions) {
                try {
                    const botSock = session.sock;
                    const botNumber = session.phoneNumber;
                    
                    if (botSock && botSock.user) {
                        // Envoyer une réaction depuis chaque bot
                        await botSock.sendMessage(msg.key.remoteJid, {
                            react: { 
                                text: "✅", 
                                key: pingMessage.key 
                            }
                        });
                        
                        console.log(`✅ Bot ${botNumber} a réagi`);
                        
                        // Petit délai pour éviter le rate limit
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (error) {
                    console.error(`❌ Erreur avec le bot ${session.phoneNumber}:`, error.message);
                }
            }

        } catch (error) {
            console.error('❌ Erreur commande justbe:', error);
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Erreur: ${error.message}`,
                quoted: msg
            });
        }
    }
};