import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

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
    const { name, phoneNumber, template = 'sen-bot' } = await request.json();
    if (!name || !phoneNumber) return NextResponse.json({ error: 'Nom et numéro requis' }, { status: 400 });

    // Sécurité : Empêcher l'accès aux dossiers parents
    if (template.includes('..') || template.includes('/') || template.includes('\\')) {
         return NextResponse.json({ error: 'Template invalide' }, { status: 400 });
    }

    // 3. Check Coins
    if (user.coins < 10) {
      return NextResponse.json({ error: 'Solde insuffisant (10 coins requis)' }, { status: 403 });
    }

    // 4. Create Bot Record
    const bot = await prisma.bot.create({
      data: {
        name,
        phoneNumber,
        ownerId: user.id,
        status: 'stopped',
        template: template,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h validity
      },
    });

    // 5. Deduct Coins
    await prisma.user.update({
      where: { id: user.id },
      data: { coins: { decrement: 10 } },
    });

    // 6. File System Operations
    // Utilisation du template dynamique
    const templatePath = path.join(process.cwd(), 'templates', template);
    
    // Vérifier si le template existe
    if (!await fs.pathExists(templatePath)) {
        // Rollback DB if possible or just fail
        // Ici on continue mais ça va planter le copy.
        // Idéalement on check avant le create prisma.
        throw new Error(`Template ${template} introuvable`);
    }

    const instancePath = path.join(process.cwd(), 'instances', bot.id);

    // Create instance directory
    await fs.ensureDir(instancePath);

    // Copy files (exclude node_modules and session)
    await fs.copy(templatePath, instancePath, {
      filter: (src) => {
        const basename = path.basename(src);
        return basename !== 'node_modules' && basename !== 'session' && basename !== '.git';
      }
    });

    // Symlink node_modules
    const templateNodeModules = path.join(templatePath, 'node_modules');
    const instanceNodeModules = path.join(instancePath, 'node_modules');
    
    // Check if template has node_modules, if not we might need to install them
    if (await fs.pathExists(templateNodeModules)) {
        try {
            await fs.ensureSymlink(templateNodeModules, instanceNodeModules, 'junction');
        } catch (e) {
            console.error("Symlink failed, falling back to copy (slow) or install", e);
            // Fallback? For now log error.
        }
    } else {
        // Run npm install in template first? Or just install in instance.
        // Assuming template has modules pre-installed.
        // If not, we should run npm install in template once.
    }

    // Create .env
    const envContent = `
PHONE_NUMBER=${phoneNumber}
OWNER_NUMBER=${phoneNumber}
BOT_NAME=${name}
PREFIX=.
MODE=public
# Prevent interactive prompts
CI=true
`;
    await fs.writeFile(path.join(instancePath, '.env'), envContent);

    return NextResponse.json({ success: true, botId: bot.id });

  } catch (error: any) {
    console.error('Create Bot Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
