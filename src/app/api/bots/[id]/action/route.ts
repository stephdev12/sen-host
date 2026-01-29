import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';
import { getDirectorySize, MAX_DISK_USAGE, MAX_RAM_MB, getInstancePath } from '@/lib/fileUtils';
import { callNodeApi } from '@/lib/nodeUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action } = await request.json(); // start, stop, restart, delete

    // 1. Auth Check
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const cookies = parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    // 2. Bot Check
    // Include Node relation
    const bot = await prisma.bot.findUnique({ 
        where: { id },
        include: { node: true }
    });

    if (!bot) return NextResponse.json({ error: 'Bot introuvable' }, { status: 404 });
    if (bot.ownerId !== user?.id && user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Check Premium for Custom Bots when starting
    if ((action === 'start' || action === 'restart') && bot.type === 'CUSTOM') {
        const isPremium = user?.isPremium && user?.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date();
        if (!isPremium) {
            return NextResponse.json({ error: 'Accès Premium requis pour démarrer un bot personnalisé.' }, { status: 403 });
        }
    }

    // --- REMOTE ACTION ---
    if (bot.nodeId && bot.node) {
        if (action === 'delete') {
            // Special handling for delete: call remote then delete local DB record
            await callNodeApi(bot.node, '/action', 'POST', { botId: bot.id, action: 'delete' });
            await prisma.bot.delete({ where: { id: bot.id } });
            return NextResponse.json({ success: true, message: 'Bot supprimé (Remote)' });
        }

        // Other actions: start, stop, restart
        const res = await callNodeApi(bot.node, '/action', 'POST', { botId: bot.id, action });
        
        // Update DB status if start/stop
        if (action === 'start' || action === 'restart') {
            // Note: we can't get the PID easily unless we trust the remote PID, 
            // but for remote management we might just store "running" status or the remote PID
            await prisma.bot.update({ 
                where: { id: bot.id }, 
                data: { status: 'running', processId: res.pid || 9999 } 
            });
        } else if (action === 'stop') {
             await prisma.bot.update({ 
                where: { id: bot.id }, 
                data: { status: 'stopped', processId: null } 
            });
        }
        
        return NextResponse.json({ success: true, message: `Bot ${action} (Remote)` });
    }

    // --- LOCAL ACTION (Fallback) ---
    const instancePath = getInstancePath(bot.id);
    const logPath = path.join(instancePath, 'logs.txt');

    // 3. Handle Actions
    switch (action) {
            case 'start': {
              if (bot.status === 'running') return NextResponse.json({ message: 'Déjà démarré' });
              
              // Check Disk Usage
              const diskUsage = await getDirectorySize(instancePath);
              if (diskUsage > MAX_DISK_USAGE) {
                   return NextResponse.json({
                       error: `Limite d'espace disque dépassée. Veuillez supprimer des fichiers.`
                   }, { status: 403 });
              }
      
              // Vider les logs avant de démarrer pour effacer l'ancien code de pairage
              await fs.writeFile(logPath, '');
      
              // 3. Define Start Command
              let command = process.execPath;
              let args = ['--max-old-space-size=' + MAX_RAM_MB, 'index.js'];
              let useShell = false;

              if (bot.startCommand) {
                  const parts = bot.startCommand.split(' ');
                  if (parts[0] === 'node') {
                      command = process.execPath;
                      args = ['--max-old-space-size=' + MAX_RAM_MB, ...parts.slice(1)];
                  } else {
                      command = bot.startCommand;
                      args = [];
                      useShell = true;
                  }
              }

              // Start Process
              const logFd = await fs.open(logPath, 'a');
              
              // Read PORT from env to override inherited PORT (which might be 3007 from platform)
              let botEnv = { ...process.env };
              // Critical: Always delete inherited PORT first so we don't accidentally use platform's port
              delete botEnv.PORT;
              delete botEnv.DATABASE_URL;
              delete botEnv.NODE_OPTIONS; // Ensure clean state
              
              try {
                  const envFilename = bot.envFileName || '.env';
                  const envFilePath = `${instancePath}/${envFilename}`;
                  const envContent = await fs.readFile(envFilePath, 'utf8');
                  const portMatch = envContent.match(/^PORT=(\d+)/m);
                  if (portMatch) {
                      botEnv.PORT = portMatch[1];
                  }
              } catch (e) {
                  console.error('Error reading env for PORT override:', e);
              }

              // Only apply patch_port.js if it exists (Generic solution for all templates)
              if (await fs.pathExists(path.join(instancePath, 'patch_port.js'))) {
                  botEnv.NODE_OPTIONS = (botEnv.NODE_OPTIONS || '') + ' -r ./patch_port.js';
              } else if (await fs.pathExists(path.join(instancePath, 'patch_port.cjs'))) {
                  botEnv.NODE_OPTIONS = (botEnv.NODE_OPTIONS || '') + ' -r ./patch_port.cjs';
              }

              const child = spawn(command, args, {
                cwd: instancePath,
                shell: useShell,
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
      
              return NextResponse.json({ success: true, message: 'Bot démarré' });
            }
      
            case 'restart': {
              // 1. Stop
              if (bot.status === 'running' && bot.processId) {
                  try {
                      await new Promise<void>((resolve) => {
                          treeKill(bot.processId!, 'SIGTERM', () => resolve());
                      });
                  } catch (e) {
                      console.error('Restart: Error stopping', e);
                  }
              }
              
              // 2. Wait a bit
              await new Promise(resolve => setTimeout(resolve, 2000));
      
              // 3. Start (Copy logic from start case)
              // Check Disk
              if ((await getDirectorySize(instancePath)) > MAX_DISK_USAGE) {
                   return NextResponse.json({ error: 'Espace disque insuffisant' }, { status: 403 });
              }
      
              // Clear logs
              await fs.writeFile(logPath, '');
              const restartLogFd = await fs.open(logPath, 'a');
      
              // Read PORT from env
              let restartBotEnv = { ...process.env };
              delete restartBotEnv.PORT;
              delete restartBotEnv.DATABASE_URL;
              delete restartBotEnv.NODE_OPTIONS;

              try {
                  const envFilename = bot.envFileName || '.env';
                  const envFilePath = `${instancePath}/${envFilename}`;
                  const envContent = await fs.readFile(envFilePath, 'utf8');
                  const portMatch = envContent.match(/^PORT=(\d+)/m);
                  if (portMatch) {
                      restartBotEnv.PORT = portMatch[1];
                  }
              } catch (e) {
                  console.error('Error reading env for restart PORT:', e);
              }

              // Only apply patch_port.js if it exists (Generic solution for all templates)
              if (await fs.pathExists(path.join(instancePath, 'patch_port.js'))) {
                  restartBotEnv.NODE_OPTIONS = (restartBotEnv.NODE_OPTIONS || '') + ' -r ./patch_port.js';
              } else if (await fs.pathExists(path.join(instancePath, 'patch_port.cjs'))) {
                  restartBotEnv.NODE_OPTIONS = (restartBotEnv.NODE_OPTIONS || '') + ' -r ./patch_port.cjs';
              }

              let restartCommand = process.execPath;
              let restartArgs = ['--max-old-space-size=' + MAX_RAM_MB, 'index.js'];
              let restartUseShell = false;

              if (bot.startCommand) {
                  const parts = bot.startCommand.split(' ');
                  if (parts[0] === 'node') {
                      restartCommand = process.execPath;
                      restartArgs = ['--max-old-space-size=' + MAX_RAM_MB, ...parts.slice(1)];
                  } else {
                      restartCommand = bot.startCommand;
                      restartArgs = [];
                      restartUseShell = true;
                  }
              }

              const restartChild = spawn(restartCommand, restartArgs, {
                cwd: instancePath,
                shell: restartUseShell,
                detached: true,
                stdio: ['ignore', restartLogFd, restartLogFd],
                env: restartBotEnv
              });
              
              restartChild.unref();
              await fs.close(restartLogFd);
      
              await prisma.bot.update({
                where: { id: bot.id },
                data: { status: 'running', processId: restartChild.pid },
              });
      
              return NextResponse.json({ success: true, message: 'Bot redémarré' });
            }
      
            case 'stop':        if (bot.status === 'stopped') return NextResponse.json({ message: 'Déjà arrêté' });
        
        if (bot.processId) {
            try {
                // Use tree-kill to kill process tree (npm spawns node)
                // Need to install tree-kill: npm install tree-kill
                await new Promise<void>((resolve) => {
                    treeKill(bot.processId!, 'SIGTERM', (err) => {
                         resolve();
                    });
                });
            } catch (e) {
                console.error('Error stopping process:', e);
            }
        }

        await prisma.bot.update({
          where: { id: bot.id },
          data: { status: 'stopped', processId: null },
        });
        
        return NextResponse.json({ success: true, message: 'Bot arrêté' });

      case 'delete':
        // Stop first if running
        if (bot.status === 'running' && bot.processId) {
             try {
                await new Promise<void>((resolve) => {
                    treeKill(bot.processId!, 'SIGTERM', (err) => {
                         if (err) console.error('TreeKill error:', err);
                         resolve();
                    });
                });
                // Give time for OS to release file locks (logs.txt)
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.error('Error stopping process during delete:', e);
            }
        }

        // Delete files with retry logic for Windows EPERM/EBUSY
        let attempts = 0;
        while (attempts < 5) {
            try {
                await fs.remove(instancePath);
                break; // Success
            } catch (e: any) {
                if (e.code === 'EPERM' || e.code === 'EBUSY') {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw e; // Other error
                }
            }
        }

        // Delete DB
        await prisma.bot.delete({ where: { id: bot.id } });

        return NextResponse.json({ success: true, message: 'Bot supprimé' });

      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Bot Action Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}