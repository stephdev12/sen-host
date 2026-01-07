/**
 * 𝗦𝗘𝗡 Bot - AI Commands (Multilingual)
 */

import axios from 'axios';
import lang from '../lib/languageManager.js';

async function chatAI(sock, chatId, message, args, apiName, modelName) {
    const query = args.join(' ');
    if (!query) {
        return sock.sendMessage(chatId, { 
            text: lang.t('commands.ai.noQuery') 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });
        
        const url = `https://api.giftedtech.co.ke/api/ai/${apiName}?apikey=gifted&q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url);

        if (data.success) {
            let replyText = data.result;
            
            if (typeof replyText === 'object') {
                replyText = replyText.response || replyText.message || replyText.data || JSON.stringify(replyText);
            }

            const formattedMsg = lang.t('commands.ai.response', { 
                model: modelName, 
                result: replyText 
            });

            await sock.sendMessage(chatId, { 
                text: formattedMsg
            }, { quoted: message });
        }
    } catch (e) {
        console.error(e);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.apiError') 
        }, { quoted: message });
    }
}

export async function gpt4Command(sock, chatId, message, args) {
    await chatAI(sock, chatId, message, args, 'gpt', 'GPT-4');
}

export async function gpt4oCommand(sock, chatId, message, args) {
    await chatAI(sock, chatId, message, args, 'gpt4o', 'GPT-4o');
}

export async function mistralCommand(sock, chatId, message, args) {
    await chatAI(sock, chatId, message, args, 'mistral', 'Mistral AI');
}

export async function fluxCommand(sock, chatId, message, args) {
    const prompt = args.join(' ');

    if (!prompt) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.flux.noPrompt')
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });

        const apiUrl = `https://apiskeith.vercel.app/ai/flux?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        await sock.sendMessage(chatId, { 
            image: data,
            caption: lang.t('commands.flux.success', { prompt })
        }, { quoted: message });

    } catch (error) {
        console.error('Flux Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.generationFailed') 
        }, { quoted: message });
    }
}

export default { gpt4Command, gpt4oCommand, mistralCommand, fluxCommand };