const { PrismaClient } = require('@prisma/client');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const treeKill = require('tree-kill');

const prisma = new PrismaClient();
const MAX_RAM_MB = 512;

async function updateBots() {
  console.log('Starting bot update process...');
  
  try {
    const bots = await prisma.bot.findMany();
    console.log(`Found ${bots.length} bots.`);

    for (const bot of bots) {
      console.log(`Processing bot: ${bot.name} (${bot.id})`);
      const instancePath = path.join(process.cwd(), 'instances', bot.id);
      const templateName = bot.template || 'sen-bot';
      const templatePath = path.join(process.cwd(), 'templates', templateName);

      if (!await fs.pathExists(templatePath)) {
        console.error(`Template ${templateName} not found for bot ${bot.id}. Skipping.`);
        continue;
      }

      // 1. Stop the bot if running
      if (bot.processId) {
        console.log(`Stopping process ${bot.processId}...`);
        try {
          await new Promise((resolve) => {
            treeKill(bot.processId, 'SIGTERM', (err) => {
                if(err) console.error(`Failed to kill ${bot.processId}:`, err);
                resolve();
            });
          });
          // Wait a bit for file locks
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          console.error('Error stopping process:', e);
        }
      }

      // 2. Update Files
      console.log('Copying files...');
      try {
          await fs.copy(templatePath, instancePath, {
            overwrite: true,
            dereference: false,
            filter: (src, dest) => {
              const basename = path.basename(src);
              // Exclude these from source copy
              if (basename === 'node_modules') return false;
              if (basename === '.git') return false;
              if (basename === 'session') return false; // Don't copy session from template (usually empty)
              
              // Also check destination preservation? fs.copy overwrites.
              // We need to ensure we don't overwrite .env if it exists in dest?
              // fs.copy logic: if src is a file, it copies it.
              // If we filter src, it won't be copied.
              
              // We want to PRESERVE: .env, session/, logs.txt IN THE DESTINATION.
              // Since fs.copy overwrites, we simply exclude them from the COPY if they exist in source (template shouldn't have .env usually).
              // But if template has .env (example), we should ignore it.
              if (basename === '.env') return false;
              if (basename === 'logs.txt') return false;
              
              return true;
            }
          });
      } catch (e) {
          console.error(`Error copying files for ${bot.id}:`, e);
          continue;
      }

      // 3. Ensure Symlink
      const templateNodeModules = path.join(templatePath, 'node_modules');
      const instanceNodeModules = path.join(instancePath, 'node_modules');
      if (await fs.pathExists(templateNodeModules)) {
          try {
              await fs.ensureSymlink(templateNodeModules, instanceNodeModules, 'junction');
          } catch (e) {
              console.error('Symlink error:', e);
          }
      }

      // 4. Restart (only if it was running or if we want to force restart all)
      // The user said "met a jours tout les bots connecter" (update all connected bots) and "n'oublie pas de les redemarrer".
      // Assuming we restart all valid bots.
      
      console.log('Restarting bot...');
      const logPath = path.join(instancePath, 'logs.txt');
      
      // Clear logs? Optional. User didn't ask, but it's cleaner. Let's append.
      // Actually `action` route clears it on start. Let's clear it to indicate fresh start.
      // await fs.writeFile(logPath, ''); 
      
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

      // 5. Update DB
      await prisma.bot.update({
        where: { id: bot.id },
        data: { status: 'running', processId: child.pid },
      });
      
      console.log(`Bot ${bot.name} restarted with PID ${child.pid}`);
    }

    console.log('Update complete.');
  } catch (error) {
    console.error('Global update error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBots();
