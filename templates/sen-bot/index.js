/**
 * 𝗦𝗘𝗡 Bot - A WhatsApp Bot
 * Copyright (c) 2024 𝙎𝙏𝙀𝙋𝙃𝘿𝙀𝙑
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

import { SenBot } from './bot/SenBot.js';
import chalk from 'chalk';

// 🧹 Fix for ENOSPC / temp overflow in hosted panels
import fs from 'fs';
import path from 'path';

const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) {
    fs.mkdirSync(customTemp, { recursive: true });
}
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => {});
                }
            });
        }
    });
    console.log('🧹 Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

// Memory optimization - Force garbage collection if available
setInterval(() => {
    if (global.gc) {
        global.gc();
        console.log('🧹 Garbage collection completed');
    }
}, 60_000);

// Memory monitoring - Restart if RAM gets too high
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024;
    if (used > 400) {
        console.log('⚠️ RAM too high (>400MB), restarting bot...');
        process.exit(1);
    }
}, 30_000);

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error(chalk.red('Uncaught Exception:'), err);
});

process.on('unhandledRejection', (err) => {
    console.error(chalk.red('Unhandled Rejection:'), err);
});

// Start bot
async function main() {
    try {
        console.log(chalk.cyan('🚀 Starting 𝗦𝗘𝗡 Bot...'));
        
        const bot = new SenBot();
        await bot.initialize();
        
    } catch (error) {
        console.error(chalk.red('Fatal error:'), error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error(chalk.red('Fatal error in main:'), error);
    process.exit(1);
});