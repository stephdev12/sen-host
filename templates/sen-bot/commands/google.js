/**
 * 𝗦𝗘𝗡 Bot - Google AI Commands (Multilingual)
 */

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { isOwner } from '../lib/authHelper.js';
import lang from '../lib/languageManager.js';
import configs from '../configs.js';
import googleApiManager from '../lib/googleApiManager.js';

export async function addgapiCommand(sock, chatId, message, args) {
    try {
        if (!await isOwner(sock, message, configs)) {
            return sock.sendMessage(chatId, {
                text: lang.t('errors.ownerOnly')
            }, { quoted: message });
        }

        if (args.length === 0) {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.google.addgapi.usage')
            }, { quoted: message });
        }

        const apiKey = args[0];
        
        await sock.sendMessage(chatId, {
            react: { text: '🔑', key: message.key }
        });

        const isValid = await googleApiManager.testApiKey(apiKey);

        if (isValid) {
            googleApiManager.setApiKey(apiKey);
            
            await sock.sendMessage(chatId, {
                text: lang.t('commands.google.addgapi.success')
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: lang.t('commands.google.addgapi.invalid')
            }, { quoted: message });
        }

    } catch (error) {
        console.error('AddGAPI Error:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

export async function removegapiCommand(sock, chatId, message, args) {
    try {
        if (!await isOwner(sock, message, configs)) {
            return sock.sendMessage(chatId, {
                text: lang.t('errors.ownerOnly')
            }, { quoted: message });
        }

        googleApiManager.removeApiKey();
        
        await sock.sendMessage(chatId, {
            text: lang.t('commands.google.removegapi.success')
        }, { quoted: message });

    } catch (error) {
        console.error('RemoveGAPI Error:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

export async function geminiCommand(sock, chatId, message, args) {
    try {
        const client = googleApiManager.getClient();
        if (!client) {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.google.noApiKey')
            }, { quoted: message });
        }

        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.google.gemini.usage')
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🤖', key: message.key }
        });

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: query
        });

        const text = response.text;

        await sock.sendMessage(chatId, {
            text: lang.t('commands.google.gemini.response', { result: text })
        }, { quoted: message });

    } catch (error) {
        console.error('Gemini Error:', error);
        
        let errorMsg = lang.t('errors.generationFailed');
        
        if (error.message?.includes('quota') || error.message?.includes('429')) {
            errorMsg = lang.t('commands.google.quotaExceeded');
        } else if (error.message?.includes('invalid')) {
            errorMsg = lang.t('commands.google.invalidKey');
        }
        
        await sock.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });
    }
}

export async function visionCommand(sock, chatId, message, args) {
    try {
        const client = googleApiManager.getClient();
        if (!client) {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.google.noApiKey')
            }, { quoted: message });
        }

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = quoted?.imageMessage || message.message?.imageMessage;

        if (!imageMsg) {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.google.vision.usage')
            }, { quoted: message });
        }

        const query = args.join(' ') || lang.t('commands.google.vision.defaultQuery');

        await sock.sendMessage(chatId, {
            react: { text: '👁️', key: message.key }
        });

        const stream = await downloadContentFromMessage(imageMsg, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const base64Image = buffer.toString('base64');

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: query },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: base64Image
                            }
                        }
                    ]
                }
            ]
        });

        const text = response.text;

        await sock.sendMessage(chatId, {
            text: lang.t('commands.google.vision.response', { result: text })
        }, { quoted: message });

    } catch (error) {
        console.error('Vision Error:', error);
        
        let errorMsg = lang.t('errors.analysisFailed');
        
        if (error.message?.includes('quota') || error.message?.includes('429')) {
            errorMsg = lang.t('commands.google.quotaExceeded');
        }
        
        await sock.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });
    }
}

export async function nanogenCommand(sock, chatId, message, args) {
    try {
        const client = googleApiManager.getClient();
        if (!client) {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.google.noApiKey')
            }, { quoted: message });
        }

        const prompt = args.join(' ');
        if (!prompt) {
            return sock.sendMessage(chatId, {
                text: lang.t('commands.google.nanogen.usage')
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🍌', key: message.key }
        });

        await sock.sendMessage(chatId, {
            text: lang.t('commands.google.nanogen.generating')
        }, { quoted: message });

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: prompt
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                
                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: lang.t('commands.google.nanogen.success', { prompt })
                }, { quoted: message });
                return;
            }
        }

        await sock.sendMessage(chatId, {
            text: lang.t('commands.google.nanogen.noImage')
        }, { quoted: message });

    } catch (error) {
        console.error('Nano Banana Error:', error);
        
        let errorMsg = lang.t('errors.generationFailed');
        
        if (error.message?.includes('quota') || error.message?.includes('429')) {
            errorMsg = lang.t('commands.google.quotaExceeded');
        } else if (error.message?.includes('RESOURCE_EXHAUSTED')) {
            errorMsg = lang.t('commands.google.rateLimit');
        }
        
        await sock.sendMessage(chatId, {
            text: errorMsg
        }, { quoted: message });
    }
}

export async function gstatusCommand(sock, chatId, message, args) {
    try {
        const apiKey = googleApiManager.getApiKey();
        const hasKey = !!apiKey;

        const text = lang.t('commands.google.status.display', { 
            configured: hasKey ? lang.t('commands.google.status.yes') : lang.t('commands.google.status.no')
        });

        await sock.sendMessage(chatId, { text }, { quoted: message });

    } catch (error) {
        console.error('GStatus Error:', error);
        await sock.sendMessage(chatId, {
            text: lang.t('errors.commandFailed')
        }, { quoted: message });
    }
}

export default {
    addgapiCommand,
    removegapiCommand,
    geminiCommand,
    visionCommand,
    nanogenCommand,
    gstatusCommand
};