/**
 * 𝗦𝗘𝗡 Bot - Auto Respond Manager (LID Compatible)
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const AUTO_RESPOND_FILE = './data/auto_respond.json';

class AutoRespondManager {
    constructor() {
        this.ensureDataFile();
    }

    ensureDataFile() {
        const dir = path.dirname(AUTO_RESPOND_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(AUTO_RESPOND_FILE)) {
            const defaultData = {
                enabled: false,
                response: null
            };
            fs.writeFileSync(AUTO_RESPOND_FILE, JSON.stringify(defaultData, null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(AUTO_RESPOND_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading auto respond file:', error);
            return { enabled: false, response: null };
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(AUTO_RESPOND_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing auto respond file:', error);
        }
    }

    setEnabled(enabled) {
        const data = this.readData();
        data.enabled = enabled;
        this.writeData(data);
    }

    isEnabled() {
        const data = this.readData();
        return data.enabled || false;
    }

    setResponse(responseData) {
        const data = this.readData();
        data.response = responseData;
        this.writeData(data);
    }

    getResponse() {
        const data = this.readData();
        return data.response;
    }

    clearResponse() {
        const data = this.readData();
        data.response = null;
        this.writeData(data);
    }

    /**
     * Normalise un JID (enlève le device ID et les parties inutiles)
     */
    normalizeJid(jid) {
        if (!jid) return null;
        // Enlever le device ID (ex: 237694530506:42@s.whatsapp.net -> 237694530506@s.whatsapp.net)
        return jid.split(':')[0].split('@')[0];
    }

    /**
     * Compare deux JIDs en tenant compte des LID et PN
     * Utilise le store LID/PN de Baileys pour la conversion
     */
    async compareJids(sock, jid1, jid2) {
        const normalized1 = this.normalizeJid(jid1);
        const normalized2 = this.normalizeJid(jid2);
        
        // Comparaison directe des numéros normalisés
        if (normalized1 === normalized2) {
            console.log(chalk.green(`✅ Direct match: ${normalized1} === ${normalized2}`));
            return true;
        }
        
        try {
            const store = sock.signalRepository?.lidMapping;
            if (store) {
                // Essayer de récupérer le PN pour le LID1
                const pn1 = await store.getPNForLID(jid1);
                if (pn1 && this.normalizeJid(pn1) === normalized2) {
                    console.log(chalk.green(`✅ LID->PN match: ${jid1} -> ${pn1} === ${jid2}`));
                    return true;
                }
                
                // Essayer de récupérer le PN pour le LID2
                const pn2 = await store.getPNForLID(jid2);
                if (pn2 && this.normalizeJid(pn2) === normalized1) {
                    console.log(chalk.green(`✅ LID->PN match: ${jid2} -> ${pn2} === ${jid1}`));
                    return true;
                }
                
                // Essayer de récupérer le LID pour le PN1
                const lid1 = await store.getLIDForPN(jid1);
                if (lid1 && this.normalizeJid(lid1) === normalized2) {
                    console.log(chalk.green(`✅ PN->LID match: ${jid1} -> ${lid1} === ${jid2}`));
                    return true;
                }
                
                // Essayer de récupérer le LID pour le PN2
                const lid2 = await store.getLIDForPN(jid2);
                if (lid2 && this.normalizeJid(lid2) === normalized1) {
                    console.log(chalk.green(`✅ PN->LID match: ${jid2} -> ${lid2} === ${jid1}`));
                    return true;
                }
            }
        } catch (error) {
            console.error(chalk.red('Error comparing LID/PN:'), error.message);
        }
        
        console.log(chalk.yellow(`⚠️ No match: ${jid1} !== ${jid2}`));
        return false;
    }

    /**
     * Vérifie si un message contient une mention du bot owner
     * Compatible avec LID et PN
     */
    async isMentioned(sock, message, ownerJid) {
        try {
            const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (mentions.length === 0) {
                return false;
            }

            console.log(chalk.cyan(`🔍 Checking mentions...`));
            console.log(chalk.cyan(`   Owner JID: ${ownerJid}`));
            console.log(chalk.cyan(`   Mentions: ${mentions.join(', ')}`));

            // Vérifier chaque mention
            for (const mentionedJid of mentions) {
                const isMatch = await this.compareJids(sock, mentionedJid, ownerJid);
                if (isMatch) {
                    console.log(chalk.green(`✅ Owner mentioned!`));
                    return true;
                }
            }

            console.log(chalk.yellow(`⚠️ Owner not in mentions`));
            return false;

        } catch (error) {
            console.error(chalk.red('Error checking mentions:'), error.message);
            return false;
        }
    }

    /**
     * Envoie la réponse automatique
     */
    async sendAutoResponse(sock, chatId, message) {
        const response = this.getResponse();
        
        if (!response || !response.type) {
            console.log(chalk.yellow('⚠️ No auto response configured'));
            return;
        }

        try {
            console.log(chalk.cyan(`📤 Sending auto response (${response.type})...`));

            const buffer = response.content ? Buffer.from(response.content, 'base64') : null;

            switch (response.type) {
                case 'text':
                    await sock.sendMessage(chatId, {
                        text: response.content
                    }, { quoted: message });
                    break;

                case 'image':
                    await sock.sendMessage(chatId, {
                        image: buffer,
                        caption: response.caption || ''
                    }, { quoted: message });
                    break;

                case 'video':
                    await sock.sendMessage(chatId, {
                        video: buffer,
                        caption: response.caption || '',
                        ptv: response.ptv || false
                    }, { quoted: message });
                    break;

                case 'audio':
                    await sock.sendMessage(chatId, {
                        audio: buffer,
                        mimetype: 'audio/mpeg',
                        ptt: response.ptt || false
                    }, { quoted: message });
                    break;

                case 'sticker':
                    await sock.sendMessage(chatId, {
                        sticker: buffer
                    }, { quoted: message });
                    break;

                default:
                    console.log(chalk.yellow(`⚠️ Unknown response type: ${response.type}`));
            }

            console.log(chalk.green(`✅ Auto response sent (${response.type})`));

        } catch (error) {
            console.error(chalk.red('❌ Error sending auto response:'), error.message);
        }
    }
}

export default new AutoRespondManager();