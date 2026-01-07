/**
 * 𝗦𝗘𝗡 Bot - MovieBox Helper
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import axios from 'axios';

const BASE_URL = 'https://cdn2.cineverse.name.ng/api';

class MovieBoxHelper {
    
    /**
     * Recherche une série par nom
     */
    async searchSeries(query) {
        try {
            const url = `${BASE_URL}/search/${encodeURIComponent(query)}`;
            const { data } = await axios.get(url);
            
            if (!data.status || data.status !== 'success') {
                return { success: false, message: 'API Error' };
            }
            
            // Filtrer uniquement les séries (subjectType: 2)
            const series = data.data.items.filter(item => item.subjectType === 2);
            
            if (series.length === 0) {
                return { success: false, message: 'No series found' };
            }
            
            return { success: true, data: series };
            
        } catch (error) {
            console.error('Search Error:', error.message);
            return { success: false, message: 'Network error' };
        }
    }
    
    /**
     * Recherche un film par nom
     */
    async searchMovie(query) {
        try {
            const url = `${BASE_URL}/search/${encodeURIComponent(query)}`;
            const { data } = await axios.get(url);
            
            if (!data.status || data.status !== 'success') {
                return { success: false, message: 'API Error' };
            }
            
            // Filtrer uniquement les films (subjectType: 1)
            const movies = data.data.items.filter(item => item.subjectType === 1);
            
            if (movies.length === 0) {
                return { success: false, message: 'No movies found' };
            }
            
            return { success: true, data: movies };
            
        } catch (error) {
            console.error('Search Error:', error.message);
            return { success: false, message: 'Network error' };
        }
    }
    
    /**
     * Récupère les infos détaillées d'une série
     */
    async getSerieInfo(subjectId) {
        try {
            const url = `${BASE_URL}/info/${subjectId}`;
            const { data } = await axios.get(url);
            
            if (!data.status || data.status !== 'success') {
                return { success: false, message: 'API Error' };
            }
            
            return { success: true, data: data.data.subject };
            
        } catch (error) {
            console.error('Info Error:', error.message);
            return { success: false, message: 'Network error' };
        }
    }
    
    /**
     * Récupère les liens de téléchargement pour une série
     */
    async getSerieSources(subjectId, season, episode, subtitle = null) {
        try {
            let url = `${BASE_URL}/sources/${subjectId}?season=${season}&episode=${episode}`;
            const { data } = await axios.get(url);
            
            if (!data.status || data.status !== 'success') {
                return { success: false, message: 'No sources available' };
            }
            
            const sources = data.data.processedSources || [];
            const captions = data.data.captions || [];
            
            // Filtrer les sous-titres si demandé
            let selectedCaption = null;
            if (subtitle) {
                selectedCaption = captions.find(cap => 
                    cap.lanName.toLowerCase().includes(subtitle.toLowerCase()) ||
                    cap.lan.toLowerCase() === subtitle.toLowerCase()
                );
            }
            
            return { 
                success: true, 
                sources: sources,
                captions: captions,
                selectedCaption: selectedCaption
            };
            
        } catch (error) {
            console.error('Sources Error:', error.message);
            return { success: false, message: 'Network error' };
        }
    }
    
    /**
     * Récupère les liens de téléchargement pour un film
     */
    async getMovieSources(subjectId, subtitle = null) {
        try {
            const url = `${BASE_URL}/sources/${subjectId}`;
            const { data } = await axios.get(url);
            
            if (!data.status || data.status !== 'success') {
                return { success: false, message: 'No sources available' };
            }
            
            const sources = data.data.processedSources || [];
            const captions = data.data.captions || [];
            
            // Filtrer les sous-titres si demandé
            let selectedCaption = null;
            if (subtitle) {
                selectedCaption = captions.find(cap => 
                    cap.lanName.toLowerCase().includes(subtitle.toLowerCase()) ||
                    cap.lan.toLowerCase() === subtitle.toLowerCase()
                );
            }
            
            return { 
                success: true, 
                sources: sources,
                captions: captions,
                selectedCaption: selectedCaption
            };
            
        } catch (error) {
            console.error('Sources Error:', error.message);
            return { success: false, message: 'Network error' };
        }
    }
    
    /**
     * Récupère les contenus trending
     */
    async getTrending() {
        try {
            const url = `${BASE_URL}/trending`;
            const { data } = await axios.get(url);
            
            if (!data.status || data.status !== 'success') {
                return { success: false, message: 'API Error' };
            }
            
            return { success: true, data: data.data.subjectList };
            
        } catch (error) {
            console.error('Trending Error:', error.message);
            return { success: false, message: 'Network error' };
        }
    }
    
    /**
     * Formate les sous-titres disponibles
     */
    formatSubtitles(subtitles) {
        if (!subtitles || subtitles === '') return 'None';
        return subtitles.split(',').slice(0, 5).join(', ') + (subtitles.split(',').length > 5 ? '...' : '');
    }
    
    /**
     * Formate la durée en heures/minutes
     */
    formatDuration(seconds) {
        if (!seconds) return 'N/A';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
}

export default new MovieBoxHelper();