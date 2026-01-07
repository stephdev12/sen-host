import {  sendReply, formatSuccess, formatError, translate, font  } from '../lib/helpers.js';

// Fonction sleep corrigée
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Base de questions d'anime
const animeQuestions = [
    {
        question: "Quel est le nom du héros principal de Naruto ?",
        options: ["1. Sasuke", "2. Naruto", "3. Kakashi", "4. Sakura"],
        answer: 2
    },
    {
        question: "Dans One Piece, quel est le fruit du démon de Luffy ?",
        options: ["1. Gomu Gomu no Mi", "2. Mera Mera no Mi", "3. Hie Hie no Mi", "4. Ope Ope no Mi"],
        answer: 1
    },
    {
        question: "Qui est le roi des pirates dans One Piece ?",
        options: ["1. Barbe Blanche", "2. Kaido", "3. Gol D. Roger", "4. Shanks"],
        answer: 3
    },
    {
        question: "Dans Death Note, comment s'appelle le Shinigami de Light ?",
        options: ["1. Rem", "2. Ryuk", "3. Sidoh", "4. Gelus"],
        answer: 2
    },
    {
        question: "Quel est le titan d'Eren Yeager dans Attack on Titan ?",
        options: ["1. Titan Colossal", "2. Titan Cuirassé", "3. Titan Assaillant", "4. Titan Bestial"],
        answer: 3
    },
    {
        question: "Dans Dragon Ball Z, qui est le fils de Goku ?",
        options: ["1. Vegeta", "2. Gohan", "3. Trunks", "4. Goten"],
        answer: 2
    },
    {
        question: "Quel anime parle d'un alchimiste cherchant la pierre philosophale ?",
        options: ["1. Fullmetal Alchemist", "2. Naruto", "3. Bleach", "4. Soul Eater"],
        answer: 1
    },
    {
        question: "Dans My Hero Academia, quel est le quirk de Deku ?",
        options: ["1. Explosion", "2. One For All", "3. Half-Cold Half-Hot", "4. Hardening"],
        answer: 2
    },
    {
        question: "Qui est le capitaine de la 11e division dans Bleach ?",
        options: ["1. Byakuya Kuchiki", "2. Kenpachi Zaraki", "3. Toshiro Hitsugaya", "4. Mayuri Kurotsuchi"],
        answer: 2
    },
    {
        question: "Dans Demon Slayer, quelle est la respiration principale de Tanjiro ?",
        options: ["1. Respiration de l'Eau", "2. Respiration du Feu", "3. Respiration du Tonnerre", "4. Respiration de la Bête"],
        answer: 1
    }
];

// Stockage des quiz actifs par groupe
const activeQuizzes = new Map();

// Nettoyage automatique des quiz inactifs
setInterval(() => {
    const now = Date.now();
    for (const [jid, quiz] of activeQuizzes.entries()) {
        if (now - (quiz.startTime || now) > 3600000) { // 1 heure
            activeQuizzes.delete(jid);
        }
    }
}, 3600000);

