/**
 * 𝗦𝗘𝗡 Bot - YouTube Commands (Multilingual)
 */

import yts from 'yt-search';
import axios from 'axios';
import StephUI from 'stephtech-ui';
import lang from '../lib/languageManager.js';
import chalk from 'chalk';

export async function iytSearchCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    const query = args.join(' ');

    if (!query) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('commands.youtube.noQuery') 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🍎', key: message.key } });

        // Use new API directly
        const apiUrl = `https://apis.davidcyril.name.ng/song?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.result) {
            return sock.sendMessage(chatId, { 
                text: lang.t('commands.youtube.noResults') 
            }, { quoted: message });
        }

        const video = data.result;

        await ui.buttons(chatId, {
            text: lang.t('commands.youtube.info', {
                title: video.title,
                author: video.creator || 'Unknown',
                duration: video.duration
            }),
            footer: lang.t('commands.youtube.footer'),
            image: video.thumbnail,
            buttons: [
                { 
                    id: `ytmp3_${video.video_url}`, 
                    text: lang.t('commands.youtube.audioButton')
                },
                { 
                    id: `ytmp4_${video.video_url}`, 
                    text: lang.t('commands.youtube.videoButton')
                }
            ],
            quoted: message
        });

    } catch (error) {
        console.error('iYT Error:', error);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.searchFailed') 
        }, { quoted: message });
    }
}

export async function ytSearchCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    const query = args.join(' ');

    if (!query) {
        return sock.sendMessage(chatId, { 
            text: lang.t('commands.youtube.noQuery') 
        });
    }
    
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
        return ytVideoCommand(sock, chatId, message, [query]);
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });
        const searchResult = await yts(query);
        const videos = searchResult.videos.slice(0, 6);

        const cards = videos.map(video => {
            let imageUrl = video.thumbnail;
            
            if (imageUrl.includes('i.ytimg.com') || imageUrl.includes('i9.ytimg.com')) {
                const videoId = video.videoId || video.url.split('v=')[1]?.split('&')[0];
                if (videoId) {
                    imageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }
            }
            
            return {
                title: video.title.substring(0, 50).toUpperCase(),
                body: `⏱️ ${video.timestamp} | 👤 ${video.author.name}`,
                image: imageUrl,
                buttons: [
                    { 
                        id: `ytmp3_${video.url}`, 
                        text: lang.t('commands.youtube.audioButton'), 
                        type: "quick_reply" 
                    },
                    { 
                        id: `ytmp4_${video.url}`, 
                        text: lang.t('commands.youtube.videoButton'), 
                        type: "quick_reply" 
                    }
                ]
            };
        });

        await ui.carousel(chatId, { 
            header: lang.t('commands.youtube.searchHeader'), 
            cards: cards, 
            quoted: message 
        });
    } catch (error) {
        console.error(chalk.red('Error in ytSearchCommand:'), error.message);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.searchFailed') 
        }, { quoted: message });
    }
}

async function getFileSize(url) {
    try {
        const response = await axios.head(url, { timeout: 10000 });
        const contentLength = response.headers['content-length'];
        return contentLength ? parseInt(contentLength) : 0;
    } catch (error) {
        console.error(chalk.red('Error getting file size:'), error.message);
        return 0;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export async function ytAudioCommand(sock, chatId, message, args) {
    const url = Array.isArray(args) ? args[0] : args;
    if (!url) return;
    
    try {
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        
        const apiUrl = `https://apis.davidcyril.name.ng/song?query=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);
        
        if (!data.status || !data.result) throw new Error('API Fail');
        
        const song = data.result;

        await sock.sendMessage(chatId, {
            audio: { url: song.audio.download_url },
            mimetype: 'audio/mpeg',
            contextInfo: { 
                externalAdReply: { 
                    title: song.title, 
                    body: lang.t('commands.youtube.audioCaption'), 
                    thumbnailUrl: song.thumbnail, 
                    mediaType: 1, 
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: message });
        
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        
    } catch (e) { 
        console.error(chalk.red('Error in ytAudioCommand:'), e.message);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.downloadFailed') 
        }); 
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

export async function ytVideoCommand(sock, chatId, message, args) {
    const url = Array.isArray(args) ? args[0] : args;
    if (!url) return;
    
    try {
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        
        const apiUrl = `https://apis.davidcyril.name.ng/song?query=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);
        
        if (!data.status || !data.result) throw new Error('API Failed');
        
        const video = data.result;
        
        await sock.sendMessage(chatId, { 
            video: { url: video.video.download_url }, 
            caption: lang.t('commands.youtube.videoCaption', { 
                title: video.title, 
                size: video.video.quality || 'Unknown' 
            }), 
            gifPlayback: false 
        }, { quoted: message });
        
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        
    } catch (e) { 
        console.error(chalk.red('Error in ytVideoCommand:'), e.message);
        await sock.sendMessage(chatId, { 
            text: lang.t('errors.downloadFailed') 
        }); 
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

export default { ytSearchCommand, ytAudioCommand, ytVideoCommand, iytSearchCommand };