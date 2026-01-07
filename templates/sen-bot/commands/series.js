/**
 * 𝗦𝗘𝗡 Bot - Series Commands (Multilingual)
 */

import axios from 'axios';
import StephUI from 'stephtech-ui';
import lang from '../lib/languageManager.js';

export async function serieCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    const query = args.join(' ');

    if (!query) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.serie.usage')
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🔎', key: message.key } });

        const searchUrl = `https://movieapi.giftedtech.co.ke/api/search/${encodeURIComponent(query)}`;
        const searchRes = await axios.get(searchUrl);

        if (!searchRes.data.success || !searchRes.data.results.items.length) {
            return await sock.sendMessage(chatId, { 
                text: lang.t('commands.serie.notFound') 
            }, { quoted: message });
        }

        const series = searchRes.data.results.items[0];
        const thumb = series.cover?.url || 'https://i.ibb.co/G5mJZxs/noposter.jpg';

        let bodyText = `> ${lang.t('commands.serie.rating')} : ${series.imdbRatingValue || 'N/A'}/10\n`;
        bodyText += `> ${lang.t('commands.serie.date')} : ${series.releaseDate || 'N/A'}\n`;
        bodyText += `> ${lang.t('commands.serie.subs')} : ${series.subtitles || 'Multi'}\n`;
        bodyText += `> ${lang.t('commands.serie.desc')} : ${series.description ? series.description.substring(0, 100) + '...' : '...'}`;

        await ui.carousel(chatId, {
            header: lang.t('commands.serie.header'),
            cards: [
                {
                    title: series.title.toUpperCase(),
                    body: bodyText,
                    image: thumb,
                    buttons: [
                        {
                            id: `dlserie ${series.title} | 1 | 1`,
                            text: lang.t('commands.serie.downloadButton'),
                            type: "quick_reply"
                        }
                    ]
                }
            ],
            quoted: message
        });

    } catch (error) {
        console.error('Serie Info Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.searchFailed') 
        }, { quoted: message });
    }
}

export async function dlSerieCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    
    const input = args.join(' ');
    const [query, season, episode, langCode] = input.split('|').map(i => i ? i.trim() : null);

    if (!query || !season || !episode) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.dlserie.usage')
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '⬇️', key: message.key } });

        const searchQuery = langCode ? `${query} ${langCode}` : query;
        const searchUrl = `https://movieapi.giftedtech.co.ke/api/search/${encodeURIComponent(searchQuery)}`;
        const searchRes = await axios.get(searchUrl);

        if (!searchRes.data.success || !searchRes.data.results.items.length) {
            return await sock.sendMessage(chatId, { 
                text: lang.t('commands.dlserie.notFound') 
            }, { quoted: message });
        }

        const series = searchRes.data.results.items[0];
        const seriesId = series.subjectId;

        const sourceUrl = `https://movieapi.giftedtech.co.ke/api/sources/${seriesId}?season=${season}&episode=${episode}`;
        const sourceRes = await axios.get(sourceUrl);
        const sources = sourceRes.data.results;

        if (!sources || sources.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: lang.t('commands.dlserie.noEpisode', { episode, season }) 
            }, { quoted: message });
        }

        let buttons = [];
        sources.forEach(source => {
            buttons.push({
                text: lang.t('commands.dlserie.downloadButton', { quality: source.quality }),
                url: source.download_url
            });
        });

        buttons = buttons.slice(0, 3);

        let caption = lang.t('commands.dlserie.info', {
            title: series.title,
            season: season,
            episode: episode,
            subs: series.subtitles || lang.t('commands.dlserie.noSubs')
        });

        await ui.urlButtons(chatId, {
            text: caption,
            footer: lang.t('commands.dlserie.footer'),
            image: series.cover?.url || 'https://i.ibb.co/G5mJZxs/noposter.jpg',
            buttons: buttons,
            quoted: message
        });

    } catch (error) {
        console.error('DL Serie Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.downloadFailed') 
        }, { quoted: message });
    }
}

export default { serieCommand, dlSerieCommand };