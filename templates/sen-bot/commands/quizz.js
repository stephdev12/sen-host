/**
 * 𝗦𝗘𝗡 Bot - Quizz Command
 */
import StephUI from 'stephtech-ui';
import lang from '../lib/languageManager.js';
import quizManager from '../lib/quizManager.js';
import { isAdmin, isOwner } from '../lib/authHelper.js';
import configs from '../configs.js';
import chalk from 'chalk';

export async function quizzCommand(sock, chatId, message, args) {
    const ui = new StephUI(sock);
    
    // Vérifier si un jeu est déjà en cours
    const existingGame = quizManager.getGame(chatId);
    if (existingGame) {
        return await sock.sendMessage(chatId, { 
            text: '⚠️ A game is already in progress in this group!' 
        }, { quoted: message });
    }
    
    const currentCode = lang.getLanguage();
    const categoriesData = lang.translations[currentCode]?.quiz?.categories || {};
    const categoriesKeys = Object.keys(categoriesData);

    if (categoriesKeys.length === 0) {
        return sock.sendMessage(chatId, { text: "❌ Quiz configuration missing." });
    }

    const cards = categoriesKeys.map(key => {
        const cat = categoriesData[key];
        return {
            title: cat.name.toUpperCase(),
            body: cat.desc,
            image: cat.img,
            buttons: [
                {
                    id: `quiz_start_${key}`,
                    text: "📚 LOCAL",
                    type: "quick_reply"
                },
                {
                    id: `quiz_api_${key}`,
                    text: "🌐 API",
                    type: "quick_reply"
                }
            ]
        };
    });

    await ui.carousel(chatId, {
        header: lang.t('quiz.ui.title'),
        cards: cards,
        quoted: message
    });
}

export async function quizzstopCommand(sock, chatId, message, args) {
    console.log(chalk.magenta('🛑 Executing .quizzstop command'));
    
   
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: '❌ This command can only be used in groups.'
        }, { quoted: message });
    }
    
    
    const senderId = message.key.participant || message.key.remoteJid;
    const userIsAdmin = await isAdmin(sock, chatId, senderId);
    const userIsOwner = await isOwner(sock, message, configs);
    
    if (!userIsAdmin && !userIsOwner) {
        return await sock.sendMessage(chatId, {
            text: '❌ Only group admins can stop the quiz.'
        }, { quoted: message });
    }
    
    
    const game = quizManager.getGame(chatId);
    
    if (!game) {
        return await sock.sendMessage(chatId, {
            text: '❌ No quiz is currently running in this group.'
        }, { quoted: message });
    }
    
 
    const scoreData = quizManager.getCurrentScores(chatId);
    
  
    const result = quizManager.endGame(chatId);
    
    if (result) {
        let text = '🛑 *QUIZ STOPPED*\n\n';
        
        if (scoreData && result.players.length > 0) {
            text += scoreData.text + '\n\n';
            text += `Stopped by @${senderId.split('@')[0]}`;
            
            await sock.sendMessage(chatId, {
                text: text,
                mentions: [...scoreData.mentions, senderId]
            }, { quoted: message });
        } else {
            text += `No one played.\n\nStopped by @${senderId.split('@')[0]}`;
            
            await sock.sendMessage(chatId, {
                text: text,
                mentions: [senderId]
            }, { quoted: message });
        }
        
        console.log(chalk.green('✅ Quiz stopped successfully'));
    } else {
        await sock.sendMessage(chatId, {
            text: '❌ Error stopping the quiz.'
        }, { quoted: message });
    }
}

// Démarrer le lobby
export async function startQuizLobby(sock, chatId, categoryKey, useAPI = false) {
    console.log(chalk.magenta(`🎮 Starting quiz lobby: ${categoryKey}, API: ${useAPI}`));
    
    if (await quizManager.createLobby(chatId, categoryKey, sock, useAPI)) {
        const catName = lang.t(`quiz.categories.${categoryKey}.name`);
        const mode = useAPI ? '🌐 API MODE' : '📚 LOCAL MODE';
        
        await sock.sendMessage(chatId, { 
            text: lang.t('quiz.ui.lobby', { category: `${catName} (${mode})` })
        });

        // Démarrage automatique après 30s
        setTimeout(async () => {
            const game = quizManager.getGame(chatId);
            
            if (!game) {
                console.log(chalk.yellow('⚠️ Game was cancelled'));
                return;
            }
            
            if (game.players.length === 0) {
                console.log(chalk.yellow('⚠️ No players joined'));
                quizManager.endGame(chatId);
                await sock.sendMessage(chatId, { 
                    text: "❌ Nobody joined. Quiz cancelled." 
                });
                return;
            }
            

            if (quizManager.startGame(chatId)) {
                await sock.sendMessage(chatId, { 
                    text: lang.t('quiz.ui.starting') 
                });
                
                
                await sendNextQuestion(sock, chatId);
            }
        }, 30000);
    } else {
        await sock.sendMessage(chatId, { 
            text: "⚠️ A game is already in progress!" 
        });
    }
}


export async function sendNextQuestion(sock, chatId) {
    console.log(chalk.magenta(`📝 Sending next question to ${chatId}`));
    
    const qData = quizManager.prepareQuestion(chatId);
    
    if (!qData) {
        
        console.log(chalk.green('🏁 No more questions, ending game'));
        await showFinalScores(sock, chatId);
        return;
    }

    
    const ui = new StephUI(sock);
    await ui.buttons(chatId, {
        text: qData.text,
        image: qData.image,
        buttons: qData.buttons.map(b => ({ id: b.id, text: b.text }))
    });

  
    const timer = setTimeout(async () => {
        console.log(chalk.yellow('⏰ Time up for this question'));

        const scoreData = quizManager.getCurrentScores(chatId);
        if (scoreData) {
            await sock.sendMessage(chatId, {
                text: scoreData.text,
                mentions: scoreData.mentions
            });
        }
        
        
        quizManager.nextQuestion(chatId);
        
        setTimeout(() => sendNextQuestion(sock, chatId), 3000);
        
    }, 15000); 
    
  
    quizManager.setQuestionTimer(chatId, timer);
}


async function showFinalScores(sock, chatId) {
    const result = quizManager.endGame(chatId);
    
    if (!result) {
        return await sock.sendMessage(chatId, { 
            text: '❌ Error ending game' 
        });
    }
    
    if (!result.winner || result.players.length === 0) {
        return await sock.sendMessage(chatId, { 
            text: lang.t('quiz.ui.no_winner') 
        });
    }

    // Afficher le classement final
    let text = '🏆 *FINAL RESULTS*\n\n';
    const sortedPlayers = Object.entries(result.allScores)
        .sort(([, a], [, b]) => b - a);

    sortedPlayers.forEach(([player, score], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '▪️';
        text += `${medal} @${player.split('@')[0]}: ${score} pts\n`;
    });

    text += `\n👑 Winner: @${result.winner.split('@')[0]}`;

    await sock.sendMessage(chatId, { 
        text: text,
        mentions: sortedPlayers.map(([player]) => player)
    });
}

export default { quizzCommand, quizzstopCommand, startQuizLobby, sendNextQuestion };