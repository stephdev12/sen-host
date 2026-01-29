require('dotenv').config();
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const treeKill = require('tree-kill');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY || 'change-me-please';
const INSTANCES_DIR = path.join(__dirname, 'instances');
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// Ensure directories exist
fs.ensureDirSync(INSTANCES_DIR);
fs.ensureDirSync(TEMPLATES_DIR);

app.use(express.json());
app.use(cors());

// Middleware Auth
app.use((req, res, next) => {
    const key = req.headers['x-api-key'];
    if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
    next();
});

// Helper: Get Directory Size
async function getDirectorySize(dirPath) {
    // Simple implementation (or use fast-folder-size)
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const paths = files.map(async file => {
      const path = path.join(dirPath, file.name);
      if (file.isDirectory()) return await getDirectorySize(path);
      if (file.isFile()) {
        const { size } = await fs.stat(path);
        return size;
      }
      return 0;
    });
    return (await Promise.all(paths)).flat(Infinity).reduce((i, size) => i + size, 0);
}

// 1. Sync Template (Platform sends a tarball or we clone via git - for now assuming manual copy or simple update)
// For simplicity: We expect templates to be present or uploaded.
// TODO: Add endpoint to upload template zip.

// 2. Create Bot
app.post('/create', async (req, res) => {
    try {
        const { botId, template, envContent, envFilename = '.env' } = req.body;
        if (!botId || !template) return res.status(400).json({ error: 'Missing data' });

        const templatePath = path.join(TEMPLATES_DIR, template);
        const instancePath = path.join(INSTANCES_DIR, botId);

        if (!fs.existsSync(templatePath)) return res.status(404).json({ error: 'Template not found on node' });

        await fs.copy(templatePath, instancePath, {
            filter: (src) => !src.includes('node_modules') && !src.includes('session')
        });

        // Symlink node_modules
        const templateModules = path.join(templatePath, 'node_modules');
        const instanceModules = path.join(instancePath, 'node_modules');
        if (fs.existsSync(templateModules)) {
            await fs.ensureSymlink(templateModules, instanceModules, 'junction');
        }

        await fs.writeFile(path.join(instancePath, envFilename), envContent);

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// 3. Actions (Start/Stop/Restart/Delete)
app.post('/action', async (req, res) => {
    try {
        const { botId, action } = req.body;
        const instancePath = path.join(INSTANCES_DIR, botId);
        const logPath = path.join(instancePath, 'logs.txt');
        const pidPath = path.join(instancePath, 'pid.json'); // Store PID locally

        if (!fs.existsSync(instancePath)) return res.status(404).json({ error: 'Bot instance not found' });

        let currentPid = null;
        if (fs.existsSync(pidPath)) {
            currentPid = JSON.parse(await fs.readFile(pidPath)).pid;
        }

        switch (action) {
            case 'start':
                if (currentPid) {
                    try { process.kill(currentPid, 0); return res.json({ message: 'Already running' }); }
                    catch (e) { /* Process dead, continue */ }
                }

                await fs.writeFile(logPath, ''); // Clear logs
                const logFd = await fs.open(logPath, 'a');
                
                const botEnv = { ...process.env };
                delete botEnv.DATABASE_URL;

                const child = spawn('node', ['--max-old-space-size=512', 'index.js'], {
                    cwd: instancePath,
                    detached: true,
                    stdio: ['ignore', logFd, logFd],
                    env: botEnv
                });
                child.unref();
                await fs.close(logFd);
                await fs.writeFile(pidPath, JSON.stringify({ pid: child.pid }));

                return res.json({ success: true, pid: child.pid });

            case 'stop':
                if (currentPid) {
                    await new Promise(resolve => treeKill(currentPid, 'SIGTERM', resolve));
                    await fs.remove(pidPath);
                }
                return res.json({ success: true });
            
            case 'delete':
                if (currentPid) await new Promise(resolve => treeKill(currentPid, 'SIGTERM', resolve));
                await fs.remove(instancePath);
                return res.json({ success: true });

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// 4. Logs
app.get('/logs/:botId', async (req, res) => {
    try {
        const { botId } = req.params;
        const logPath = path.join(INSTANCES_DIR, botId, 'logs.txt');
        if (!fs.existsSync(logPath)) return res.send('');
        
        // Simple read for now. Better: stream.
        const content = await fs.readFile(logPath, 'utf-8');
        res.send(content);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// 5. Status Check (Is bot running?)
app.get('/status/:botId', async (req, res) => {
    try {
        const { botId } = req.params;
        const pidPath = path.join(INSTANCES_DIR, botId, 'pid.json');
        if (!fs.existsSync(pidPath)) return res.json({ running: false });
        
        const { pid } = JSON.parse(await fs.readFile(pidPath));
        try {
            process.kill(pid, 0); // Check if process exists
            res.json({ running: true, pid });
        } catch (e) {
            res.json({ running: false });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Sen Node Agent running on port ${PORT}`);
});
