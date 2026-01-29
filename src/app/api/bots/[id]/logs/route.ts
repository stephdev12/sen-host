import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { callNodeApi } from '@/lib/nodeUtils';
import { getInstancePath } from '@/lib/fileUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const cookies = parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    // Include Node info
    const bot = await prisma.bot.findUnique({ 
        where: { id },
        include: { node: true }
    });

    if (!bot) return NextResponse.json({ error: 'Bot introuvable' }, { status: 404 });
    if (bot.ownerId !== user?.id && user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    let logs = '';

    if (bot.nodeId && bot.node) {
        // --- REMOTE LOGS ---
        try {
            logs = await callNodeApi(bot.node, `/logs/${bot.id}`);
        } catch (e) {
            logs = `[Error fetching remote logs: ${(e as Error).message}]`;
        }
    } else {
        // --- LOCAL LOGS ---
        const instancePath = getInstancePath(bot.id);
        const logPath = path.join(instancePath, 'logs.txt');

        if (await fs.pathExists(logPath)) {
            logs = await fs.readFile(logPath, 'utf8');
        }
    }

    // Extract pairing code if present (Shared logic)
    // The bot prints: "✅ Your Pairing Code: 1234-5678" or "Code de pairage : 1234-5678" or similar
    let pairingCode = null;
    // Regex explanation:
    // 1. Keywords: Pairing Code, Code de pairage, etc.
    // 2. Separator: [^a-zA-Z0-9]* matches any non-alphanumeric chars (colons, spaces, " is ", etc.)
    // 3. Code: 4 chars, optional hyphen/space, 4 chars OR 8 chars.
    const pairingRegex = /(?:Pairing Code|Code de pairage|Code d'appairage|Votre code|Code de couplage|CODE DE CONNEXION|Your pairing code is|pairage)[^a-zA-Z0-9]*([A-Z0-9]{4}[-\s]?[A-Z0-9]{4}|[A-Z0-9]{8})/gi;
    const matches = [...logs.matchAll(pairingRegex)];
    
    if (matches.length > 0) {
        // Take the last match found in logs (the most recent one)
        pairingCode = matches[matches.length - 1][1].replace(/\s+/g, '');
    }

    // FALLBACK: Hardcode DEVSENKU for SENKU-XMD after 10s if not found
    if (!pairingCode && bot.template === 'SENKU-XMD') {
        try {
            const instancePath = getInstancePath(bot.id);
            const logPath = path.join(instancePath, 'logs.txt');
            if (await fs.pathExists(logPath)) {
                const stats = await fs.stat(logPath);
                // If logs are older than 10 seconds (bot started > 10s ago)
                if (Date.now() - stats.mtimeMs > 10000) {
                    pairingCode = "DEVSENKU";
                }
            }
        } catch (e) {
            // Ignore stats errors
        }
    }

    return NextResponse.json({ logs, pairingCode });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
