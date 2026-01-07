import dotenv from 'dotenv';
dotenv.config();

export default {
    // Bot Information
    botName: process.env.BOT_NAME || "𝗦𝗘𝗡",
    version: "1.0.0",
    
    // Owner Information (PRIORITÉ: .env > configs.js)
    ownerName: "𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑",
    ownerNumber: process.env.OWNER_NUMBER || "2376000000",
    
    // Connection Settings (PRIORITÉ: .env > configs.js)
    phoneNumber: process.env.PHONE_NUMBER || process.env.OWNER_NUMBER || "237650000003",
    sessionName: "session",
    
    // Sticker Information
    packname: "𝗦𝗘𝗡 Bot",
    author: "𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑",
    
    // Store Settings
    storeWriteInterval: 10000,
    
    // Memory Management
    maxMemoryMB: 400,
    gcInterval: 60000,
    memoryCheckInterval: 30000,
    
    // Temp Folder Settings
    tempCleanInterval: 10800000,
    tempFileMaxAge: 10800000,
    
    // API Keys
    apiKeys: {
        openai: process.env.OPENAI_API_KEY || "",
        gemini: process.env.GEMINI_API_KEY || "",
        weather: process.env.WEATHER_API_KEY || "",
        quizApi: process.env.QUIZ_API_KEY || ""
    },
    
    // Channel & Social Links
    channelLink: "https://whatsapp.com/channel/yourchannellink",
    githubLink: "https://github.com/𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑",
    supportGroup: "https://chat.whatsapp.com/yourgrouplink",
    
    // Newsletter Info
    newsletter: {
        jid: '120363161513685998@newsletter',
        name: '𝗦𝗘𝗡'
    },
    
    // Bot Features
    features: {
        autoRead: false,
        autoTyping: false,
        autoReact: false,
        anticall: false,
        pmBlocker: false,
        autostatus: false
    },
    
    // Group Settings
    groupSettings: {
        antilink: {
            enabled: false,
            warnBeforeKick: true,
            warningsBeforeKick: 3
        },
        antibadword: {
            enabled: false,
            warnBeforeKick: true
        },
        antitag: {
            enabled: false
        },
        welcome: {
            enabled: false
        },
        goodbye: {
            enabled: false
        }
    },
    
    // Rate Limiting
    rateLimit: {
        enabled: true,
        maxCommands: 10,
        cooldown: 3000
    },
    
    // Prefix
    prefix: process.env.PREFIX || ".",
    
    // Timezone
    timezone: "Africa/Lagos",
    
    // Language
    language: process.env.LANGUAGE || "en",
    
    // Admin Settings
    sudo: [],
    
    // Database Settings
    database: {
        useJSON: true,
        path: "./data",
        mongoUri: process.env.MONGO_URI || ""
    }
};