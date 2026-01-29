import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { getInstancePath } from '@/lib/fileUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Helper to authenticate
async function getAuthUser(request: Request) {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    const cookies = parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return await prisma.user.findUnique({ where: { id: decoded.userId } });
    } catch {
        return null;
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bot = await prisma.bot.findUnique({ where: { id } });
    if (!bot || bot.ownerId !== user.id) {
        return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    let envVars = {};
    try {
        envVars = JSON.parse(bot.envVars || '{}');
    } catch (e) {
        envVars = {};
    }

    return NextResponse.json({ envVars });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bot = await prisma.bot.findUnique({ where: { id } });
    if (!bot || bot.ownerId !== user.id) {
        return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    const body = await request.json();
    const newEnvVars = body.envVars;

    if (!newEnvVars || typeof newEnvVars !== 'object') {
        return NextResponse.json({ error: 'Invalid envVars' }, { status: 400 });
    }

    // Update DB
    await prisma.bot.update({
        where: { id },
        data: { envVars: JSON.stringify(newEnvVars) }
    });

    // Update .env file
    const instanceDir = getInstancePath(id);
    const envContent = Object.entries(newEnvVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    
    await fs.ensureDir(instanceDir);
    await fs.writeFile(path.join(instanceDir, '.env'), envContent);

    return NextResponse.json({ success: true });
}
