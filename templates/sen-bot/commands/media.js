/**
 * 𝗦𝗘𝗡 Bot - Media Commands (Multilingual)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { isOwner } from '../lib/authHelper.js';
import lang from '../lib/languageManager.js';
import configs from '../configs.js';

const MEDIA_BASE_DIR = './data/user_media';

const ensureDir = async (userId) => {
    const cleanId = userId.split('@')[0].split(':')[0];
    const userDir = path.join(MEDIA_BASE_DIR, cleanId);
    try { 
        await fs.access(userDir); 
    } catch { 
        await fs.mkdir(userDir, { recursive: true }); 
    }
    return userDir;
};

export async function stickerCommand(sock, chatId, message, args) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMsg = quoted || message.message;
        
        const imageMsg = targetMsg?.imageMessage;
        const videoMsg = targetMsg?.videoMessage;
        const stickerMsg = targetMsg?.stickerMessage;

        if (!imageMsg && !videoMsg && !stickerMsg) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.sticker.noMedia') 
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { 
            react: { text: '🎨', key: message.key }
        });

        let buffer;
        
        if (stickerMsg) {
            const stream = await downloadContentFromMessage(stickerMsg, 'sticker');
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
        } else {
            const type = imageMsg ? 'image' : 'video';
            const stream = await downloadContentFromMessage(imageMsg || videoMsg, type);
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
        }

        let pack = configs.packname || 'SEN Bot';
        let author = configs.author || 'SEN';
        
        if (args.length > 0) {
            const split = args.join(' ').split('|');
            pack = split[0]?.trim() || pack;
            author = split[1]?.trim() || author;
        }

        const sticker = new Sticker(buffer, {
            pack: pack,
            author: author,
            type: StickerTypes.FULL,
            quality: 60
        });

        await sock.sendMessage(chatId, await sticker.toMessage(), { quoted: message });

    } catch (error) {
        console.error('Sticker Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.stickerFailed') 
        }, { quoted: message });
    }
}

export async function storeCommand(sock, chatId, message, args) {
    try {
        if (!await isOwner(sock, message, configs)) return;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted || (!quoted.audioMessage && !quoted.videoMessage)) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.store.usage') 
            }, { quoted: message });
        }

        const name = args[0];
        if (!name) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.store.noName') 
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { 
            react: { text: '💾', key: message.key }
        });
        
        const sender = message.key.participant || message.key.remoteJid;
        const userDir = await ensureDir(sender);
        
        const isVideo = !!quoted.videoMessage;
        const ext = isVideo ? '.mp4' : '.mp3';
        const filePath = path.join(userDir, name.toLowerCase() + ext);

        const stream = await downloadContentFromMessage(
            quoted.videoMessage || quoted.audioMessage, 
            isVideo ? 'video' : 'audio'
        );
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        await fs.writeFile(filePath, buffer);
        
        await sock.sendMessage(chatId, { 
            text: lang.t('commands.store.success', { 
                name, 
                type: ext.replace('.', '').toUpperCase() 
            }) 
        }, { quoted: message });

    } catch (error) {
        console.error('Store Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.saveFailed') 
        }, { quoted: message });
    }
}

export async function adCommand(sock, chatId, message, args) {
    try {
        const name = args[0];
        if (!name) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.ad.usage') 
            }, { quoted: message });
        }
        
        if (!await isOwner(sock, message, configs)) return;

        const sender = message.key.participant || message.key.remoteJid;
        const userDir = await ensureDir(sender);
        
        const mp3Path = path.join(userDir, name.toLowerCase() + '.mp3');
        
        try {
            const fileBuffer = await fs.readFile(mp3Path);
            
            await sock.sendMessage(chatId, { 
                react: { text: '🎵', key: message.key }
            });

            await sock.sendMessage(chatId, { 
                audio: fileBuffer, 
                mimetype: 'audio/mpeg', 
                ptt: false 
            }, { quoted: message });

        } catch (error) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.ad.notFound', { name }) 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('AD Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.playFailed') 
        }, { quoted: message });
    }
}

export async function vdCommand(sock, chatId, message, args) {
    try {
        const name = args[0];
        if (!name) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.vd.usage') 
            }, { quoted: message });
        }
        
        if (!await isOwner(sock, message, configs)) return;

        const sender = message.key.participant || message.key.remoteJid;
        const userDir = await ensureDir(sender);
        
        const mp4Path = path.join(userDir, name.toLowerCase() + '.mp4');
        
        try {
            const fileBuffer = await fs.readFile(mp4Path);
            
            await sock.sendMessage(chatId, { 
                react: { text: '🎬', key: message.key }
            });

            const isPtv = args.includes('-c');
            
            await sock.sendMessage(chatId, { 
                video: fileBuffer, 
                caption: `🎬 ${name}`,
                ptv: isPtv 
            }, { quoted: message });

        } catch (error) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.vd.notFound', { name }) 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('VD Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.playFailed') 
        }, { quoted: message });
    }
}

export async function listMediaCommand(sock, chatId, message, args) {
    try {
        const sender = message.key.participant || message.key.remoteJid;
        const userDir = await ensureDir(sender);
        const files = await fs.readdir(userDir);

        if (files.length === 0) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.listMedia.empty') 
            }, { quoted: message });
        }
        
        if (!await isOwner(sock, message, configs)) return;

        let text = lang.t('commands.listMedia.header') + '\n\n';
        files.forEach((f, i) => {
            text += `${i + 1}. ${f}\n`;
        });
        
        await sock.sendMessage(chatId, { text }, { quoted: message });

    } catch (error) {
        console.error('List Media Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.listFailed') 
        }, { quoted: message });
    }
}

export async function deleteMediaCommand(sock, chatId, message, args) {
    try {
        if (!await isOwner(sock, message, configs)) return;

        const name = args[0];
        if (!name) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.deleteMedia.usage') 
            }, { quoted: message });
        }

        const sender = message.key.participant || message.key.remoteJid;
        const userDir = await ensureDir(sender);
        
        let deleted = false;
        
        try { 
            await fs.unlink(path.join(userDir, name + '.mp3')); 
            deleted = true; 
        } catch {}
        
        try { 
            await fs.unlink(path.join(userDir, name + '.mp4')); 
            deleted = true; 
        } catch {}

        if (deleted) {
            await sock.sendMessage(chatId, { 
                text: lang.t('commands.deleteMedia.success', { name }) 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: lang.t('commands.deleteMedia.notFound', { name }) 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Delete Media Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.deleteFailed') 
        }, { quoted: message });
    }
}

export default { 
    stickerCommand, 
    storeCommand, 
    adCommand, 
    vdCommand, 
    listMediaCommand, 
    deleteMediaCommand 
};