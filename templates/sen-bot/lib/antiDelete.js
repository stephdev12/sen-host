import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { writeFile } from 'fs/promises';
import settings from './settingsManager.js';
import lang from './languageManager.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messageStore = new Map();
const TEMP_MEDIA_DIR = path.join(process.cwd(), 'temp', 'antidelete');

// Ensure tmp dir exists
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

// Function to clean temp folder if size exceeds 200MB
const cleanTempFolder = () => {
    try {
        if (!fs.existsSync(TEMP_MEDIA_DIR)) return;
        const files = fs.readdirSync(TEMP_MEDIA_DIR);
        let totalSize = 0;
        for (const file of files) {
            totalSize += fs.statSync(path.join(TEMP_MEDIA_DIR, file)).size;
        }

        if (totalSize > 200 * 1024 * 1024) {
            for (const file of files) {
                fs.unlinkSync(path.join(TEMP_MEDIA_DIR, file));
            }
            console.log('🧹 AntiDelete temp folder cleaned');
        }
    } catch (err) {
        console.error('Temp cleanup error:', err);
    }
};

setInterval(cleanTempFolder, 60 * 1000);

class AntiDelete {
    constructor() {
        this.socket = null;
    }

    init(socket) {
        this.socket = socket;
    }

    async storeMessage(message) {
        try {
            const isAntidelete = settings.get('antidelete');
            if (!isAntidelete) return;
            if (!message.key?.id || message.key.remoteJid === 'status@broadcast') return;

            const messageId = message.key.id;
            let content = '';
            let mediaType = '';
            let mediaPath = '';

            const sender = message.key.participant || message.key.remoteJid;

            // Media Handling
            const msg = message.message?.viewOnceMessageV2?.message || 
                        message.message?.viewOnceMessage?.message || 
                        message.message;

            if (!msg) return;

            if (msg.conversation) content = msg.conversation;
            else if (msg.extendedTextMessage?.text) content = msg.extendedTextMessage.text;
            else if (msg.imageMessage) {
                mediaType = 'image';
                content = msg.imageMessage.caption || '';
                const buffer = await downloadContentFromMessage(msg.imageMessage, 'image');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
                await writeFile(mediaPath, buffer);
            } else if (msg.videoMessage) {
                mediaType = 'video';
                content = msg.videoMessage.caption || '';
                const buffer = await downloadContentFromMessage(msg.videoMessage, 'video');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
                await writeFile(mediaPath, buffer);
            } else if (msg.stickerMessage) {
                mediaType = 'sticker';
                const buffer = await downloadContentFromMessage(msg.stickerMessage, 'sticker');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
                await writeFile(mediaPath, buffer);
            } else if (msg.audioMessage) {
                mediaType = 'audio';
                const buffer = await downloadContentFromMessage(msg.audioMessage, 'audio');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp3`);
                await writeFile(mediaPath, buffer);
            }

            messageStore.set(messageId, {
                content,
                mediaType,
                mediaPath,
                sender,
                chatId: message.key.remoteJid,
                timestamp: new Date()
            });

            // Limit store size to 1000 messages
            if (messageStore.size > 1000) {
                const firstKey = messageStore.keys().next().value;
                const old = messageStore.get(firstKey);
                if (old?.mediaPath && fs.existsSync(old.mediaPath)) fs.unlinkSync(old.mediaPath);
                messageStore.delete(firstKey);
            }

        } catch (err) {
            console.error('AntiDelete store error:', err);
        }
    }

    async handleRevoke(revocationMessage) {
        try {
            const isAntidelete = settings.get('antidelete');
            if (!isAntidelete) return;

            const protocolMsg = revocationMessage.message?.protocolMessage;
            if (!protocolMsg || protocolMsg.type !== 0) return; // 0 = REVOKE

            const messageId = protocolMsg.key.id;
            const original = messageStore.get(messageId);
            if (!original) return;

            const deletedBy = revocationMessage.key.participant || revocationMessage.key.remoteJid;
            // Ne pas signaler si c'est le bot lui-même
            if (revocationMessage.key.fromMe) return;

            const time = original.timestamp.toLocaleTimeString();
            const text = lang.t('antidelete.deletedMessage', {
                sender: original.sender.split('@')[0],
                time: time,
                content: original.content || (original.mediaType ? `[${original.mediaType.toUpperCase()}]` : 'Type inconnu')
            });

            // Envoyer le rapport au propriétaire (Mode silencieux/Privé)
            const ownerNumber = this.socket.user.id.split(':')[0] + '@s.whatsapp.net';
            
            await this.socket.sendMessage(ownerNumber, { 
                text, 
                mentions: [original.sender, deletedBy] 
            }); // Pas de quoted message car on est en DM

            // Envoyer le média si existant
            if (original.mediaType && fs.existsSync(original.mediaPath)) {
                const mediaOptions = {
                    caption: `*Média récupéré de @${original.sender.split('@')[0]}*`,
                    mentions: [original.sender]
                };

                if (original.mediaType === 'image') await this.socket.sendMessage(ownerNumber, { image: { url: original.mediaPath }, ...mediaOptions });
                else if (original.mediaType === 'video') await this.socket.sendMessage(ownerNumber, { video: { url: original.mediaPath }, ...mediaOptions });
                else if (original.mediaType === 'sticker') await this.socket.sendMessage(ownerNumber, { sticker: { url: original.mediaPath } });
                else if (original.mediaType === 'audio') await this.socket.sendMessage(ownerNumber, { audio: { url: original.mediaPath }, mimetype: 'audio/mp4' });

                // Supprimer après envoi
                try { fs.unlinkSync(original.mediaPath); } catch {}
            }

            messageStore.delete(messageId);

        } catch (err) {
            console.error('AntiDelete handle error:', err);
        }
    }
}

export default new AntiDelete();