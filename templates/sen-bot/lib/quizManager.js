/**
 * 𝗦𝗘𝗡 Bot - Quiz Manager 
 */
import lang from './languageManager.js';
import chalk from 'chalk';

class QuizManager {
    constructor() {
        this.games = new Map();
    }

    createLobby(groupId, categoryKey, sock) {
        console.log(chalk.cyan(`🎮 Creating lobby for group: ${groupId}, category: ${categoryKey}`));
        
        if (this.games.has(groupId)) {
            console.log(chalk.yellow('⚠️ Game already exists for this group'));
            return false;
        }

        this.games.set(groupId, {
            state: 'lobby',
            category: categoryKey,
            players: [],
            questionIndex: 0,
            scores: {},
            answers: {}, // Pour suivre qui a répondu
            questionTimer: null,
            sock: sock
        });
        
        console.log(chalk.green('✅ Lobby created successfully'));
        return true;
    }

    addPlayer(groupId, userId) {
        console.log(chalk.cyan(`👤 Adding player: ${userId} to group: ${groupId}`));
        
        const game = this.games.get(groupId);
        if (!game) {
            console.log(chalk.yellow('⚠️ No game found'));
            return false;
        }
        
        if (game.state !== 'lobby') {
            console.log(chalk.yellow(`⚠️ Game state is: ${game.state}, not lobby`));
            return false;
        }

        if (!game.players.includes(userId)) {
            game.players.push(userId);
            game.scores[userId] = 0;
            console.log(chalk.green(`✅ Player added. Total players: ${game.players.length}`));
            return true;
        }
        
        console.log(chalk.yellow('⚠️ Player already in game'));
        return false;
    }

    startGame(groupId) {
        console.log(chalk.cyan(`🚀 Starting game for group: ${groupId}`));
        
        const game = this.games.get(groupId);
        if (!game) {
            console.log(chalk.red('❌ No game found'));
            return false;
        }

        if (game.players.length === 0) {
            console.log(chalk.yellow('⚠️ No players in lobby'));
            this.endGame(groupId);
            return false;
        }

        game.state = 'playing';
        console.log(chalk.green(`✅ Game state changed to: playing with ${game.players.length} players`));
        
        return true;
    }

    prepareQuestion(groupId) {
        console.log(chalk.cyan(`📝 Preparing question for group: ${groupId}`));
        
        const game = this.games.get(groupId);
        if (!game) {
            console.log(chalk.red('❌ No game found'));
            return null;
        }

        console.log(chalk.cyan(`Current question index: ${game.questionIndex}`));
        console.log(chalk.cyan(`Category: ${game.category}`));
        console.log(chalk.cyan(`Using API: ${game.useAPI}`));

        // Si on utilise l'API, prendre les questions pré-chargées
        if (game.useAPI && game.apiQuestions) {
            if (game.questionIndex >= game.apiQuestions.length) {
                console.log(chalk.yellow('⚠️ No more API questions'));
                return null;
            }
            
            const qData = game.apiQuestions[game.questionIndex];
            console.log(chalk.cyan(`API Question: ${qData.q}`));
            console.log(chalk.cyan(`Correct answer index: ${qData.answer}`));
            
            // Reset des réponses pour cette question
            game.answers = {};
            
            const buttons = qData.options.map((opt, index) => ({
                id: `quiz_ans_${index}`,
                text: opt,
                type: 'quick_reply'
            }));

            const catData = lang.t(`quiz.categories.${game.category}`);
            const text = lang.t('quiz.ui.question_header', {
                num: game.questionIndex + 1,
                total: game.apiQuestions.length,
                category: catData?.name || 'Quiz',
                question: qData.q
            });

            console.log(chalk.green(`✅ API Question prepared with ${buttons.length} buttons`));

            return {
                text: text,
                buttons: buttons,
                image: catData?.img || 'https://i.ibb.co/wznvnZf/cult-g.jpg',
                correctAnswer: qData.answer
            };
        }

        // Sinon, utiliser les questions locales
        const catData = lang.t(`quiz.categories.${game.category}`);
        
        console.log(chalk.cyan(`Category data loaded:`, catData ? 'YES' : 'NO'));
        
        if (!catData || !catData.questions || game.questionIndex >= catData.questions.length) {
            console.log(chalk.yellow('⚠️ No more questions'));
            return null;
        }

        const qData = catData.questions[game.questionIndex];
        console.log(chalk.cyan(`Local Question: ${qData.q}`));
        console.log(chalk.cyan(`Correct answer index: ${qData.answer}`));
        
        // Reset des réponses pour cette question
        game.answers = {};
        
        const buttons = qData.options.map((opt, index) => ({
            id: `quiz_ans_${index}`,
            text: opt,
            type: 'quick_reply'
        }));

        const text = lang.t('quiz.ui.question_header', {
            num: game.questionIndex + 1,
            total: catData.questions.length,
            category: catData.name,
            question: qData.q
        });

        console.log(chalk.green(`✅ Local Question prepared with ${buttons.length} buttons`));

        return {
            text: text,
            buttons: buttons,
            image: catData.img,
            correctAnswer: qData.answer
        };
    }

