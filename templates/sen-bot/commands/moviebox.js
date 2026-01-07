
/**
 * 𝗦𝗘𝗡 Bot - MovieBox Commands (CAROUSEL VERSION)
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import StephUI from 'stephtech-ui';
import helper from './movieboxHelper.js';

// ========================================
// 📺 SERIEINFO - Recherche de série
// ========================================
export async function serieinfoCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    const query = args.join(' ');

    if (!query) {
        return await sock.sendMessage(chatId, { 
            text: '📺 Usage: .serieinfo <série name>\nEx: .serieinfo Wednesday' 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

        const result = await helper.searchSeries(query);

        if (!result.success) {
            return await sock.sendMessage(chatId, { 
                text: `❌ ${result.message}` 
            }, { quoted: message });
        }

        // Limiter à 6 résultats (max carousel)
        const series = result.data.slice(0, 6);
        const cards = [];

        for (const serie of series) {
            const thumbnail = serie.cover?.url || 'https://i.ibb.co/G5mJZxs/noposter.jpg';
            
            let bodyText = `> Rating : ${serie.imdbRatingValue || 'N/A'}\n`;
            bodyText += `> Date : ${serie.releaseDate || 'N/A'}\n`;
            bodyText += `> Subtitles : ${helper.formatSubtitles(serie.subtitles)}`;

            cards.push({
                title: serie.title.toUpperCase(),
                body: bodyText,
                image: thumbnail,
                buttons: [
                    {
                        id: `seriedl_${serie.subjectId}`,
                        text: "📥 Download",
                        type: "quick_reply"
                    }
                ]
            });
        }

        await ui.carousel(chatId, {
            header: "📺 SERIES SEARCH",
            cards: cards,
            quoted: message
        });

    } catch (error) {
        console.error('SerieInfo Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + error.message }, { quoted: message });
    }
}

// ========================================
// 📥 DESERVDL - Téléchargement de série
// ========================================
export async function deservdlCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);

    // Format: .deservdl <subjectId> | <season> | <episode> | [subtitle]
    const parts = args.join(' ').split('|').map(p => p.trim());

    if (parts.length < 3) {
        return await sock.sendMessage(chatId, { 
            text: '📥 Usage: .deservdl <ID> | <season> | <episode> | [subtitle]\n\nEx: .deservdl 9028867555875774472 | 1 | 1\nEx: .deservdl 9028867555875774472 | 1 | 1 | français' 
        }, { quoted: message });
    }

    const subjectId = parts[0];
    const season = parts[1];
    const episode = parts[2];
    const subtitle = parts[3] || null;

    try {
        await sock.sendMessage(chatId, { react: { text: '⬇️', key: message.key } });

        // Récupérer les infos de la série
        const infoResult = await helper.getSerieInfo(subjectId);
        if (!infoResult.success) {
            return await sock.sendMessage(chatId, { text: '❌ Serie not found' }, { quoted: message });
        }

        const serieInfo = infoResult.data;

        // Récupérer les sources
        const sourcesResult = await helper.getSerieSources(subjectId, season, episode, subtitle);
        if (!sourcesResult.success) {
            return await sock.sendMessage(chatId, { text: '❌ No sources available' }, { quoted: message });
        }

        const sources = sourcesResult.sources;
        const thumbnail = serieInfo.cover?.url || 'https://i.ibb.co/G5mJZxs/noposter.jpg';

        // Construction du message
        let caption = `*SERIE DOWNLOADER*\n\n`;
        caption += `> *Name* : ${serieInfo.title}\n`;
        caption += `> *Season* : ${season}\n`;
        caption += `> *Episode* : ${episode}\n`;
        
        if (subtitle && sourcesResult.selectedCaption) {
            caption += `> *Subtitle* : ${sourcesResult.selectedCaption.lanName}`;
        } else if (subtitle) {
            caption += `> *Subtitle* : Not found`;
        }

        // Boutons de téléchargement (max 3 boutons)
        const buttons = sources.slice(0, 3).map(source => ({
            text: `📥 ${source.quality}p`,
            url: source.downloadUrl
        }));

        await ui.urlButtons(chatId, {
            text: caption,
            footer: "SEN DOWNLOADER",
            image: thumbnail,
            buttons: buttons,
            quoted: message
        });

    } catch (error) {
        console.error('DeservDL Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + error.message }, { quoted: message });
    }
}

// ========================================
// 🎬 MOVIESEARCH - Recherche de film
// ========================================
export async function moviesearchCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    const query = args.join(' ');

    if (!query) {
        return await sock.sendMessage(chatId, { 
            text: '🎬 Usage: .moviesearch <movie name>\nEx: .moviesearch Avatar' 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

        const result = await helper.searchMovie(query);

        if (!result.success) {
            return await sock.sendMessage(chatId, { 
                text: `❌ ${result.message}` 
            }, { quoted: message });
        }

        // Limiter à 6 résultats (max carousel)
        const movies = result.data.slice(0, 6);
        const cards = [];

        for (const movie of movies) {
            const thumbnail = movie.cover?.url || 'https://i.ibb.co/G5mJZxs/noposter.jpg';
            
            let bodyText = `> Rating : ${movie.imdbRatingValue || 'N/A'}\n`;
            bodyText += `> Date : ${movie.releaseDate || 'N/A'}\n`;
            bodyText += `> Duration : ${helper.formatDuration(movie.duration)}\n`;
            bodyText += `> Subtitles : ${helper.formatSubtitles(movie.subtitles)}`;

            cards.push({
                title: movie.title.toUpperCase(),
                body: bodyText,
                image: thumbnail,
                buttons: [
                    {
                        id: `moviedl_${movie.subjectId}`,
                        text: "📥 Download",
                        type: "quick_reply"
                    }
                ]
            });
        }

        await ui.carousel(chatId, {
            header: "🎬 MOVIES SEARCH",
            cards: cards,
            quoted: message
        });

    } catch (error) {
        console.error('MovieSearch Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + error.message }, { quoted: message });
    }
}

// ========================================
// 📥 MOVIEDL - Téléchargement de film
// ========================================
export async function moviedlCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);

    // Format: .moviedl <subjectId> | [subtitle]
    const parts = args.join(' ').split('|').map(p => p.trim());

    if (parts.length < 1) {
        return await sock.sendMessage(chatId, { 
            text: '📥 Usage: .moviedl <ID> | [subtitle]\n\nEx: .moviedl 8906247916759695608\nEx: .moviedl 8906247916759695608 | français' 
        }, { quoted: message });
    }

    const subjectId = parts[0];
    const subtitle = parts[1] || null;

    try {
        await sock.sendMessage(chatId, { react: { text: '⬇️', key: message.key } });

        // Récupérer les infos du film
        const infoResult = await helper.getSerieInfo(subjectId);
        if (!infoResult.success) {
            return await sock.sendMessage(chatId, { text: '❌ Movie not found' }, { quoted: message });
        }

        const movieInfo = infoResult.data;

        // Récupérer les sources
        const sourcesResult = await helper.getMovieSources(subjectId, subtitle);
        if (!sourcesResult.success) {
            return await sock.sendMessage(chatId, { text: '❌ No sources available' }, { quoted: message });
        }

        const sources = sourcesResult.sources;
        const thumbnail = movieInfo.cover?.url || 'https://i.ibb.co/G5mJZxs/noposter.jpg';

        // Construction du message
        let caption = `*MOVIE DOWNLOADER*\n\n`;
        caption += `> *Name* : ${movieInfo.title}\n`;
        
        if (subtitle && sourcesResult.selectedCaption) {
            caption += `> *Subtitle* : ${sourcesResult.selectedCaption.lanName}`;
        } else if (subtitle) {
            caption += `> *Subtitle* : Not found`;
        }

        // Boutons de téléchargement (max 3 boutons)
        const buttons = sources.slice(0, 3).map(source => ({
            text: `📥 ${source.quality}p`,
            url: source.downloadUrl
        }));

        await ui.urlButtons(chatId, {
            text: caption,
            footer: "SEN DOWNLOADER",
            image: thumbnail,
            buttons: buttons,
            quoted: message
        });

    } catch (error) {
        console.error('MovieDL Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + error.message }, { quoted: message });
    }
}

// ========================================
// 🔥 TRENDING - Contenus populaires
// ========================================
export async function trendingCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);

    try {
        await sock.sendMessage(chatId, { react: { text: '🔥', key: message.key } });

        const result = await helper.getTrending();

        if (!result.success) {
            return await sock.sendMessage(chatId, { 
                text: `❌ ${result.message}` 
            }, { quoted: message });
        }

        // Limiter à 6 contenus (max carousel)
        const trending = result.data.slice(0, 6);
        const cards = [];

        for (const item of trending) {
            const type = item.subjectType === 1 ? 'movie' : 'serie';
            const thumbnail = item.cover?.url || 'https://i.ibb.co/G5mJZxs/noposter.jpg';
            
            let bodyText = `> Rating : ${item.imdbRatingValue || 'N/A'}\n`;
            bodyText += `> Date : ${item.releaseDate || 'N/A'}\n`;
            bodyText += `> Subtitles : ${helper.formatSubtitles(item.subtitles)}`;

            cards.push({
                title: item.title.toUpperCase(),
                body: bodyText,
                image: thumbnail,
                buttons: [
                    {
                        id: `${type}dl_${item.subjectId}`,
                        text: "📥 Download",
                        type: "quick_reply"
                    }
                ]
            });
        }

        await ui.carousel(chatId, {
            header: "🔥 TRENDING NOW",
            cards: cards,
            quoted: message
        });

    } catch (error) {
        console.error('Trending Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + error.message }, { quoted: message });
    }
}

export default { 
    serieinfoCommand, 
    deservdlCommand, 
    moviesearchCommand, 
    moviedlCommand,
    trendingCommand 
};