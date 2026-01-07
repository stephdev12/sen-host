import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';
import { getDirectorySize, MAX_DISK_USAGE, MAX_RAM_MB } from '@/lib/fileUtils';

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
    const bot = await prisma.bot.findUnique({ where: { id } });
    if (!bot) return NextResponse.json({ error: 'Bot introuvable' }, { status: 404 });
    if (bot.ownerId !== user?.id && user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const instancePath = path.join(process.cwd(), 'instances', bot.id);
    const logPath = path.join(instancePath, 'logs.txt');

    // 3. Handle Actions
    switch (action) {
            case 'start':
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
      
              // Start Process
              // Mode 'a' pour append (ou 'w' pour overwrite mais openSync gère mal w si on veut stream en temps réel parfois)
              // Ici on a vidé le fichier avant, donc 'a' est ok.
              const logFd = await fs.open(logPath, 'a');
              
              const ramArg = `--max-old-space-size=${MAX_RAM_MB}`;
              const child = spawn('node', [ramArg, 'index.js'], {
                cwd: instancePath,
                shell: false,
                detached: true,
                stdio: ['ignore', logFd, logFd]
              });
              
              child.unref();
              await fs.close(logFd);
      
              await prisma.bot.update({
                where: { id: bot.id },
                data: { status: 'running', processId: child.pid },
              });
      
              return NextResponse.json({ success: true, message: 'Bot démarré' });
      
            case 'restart':
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
      
              const restartChild = spawn('node', [`--max-old-space-size=${MAX_RAM_MB}`, 'index.js'], {
                cwd: instancePath,
                shell: false,
                detached: true,
                stdio: ['ignore', restartLogFd, restartLogFd]
              });
              
              restartChild.unref();
              await fs.close(restartLogFd);
      
              await prisma.bot.update({
                where: { id: bot.id },
                data: { status: 'running', processId: restartChild.pid },
              });
      
              return NextResponse.json({ success: true, message: 'Bot redémarré' });
      
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
