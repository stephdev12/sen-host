import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';
import { getDirectorySize, MAX_DISK_USAGE, MAX_RAM_MB, getInstancePath, getTemplatePath } from '@/lib/fileUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';
const INTERNAL_BOT_KEY = 'sen-bot-internal-key'; // Simple key for localhost communication

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // 1. Auth Check (Cookie OR Internal Header)
        let authorized = false;
        
        // Check Internal Header (for Bot Command)
        const botAuthHeader = request.headers.get('x-bot-auth');
        if (botAuthHeader === INTERNAL_BOT_KEY) {
            authorized = true;
        } else {
            // Check Cookie (for Dashboard)
            const cookieHeader = request.headers.get('cookie');
            if (cookieHeader) {
                const cookies = parse(cookieHeader);
                const token = cookies.auth_token;
                if (token) {
                    try {
                        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
                        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
                        const bot = await prisma.bot.findUnique({ where: { id } });
                        
                        if (bot && (bot.ownerId === user?.id || user?.role === 'admin')) {
                            authorized = true;
                        }
                    } catch (e) {}
                }
            }
        }

        if (!authorized) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const bot = await prisma.bot.findUnique({ where: { id } });
        if (!bot) return NextResponse.json({ error: 'Bot introuvable' }, { status: 404 });

        // 3. File Update Logic
        const templateName = bot.template || 'sen-bot';
        const sourceDir = getTemplatePath(templateName);
        const destDir = getInstancePath(bot.id);

        if (!await fs.pathExists(sourceDir)) {
            return NextResponse.json({ error: 'Template introuvable' }, { status: 500 });
        }

        console.log(`Upgrading bot ${id} from template...`);

        await fs.copy(sourceDir, destDir, {
            overwrite: true,
            filter: (src, dest) => {
                const basename = path.basename(src);
                if (basename === 'node_modules') return false;
                if (basename === '.env') return false;
                if (basename === '.git') return false;
                if (basename === 'session') return false;
                if (basename === 'data') return false;
                if (basename === 'logs.txt') return false;
                if (basename === 'configs.js') return false; 
                return true;
            }
        });

        // Ensure node_modules symlink exists
        const templateNodeModules = path.join(sourceDir, 'node_modules');
        const instanceNodeModules = path.join(destDir, 'node_modules');
        
        if (await fs.pathExists(templateNodeModules)) {
             try {
                await fs.ensureSymlink(templateNodeModules, instanceNodeModules);
             } catch (e) {
                 console.error('Symlink error (ignorable if exists):', e);
             }
        }

        // 4. RESTART LOGIC (Automatic)
        const instancePath = destDir;
        const logPath = path.join(instancePath, 'logs.txt');

        console.log(`Restarting bot ${id}...`);

        // Stop if running
        if (bot.status === 'running' && bot.processId) {
            try {
                await new Promise<void>((resolve) => {
                    treeKill(bot.processId!, 'SIGTERM', () => resolve());
                });
            } catch (e) {
                console.error('Restart: Error stopping', e);
            }
        }
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Start
        // Check Disk Usage
        try {
            const diskUsage = await getDirectorySize(instancePath);
            if (diskUsage > MAX_DISK_USAGE) {
                 // Even if disk full, we tried to update. But maybe we shouldn't start?
                 // Let's warn but try to start if possible or just fail start.
                 console.warn(`Disk usage high for ${id}`);
            }
        } catch(e) {}

        // Clear logs
        await fs.writeFile(logPath, '');
        const logFd = await fs.open(logPath, 'a');

        // Read PORT from .env
        let botEnv = { ...process.env };
        delete botEnv.PORT;
        delete botEnv.DATABASE_URL;

        try {
            const envFilePath = `${instancePath}/.env`;
            const envContent = await fs.readFile(envFilePath, 'utf8');
            const portMatch = envContent.match(/^PORT=(\d+)/m);
            if (portMatch) {
                botEnv.PORT = portMatch[1];
            }
        } catch (e) {
             console.error('Error reading .env for upgrade PORT:', e);
        }

        const maxRamFlag = '--max-old-space-size=' + MAX_RAM_MB;
        const args = [maxRamFlag, 'index.js'];
        const child = spawn(process.execPath, args, {
            cwd: instancePath,
            shell: false,
            detached: true,
            stdio: ['ignore', logFd, logFd],
            env: botEnv
        });
        
        child.unref();
        await fs.close(logFd);

        await prisma.bot.update({
            where: { id: bot.id },
            data: { status: 'running', processId: child.pid },
        });

        return NextResponse.json({ success: true, message: 'Bot mis à jour et redémarré avec succès' });

    } catch (error: any) {
        console.error('Upgrade Bot Error:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
    }
}
