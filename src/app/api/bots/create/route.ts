import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { getAvailableNode, callNodeApi } from '@/lib/nodeUtils';
import { getInstancePath, getTemplatePath } from '@/lib/fileUtils';

const execPromise = util.promisify(exec);
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(request: Request) {
  try {
    // 1. Auth Check
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const cookies = parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    // 2. Validate Request
    const { name, phoneNumber, template = 'sen-bot', sessionId, envVars } = await request.json();
    if (!name || !phoneNumber) return NextResponse.json({ error: 'Nom et numéro requis' }, { status: 400 });

    if ((template === 'ANITA-V5' || template === 'keith-md') && !sessionId) {
        return NextResponse.json({ error: 'Session ID requis pour ce bot' }, { status: 400 });
    }

    // Sécurité : Empêcher l'accès aux dossiers parents
    if (template.includes('..') || template.includes('/') || template.includes('\\')) {
         return NextResponse.json({ error: 'Template invalide' }, { status: 400 });
    }

    // 2.1 Check Global Settings
    let settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
    // Default fallback if settings are missing
    const MAX_BOTS = settings?.maxTotalBots ?? 100;
    const MIN_COINS = settings?.minCoinsToCreate ?? 10;
    const MAINTENANCE = settings?.maintenanceMode ?? false;

    if (MAINTENANCE) {
      return NextResponse.json({ error: 'La création de bots est temporairement désactivée.' }, { status: 503 });
    }

    const currentTotalBots = await prisma.bot.count();
    if (currentTotalBots >= MAX_BOTS) {
      return NextResponse.json({ error: `Capacité maximale du serveur atteinte (${currentTotalBots}/${MAX_BOTS}).` }, { status: 503 });
    }

    // 2.2 Check User Bot Limit
    const isPremium = user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date();
    
    if (!isPremium) {
        const userBotCount = await prisma.bot.count({ where: { ownerId: user.id } });
        if (userBotCount >= 2) {
          return NextResponse.json({ error: 'Vous ne pouvez pas créer plus de 2 bots à la fois (Passez Premium pour illimité).' }, { status: 403 });
        }
    }

    // Fetch Template Data for Start Command
    const templateData = await prisma.template.findFirst({
        where: { folderName: template }
    });

    // 3. Check Coins (Skip for Premium)
    if (!isPremium && user.coins < MIN_COINS) {
      return NextResponse.json({ error: `Solde insuffisant (${MIN_COINS} coins requis)` }, { status: 403 });
    }

    // Use port 0 to let the OS assign a random available port
    const PORT = 0;

    // Env Content Construction
    let finalEnvVars: Record<string, any> = {};

    if (envVars && Object.keys(envVars).length > 0) {
        // Use Dynamic Env Vars provided by Frontend
        finalEnvVars = { ...envVars };
    } else {
        // Fallback: Legacy Hardcoded Templates
        if (template === 'ANITA-V5') {
            finalEnvVars = {
                SESSION_ID: sessionId,
                OWNER_NUMBER: phoneNumber,
                OWNER_NUMBERS: phoneNumber,
                BOT_NAME: name,
                PREFIX: '.',
                PUBLIC: 'true',
                PACK_NAME: name,
                AUTHOR: name,
                ANTI_DELETE: 'true',
                ANTI_CALL: 'false',
                UNAVAILABLE: 'false',
                AVAILABLE: 'true',
                AUTO_READ_MESSAGES: 'false',
                CHATBOT: 'false',
                AUTO_REACT: 'false',
                AUTO_TYPING: 'false',
                AUTO_STATUS_VIEW: 'true',
                AUTO_STATUS_REACT: 'false',
                WELCOME: 'true',
                AUTO_BIO: 'false',
                ANTI_TEMU: 'true',
                ANTI_TAG: 'true'
            };
        } else if (template === 'KnutXMD-V3') {
             finalEnvVars = {
                PREFIXE: '.',
                DOSSIER_AUTH: 'session',
                NUMBER: phoneNumber,
                USE_QR: 'false',
                LOG_LEVEL: 'info',
                RECONNECT_DELAY: '5000'
             };
        } else if (template === 'keith-md') {
             finalEnvVars = {
                SESSION: sessionId,
                OWNER_NUMBER: phoneNumber,
                BOT_NAME: name,
                PREFIX: '.',
                MODE: 'public'
             };
        } else {
             // Generic Fallback (e.g. Sen Bot)
             finalEnvVars = {
                PHONE_NUMBER: phoneNumber,
                OWNER_NUMBER: phoneNumber,
                BOT_NAME: name,
                PREFIX: '.',
                MODE: 'public'
             };
        }
    }

    // Force System overrides
    finalEnvVars.PORT = PORT;
    finalEnvVars.CI = 'true';

    // NEW: Check for available Node
    const availableNode = await getAvailableNode();

    // 4. Create Bot Record (Optimistic creation)
    const envFileName = templateData?.envFileName || '.env';

    const bot = await prisma.bot.create({
      data: {
        name,
        phoneNumber,
        ownerId: user.id,
        status: 'stopped',
        template: template,
        startCommand: templateData?.startCommand ?? "node index.js",
        envFileName: envFileName,
        lastDeductionAt: new Date(),
        expiresAt: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        nodeId: availableNode ? availableNode.id : null, // Assign to node if found
        envVars: JSON.stringify(finalEnvVars)
      },
    });

    // 5. Deduct Coins (Skip for Premium)
    if (!isPremium) {
        await prisma.user.update({
            where: { id: user.id },
            data: { coins: { decrement: MIN_COINS } },
        });
    }

    // Convert to String
    const envContent = Object.entries(finalEnvVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    
    // Determine filename (Used from above)

    if (availableNode) {
        // --- REMOTE DEPLOYMENT ---
        try {
            await callNodeApi(availableNode, '/create', 'POST', {
                botId: bot.id,
                template: template,
                envContent: envContent,
                envFilename: envFileName
            });
        } catch (error) {
            // Rollback if deployment fails
            await prisma.bot.delete({ where: { id: bot.id } });
            await prisma.user.update({ where: { id: user.id }, data: { coins: { increment: MIN_COINS } } }); // Refund
            throw new Error('Échec du déploiement sur le noeud distant: ' + (error as Error).message);
        }

    } else {
        // --- LOCAL DEPLOYMENT (Fallback) ---
        // 6. File System Operations
        const templatePath = getTemplatePath(template);
        
        if (!await fs.pathExists(templatePath)) {
            throw new Error(`Template ${template} introuvable`);
        }

        // Check if template is still installing
        const isInstallingPath = path.join(templatePath, 'is_installing');
        if (await fs.pathExists(isInstallingPath)) {
            throw new Error('Le template est encore en cours d\'installation. Veuillez patienter quelques minutes.');
        }

        const instancePath = getInstancePath(bot.id);
        
        await fs.ensureDir(instancePath);

        await fs.copy(templatePath, instancePath, {
        filter: (src) => {
            const basename = path.basename(src);
            return basename !== 'node_modules' && basename !== 'session' && basename !== '.git';
        }
        });

        const templateNodeModules = path.join(templatePath, 'node_modules');
        const instanceNodeModules = path.join(instancePath, 'node_modules');
        
        if (await fs.pathExists(templateNodeModules)) {
            try {
                await fs.ensureSymlink(templateNodeModules, instanceNodeModules, 'junction');
            } catch (e) {
                console.error("Symlink failed, falling back to copy", e);
            }
        }

        await fs.writeFile(path.join(instancePath, envFileName), envContent);
    }

    return NextResponse.json({ success: true, botId: bot.id });

  } catch (error: any) {
    console.error('Create Bot Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
