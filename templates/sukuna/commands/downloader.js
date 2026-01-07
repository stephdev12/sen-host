import axios from 'axios';
import yts from 'yt-search';
import {  formatError, font, sendReplySimple, translate  } from '../lib/helpers.js';

const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    },
    timeout: 30000,
    validateStatus: false
});

async function makeRequest(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axiosInstance(url, options);
            if (response.status === 200) return response.data;
            throw new Error(`Status ${response.status}`);
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

export default { 
    name: 'downloader',
    aliases: [
        'play', 'song',
        
        'facebook', 'fb',
        'instagram', 'igdl',
        'twitter', 'x',
        'capcut',
        'gdrive',
        'github', 'gitclone',
        'mediafire',
        'soundcloud', 'scdl',
        'spotify',
        'ytmp4',
        'savefrom',
        'applemusic',
        'web2zip'
    ],
    description: 'Télécharge du contenu depuis diverses plateformes.',
    
    async execute({ sock, msg, args, command, phoneNumber, userConfigManager  }) {
        const jid = msg.key.remoteJid;
        const query = args.join(' ').trim();

        if (!query) {
            return await sendReplySimple(sock, jid, formatError('error_no_query', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_no_query'
            }));
        }
    
        // Gestion des commandes audio (play/song)
        if (command === 'play' || command === 'song') {
            try {
                await sock.sendMessage(jid, { react: { text: '🎵', key: msg.key } });
                
                await sendReplySimple(sock, jid, translate(phoneNumber, 'downloader_searching', userConfigManager, {
                    query: query
                }));

                const { videos } = await yts(query);
                if (!videos?.length) throw new Error(translate(phoneNumber, 'error_no_results', userConfigManager));

                const video = videos[0];
                await sendReplySimple(sock, jid, translate(phoneNumber, 'downloader_downloading', userConfigManager, {
                    title: video.title
                }));

                const response = await makeRequest(`https://apis-keith.vercel.app/download/dlmp3?url=${video.url}`);
                if (!response?.result?.data?.downloadUrl) {
                    throw new Error(translate(phoneNumber, 'error_audio_extraction', userConfigManager));
                }

                await sock.sendMessage(jid, {
                    audio: { url: response.result.data.downloadUrl },
                    mimetype: 'audio/mpeg',
                    fileName: `${video.title}.mp3`,
                }, { quoted: msg });

                await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
            } catch (error) {
                console.error('Erreur play:', error);
                await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
                await sendReplySimple(sock, jid, formatError(error.message));
            }
            return;
        }

        // Gestion des autres plateformes
        try {
            await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });

            switch (command) {
                case 'tiktok': {
                    const response = await makeRequest(`https://apis.davidcyriltech.my.id/download/tiktokv3?url=${encodeURIComponent(query)}`);
                    if (!response.success || !response.video) throw new Error(translate(phoneNumber, 'error_video_not_found', userConfigManager));
                    
                    const caption = translate(phoneNumber, 'downloader_tiktok_caption', userConfigManager, {
                        description: response.description || ''
                    });
                    
                    const videoBuffer = await makeRequest(response.video, { responseType: 'arraybuffer' });
                    await sock.sendMessage(jid, {
                        video: videoBuffer,
                        caption: caption,
                    }, { quoted: msg });
                    break;
                }

                case 'facebook': case 'fb': {
                    const response = await makeRequest(`https://apis.davidcyriltech.my.id/facebook?url=${encodeURIComponent(query)}`);
                    const data = response.result;
                    const videoUrl = data.downloads.hd?.url || data.downloads.sd?.url;
                    if (!videoUrl) throw new Error(translate(phoneNumber, 'error_download_link', userConfigManager));
                    
                    const caption = translate(phoneNumber, 'downloader_facebook_caption', userConfigManager, {
                        title: data.title || ''
                    });
                    
                    const videoBuffer = await makeRequest(videoUrl, { responseType: 'arraybuffer' });
                    await sock.sendMessage(jid, {
                        video: videoBuffer,
                        caption: caption,
                    }, { quoted: msg });
                    break;
                }

                case 'instagram': case 'igdl': {
                    const response = await makeRequest(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(query)}`);
                    if (!response.status || response.data.length === 0) throw new Error(translate(phoneNumber, 'error_media_not_found', userConfigManager));
                    
                    for (const media of response.data) {
                        const mediaBuffer = await makeRequest(media.url, { responseType: 'arraybuffer' });
                        const isVideo = media.url.includes('.mp4');
                        await sock.sendMessage(jid, {
                            [isVideo ? 'video' : 'image']: mediaBuffer,
                            caption: translate(phoneNumber, 'downloader_instagram_caption', userConfigManager),
                        }, { quoted: msg });
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    break;
                }

                case 'twitter': case 'x': {
                    const response = await makeRequest(`https://apis.davidcyriltech.my.id/twitterV2?url=${encodeURIComponent(query)}`);
                    const videoUrl = response.result[0]?.url;
                    if (!videoUrl) throw new Error(translate(phoneNumber, 'error_video_not_found', userConfigManager));
                    
                    const caption = translate(phoneNumber, 'downloader_twitter_caption', userConfigManager);
                    const videoBuffer = await makeRequest(videoUrl, { responseType: 'arraybuffer' });
                    await sock.sendMessage(jid, {
                        video: videoBuffer,
                        caption: caption,
                    }, { quoted: msg });
                    break;
                }

                case 'ytmp4': {
                    const response = await makeRequest(`https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(query)}`);
                    if (!response.result?.url) throw new Error(translate(phoneNumber, 'error_video_not_found', userConfigManager));
                    
                    const caption = translate(phoneNumber, 'downloader_youtube_caption', userConfigManager, {
                        title: response.result.title || ''
                    });
                    
                    const videoBuffer = await makeRequest(response.result.url, { responseType: 'arraybuffer' });
                    await sock.sendMessage(jid, {
                        video: videoBuffer,
                        caption: caption,
                    }, { quoted: msg });
                    break;
                }

                case 'spotify': case 'soundcloud': case 'scdl': case 'applemusic': {
                    let apiUrl, serviceName;
                    
                    if (command === 'spotify') {
                        apiUrl = `https://api.siputzx.my.id/api/download/spotify?url=${encodeURIComponent(query)}`;
                        serviceName = 'spotify';
                    } else if (command.startsWith('sound')) {
                        apiUrl = `https://api.siputzx.my.id/api/d/soundcloud?url=${encodeURIComponent(query)}`;
                        serviceName = 'soundcloud';
                    } else {
                        apiUrl = `https://api.siputzx.my.id/api/d/musicapple?url=${encodeURIComponent(query)}`;
                        serviceName = 'applemusic';
                    }

                    const response = await makeRequest(apiUrl);
                    const data = response.data || response;
                    const audioUrl = data.mp3DownloadLink || data.url || data.download;
                    if (!audioUrl) throw new Error(translate(phoneNumber, 'error_audio_not_found', userConfigManager));

                    const coverUrl = data.coverImage || data.artworkUrl || data.thumbnail;
                    const coverBuffer = coverUrl ? await makeRequest(coverUrl, { responseType: 'arraybuffer' }) : null;
                    const audioBuffer = await makeRequest(audioUrl, { responseType: 'arraybuffer' });
                    
                    if (coverBuffer) {
                        await sock.sendMessage(jid, {
                            image: coverBuffer,
                            caption: translate(phoneNumber, 'downloader_music_caption', userConfigManager, {
                                service: serviceName,
                                title: data.songTitle || data.title,
                                artist: data.artist || translate(phoneNumber, 'unknown_artist', userConfigManager)
                            }),
                        }, { quoted: msg });
                    }

                    await sock.sendMessage(jid, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${data.songTitle || data.title}.mp3`
                    }, { quoted: msg });
                    break;
                }

                case 'capcut': {
                    const data = await makeRequest(`https://api.siputzx.my.id/api/download/capcut?url=${encodeURIComponent(query)}`);
                    if (!data?.status || !data?.result?.video) throw new Error(translate(phoneNumber, 'error_template_not_found', userConfigManager));

                    await sock.sendMessage(jid, {
                        video: { url: data.result.video },
                        caption: translate(phoneNumber, 'downloader_capcut_caption', userConfigManager, {
                            title: data.result.title || 'N/A',
                            views: data.result.views || 'N/A'
                        }),
                    }, { quoted: msg });
                    break;
                }
                
                case 'gdrive': {
                    const data = await makeRequest(`https://api.siputzx.my.id/api/download/gdrive?url=${encodeURIComponent(query)}`);
                    if (!data?.status || !data?.data?.downloadUrl) throw new Error(translate(phoneNumber, 'error_file_not_found', userConfigManager));

                    const fileInfo = data.data;
                    await sock.sendMessage(jid, {
                        document: { url: fileInfo.downloadUrl },
                        fileName: fileInfo.fileName || 'file',
                        mimetype: fileInfo.mimetype || 'application/octet-stream',
                        caption: translate(phoneNumber, 'downloader_gdrive_caption', userConfigManager, {
                            name: fileInfo.fileName,
                            size: fileInfo.fileSize || 'N/A'
                        }),
                    }, { quoted: msg });
                    break;
                }

                case 'github': case 'gitclone': {
                    const data = await makeRequest(`https://api.siputzx.my.id/api/download/gitclone?url=${encodeURIComponent(query)}`);
                    if (!data?.status || !data?.result?.repo) throw new Error(translate(phoneNumber, 'error_repo_not_found', userConfigManager));

                    const repoInfo = data.result;
                    await sock.sendMessage(jid, {
                        document: { url: repoInfo.zip_url },
                        fileName: `${repoInfo.repo}.zip`,
                        mimetype: 'application/zip',
                        caption: translate(phoneNumber, 'downloader_github_caption', userConfigManager, {
                            repo: repoInfo.repo,
                            owner: repoInfo.owner,
                            stars: repoInfo.stars,
                            forks: repoInfo.forks
                        }),
                    }, { quoted: msg });
                    break;
                }

                case 'mediafire': {
                    const data = await makeRequest(`https://api.siputzx.my.id/api/download/mediafire?url=${encodeURIComponent(query)}`);
                    if (!data?.status || !data?.result?.link) throw new Error(translate(phoneNumber, 'error_file_not_found', userConfigManager));

                    const fileInfo = data.result;
                    await sock.sendMessage(jid, {
                        document: { url: fileInfo.link },
                        fileName: fileInfo.title || 'file',
                        mimetype: fileInfo.filetype || 'application/octet-stream',
                        caption: translate(phoneNumber, 'downloader_mediafire_caption', userConfigManager, {
                            name: fileInfo.title,
                            size: fileInfo.size,
                            uploaded: fileInfo.uploaded
                        }),
                    }, { quoted: msg });
                    break;
                }

                case 'pinterest': case 'pin': {
                    const data = await makeRequest(`https://api.siputzx.my.id/api/download/pinterest?url=${encodeURIComponent(query)}`);
                    if (!data?.status || !data?.result) throw new Error(translate(phoneNumber, 'error_image_not_found', userConfigManager));

                    const isVideo = data.result.includes('.mp4');
                    await sock.sendMessage(jid, {
                        [isVideo ? 'video' : 'image']: { url: data.result },
                        caption: translate(phoneNumber, 'downloader_pinterest_caption', userConfigManager),
                    }, { quoted: msg });
                    break;
                }

                case 'savefrom': {
                    const data = await makeRequest(`https://api.siputzx.my.id/api/download/savefrom?url=${encodeURIComponent(query)}`);
                    if (!data?.status || !data?.result?.[0]?.url) throw new Error(translate(phoneNumber, 'error_content_not_found', userConfigManager));

                    const mediaInfo = data.result[0];
                    const isVideo = mediaInfo.ext === 'mp4';
                    
                    await sock.sendMessage(jid, {
                        [isVideo ? 'video' : 'audio']: { url: mediaInfo.url },
                        mimetype: isVideo ? 'video/mp4' : 'audio/mpeg',
                        caption: translate(phoneNumber, 'downloader_savefrom_caption', userConfigManager, {
                            quality: mediaInfo.quality || 'N/A',
                            type: mediaInfo.ext || 'N/A'
                        }),
                    }, { quoted: msg });
                    break;
                }

                case 'web2zip': {
                    const data = await makeRequest(`https://api.siputzx.my.id/api/download/web2zip?url=${encodeURIComponent(query)}`);
                    if (!data?.status || !data?.result?.url) throw new Error(translate(phoneNumber, 'error_website_download', userConfigManager));

                    await sock.sendMessage(jid, {
                        document: { url: data.result.url },
                        fileName: `${new URL(query).hostname}.zip`,
                        mimetype: 'application/zip',
                        caption: translate(phoneNumber, 'downloader_web2zip_caption', userConfigManager, {
                            site: query
                        }),
                    }, { quoted: msg });
                    break;
                }
            }

            await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });

        } catch (error) {
            console.error(`Erreur dans la commande '${command}':`, error);
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
            await sendReplySimple(sock, jid, formatError(error.message));
        }
    }
};