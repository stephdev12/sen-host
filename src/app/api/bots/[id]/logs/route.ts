import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';

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
    
    const bot = await prisma.bot.findUnique({ where: { id } });
    if (!bot) return NextResponse.json({ error: 'Bot introuvable' }, { status: 404 });
    if (bot.ownerId !== user?.id && user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const instancePath = path.join(process.cwd(), 'instances', bot.id);
    const logPath = path.join(instancePath, 'logs.txt');

    if (await fs.pathExists(logPath)) {
        const logs = await fs.readFile(logPath, 'utf8');
        // Extract pairing code if present
        // Look for "Pairing Code: XXXX-XXXX"
        // The bot prints: "✅ Your Pairing Code: 1234-5678"
        
        let pairingCode = null;
        const match = logs.match(/Pairing Code:\s*([A-Z0-9-]{9,})/);
        if (match) {
            pairingCode = match[1];
        }

        return NextResponse.json({ logs, pairingCode });
    }

    return NextResponse.json({ logs: '', pairingCode: null });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
