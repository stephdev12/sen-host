/**
 * 𝗦𝗘𝗡 Bot - Help Command (Structuré par Catégories)
 */

import response from '../lib/response.js';
import settings from '../lib/settingsManager.js';

export async function helpCommand(sock, chatId, message, args) {
    const senderName = message.pushName || "User";
    
    // 🔥 C'est ICI qu'on définit les boîtes que tu veux voir apparaître
    const menuData = {
        user: senderName,
        categories: {
            "General": [
                "ping", 
                "menu", 
                "help"
            ],
            "Owner": [
                "public", 
                "private", 
                "sudo", 
                "delsudo", 
                "listsudo", 
                "language",
                "setname",
                "setprefix",
                "setmenu",
                "setaudio",
                "setstyle",
                "audio", 
                "setwelcome",
                "setgoodbye",
                "save", 
                "respond",
                "setrespond",
                "autowrite",
                "autorecord",
                "autostatus",
                "antidelete",
                "update",
            ],
           "AI": [ 
                "gpt4", 
                "gpt4o", 
                "mistral", 
                "flux", 
                "sora",
            ],
           "image edit": [
                "removebg",
                "upscale",
                "img2sketch",
                "nanobanana",
                "toimg",
                "tovideo",
           ], 
           "Google": [ 
                "gemini", 
                "addgapi <YOUR_API>", 
                "removegapi", 
                "nanogen", 
                "imagefx",
                "veo3", 
                "vision",
                "nanobanana"
            ],
            "Downloads": [ 
                "apk",
                "movie",
                "series",
                "serieinfo", 
                "msearch", 
                "play", 
                "pinterest",
                "video",
                "ytmp3", 
                "ytmp4", 
                "youtube", 
                "instagram",
            ],
            "ios": [
                "iyoutube", 
            ],
            "Anime": [ 
                "waifu", "neko", "konachan", "loli",
                "hug", "kiss", "happy",
                "akiyama", "boruto", "deidara",
                "fanart", "sasuke", "bluearchive",
                "nsfw"
            ],
            "Adulte 18+": [
                "xvideo", "xnxx",
                "ass", "hwaifu", "hneko", "milf"
            ],

            "quizz & trivia": [ 
                "quizz", 
                "quizzstop"
            ],
            "Protection": [
                "antilink", 
                "antitag", 
                "antimedia", 
                "antispam", 
                "antipromote",
                "antidemote",
                "antitransfert",
                "antimention",
                "warnings", 
                "resetwarn", 
                "groupstatus"
            ], 
            "Groups": [
                "add", 
                "tag", 
                "tagall",
                "kick",
                "demote",
                "promote",
                "demoteall",
                "gdesc",
                "gname",
                "glink", 
                "welcome",
                "goodbye",
            ], 
           "Ephoto": [
                "metallic", "ice", "snow", "impressive", 
                "matrix", "light", "neon", "devil", 
                "purple", "thunder", "leaves", "1917", 
                "arena", "hacker", "sand", "glitch", 
                "fire", "dragonball", "foggyglass", "pornhub", 
                "foggyglassv2", "naruto", "typo", "marvel", 
                "frost", "pixelglitch", "neonglitch", "america", 
                "erase", "captainamerica", "blackpink", "starwars", 
                "bearlogo", "graffiti", "graffitiv2", "futuristic", 
                "clouds"
            ],
            "utils": [
                "dns", 
                "obfuscate", 
                "dbinary", 
                "fancy",
                "tourl",
                "vv", 
                "locate", 
                "gitclone",
            ]
           
        }
    };

    // On envoie les données structurées au gestionnaire de réponse
    await response.menu(sock, chatId, message, menuData);
}

export default helpCommand;
