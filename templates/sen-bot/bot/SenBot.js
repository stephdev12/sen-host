/**
 * 𝗦𝗘𝗡 Bot - Main Bot Class
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 */

import makeWASocket from '@whiskeysockets/baileys';
import {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    jidDecode,
    makeCacheableSignalKeyStore,
    delay
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import NodeCache from 'node-cache';
import chalk from 'chalk';
import readline from 'readline';
import PhoneNumber from 'awesome-phonenumber';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import configs from '../configs.js';
import modeManager from '../lib/modeManager.js';
import groupProtection from '../lib/groupProtection.js';
import { isOwner, isSudoUser, getPhoneNumber } from '../lib/authHelper.js';
import settings from '../lib/settingsManager.js';
import lang from '../lib/languageManager.js';
import { jidNormalizedUser } from '@whiskeysockets/baileys';
import quizManager from '../lib/quizManager.js';
import { startQuizLobby, sendNextQuestion } from '../commands/quizz.js';
import dotenv from 'dotenv';
dotenv.config();
import { ytSearchCommand, ytAudioCommand, ytVideoCommand } from '../commands/youtube.js';
const { moviedlCommand, deservdlCommand } = await import('../commands/moviebox.js');
import autoVvManager from '../lib/autoVvManager.js';
import { revealViewOnce } from '../commands/viewonce.js';

import { servicesCommand, handleServiceClick } from '../commands/services.js';

// New Managers
import presenceManager from '../lib/presenceManager.js';
import statusManager from '../lib/statusManager.js';
import antiDelete from '../lib/antiDelete.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class SenBot {
    constructor() {
        this.socket = null;
        this.configs = configs;
        this.isConnected = false;
        this.commands = new Map();
        this.keepAliveInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        // Bot metadata
        this.botName = configs.botName;
        this.themeEmoji = "•";
        
        // 📱 CONNECTION SETTINGS - PRIORITÉ: .env > configs.js
        this.phoneNumber = this.getPhoneNumber();
        this.ownerNumber = this.getOwnerNumber();
        
        this.pairingCode = !!this.phoneNumber || process.argv.includes("--pairing-code");
        this.useMobile = process.argv.includes("--mobile");
        this.pairingRequested = false;
        
        // Readline interface
        this.rl = process.stdin.isTTY ? readline.createInterface({
            input: process.stdin, 
            output: process.stdout 
        }) : null;
        
        // Set global variables
        global.botname = this.botName;
        global.themeemoji = this.themeEmoji;
        
        // Afficher la source du numéro
        this.logPhoneNumberSource();
        
        // Load commands
        this.loadCommands();
    }
    
    getPhoneNumber() {
        if (process.env.PHONE_NUMBER) return process.env.PHONE_NUMBER.replace(/[^0-9]/g, '');
        if (process.env.OWNER_NUMBER) return process.env.OWNER_NUMBER.replace(/[^0-9]/g, '');
        if (configs.phoneNumber) return configs.phoneNumber.replace(/[^0-9]/g, '');
        if (configs.ownerNumber) return configs.ownerNumber.replace(/[^0-9]/g, '');
        return null;
    }
    
    getOwnerNumber() {
        if (process.env.OWNER_NUMBER) return process.env.OWNER_NUMBER.replace(/[^0-9]/g, '');
        if (configs.ownerNumber) return configs.ownerNumber.replace(/[^0-9]/g, '');
        return this.phoneNumber;
    }
    
    logPhoneNumberSource() {
        let source = 'Unknown';
        if (process.env.PHONE_NUMBER) source = '.env (PHONE_NUMBER)';
        else if (process.env.OWNER_NUMBER) source = '.env (OWNER_NUMBER)';
        else if (configs.phoneNumber && configs.phoneNumber !== "911234567890") source = 'configs.js (phoneNumber)';
        else if (configs.ownerNumber && configs.ownerNumber !== "911234567890") source = 'configs.js (ownerNumber)';
        else source = 'Will be prompted';
        
        console.log(chalk.cyan(`📱 Phone Number Source: ${source}`));
        if (this.phoneNumber) console.log(chalk.cyan(`📱 Phone Number: +${this.phoneNumber}`));
    }    
    
    
    async loadCommands() {
        const commandFiles = [
            { name: 'ping', aliases: ['p', 'pong'], file: '../commands/ping.js' },
            { name: 'help', aliases: ['menu', 'h'], file: '../commands/help.js' },
            { name: 'public', aliases: [], file: '../commands/mode.js', func: 'publicCommand' },
            { name: 'private', aliases: [], file: '../commands/mode.js', func: 'privateCommand' },
            { name: 'language', aliases: ['lang', 'setlang'], file: '../commands/language.js' },
            { name: 'sudo', aliases: [], file: '../commands/sudo.js', func: 'sudoCommand' },
            { name: 'delsudo', aliases: ['removesudo'], file: '../commands/sudo.js', func: 'delsudoCommand' },
            { name: 'listsudo', aliases: ['sudolist'], file: '../commands/sudo.js', func: 'listsudoCommand' },
            { name: 'antilink', aliases: [], file: '../commands/protection.js', func: 'antilinkCommand' },
            { name: 'antitag', aliases: [], file: '../commands/protection.js', func: 'antitagCommand' },
            { name: 'antimedia', aliases: [], file: '../commands/protection.js', func: 'antimediaCommand' },
            { name: 'antispam', aliases: [], file: '../commands/protection.js', func: 'antispamCommand' },
            { name: 'antitransfert', aliases: [], file: '../commands/protection.js', func: 'antitransfertCommand' },
            { name: 'antimention', aliases: [], file: '../commands/protection.js', func: 'antimentionCommand' },
            { name: 'warnings', aliases: ['warn'], file: '../commands/protection.js', func: 'warningsCommand' },
            { name: 'resetwarnings', aliases: ['resetwarn'], file: '../commands/protection.js', func: 'resetwarningsCommand' },
            { name: 'groupstatus', aliases: ['gstatus', 'protection'], file: '../commands/protection.js', func: 'groupstatusCommand' }, 
            { name: 'setname', aliases: [], file: '../commands/customization.js', func: 'setname' },
            { name: 'setprefix', aliases: ['prefix'], file: '../commands/customization.js', func: 'setprefix' },
            { name: 'setmenu', aliases: ['setimg'], file: '../commands/customization.js', func: 'setmenu' },
            { name: 'setaudio', aliases: [], file: '../commands/customization.js', func: 'setaudio' },
            { name: 'setstyle', aliases: [], file: '../commands/customization.js', func: 'setstyle' },
            { name: 'audio', aliases: [], file: '../commands/customization.js', func: 'audio' }, 
            { name: 'tourl', aliases: ['url', 'upload'], file: '../commands/tourl.js', func: 'tourlCommand' }, 
            { name: 'welcome', aliases: [], file: '../commands/welcome.js', func: 'welcome' },
            { name: 'goodbye', aliases: [], file: '../commands/welcome.js', func: 'goodbye' },
            { name: 'setwelcome', aliases: [], file: '../commands/welcome.js', func: 'setwelcome' },
            { name: 'setgoodbye', aliases: [], file: '../commands/welcome.js', func: 'setgoodbye' }, 
            { name: 'antipromote', aliases: [], file: '../commands/protection.js', func: 'antipromoteCommand' },
            { name: 'antidemote', aliases: [], file: '../commands/protection.js', func: 'antidemoteCommand' }, 
            { name: 'add', aliases: [], file: '../commands/group.js', func: 'add' },
            { name: 'kick', aliases: ['remove'], file: '../commands/group.js', func: 'kick' },
            { name: 'promote', aliases: [], file: '../commands/group.js', func: 'promote' },
            { name: 'demote', aliases: [], file: '../commands/group.js', func: 'demote' },
            { name: 'demoteall', aliases: [], file: '../commands/group.js', func: 'demoteall' },
            { name: 'gname', aliases: ['setname'], file: '../commands/group.js', func: 'gname' },
            { name: 'gdesc', aliases: ['setdesc'], file: '../commands/group.js', func: 'gdesc' },
            { name: 'glink', aliases: ['link', 'grouplink'], file: '../commands/group.js', func: 'glink' }, 
            { name: 'vv', aliases: ['viewonce', 'reveal'], file: '../commands/viewonce.js', func: 'viewOnceCommand' },
            { name: 'movie', aliases: ['film'], file: '../commands/movie.js', func: 'movieCommand' },
            { name: 'serie', aliases: ['infoserie'], file: '../commands/series.js', func: 'serieCommand' },
            { name: 'dlserie', aliases: ['tvdl', 'dlepisode'], file: '../commands/series.js', func: 'dlSerieCommand' },
            // AI
            { name: 'gpt4', aliases: ['gpt'], file: '../commands/ai.js', func: 'gpt4Command' },
            { name: 'gpt4o', aliases: [], file: '../commands/ai.js', func: 'gpt4oCommand' },
            { name: 'mistral', aliases: [], file: '../commands/ai.js', func: 'mistralCommand' },
            { name: 'flux', aliases: ['genimg'], file: '../commands/ai.js', func: 'fluxCommand' },

            // Tools
            { name: 'dns', aliases: [], file: '../commands/tools.js', func: 'dnsCommand' },
            { name: 'obfuscate', aliases: ['encrypt'], file: '../commands/tools.js', func: 'obfuscateCommand' },
            { name: 'dbinary', aliases: ['decodebin'], file: '../commands/tools.js', func: 'dbinaryCommand' },
            { name: 'fancy', aliases: ['style'], file: '../commands/tools.js', func: 'fancyCommand' },

            // Anime - Images
            { name: 'waifu', aliases: [], file: '../commands/anime.js', func: 'waifuCommand' },
            { name: 'neko', aliases: [], file: '../commands/anime.js', func: 'nekoCommand' },
            { name: 'konachan', aliases: [], file: '../commands/anime.js', func: 'konachanCommand' },
            { name: 'loli', aliases: [], file: '../commands/anime.js', func: 'loliCommand' },

            // Adulte 18+
            { name: 'xvideo', aliases: ['xvid'], file: '../commands/adulte.js', func: 'xvideoCommand' },
            { name: 'xnxx', aliases: [], file: '../commands/adulte.js', func: 'xnxxCommand' },
            { name: 'naija', aliases: [], file: '../commands/naija.js', func: 'naijaCommand' },
            { name: 'celeb', aliases: ['leaked', 'naija2'], file: '../commands/celeb.js', func: 'celebCommand' },
            { name: 'ass', aliases: [], file: '../commands/adulte.js', func: 'assCommand' },
            { name: 'milf', aliases: [], file: '../commands/adulte.js', func: 'milfCommand' },
            { name: 'hwaifu', aliases: [], file: '../commands/adulte.js', func: 'hwaifuCommand' },
            { name: 'hneko', aliases: [], file: '../commands/adulte.js', func: 'hnekoCommand' },
            { name: 'locate', aliases: ['location', 'gps', 'position'], file: '../commands/locate.js', func: 'locateCommand' },


            // Downloads
            { name: 'apk', aliases: ['app'], file: '../commands/apk.js', func: 'apkCommand' },
            { name: 'quizz', aliases: ['quiz', 'trivia'], file: '../commands/quizz.js', func: 'quizzCommand' },
            {name: 'quizzstop', aliases: ['stopquiz', 'endquiz'], file: '../commands/quizz.js', func: 'quizzstopCommand' },
            { name: 'pinterest', aliases: ['pin'], file: '../commands/pinterest.js', func: 'pinterestCommand' },
            // Media
            { name: 'sticker', aliases: ['s', 'stiker'], file: '../commands/media.js', func: 'stickerCommand' },
            { name: 'steal', aliases: ['take'], file: '../commands/media.js', func: 'stickerCommand' },
            { name: 'store', aliases: [], file: '../commands/media.js', func: 'storeCommand' },
            { name: 'ad', aliases: [], file: '../commands/media.js', func: 'adCommand' },
            { name: 'vd', aliases: ['video'], file: '../commands/media.js', func: 'vdCommand' },
            { name: 'listmedia', aliases: ['medialist'], file: '../commands/media.js', func: 'listMediaCommand' },
            { name: 'delmedia', aliases: ['deletemedia'], file: '../commands/media.js', func: 'deleteMediaCommand' },
            { name: 'toimg', aliases: [], file: '../commands/media.js', func: 'toimgCommand' },
            { name: 'tovideo', aliases: [], file: '../commands/media.js', func: 'tovideoCommand' },
            { name: 'play', aliases: ['song', 'mp3'], file: '../commands/play.js', func: 'playCommand' },


            // Utility commands
            { name: 'getpp', aliases: ['pp', 'pfp'], file: '../commands/utility.js', func: 'getppCommand' },
            { name: 'save', aliases: ['savestatus'], file: '../commands/utility.js', func: 'saveCommand' },
            { name: 'respond', aliases: [], file: '../commands/respond.js', func: 'respondCommand' },
            { name: 'setrespond', aliases: [], file: '../commands/respond.js', func: 'setrespondCommand' },
            { name: 'clearrespond', aliases: [], file: '../commands/respond.js', func: 'clearrespondCommand' },
            { name: 'youtube', aliases: ['yt', 'video'], file: '../commands/youtube.js', func: 'ytSearchCommand' },
            { name: 'ytmp3', aliases: ['ytaudio'], file: '../commands/youtube.js', func: 'ytAudioCommand' },
            { name: 'ytmp4', aliases: ['ytvideo'], file: '../commands/youtube.js', func: 'ytVideoCommand' },
            { name: 'tiktok', aliases: ['tt', 'tik'], file: '../commands/tiktok.js', func: 'tiktokCommand' },
            { name: 'nanobanana', aliases: ['nano', 'banana', 'ai-edit'], file: '../commands/nanobanana.js', func: 'nanobananaCommand' },
            { name: 'sora', aliases: ['text2video', 'soragen'], file: '../commands/sora.js', func: 'soraCommand' },

            { name: 'addgapi', aliases: ['setgapi'], file: '../commands/google.js', func: 'addgapiCommand' },
            { name: 'removegapi', aliases: ['delgapi'], file: '../commands/google.js', func: 'removegapiCommand' },
            { name: 'gemini', aliases: ['gem'], file: '../commands/google.js', func: 'geminiCommand' },
            { name: 'vision', aliases: ['gemvision'], file: '../commands/google.js', func: 'visionCommand' },
            { name: 'imagefx', aliases: ['imagen'], file: '../commands/google.js', func: 'imagefxCommand' },
            { name: 'gstatus', aliases: ['googlestatus'], file: '../commands/google.js', func: 'gstatusCommand' },

            // MovieBox Commands
            { name: 'serieinfo', aliases: ['sinfo'], file: '../commands/moviebox.js', func: 'serieinfoCommand' },
            { name: 'deservdl', aliases: ['sdl'], file: '../commands/moviebox.js', func: 'deservdlCommand' },
            { name: 'moviesearch', aliases: ['msearch'], file: '../commands/moviebox.js', func: 'moviesearchCommand' },
            { name: 'moviedl', aliases: ['mdl'], file: '../commands/moviebox.js', func: 'moviedlCommand' },
            { name: 'trending', aliases: ['trend'], file: '../commands/moviebox.js', func: 'trendingCommand' },

            // Image Tools
            { name: 'removebg', aliases: ['rbg', 'nobg'], file: '../commands/image.js', func: 'removebgCommand' },
            { name: 'upscale', aliases: ['hd', 'remini', 'enhance'], file: '../commands/image.js', func: 'upscaleCommand' },
            { name: 'img2sketch', aliases: ['sketch', 'dessin'], file: '../commands/image.js', func: 'img2sketchCommand' },

            { name: 'autovv', aliases: ['avv'], file: '../commands/autovv.js', func: 'autovvCommand' },
            // Group Mentions
            { name: 'tagall', aliases: ['everyone', 'tous'], file: '../commands/tag.js', func: 'tagAllCommand' },
            { name: 'hidetag', aliases: ['tag', 'ht'], file: '../commands/tag.js', func: 'hideTagCommand' },
            { name: 'walink', aliases: ['wame'], file: '../commands/tools.js', func: 'walinkCommand' },
            { name: 'lyrics', aliases: ['paroles'], file: '../commands/tools.js', func: 'lyricsCommand' },
            { name: 'services', aliases: ['service', 'nos-services'], file: '../commands/services.js', func: 'servicesCommand' },

            // Automation Commands
            { name: 'autowrite', aliases: [], file: '../commands/automation.js', func: 'autowriteCommand' },
            { name: 'autorecord', aliases: [], file: '../commands/automation.js', func: 'autorecordCommand' },
            { name: 'autostatus', aliases: [], file: '../commands/automation.js', func: 'autostatusCommand' },
            { name: 'antidelete', aliases: [], file: '../commands/automation.js', func: 'antideleteCommand' },
            { name: 'update', aliases: [], file: '../commands/update.js', func: 'updateCommand' },
        ];
        
        const textEffects = [
            'metallic', 'ice', 'snow', 'impressive', 'matrix', 'light',
            'neon', 'devil', 'purple', 'thunder', 'leaves', '1917',
            'arena', 'hacker', 'sand', 'glitch', 'fire',
            'dragonball', 'foggyglass', 'pornhub', 'foggyglassv2', 'naruto', 'typo',
            'marvel', 'frost', 'pixelglitch', 'neonglitch', 'america', 'erase',
            'captainamerica', 'blackpink', 'starwars', 'bearlogo', 'graffiti',
            'graffitiv2', 'futuristic', 'clouds'
        ];

        // On injecte chaque effet comme une commande pointant vers textmaker.js
        textEffects.forEach(effect => {
            commandFiles.push({
                name: effect, 
                aliases: [], 
                file: '../commands/textmaker.js', 
                func: 'textmakerCommand' // C'est le nom de l'export nommé dans le fichier
            });
        });

        
        for (const cmd of commandFiles) {
            try {
                const module = await import(cmd.file);
                const command = cmd.func ? module[cmd.func] : module.default;
                
                this.commands.set(cmd.name, { execute: command, aliases: cmd.aliases });
                
                if (cmd.aliases) {
                    for (const alias of cmd.aliases) {
                        this.commands.set(alias, { execute: command, aliases: [] });
                    }
                }
                
                console.log(chalk.green(`✅ Loaded command: ${cmd.name} ${cmd.aliases?.length ? `(${cmd.aliases.join(', ')})` : ''}`));
            } catch (error) {
                console.log(chalk.yellow(`⚠️ Could not load command: ${cmd.name} - ${error.message}`));
            }
        }
    }
    
    async question(text) {
        if (this.rl) {
            return new Promise((resolve) => this.rl.question(text, resolve));
        } else {
            return Promise.resolve(this.configs.ownerNumber || this.phoneNumber);
        }
    }
    
    async initialize() {
        try {
            console.log(chalk.cyan('📡 Fetching latest Baileys version...'));
            const { version } = await fetchLatestBaileysVersion();
            console.log(chalk.green(`✅ Using Baileys version: ${version}`));
            
            const credsExists = fs.existsSync('./session/creds.json');
            
            const { state, saveCreds } = await useMultiFileAuthState('./session');
            const msgRetryCounterCache = new NodeCache();
            
            this.socket = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                printQRInTerminal: !this.pairingCode,
                browser: ["Ubuntu", "Chrome", "20.0.04"],
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: false,
                msgRetryCounterCache,
                defaultQueryTimeoutMs: 60000,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 10000,
            });
            
            // Initialize Managers
            presenceManager.init(this.socket);
            statusManager.init(this.socket);
            antiDelete.init(this.socket); // Plus besoin de store externe

            this.setupEventHandlers(saveCreds);
            
            if (!credsExists && !this.pairingRequested && this.pairingCode) {
                this.pairingRequested = true;
                await this.handlePairing();
            }
            
            return this.socket;
            
        } catch (error) {
            console.error(chalk.red('❌ Error initializing bot:'), error);
            await delay(5000);
            return this.initialize();
        }
    }
    
    // ... (handlePairing code remains same) ...
    async handlePairing() {
    if (!this.socket.authState.creds.registered) {
        if (this.useMobile) {
            throw new Error('Cannot use pairing code with mobile api');
        }
        
        // 📱 VÉRIFIER SI UN NUMÉRO EST DÉJÀ CONFIGURÉ
        let phoneNumber = this.phoneNumber;
        
        // Si pas de numéro configuré, demander à l'utilisateur
        if (!phoneNumber || phoneNumber === "911234567890") {
            phoneNumber = await this.question(
                chalk.bgBlack(chalk.greenBright(
                    `\n📱 No phone number configured in .env or configs.js\nEnter your WhatsApp number\nFormat: 237694530506 (without + or spaces)\n> `
                ))
            );
            
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        } else {
            console.log(chalk.bgBlack(chalk.greenBright(
                `\n📱 Using configured phone number: +${phoneNumber}`
            )));
        }
        
        // Valider le numéro
        const pn = PhoneNumber('+' + phoneNumber);
        if (!pn.isValid()) {
            console.log(chalk.red('❌ Invalid phone number format'));
            console.log(chalk.yellow('💡 Tip: Configure PHONE_NUMBER in .env file'));
            process.exit(1);
        }
        
        // Demander le pairing code
        setTimeout(async () => {
            try {
                let code = await this.socket.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(chalk.bgGreen(chalk.black(`\n✅ Your Pairing Code: ${code}\n`)));
                console.log(chalk.yellow(`📱 Enter this code in WhatsApp:\n1. Open WhatsApp\n2. Settings > Linked Devices\n3. Link a Device\n4. Enter code above\n`));
            } catch (error) {
                console.error(chalk.red('❌ Error requesting pairing code:'), error);
            }
        }, 3000);
    }
}

    setupEventHandlers(saveCreds) {
        this.socket.ev.on('creds.update', saveCreds);
        
        this.socket.ev.on('messages.upsert', async (chatUpdate) => {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            // AntiDelete Storage
            await antiDelete.storeMessage(mek);

            await this.handleMessages(chatUpdate);
            // Handle Status
            if (mek.key?.remoteJid === 'status@broadcast') {
                await statusManager.handleStatus(mek);
            }
            // Handle Antidelete (Revoke)
            if (mek.message?.protocolMessage) {
                await antiDelete.handleRevoke(mek);
            }
        });
        
        this.socket.ev.on('connection.update', async (update) => {
            await this.handleConnection(update);
        });
        
        this.socket.ev.on('contacts.update', (update) => {
            for (let contact of update) {
                let id = this.socket.decodeJid(contact.id);
                if (id) {
                    console.log(chalk.gray(`📇 Contact updated: ${id}`));
                }
            }
        });
        
        this.socket.ev.on('groups.update', (updates) => {
            for (const update of updates) {
                console.log(chalk.gray(`👥 Group updated: ${update.id}`));
            }
        });
        
        // Remplace uniquement la partie group-participants.update dans SenBot.js

// Remplace la partie group-participants.update dans SenBot.js (ligne ~220)

this.socket.ev.on('group-participants.update', async (event) => {
    const { id, participants, action, actor } = event;
    
    try {
        const config = groupProtection.getGroupConfig(id);
        const botNumber = this.socket.user.id.split(':')[0] + '@s.whatsapp.net';

        // --- 🛡️ ANTI-PROMOTE ---
        if (action === 'promote' && config.antipromote?.enabled) {
            if (actor === botNumber) return;

            for (const participant of participants) {
                try {
                    const jid = typeof participant === 'string' ? participant : participant.id;
                    await this.socket.groupParticipantsUpdate(id, [jid], 'demote');
                    console.log(`Anti-Promote: Demoted ${jid}`);
                } catch (e) { 
                    console.error('Anti-Promote fail:', e.message); 
                }
            }
        }

        // --- 🛡️ ANTI-DEMOTE ---
        if (action === 'demote' && config.antidemote?.enabled) {
            if (actor === botNumber) return;

            for (const participant of participants) {
                try {
                    const jid = typeof participant === 'string' ? participant : participant.id;
                    await this.socket.groupParticipantsUpdate(id, [jid], 'promote');
                    console.log(`Anti-Demote: Re-promoted ${jid}`);
                } catch (e) { 
                    console.error('Anti-Demote fail:', e.message); 
                }
            }
        }

        // --- 👋 WELCOME / GOODBYE ---
        if (action === 'add' || action === 'remove') {
            let metadata;
            try { 
                metadata = await this.socket.groupMetadata(id); 
            } catch (e) { 
                console.error('Failed to get group metadata:', e.message);
                return; 
            } 

            for (const participant of participants) {
                try {
                    const jid = typeof participant === 'string' ? participant : participant.id;

                    // WELCOME
                    if (action === 'add' && config.welcome?.enabled) {
                        let text = config.welcome.text || 'Welcome @user to {group}';
                        
                        // ✅ FIX: Remplacer @user par le format de mention WhatsApp
                        text = text.replace(/@user/g, `@${jid.split('@')[0]}`)
                                   .replace('{group}', metadata.subject || 'this group')
                                   .replace('{members}', metadata.participants?.length || 0)
                                   .replace('{desc}', metadata.desc?.toString() || 'No description');
                        
                        await this.socket.sendMessage(id, { 
                            text, 
                            mentions: [jid] 
                        });
                        console.log(chalk.green(`✅ Welcome sent to ${jid}`));
                    }

                    // GOODBYE
                    if (action === 'remove' && config.goodbye?.enabled) {
                        let text = config.goodbye.text || 'Goodbye @user';
                        
                        // ✅ FIX: Remplacer @user par le format de mention WhatsApp
                        text = text.replace(/@user/g, `@${jid.split('@')[0]}`)
                                   .replace('{group}', metadata.subject || 'this group')
                                   .replace('{members}', metadata.participants?.length || 0);
                        
                        await this.socket.sendMessage(id, { 
                            text, 
                            mentions: [jid] 
                        });
                        console.log(chalk.green(`✅ Goodbye sent for ${jid}`));
                    }
                } catch (e) {
                    console.error(`Error processing participant:`, e.message);
                }
            }
        }

    } catch (err) {
        console.error('Error Group Participants:', err.message);
    }
});
        
        this.addHelpers();
        this.startKeepAlive();
    }
    
        async handleMessages(chatUpdate) {
    const sen = chatUpdate.messages[0];
    if (!sen.message) return;

    setImmediate(async () => {
        try {
        
const autoRespondManager = (await import('../lib/autoRespondManager.js')).default;
            
            // Gestion message éphémère
            sen.message = (Object.keys(sen.message)[0] === 'ephemeralMessage') 
                ? sen.message.ephemeralMessage.message 
                : sen.message;

            if (sen.key && sen.key.remoteJid === 'status@broadcast') return;
            if (sen.key.id.startsWith('BAE5') && sen.key.id.length === 16) return;

            const chatId = sen.key.remoteJid;
            const isGroup = chatId.endsWith('@g.us');
            const senderId = sen.key.participant || sen.key.remoteJid;

            // Handle Presence
            await presenceManager.handleMessage(chatId);

            // ========================================
            // 📝 RÉCUPÉRATION DU TEXTE (EN PREMIER)
            // ========================================
            
            // ========================================
            // 🛡️ PROTECTION DE GROUPE (PRIORITAIRE)
            // ========================================
            if (isGroup) {
                try {
                    await groupProtection.handleMessage(this.socket, sen, chatId, senderId);
                } catch (error) {
                    console.error(chalk.red('❌ Error in group protection:'), error);
                }
            }

            // ========================================
            // 🤖 AUTO RESPOND (Mentions)
            // ========================================
          if (isGroup && autoRespondManager.isEnabled()) {
                try {
                    // Construire le JID du owner (PN format)
                    const botOwnerJid = configs.ownerNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    
                    // Vérifier si le owner est mentionné (gère LID et PN)
                    const isMentioned = await autoRespondManager.isMentioned(this.socket, sen, botOwnerJid);
                    
                    if (isMentioned) {
                        console.log(chalk.cyan('🔔 Bot owner mentioned, sending auto response...'));
                        await autoRespondManager.sendAutoResponse(this.socket, chatId, sen);
                    }
                } catch (error) {
                    console.error(chalk.red('❌ Error in auto respond:'), error.message);
                }
            }

            
            const messageText = (
                sen.message?.conversation?.trim() ||
                sen.message?.extendedTextMessage?.text?.trim() ||
                sen.message?.imageMessage?.caption?.trim() ||
                sen.message?.videoMessage?.caption?.trim() ||
                ''
            );

            // ========================================
            // 🔒 VÉRIFICATION GLOBALE DU MODE (Boutons + Commandes)
            // ========================================
            
            const owner = await isOwner(this.socket, sen, configs);
            
            // Si pas owner, on vérifie le mode PUBLIC et les SUDO
            if (!owner) {
                const isPublicMode = modeManager.isPublic();
                const userPhone = await getPhoneNumber(this.socket, senderId);
                const sudo = isSudoUser(userPhone, senderId);

                // Si Mode Privé ET pas Sudo -> On arrête TOUT (Boutons inclus)
                if (!isPublicMode && !sudo) {
                    return; 
                }
            }

            const bodyQuizz = messageText; // Pour le quiz
            const userMessage = messageText.toLowerCase(); // Pour les commandes

            // ========================================
            // 🎮 DÉTECTION BOUTONS QUIZ (PRIORITAIRE)
            // ========================================
            
            // Récupération de l'ID du bouton (Tous formats)
            let buttonId = "";
            
            // Format standard buttons
            if (sen.message?.buttonsResponseMessage?.selectedButtonId) {
                buttonId = sen.message.buttonsResponseMessage.selectedButtonId;
            }
            // Format template buttons
            else if (sen.message?.templateButtonReplyMessage?.selectedId) {
                buttonId = sen.message.templateButtonReplyMessage.selectedId;
            }
            // Format list response
            else if (sen.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
                buttonId = sen.message.listResponseMessage.singleSelectReply.selectedRowId;
            }
            // Format interactif moderne (stephtech-ui)
            else if (sen.message?.interactiveResponseMessage) {
                try {
                    const interactive = sen.message.interactiveResponseMessage;
                    
                    // Type 1: nativeFlowResponseMessage
                    if (interactive.nativeFlowResponseMessage) {
                        const params = JSON.parse(interactive.nativeFlowResponseMessage.paramsJson || '{}');
                        buttonId = params.id || "";
                    }
                    // Type 2: body direct (certains cas)
                    else if (interactive.body) {
                        buttonId = interactive.body.text || "";
                    }
                } catch (e) {
                    console.error(chalk.red('Error parsing interactive button:'), e.message);
                }
            }
            
            // Debug
            if (buttonId) {
                console.log(chalk.yellow(`🔘 Button clicked: ${buttonId}`));}
// 1. Série sélectionnée (depuis liste OU trending)
// 1️⃣ SÉRIE BUTTON (depuis serieinfo OU trending)
if (buttonId && buttonId.startsWith('seriedl_')) {
    console.log(chalk.cyan('📺 Serie button clicked'));
    const subjectId = buttonId.replace('seriedl_', '');
    
    await sock.sendMessage(chatId, { 
        text: `📺 *Download Serie*\n\nUse: .deservdl ${subjectId} | <season> | <episode> | [subtitle]\n\n*Examples:*
• .deservdl ${subjectId} | 1 | 1\n• .deservdl ${subjectId} | 1 | 1 | français\n• .deservdl ${subjectId} | 2 | 5 | english`
    }, { quoted: sen });
    return;
}

// 2️⃣ FILM BUTTON (depuis moviesearch OU trending)
if (buttonId && buttonId.startsWith('moviedl_')) {
    console.log(chalk.cyan('🎬 Movie button clicked'));
    const subjectId = buttonId.replace('moviedl_', '');
    await moviedlCommand(this.socket, chatId, sen, [subjectId]);
    return;
}
            
            
        // E1. Gestion YouTube AUDIO (Bouton ID: ytmp3_URL)
        if (buttonId && buttonId.startsWith('ytmp3_')) {
            const url = buttonId.replace('ytmp3_', '');
            await ytAudioCommand(this.socket, chatId, sen, [url]);
            return;
        }

        // E2. Gestion YouTube VIDEO (Bouton ID: ytmp4_URL)
        if (buttonId && buttonId.startsWith('ytmp4_')) {
            const url = buttonId.replace('ytmp4_', '');
            await ytVideoCommand(this.socket, chatId, sen, [url]);
            return;
        }
        
        if (buttonId && buttonId.startsWith('service_')) {
    await handleServiceClick(this.socket, chatId, sen, buttonId);
    return;
}


            
            // ========================================
            // 3. LOGIQUE JOIN (via texte "join")
            // ========================================
            if (bodyQuizz && bodyQuizz.toLowerCase().trim() === 'join') {
                const game = quizManager.getGame(chatId);
                if (game && game.state === 'lobby') {
                    if (quizManager.addPlayer(chatId, senderId)) {
                        await this.socket.sendMessage(chatId, { 
                            text: lang.t('quiz.ui.joined', { user: senderId.split('@')[0] }),
                            mentions: [senderId]
                        });
                    }
                    return; 
                }
            }

            // ========================================
            // 4. LOGIQUE START (via bouton quiz_start_* ou quiz_api_*)
            // ========================================
            if (buttonId && buttonId.startsWith('quiz_start_')) {
                console.log(chalk.green(`✅ Starting LOCAL quiz: ${buttonId}`));
                const category = buttonId.replace('quiz_start_', '');
                await startQuizLobby(this.socket, chatId, category, false); // LOCAL
                return;
            }
            
            if (buttonId && buttonId.startsWith('quiz_api_')) {
                console.log(chalk.green(`✅ Starting API quiz: ${buttonId}`));
                const category = buttonId.replace('quiz_api_', '');
                await startQuizLobby(this.socket, chatId, category, true); // API
                return;
            }

            // ========================================
            // 5. LOGIQUE RÉPONSE (via bouton quiz_ans_*)
            // ========================================
            if (buttonId && buttonId.startsWith('quiz_ans_')) {
                console.log(chalk.green(`✅ Processing answer: ${buttonId}`));
                
                const index = parseInt(buttonId.replace('quiz_ans_', ''));
                const result = await quizManager.handleAnswer(chatId, senderId, index, sen.key);
                
                if (result) {
                    if (result.valid) {
                        // Réagir au message avec ✅ ou ❌
                        const emoji = result.correct ? '✅' : '❌';
                        await this.socket.sendMessage(chatId, {
                            react: {
                                text: emoji,
                                key: sen.key
                            }
                        });
                        
                        console.log(chalk.green(`${emoji} Reaction sent`));
                    } else if (result.msg === 'Not playing') {
                        await this.socket.sendMessage(chatId, { 
                            text: '❌ You are not playing! Wait for the next game.' 
                        });
                    } else if (result.msg === 'Already answered') {
                        // Ne rien faire si déjà répondu
                        console.log(chalk.yellow('User already answered'));
                    } else if (result.msg === 'Game not started') {
                        // Le lobby n'a pas encore démarré
                        console.log(chalk.yellow('Game not started yet'));
                    }
                }
                return;
            }
            
if (autoVvManager.isEnabled()) {
    try {
        // Construire le JID du owner
        const ownerNumber = configs.ownerNumber.replace(/[^0-9]/g, '');
        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
        const senderId = sen.key.participant || sen.key.remoteJid;
        
        // Vérifier si c'est une vue unique (message direct, pas cité)
        const directMessage = sen.message;
        
        // Format 1 : viewOnceMessageV2 / viewOnceMessage
        const viewOnceV2 = directMessage?.viewOnceMessageV2;
        const viewOnceV1 = directMessage?.viewOnceMessage;
        
        // Format 2 : imageMessage.viewOnce / videoMessage.viewOnce
        const imageMsg = directMessage?.imageMessage;
        const videoMsg = directMessage?.videoMessage;
        const audioMsg = directMessage?.audioMessage;
        
        const isViewOnceV1V2 = viewOnceV2 || viewOnceV1;
        const isViewOnceMedia = (imageMsg && imageMsg.viewOnce) || 
                               (videoMsg && videoMsg.viewOnce) || 
                               (audioMsg && audioMsg.viewOnce);
        
        if (isViewOnceV1V2 || isViewOnceMedia) {
            console.log(chalk.cyan('🔓 AutoVV: Vue unique détectée'));
            
            // 🔥 FIX : Passer le message DIRECT, pas un quotedMessage artificiel
            const result = await revealViewOnce(this.socket, directMessage, senderId, chatId, ownerJid);
            
            if (result.success) {
                console.log(chalk.green(`✅ AutoVV: ${result.mediaType} révélé automatiquement`));
            } else {
                console.log(chalk.yellow(`⚠️ AutoVV: Échec - ${result.message}`));
            }
        }
        
    } catch (error) {
        console.error(chalk.red('❌ AutoVV Error:'), error.message);
    }
}

                // Si ce n'est pas une commande, on arrête là
               const currentPrefix = settings.get('prefix');
if (!userMessage.startsWith(currentPrefix)) return;

                const args = messageText.slice(1).trim().split(/\s+/);
                const commandName = args.shift().toLowerCase();

                // ========================================
                // 🔒 VÉRIFICATION DU MODE (DÉJÀ FAIT PLUS HAUT)
                // ========================================
                
                // Le check a été déplacé avant les boutons pour tout sécuriser.
                // On garde juste le log.

                console.log(chalk.cyan(`📝 Command: .${commandName} from ${senderId.split('@')[0]}`));

                const command = this.commands.get(commandName);

                if (command) {
                    try {
                        // 🔥 Petit délai de sécurité supplémentaire (comme le rate limit du manager)
                        await delay(500); 
                        await command.execute(this.socket, chatId, sen, args);
                    } catch (error) {
                        console.error(chalk.red(`❌ Error executing ${commandName}:`), error.message);
                        // Ne pas envoyer de message d'erreur à l'utilisateur pour éviter les boucles
                    }
                }

            } catch (err) {
                console.error(chalk.red("❌ Global Handler Error:"), err.message);
            }
        });
    }

    async handleConnection(update) {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log(chalk.yellow('📱 QR Code generated. Please scan with WhatsApp.'));
        }
        
        if (connection === 'connecting') {
            console.log(chalk.yellow('🔄 Connecting...'));
        }
        
        if (connection === "open") {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            const mode = modeManager.isPublic() ? 'PUBLIC' : 'PRIVATE';
            
           try {
            
            await this.socket.newsletterFollow("120363420601379038@newsletter");
            await this.socket.newsletterFollow("120363419924327792@newsletter");
            sessionData.channelsFollowed = true;
            console.log(`Newsletters suivies`);
        } catch (e) {
            console.log(` Newsletter follow error: ${e.message}`);
        }
    
            console.log(chalk.green('\n✅ Connected to WhatsApp!'));
            console.log(chalk.cyan(`\n╭━━━━━━━━━━━━━━━━━━━╮`));
            console.log(chalk.cyan(`│  ${chalk.bold('🤖 ' + this.botName + ' Bot')}      │`));
            console.log(chalk.cyan(`╰━━━━━━━━━━━━━━━━━━━╯`));
            console.log(chalk.magenta(`\n${this.themeEmoji} Developer : 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑`));
            console.log(chalk.magenta(`${this.themeEmoji} Version   : ${this.configs.version}`));
            console.log(chalk.magenta(`${this.themeEmoji} Commands  : ${this.commands.size}`));
            console.log(chalk.magenta(`${this.themeEmoji} Mode      : ${mode} ${mode === 'PUBLIC' ? '🌍' : '🔒'}`));
            console.log(chalk.magenta(`${this.themeEmoji} Status    : Online ✅\n`));
            
            try {
                const botNumber = this.socket.user.id.split(':')[0] + '@s.whatsapp.net';
                await this.socket.sendMessage(botNumber, {
                    text: `*${this.botName} Connected!*\n\n${new Date().toLocaleString()}\nBot is ready!\nCommands: ${this.commands.size}\nMode: ${mode}`
                });
            } catch (err) {
                console.error(chalk.yellow('⚠️ Could not send startup message'));
            }
        }
        
        if (connection === 'close') {
            this.isConnected = false;
            
            if (this.keepAliveInterval) {
                clearInterval(this.keepAliveInterval);
                this.keepAliveInterval = null;
            }
            
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(chalk.red(`❌ Connection closed. Status: ${statusCode}`));
            
            // ✅ NE PAS SUPPRIMER LA SESSION POUR "An internal server error occurred"
            if (statusCode === DisconnectReason.badSession) {
                // Vérifier si c'est vraiment une mauvaise session ou juste une erreur temporaire
                const errorMsg = lastDisconnect?.error?.output?.payload?.message || '';
                
                if (errorMsg.includes('internal server error') || errorMsg.includes('Stream Errored')) {
                    console.log(chalk.yellow('⚠️ Temporary server error, reconnecting without deleting session...'));
                    await delay(3000);
                    return await this.reconnect();
                } else {
                    // C'est vraiment une mauvaise session
                    console.log(chalk.red('Bad Session File, Please Delete session and Scan Again'));
                    try {
                        fs.rmSync('./session', { recursive: true, force: true });
                    } catch {}
                    process.exit(0);
                }
            } else if (statusCode === DisconnectReason.connectionClosed) {
                console.log(chalk.yellow('Connection closed, reconnecting...'));
                await this.reconnect();
            } else if (statusCode === DisconnectReason.connectionLost) {
                console.log(chalk.yellow('Connection Lost from Server, reconnecting...'));
                await this.reconnect();
            } else if (statusCode === DisconnectReason.connectionReplaced) {
                console.log(chalk.red('Connection Replaced, Another New Session Opened'));
                process.exit(0);
            } else if (statusCode === DisconnectReason.loggedOut) {
                console.log(chalk.red('Device Logged Out, Please Delete session and Scan Again.'));
                try {
                    fs.rmSync('./session', { recursive: true, force: true });
                } catch {}
                process.exit(0);
            } else if (statusCode === DisconnectReason.restartRequired) {
                console.log(chalk.yellow('Restart Required, Restarting...'));
                await this.reconnect();
            } else if (statusCode === DisconnectReason.timedOut) {
                console.log(chalk.yellow('Connection TimedOut, Reconnecting...'));
                await this.reconnect();
            } else if (statusCode === 401 || statusCode === 403) {
                console.log(chalk.red('Unauthorized. Session deleted.'));
                try {
                    fs.rmSync('./session', { recursive: true, force: true });
                } catch {}
                process.exit(0);
            } else if (shouldReconnect) {
                console.log(chalk.yellow('Reconnecting...'));
                await this.reconnect();
            }
        }
    }
    
    async reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log(chalk.red(`❌ Max reconnection attempts (${this.maxReconnectAttempts}) reached. Please restart manually.`));
            process.exit(1);
        }
        
        this.reconnectAttempts++;
        const delayTime = Math.min(5000 * this.reconnectAttempts, 30000);
        console.log(chalk.yellow(`♻️ Reconnecting in ${delayTime/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`));
        
        await delay(delayTime);
        this.pairingRequested = false;
        await this.initialize();
    }
    
    startKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }
        
        this.keepAliveInterval = setInterval(async () => {
            if (this.isConnected && this.socket) {
                try {
                    const status = this.socket.ws.readyState;
                    if (status === 1) {
                        console.log(chalk.gray(`💓 Keep-alive: Connection active (${new Date().toLocaleTimeString()})`));
                    } else {
                        console.log(chalk.yellow(`⚠️ Keep-alive: Connection state: ${status}`));
                        if (status === 3) {
                            console.log(chalk.red('Connection closed, attempting to reconnect...'));
                            this.isConnected = false;
                            await this.reconnect();
                        }
                    }
                } catch (error) {
                    console.error(chalk.red('❌ Keep-alive error:'), error.message);
                }
            }
        }, 30000);
        
        console.log(chalk.green('✅ Keep-alive started (30s interval)'));
    }
    
    addHelpers() {
        this.socket.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            }
            return jid;
        };
        
        this.socket.public = true;
    }
}