// commands/ai.js
import axios from 'axios';
import {  font, sendReplySimple  } from '../lib/helpers.js';

// Configuration axios avec User-Agent
const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    },
    timeout: 30000,
    validateStatus: false
});

export default { 
    name: 'ai',
    aliases: [
        'gpt', 'gemini', 'andi', 'deepseek', 'gemma',
        'gita', 'llama', 'perplexity', 'bard', 'blackbox',
        'geminipro', 'lumin', 'mistral', 'venice', 'powerbrain',
        'gpt3', 'getliner', 'kimi', 'latukam', 'llamaturbo',
        'teachanything', 'felo', 'cici',
        'flux', 'magicstudio', 'dalle'
    ],
    description: 'Commandes IA (texte et image)',

    async execute({ sock, msg, args, command  }) {
        const jid = msg.key.remoteJid;
        const query = args.join(' ').trim();

        // Vérification de base
        if (!query) {
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key }});
            return await sendReplySimple(sock, jid, font(`❌ Veuillez fournir une question ou un prompt.\n\nExemple: .${command} qui es-tu ?`), { quoted: msg });
        }

        try {
            // Réaction initiale
            await sock.sendMessage(jid, { react: { text: '🤖', key: msg.key }});

            // En-tête et pied de page standards
            const header = font(`卍 *sᴜᴋᴜɴᴀ ɪᴀ* 卍\n\n`);
            const footer = font(`\n\n> ʙʏ sᴛᴇᴘʜᴅᴇᴠ`);

            // Gestion de la génération d'images
            if (['flux', 'magicstudio', 'dalle'].includes(command)) {
                try {
                    const apiUrl = command === 'dalle' 
                        ? `https://apis.davidcyriltech.my.id/ai/dalle?text=${encodeURIComponent(query)}`
                        : `https://api.siputzx.my.id/api/ai/${command}?prompt=${encodeURIComponent(query)}`;

                    const response = await axiosInstance.get(apiUrl, { responseType: 'arraybuffer' });
                    
                    await sock.sendMessage(jid, { 
                        image: response.data,
                        caption: font(`${header}ɪᴍᴀɢᴇ ɢéɴéʀéᴇ ᴘᴏᴜʀ :\n"${query}"${footer}`),
                        contextInfo: {
                            externalAdReply: {
                                title: "SUKUNA - XMD",
                                body: "BY STEPHDEV",
                                mediaType: 1,
                                showAdAttribution: true
                            }
                        }
                    }, { quoted: msg });

                    await sock.sendMessage(jid, { react: { text: '✨', key: msg.key }});
                    return;
                } catch (error) {
                    throw new Error('Erreur lors de la génération de l\'image');
                }
            }

            // Gestion de la génération de texte
            let answer;
            let references = [];

            try {
                switch(command) {
                    case 'gemini': {
                        const response = await axiosInstance.get(`https://api.dreaded.site/api/gemini2?text=${encodeURIComponent(query)}`);
                        answer = response.data?.response;
                        break;
                    }
                    case 'getliner': {
                        const response = await axiosInstance.get(`https://api.siputzx.my.id/api/ai/getliner?text=${encodeURIComponent(query)}`);
                        answer = response.data?.data?.answer;
                        references = response.data?.data?.references || [];
                        break;
                    }
                    // Autres modèles texte
                    case 'geminipro':
                    case 'lumin':
                    case 'mistral':
                    case 'venice':
                    case 'powerbrain':
                    case 'bard':
                    case 'blackbox':
                    case 'llama':
                    case 'perplexity': {
                        const apiPath = command === 'geminipro' ? 'gemini-pro' : command;
                        const paramName = ['perplexity'].includes(command) ? 'text' : 'content';
                        const response = await axiosInstance.get(`https://api.siputzx.my.id/api/ai/${apiPath}?${paramName}=${encodeURIComponent(query)}`);
                        answer = response.data?.data?.output || response.data?.data || response.data?.message;
                        break;
                    }
                    // Modèles spéciaux avec persona
                    case 'gemma':
                    case 'gpt':
                    case 'deepseek': {
                        const persona = 'Tu es Sukuna, un démon millénaire très puissant. Tu réponds avec sagesse mais aussi avec un certain dédain pour la faiblesse humaine.';
                        const response = await axiosInstance.get(`https://api.siputzx.my.id/api/ai/${command}?prompt=${encodeURIComponent(persona)}&message=${encodeURIComponent(query)}`);
                        answer = response.data?.data;
                        break;
                    }
                    // Autres modèles simples
                    default: {
                        const response = await axiosInstance.get(`https://api.siputzx.my.id/api/ai/${command}?content=${encodeURIComponent(query)}`);
                        answer = response.data?.data?.response || response.data?.data;
                    }
                }

                if (!answer || typeof answer !== 'string' || answer.trim() === '') {
                    throw new Error('Réponse invalide de l\'API');
                }

                let finalAnswer = `${header}*${command.toUpperCase()}*\n\n${answer}`;

                if (references.length > 0) {
                    finalAnswer += `\n\n*sᴏᴜʀᴄᴇs :*\n${references.slice(0, 3).map(ref => `• ${ref.title}`).join('\n')}`;
                }

                finalAnswer += footer;

                await sendReplySimple(sock, jid, font(finalAnswer), { quoted: msg });
                await sock.sendMessage(jid, { react: { text: '✨', key: msg.key }});

            } catch (aiError) {
                console.error(`Erreur API ${command}:`, aiError);
                throw new Error('Service IA temporairement indisponible');
            }

        } catch (error) {
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key }});
            await sendReplySimple(sock, jid, font(`❌ ${error.message || "Une erreur est survenue"}`), { quoted: msg });
        }
    }
};