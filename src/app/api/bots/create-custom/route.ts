import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { getInstancePath } from '@/lib/fileUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(request: Request) {
  console.log('[API] /api/bots/create-custom hit');
  try {
    // 1. Auth Check
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
        console.log('[API] No cookie header');
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const cookies = parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) {
        console.log('[API] No auth_token');
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
        console.log('[API] User not found');
        return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Coin Check (15 Coins required)
    if (user.coins < 15) {
        return NextResponse.json({ error: 'Solde insuffisant (15 coins requis).' }, { status: 403 });
    }

    // Deduct Coins
    await prisma.user.update({
        where: { id: user.id },
        data: { coins: { decrement: 15 } }
    });

    // 2. Parse Request
    console.log('[API] Parsing Request...');
    
    let name, sourceType, startCommand, envVarsJSON, sourcePath, zipFileBuffer, zipFileName;

    // Try parsing as JSON first (standard for modern APIs)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
        const body = await request.json();
        name = body.name;
        sourceType = body.sourceType;
        startCommand = body.startCommand || 'npm start';
        envVarsJSON = typeof body.envVars === 'object' ? JSON.stringify(body.envVars) : body.envVars;
        
        if (sourceType === 'GIT') {
            sourcePath = body.repoUrl;
        } 
        // Note: JSON cannot handle file uploads directly (ZIP). Use Base64 or separate upload if needed. 
        // For now, if sourceType is ZIP and JSON is used, we expect a path or error.
        
    } else if (contentType.includes('multipart/form-data')) {
        // Fallback to FormData for File Uploads
        const formData = await request.formData();
        name = formData.get('name') as string;
        sourceType = formData.get('sourceType') as string;
        startCommand = formData.get('startCommand') as string || 'npm start';
        envVarsJSON = formData.get('envVars') as string;

        if (sourceType === 'GIT') {
            sourcePath = formData.get('repoUrl') as string;
        } else if (sourceType === 'ZIP') {
             const file = formData.get('zipFile') as File;
             if (file) {
                 zipFileName = file.name;
                 zipFileBuffer = Buffer.from(await file.arrayBuffer());
             }
        }
    } else {
        return NextResponse.json({ error: 'Content-Type non supporté' }, { status: 415 });
    }
    
    console.log(`[API] Payload: name=${name}, sourceType=${sourceType}`);

    if (!name || !sourceType) {
        return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    // 3. Handle Source
    let finalSourcePath = '';
    
    if (sourceType === 'GIT') {
        if (!sourcePath || !sourcePath.startsWith('http')) {
            return NextResponse.json({ error: 'URL Git invalide' }, { status: 400 });
        }
        finalSourcePath = sourcePath;
    } else if (sourceType === 'ZIP') {
        if (!zipFileBuffer) {
            return NextResponse.json({ error: 'Fichier ZIP manquant' }, { status: 400 });
        }
        
        // Save ZIP to temporary location
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp_bots');
        await fs.ensureDir(uploadDir);
        
        const fileName = `${Date.now()}-${zipFileName || 'bot.zip'}`;
        finalSourcePath = path.join(uploadDir, fileName);
        await fs.writeFile(finalSourcePath, zipFileBuffer);
    } else {
        return NextResponse.json({ error: 'Type de source invalide' }, { status: 400 });
    }

    // 4. Create Bot in DB
    const bot = await prisma.bot.create({
        data: {
            name,
            ownerId: user.id,
            status: 'creating', // Initial status
            type: 'CUSTOM',
            template: 'custom', // Generic template name
            repoUrl: sourceType === 'GIT' ? finalSourcePath : null,
            zipFilePath: sourceType === 'ZIP' ? finalSourcePath : null,
            startCommand: startCommand,
            envVars: envVarsJSON,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
        }
    });

    // 5. Prepare Instance Directory
    const instanceDir = getInstancePath(bot.id);
    await fs.ensureDir(instanceDir);

    // 6. Spawn Background Install Script
    const scriptsDirName = 'scripts';
    const scriptFileName = 'install_custom_bot.js';
    const scriptPath = path.join(process.cwd(), scriptsDirName, scriptFileName);
    
    // Spawn detached process so API returns immediately
    const args = [scriptPath, bot.id, sourceType, finalSourcePath];
    const installProcess = spawn(process.execPath, args, {
        detached: true,
        stdio: 'ignore' // Ignore stdio to allow detaching
    });
    
    installProcess.unref(); // Allow parent to exit independently

    return NextResponse.json({ success: true, botId: bot.id, message: 'Installation démarrée en arrière-plan' });

  } catch (error: any) {
    console.error('Create Custom Bot Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