export default { 
    name: 'quizzanime',
    aliases: ['animequiz', 'aquiz'],
    description: 'Lancer un quiz anime en groupe',
    usage: 'quizzanime start',
    activeQuizzes: activeQuizzes,

    async execute({ sock, msg, args, config, phoneNumber, userConfigManager, jid, sender, isGroup  }) {
        
        if (!isGroup) {
            return await sendReply(sock, jid, formatError('error_group_only', {
                phoneNumber,
                userConfigManager,
                translationKey: 'error_group_only'
            }), { quoted: msg });
        }
        const command = args[0]?.toLowerCase();

      if (command === 'start') {  
            if (activeQuizzes.has(jid)) {
                return await sendReply(sock, jid, formatError('Quiz déjà en cours dans ce groupe !', {
                    phoneNumber,
                    userConfigManager
                }), { quoted: msg });
            }

            // Initialiser le quiz
            const quiz = {
                startTime: Date.now(),
                players: new Map(),
                currentQuestion: 0,
                questions: shuffleArray([...animeQuestions]).slice(0, 5),
                state: 'registration',
                registrationMessageId: null,
                questionStartTime: null
            };

            activeQuizzes.set(jid, quiz);

            const registrationText = `▢ ${font('QUIZZ ANIME DÉMARRÉ !')}

▢ ${font('Pour participer, répondez à ce message avec : moi')}
▢ ${font('Nombre minimum de joueurs : 2')}
▢ ${font('Temps d\'inscription : 30 secondes')}
▢ ${font('Questions totales : ' + quiz.questions.length)}

▢ ${font('En attente de joueurs...')}

> BY STEPH TECH`;

            const sentMessage = await sock.sendMessage(jid, {
                text: registrationText
            });
            
            quiz.registrationMessageId = sentMessage.key.id;

            // Attendre 30 secondes pour les inscriptions
            await sleep(30000);

            const updatedQuiz = activeQuizzes.get(jid);
            if (!updatedQuiz || updatedQuiz.state !== 'registration') return;

            if (updatedQuiz.players.size < 2) {
                activeQuizzes.delete(jid);
                
                const cancelText = `▢ ${font('QUIZZ ANNULÉ')}

▢ ${font('Pas assez de joueurs (minimum 2)')}

> BY STEPH TECH`;
                
                return await sock.sendMessage(jid, { text: cancelText });
            }

            // Démarrer les questions
            updatedQuiz.state = 'playing';
            await startQuestion(sock, jid, phoneNumber, userConfigManager);
        }

        // ===== ARRÊTER LE QUIZ =====
        else if (command === 'stop') {
            
            
            if (!activeQuizzes.has(jid)) {
                return await sendReply(sock, jid, formatError('Aucun quiz actif dans ce groupe', {
                    phoneNumber,
                    userConfigManager
                }), { quoted: msg });
            }

            activeQuizzes.delete(jid);
            
            const stopText = `▢ ${font('QUIZZ ARRÊTÉ')}

▢ ${font('Le quiz a été arrêté par un administrateur')}

> BY STEPH TECH`;
            
            await sock.sendMessage(jid, { text: stopText });
        }

        // ===== AIDE =====
        else {
            const helpText = `▢ ${font('QUIZZ ANIME - AIDE')}

▢ ${font(config.prefix + 'quizzanime start - Démarrer un quiz (Admin)')}
▢ ${font(config.prefix + 'quizzanime stop - Arrêter le quiz (Admin)')}

▢ ${font('COMMENT JOUER :')}
▢ ${font('1. Un admin lance le quiz')}
▢ ${font('2. Répondez "moi" pour vous inscrire')}
▢ ${font('3. Répondez avec le numéro de votre choix (1-4)')}
▢ ${font('4. Le joueur avec le plus de points gagne !')}

> BY STEPH TECH`;

            await sock.sendMessage(jid, { text: helpText });
        }
    }
};

// Fonction pour mélanger un tableau
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Fonction pour démarrer une question - CORRIGÉE
async function startQuestion(sock, jid, phoneNumber, userConfigManager) {
    try {
        const quiz = activeQuizzes.get(jid);
        if (!quiz || quiz.state !== 'playing') return;

        const question = quiz.questions[quiz.currentQuestion];
        
        const questionText = `▢ ${font('QUESTION ' + (quiz.currentQuestion + 1) + '/' + quiz.questions.length)}

▢ ${font(question.question)}

${question.options.map(opt => '▢' + font(opt)).join('\n')}

▢ ${font('Temps : 15 secondes')}

> BY STEPH TECH`;

        const sentMessage = await sock.sendMessage(jid, {
            text: questionText
        });

        quiz.questionStartTime = Date.now();
        quiz.currentQuestionId = sentMessage.key.id;

        // Attendre 15 secondes pour les réponses
        await sleep(15000);

        const updatedQuiz = activeQuizzes.get(jid);
        if (!updatedQuiz || updatedQuiz.state !== 'playing') return;

        // Afficher les scores actuels
        await showScores(sock, jid, phoneNumber, userConfigManager, question.answer);

        // Question suivante ou fin
        updatedQuiz.currentQuestion++;
        
        if (updatedQuiz.currentQuestion < updatedQuiz.questions.length) {
            await sleep(3000);
            await startQuestion(sock, jid, phoneNumber, userConfigManager);
        } else {
            await endQuiz(sock, jid, phoneNumber, userConfigManager);
        }
    } catch (error) {
        console.error('❌ Erreur startQuestion:', error.message);
    }
}

