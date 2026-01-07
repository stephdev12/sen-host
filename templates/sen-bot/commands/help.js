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
            "general": [
                "ping", 
                "menu", 
                "help"
            ],
            "owner": [
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
            ],
           "ai": [ 
                "gpt4", 
                "gpt4o", 
                "mistral", 
                "flux", 
                "sora",
            ],
           "image_edit": [
                "removebg",
                "upscale",
                "img2sketch",
                "nanobanana"
           ], 
           "google": [ 
                "gemini", 
                "addgapi <YOUR_API>", 
                "removegapi", 
                "nanogen", 
                "imagefx",
                "veo3", 
                "vision",
                "nanobanana"
            ],
            "downloads": [ 
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
            ],
            "ios": [
                "iyoutube", 
            ],
            "anime": [ 
                "waifu", "hwaifu", "loli",
                "hug", "kiss", "happy",
                "akiyama", "boruto", "deidara",
                "fanart", "sasuke", "bluearchive",
                "nsfw", "hneko"
            ],

            "quizz_trivia": [ 
                "quizz", 
                "quizzstop"
            ],
            "protection": [
                "antilink", 
                "antitag", 
                "antimedia", 
                "antispam", 
                "antipromote",
                "antidemote",
                "warnings", 
                "resetwarn", 
                "groupstatus"
            ], 
            "groups": [
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
           "ephoto": [
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
            ]
           
        }
    };

    // On envoie les données structurées au gestionnaire de réponse
    await response.menu(sock, chatId, message, menuData);
}

export default helpCommand;
