const { PrismaClient } = require('@prisma/client');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const AdmZip = require('adm-zip');

const execPromise = util.promisify(exec);
const prisma = new PrismaClient();

async function installBot() {
    const botId = process.argv[2];
    const sourceType = process.argv[3]; // 'GIT' or 'ZIP'
    const sourcePath = process.argv[4]; // URL or File Path

    if (!botId || !sourceType || !sourcePath) {
        console.error('Missing arguments: botId, sourceType, sourcePath');
        process.exit(1);
    }

    const instanceDir = path.join(__dirname, '..', 'instances', botId);
    await fs.ensureDir(instanceDir);
    const logFile = path.join(instanceDir, 'install.log');

    // Helper to log to file and console
    const log = async (msg) => {
        const timestamp = new Date().toISOString();
        const line = `[${timestamp}] ${msg}\n`;
        console.log(msg);
        await fs.appendFile(logFile, line);
    };

    try {
        await log('Starting installation...');
        
        // Fetch Bot data
        const bot = await prisma.bot.findUnique({ where: { id: botId } });
        if (!bot) throw new Error('Bot not found in database');

        // Update DB status
        await prisma.bot.update({
            where: { id: botId },
            data: { status: 'installing' }
        });

        // 1. Setup Source
        if (sourceType === 'GIT') {
            await log(`Cloning Git repository: ${sourcePath}`);
            // If directory is not empty (contains install.log), we use a temp dir
            const tempDir = path.join(instanceDir, '_temp_clone');
            await fs.ensureDir(tempDir);
            await execPromise(`git clone ${sourcePath} .`, { cwd: tempDir });
            
            // Move files to instanceDir
            const files = await fs.readdir(tempDir);
            for (const file of files) {
                await fs.move(path.join(tempDir, file), path.join(instanceDir, file), { overwrite: true });
            }
            await fs.remove(tempDir);
            await log('Git clone and move successful.');
        } else if (sourceType === 'ZIP') {
            await log(`Extracting ZIP file: ${sourcePath}`);
            if (!fs.existsSync(sourcePath)) {
                throw new Error(`Zip file not found: ${sourcePath}`);
            }
            
            try {
                const zip = new AdmZip(sourcePath);
                zip.extractAllTo(instanceDir, true); // overwrite = true
                await log('ZIP extraction successful.');
                
                // Handle nested folder (common in GitHub zips)
                const files = await fs.readdir(instanceDir);
                // Filter out system files/dirs that might be there
                const actualFiles = files.filter(f => !['install.log', 'patch_port.js', '.env', '__MACOSX'].includes(f));

                if (actualFiles.length === 1) {
                    const nestedPath = path.join(instanceDir, actualFiles[0]);
                    const stats = await fs.stat(nestedPath);
                    if (stats.isDirectory()) {
                        await log(`Detected nested folder: ${actualFiles[0]}. Moving contents up...`);
                        const nestedFiles = await fs.readdir(nestedPath);
                        for (const file of nestedFiles) {
                            await fs.move(path.join(nestedPath, file), path.join(instanceDir, file), { overwrite: true });
                        }
                        await fs.remove(nestedPath);
                        await log('Moved files to root.');
                    }
                }

                // Clean up zip file
                await fs.remove(sourcePath);
            } catch (zipError) {
                throw new Error(`Failed to extract ZIP: ${zipError.message}`);
            }
        }

        // 1.2. Parse & Discover Environment Variables
        await log('Scanning for configuration variables...');
        const discoveredVars = {};

        // Helper: Parse Key=Value files (.env)
        const parseEnvFile = async (filename) => {
            try {
                const p = path.join(instanceDir, filename);
                if (await fs.pathExists(p)) {
                    const content = await fs.readFile(p, 'utf8');
                    content.split('\n').forEach(line => {
                        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
                        if (match) discoveredVars[match[1]] = match[2].trim();
                    });
                    await log(`Parsed variables from ${filename}`);
                }
            } catch (e) { /* ignore */ }
        };

        // Helper: Parse JS files (Advanced Regex)
        const parseJsFile = async (filename) => {
            try {
                const p = path.join(instanceDir, filename);
                if (await fs.pathExists(p)) {
                    const content = await fs.readFile(p, 'utf8');
                    
                    // 1. Match process.env.VAR || "default"
                    // Catch VAR and Default (String)
                    let matches = content.matchAll(/process\.env\.([A-Z0-9_]+)\s*\|\|\s*['"](.*?)['"]/g);
                    for (const m of matches) {
                        if (!discoveredVars[m[1]]) discoveredVars[m[1]] = m[2];
                    }
                    
                    // 2. Match process.env.VAR || NUMBER/BOOL
                    matches = content.matchAll(/process\.env\.([A-Z0-9_]+)\s*\|\|\s*([0-9]+|true|false)/g);
                     for (const m of matches) {
                        if (!discoveredVars[m[1]]) discoveredVars[m[1]] = m[2];
                    }

                    // 3. Match just process.env.VAR (Set empty if not found)
                    matches = content.matchAll(/process\.env\.([A-Z0-9_]+)/g);
                    for (const m of matches) {
                        if (!discoveredVars[m[1]]) discoveredVars[m[1]] = "";
                    }

                    // 4. Global assignments (legacy)
                    // Matches global.VAR = "value" OR global.var = "value"
                    matches = content.matchAll(/global\.([a-zA-Z0-9_]+)\s*=\s*['"]([^'"]+)['"]/g);
                    for (const m of matches) {
                        // If it looks like an ENV var (uppercase), take it.
                        // Or if it matches typical config keys like "packname", "author"
                        // We map them to uppercase ENV style for .env consistency if reasonable
                        const key = m[1];
                        const val = m[2];
                        
                        if (key === key.toUpperCase()) {
                            if (!discoveredVars[key]) discoveredVars[key] = val;
                        } else {
                            // If it's lowercase like "packname", we might want to expose it as PACKNAME in .env
                            // But usually the bot code reads `global.packname`.
                            // .env is for process.env.
                            // If the bot reads process.env.PACKNAME, we caught it in step 1-3.
                            // If the bot reads global.packname directly from string, we can't inject it via .env unless the config file reads .env.
                            // So we only care about keys that are actually read from process.env OR if we are trying to patch the config.
                            // Since we only write to .env, we only care about process.env usage.
                            // So, ignoring global.lowercase unless we know it's mapped.
                            // Exception: explicit patterns like "global.owner = process.env.OWNER_NUMBER" which is caught by step 3.
                        }
                    }
                    
                    await log(`Scanned variables from ${filename}`);
                }
            } catch (e) { /* ignore */ }
        };
        
        await parseEnvFile('.env');
        await parseEnvFile('set.env');
        await parseEnvFile('config.env');
        await parseJsFile('config.js');
        await parseJsFile('configs.js'); // Added configs.js (plural)
        await parseJsFile('settings.js');
        await parseJsFile('index.js');

        // Merge with existing (User provided ones take precedence if we want, or discovered ones? 
        // Usually User provided > Discovered. But here User hasn't provided details yet if using the new flow.
        // So we merge: Existing (User) overwrites Discovered? Or Discovered fills gaps?
        // Let's say Discovered are defaults, User provided (if any) are overrides.)
        let existingVars = {};
        try { existingVars = JSON.parse(bot.envVars || '{}'); } catch (e) {}
        
        // Final Vars = Discovered + Existing (Existing overrides Discovered)
        // If the user hasn't set anything, existingVars is empty.
        const finalVars = { ...discoveredVars, ...existingVars };
        
        // Update DB with discovered vars so Frontend can see them
        await prisma.bot.update({
            where: { id: botId },
            data: { envVars: JSON.stringify(finalVars) }
        });
        
        // Update local reference for the next step
        bot.envVars = JSON.stringify(finalVars);

        // 1.5. Copy Port Patch (Early Apply)
        const patchSource = path.join(__dirname, '..', 'templates', 'ANITA-V5', 'patch_port.js');
        if (await fs.pathExists(patchSource)) {
            let isEsm = false;
            try {
                const pkg = await fs.readJson(path.join(instanceDir, 'package.json'));
                if (pkg.type === 'module') isEsm = true;
            } catch (e) {
                // If package.json doesn't exist yet or is invalid, assume CJS for now
            }

            const destFilename = isEsm ? 'patch_port.cjs' : 'patch_port.js';
            await fs.copy(patchSource, path.join(instanceDir, destFilename));
            await log(`Port patch applied as ${destFilename}.`);
        }

        // 2. Write .env file
        await log('Writing environment variables...');
        try {
            const envVars = JSON.parse(bot.envVars || '{}');
            // Ensure PORT is set if not present (although usually handled by platform, nice to have in .env)
            if (!envVars.PORT) envVars.PORT = '8080'; 

            const envContent = Object.entries(envVars)
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');
            
            await fs.writeFile(path.join(instanceDir, '.env'), envContent);
            await log('.env file created.');
        } catch (e) {
            await log(`Warning: Error parsing envVars: ${e.message}`);
        }

        // 3. Install Dependencies
        await log('Installing dependencies (npm install)... This may take a few minutes.');
        
        if (!fs.existsSync(path.join(instanceDir, 'package.json'))) {
             throw new Error('No package.json found in the root of the bot!');
        }

        // We use --ignore-scripts to avoid native module build failures (like lzma-native)
        // which are common in some environments and often not strictly required.
        const { stdout, stderr } = await execPromise('npm install --omit=dev --no-audit --ignore-scripts', { 
            cwd: instanceDir,
            maxBuffer: 1024 * 1024 * 50 // 50MB buffer
        });
        
        await log('NPM Install finished.');

        // 5. Finalize
        await log('Installation completed successfully.');
        await prisma.bot.update({
            where: { id: botId },
            data: { status: 'stopped' }
        });

    } catch (error) {
        await log(`CRITICAL ERROR: ${error.message}`);
        if (error.stack) await log(error.stack);
        
        await prisma.bot.update({
            where: { id: botId },
            data: { status: 'error' }
        });
    } finally {
        await prisma.$disconnect();
    }
}

installBot();