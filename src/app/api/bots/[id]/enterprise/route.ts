import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { getInstancePath } from '@/lib/fileUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

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

    const instancePath = getInstancePath(id);
    const filePath = path.join(instancePath, 'data', 'auto_respond.json');

    try {
        if (await fs.pathExists(filePath)) {
            const content = await fs.readJson(filePath);
            // Ensure migration/defaults
            if (!Array.isArray(content.responses)) content.responses = [];
            return NextResponse.json(content);
        } else {
             // Return default
             return NextResponse.json({ enabled: true, responses: [] });
        }
    } catch (error) {
        console.error("Error reading enterprise config", error);
        return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
    }
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
    
    // Validate body structure briefly
    if (typeof body.enabled !== 'boolean' || !Array.isArray(body.responses)) {
        return NextResponse.json({ error: 'Invalid config format' }, { status: 400 });
    }

    const instancePath = getInstancePath(id);
    const filePath = path.join(instancePath, 'data', 'auto_respond.json');

    try {
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeJson(filePath, body, { spaces: 2 });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error writing enterprise config", error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
