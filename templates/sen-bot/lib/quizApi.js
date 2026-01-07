/**
 * 𝗦𝗘𝗡 Bot - Quiz API Integration
 * Open Trivia (EN) + Quiz API (FR)
 */

import axios from 'axios';
import chalk from 'chalk';

class QuizAPI {
    constructor() {
        // Clé API Quiz API (Gratuite - 100 req/jour)
        // Obtenir une clé sur: https://quizapi.io/clientarea/settings/token
        this.quizApiKey = process.env.QUIZ_API_KEY || 'YOUR_API_KEY_HERE';
    }

    /**
     * Open Trivia Database - Pour l'anglais
     * Mapping des catégories vers Open Trivia
     */
    getCategoryMapping(categoryKey) {
        const mapping = {
            'general': 9,      // General Knowledge
            'anime': 31,       // Anime & Manga
            'science': 17,     // Science & Nature
            'history': 23,     // History
            'geography': 22,   // Geography
            'sport': 21,       // Sports
            'movies': 11,      // Film
            'music': 12,       // Music
            'videogames': 15,  // Video Games
            'computers': 18    // Computers
        };
        return mapping[categoryKey] || 9;
    }

    /**
     * Récupérer des questions depuis Open Trivia (EN)
     */
    async fetchOpenTrivia(categoryKey, amount = 10) {
        try {
            console.log(chalk.cyan(`📡 Fetching ${amount} questions from Open Trivia...`));
            
            const categoryId = this.getCategoryMapping(categoryKey);
            const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&type=multiple`;
            
            const response = await axios.get(url);
            
            if (response.data.response_code !== 0) {
                console.log(chalk.red('❌ Open Trivia error'));
                return null;
            }
            
            const questions = response.data.results.map(q => {
                const allOptions = [
                    ...q.incorrect_answers.map(a => this.decodeHTML(a)),
                    this.decodeHTML(q.correct_answer)
                ];
                const shuffled = this.shuffleArray(allOptions);
                
                return {
                    q: this.decodeHTML(q.question),
                    options: shuffled,
                    answer: shuffled.indexOf(this.decodeHTML(q.correct_answer))
                };
            });
            
            console.log(chalk.green(`✅ Fetched ${questions.length} questions from Open Trivia`));
            return questions;
            
        } catch (error) {
            console.error(chalk.red('❌ Open Trivia error:'), error.message);
            return null;
        }
    }

    /**
     * Quiz API - Pour le français (NÉCESSITE CLÉ API)
     * Catégories disponibles: Linux, DevOps, Docker, Code, CMS, SQL, etc.
     */
    async fetchQuizAPI(categoryKey, amount = 10) {
        try {
            console.log(chalk.cyan(`📡 Fetching ${amount} questions from Quiz API...`));
            
            // Mapping des catégories (Quiz API est plutôt tech-oriented)
            const categoryMapping = {
                'computers': 'Code',
                'science': 'DevOps',
                'general': 'Linux'
            };
            
            const category = categoryMapping[categoryKey] || 'Code';
            const url = `https://quizapi.io/api/v1/questions?apiKey=${this.quizApiKey}&limit=${amount}&category=${category}`;
            
            const response = await axios.get(url);
            const data = response.data;
            
            if (!data || data.length === 0) {
                console.log(chalk.yellow('⚠️ No questions from Quiz API'));
                return null;
            }
            
            const questions = data.map(q => {
                // Filtrer les options non-null
                const options = Object.values(q.answers).filter(a => a !== null);
                
                // Trouver la bonne réponse
                const correctKey = Object.keys(q.correct_answers).find(k => 
                    q.correct_answers[k] === 'true'
                );
                const correctAnswerKey = correctKey.replace('_correct', '');
                const correctAnswer = q.answers[correctAnswerKey];
                
                return {
                    q: q.question,
                    options: options,
                    answer: options.indexOf(correctAnswer)
                };
            });
            
            console.log(chalk.green(`✅ Fetched ${questions.length} questions from Quiz API`));
            return questions;
            
        } catch (error) {
            console.error(chalk.red('❌ Quiz API error:'), error.message);
            return null;
        }
    }

    /**
     * Fonction principale: Récupérer des questions selon la langue
     */
    async getQuestions(categoryKey, lang, amount = 10) {
        console.log(chalk.magenta(`🎮 Getting quiz: category=${categoryKey}, lang=${lang}, amount=${amount}`));
        
        if (lang === 'en') {
            // Anglais = Open Trivia
            return await this.fetchOpenTrivia(categoryKey, amount);
        } else if (lang === 'fr') {
            // Français = Quiz API (si clé disponible)
            if (this.quizApiKey && this.quizApiKey !== 'YOUR_API_KEY_HERE') {
                return await this.fetchQuizAPI(categoryKey, amount);
            } else {
                console.log(chalk.yellow('⚠️ Quiz API key not configured, using local questions'));
                return null; // Utiliser les questions locales
            }
        }
        
        return null;
    }

    /**
     * Helper: Décoder les entités HTML
     */
    decodeHTML(html) {
        const entities = {
            '&quot;': '"',
            '&#039;': "'",
            '&apos;': "'",
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&rsquo;': "'",
            '&ldquo;': '"',
            '&rdquo;': '"',
            '&lsquo;': "'",
            '&hellip;': '...',
            '&ndash;': '–',
            '&mdash;': '—'
        };
        
        let text = html;
        for (const [entity, char] of Object.entries(entities)) {
            text = text.replace(new RegExp(entity, 'g'), char);
        }
        
        // Décoder les codes numériques
        text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
        
        return text;
    }

    /**
     * Helper: Mélanger un tableau
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

export default new QuizAPI();