    async handleAnswer(groupId, userId, choiceIndex, messageKey) {
        console.log(chalk.cyan(`🎯 Handling answer from ${userId} in group ${groupId}`));
        console.log(chalk.cyan(`Choice index: ${choiceIndex}`));
        
        const game = this.games.get(groupId);
        
        if (!game) {
            console.log(chalk.red('❌ No game found'));
            return null;
        }
        
        if (game.state !== 'playing') {
            console.log(chalk.yellow(`⚠️ Game state is: ${game.state}, not playing`));
            return { valid: false, msg: 'Game not started' };
        }

        if (!game.players.includes(userId)) {
            console.log(chalk.yellow('⚠️ User not in player list'));
            return { valid: false, msg: 'Not playing' };
        }

        if (game.answers[userId] !== undefined) {
            console.log(chalk.yellow('⚠️ User already answered this question'));
            return { valid: false, msg: 'Already answered' };
        }

        // Récupérer la bonne réponse (API ou local)
        let correctAnswer;
        
        if (game.useAPI && game.apiQuestions) {
            correctAnswer = game.apiQuestions[game.questionIndex].answer;
        } else {
            const catData = lang.t(`quiz.categories.${game.category}`);
            correctAnswer = catData.questions[game.questionIndex].answer;
        }

        console.log(chalk.cyan(`Correct answer: ${correctAnswer}`));
        console.log(chalk.cyan(`User chose: ${choiceIndex}`));

        game.answers[userId] = choiceIndex;

        if (choiceIndex === correctAnswer) {
            console.log(chalk.green('✅ CORRECT ANSWER!'));
            game.scores[userId] += 10;
            return { 
                valid: true, 
                correct: true,
                messageKey: messageKey
            };
        } else {
            console.log(chalk.red('❌ WRONG ANSWER'));
            return { 
                valid: true, 
                correct: false,
                messageKey: messageKey
            };
        }
    }

    nextQuestion(groupId) {
        const game = this.games.get(groupId);
        if (!game) return false;

        game.questionIndex++;
        return true;
    }

    getCurrentScores(groupId) {
        const game = this.games.get(groupId);
        if (!game) return null;

        let text = '📊 *SCORES*\n\n';
        const sortedPlayers = Object.entries(game.scores)
            .sort(([, a], [, b]) => b - a);

        sortedPlayers.forEach(([player, score], index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '▪️';
            text += `${medal} @${player.split('@')[0]}: ${score} pts\n`;
        });

        return {
            text: text,
            mentions: sortedPlayers.map(([player]) => player)
        };
    }

    getGame(groupId) {
        const game = this.games.get(groupId);
        if (game) {
            console.log(chalk.cyan(`📊 Game found for ${groupId}: state=${game.state}, players=${game.players.length}`));
        }
        return game;
    }

    endGame(groupId) {
        console.log(chalk.cyan(`🏁 Ending game for group: ${groupId}`));
        
        const game = this.games.get(groupId);
        if (!game) {
            console.log(chalk.red('❌ No game found'));
            return null;
        }

        // Clear timer si existant
        if (game.questionTimer) {
            clearTimeout(game.questionTimer);
        }

        let winner = null;
        let maxScore = -1;

        for (const [player, score] of Object.entries(game.scores)) {
            console.log(chalk.cyan(`Player ${player}: ${score} points`));
            if (score > maxScore) {
                maxScore = score;
                winner = player;
            }
        }

        console.log(chalk.green(`✅ Winner: ${winner} with ${maxScore} points`));

        const result = {
            winner: winner,
            score: maxScore,
            allScores: game.scores,
            players: game.players
        };

        this.games.delete(groupId);
        return result;
    }

    setQuestionTimer(groupId, timer) {
        const game = this.games.get(groupId);
        if (game) {
            game.questionTimer = timer;
        }
    }

    clearQuestionTimer(groupId) {
        const game = this.games.get(groupId);
        if (game && game.questionTimer) {
            clearTimeout(game.questionTimer);
            game.questionTimer = null;
        }
    }
}

export default new QuizManager();