// Afficher les scores après chaque question
async function showScores(sock, jid, phoneNumber, userConfigManager, correctAnswer) {
    const quiz = activeQuizzes.get(jid);
    if (!quiz) return;

    let scoresText = `▢ ${font('RÉPONSE CORRECTE : ' + correctAnswer)}

▢ ${font('SCORES ACTUELS :')}

`;

    const sortedPlayers = Array.from(quiz.players.entries())
        .sort((a, b) => b[1].score - a[1].score);

    sortedPlayers.forEach(([playerId, player], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '▢';
        scoresText += `${medal} @${playerId.split('@')[0]} : ${font(player.score + ' points')}\n`;
    });

    scoresText += '\n> BY STEPH TECH';

    await sock.sendMessage(jid, {
        text: scoresText,
        mentions: sortedPlayers.map(([id]) => id)
    });
}

// Terminer le quiz
async function endQuiz(sock, jid, phoneNumber, userConfigManager) {
    const quiz = activeQuizzes.get(jid);
    if (!quiz) return;

    const sortedPlayers = Array.from(quiz.players.entries())
        .sort((a, b) => b[1].score - a[1].score);

    let finalText = `▢ ${font('QUIZZ TERMINÉ !')}

▢ ${font('CLASSEMENT FINAL :')}

`;

    sortedPlayers.forEach(([playerId, player], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        finalText += `${medal} @${playerId.split('@')[0]} : ${font(player.score + ' points')}\n`;
    });

    if (sortedPlayers.length > 0) {
        const [winnerId, winner] = sortedPlayers[0];
        finalText += `\n▢ ${font('FÉLICITATIONS')} @${winnerId.split('@')[0]} !\n`;
    }

    finalText += '\n> BY STEPH TECH';

    await sock.sendMessage(jid, {
        text: finalText,
        mentions: sortedPlayers.map(([id]) => id)
    });

    activeQuizzes.delete(jid);
}

// Gestionnaire de messages pour le quiz - CORRIGÉ
async function handleQuizMessage(sock, msg, phoneNumber, userConfigManager) {
    try {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // ⭐ VÉRIFICATION CRITIQUE : Ignorer les messages du bot
        if (msg.key.fromMe) return;
        
        // Vérifier que c'est un groupe
        if (!jid.endsWith('@g.us')) return;
        
        const quiz = activeQuizzes.get(jid);
        // ⭐ CORRECTION : Si pas de quiz actif, NE RIEN FAIRE
        if (!quiz) return;

        const body = msg.message?.conversation 
            || msg.message?.extendedTextMessage?.text 
            || '';

        // ⭐ CORRECTION : Ignorer les messages vides ou trop longs
        if (!body || body.length > 10) return;

        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

        // ===== INSCRIPTION =====
        if (quiz.state === 'registration' && body.toLowerCase().trim() === 'moi') {
            if (!quiz.players.has(sender)) {
                quiz.players.set(sender, { score: 0, answers: [] });
                
                const registerText = `▢ @${sender.split('@')[0]} ${font('s\'est inscrit au quiz !')}

> BY STEPH TECH`;
                
                await sock.sendMessage(jid, {
                    text: registerText,
                    mentions: [sender]
                });
            }
            return; // ⭐ IMPORTANT : Sortir après traitement
        }

        // ===== RÉPONSE À UNE QUESTION =====
        if (quiz.state === 'playing' && quotedMsg === quiz.currentQuestionId) {
            const answer = parseInt(body.trim());
            
            // ⭐ VÉRIFICATION : Uniquement les nombres 1-4
            if (isNaN(answer) || answer < 1 || answer > 4) return;

            const player = quiz.players.get(sender);
            if (!player) return;

            // Vérifier si déjà répondu à cette question
            if (player.answers.includes(quiz.currentQuestion)) return;

            const question = quiz.questions[quiz.currentQuestion];
            
            if (answer === question.answer) {
                // Calcul du score avec bonus de vitesse
                const timeElapsed = (Date.now() - quiz.questionStartTime) / 1000;
                const speedBonus = Math.max(0, Math.floor((15 - timeElapsed) / 3));
                const points = 10 + speedBonus;
                
                player.score += points;
                player.answers.push(quiz.currentQuestion);

                await sock.sendMessage(jid, {
                    react: { text: '✅', key: msg.key }
                });
            } else {
                player.answers.push(quiz.currentQuestion);
                
                await sock.sendMessage(jid, {
                    react: { text: '❌', key: msg.key }
                });
            }
            return; // ⭐ IMPORTANT : Sortir après traitement
        }
        
    } catch (error) {
        console.error(`❌ Erreur handleQuizMessage:`, error.message);
        // ⭐ NE PAS PROPAGER L'ERREUR pour éviter les crashes
    }
}

// Exporter le gestionnaire
export { handleQuizMessage };