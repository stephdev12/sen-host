import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { getInstancePath } from '@/lib/fileUtils';
import { randomUUID } from 'crypto';

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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // 1. Auth
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Validate Bot Ownership
    const bot = await prisma.bot.findUnique({ where: { id } });
    if (!bot || bot.ownerId !== user.id) {
        return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 3. Prepare Storage Path
        const instancePath = getInstancePath(id);
        const mediaDir = path.join(instancePath, 'data', 'media');
        await fs.ensureDir(mediaDir);

        // 4. Generate Safe Filename
        const ext = path.extname(file.name);
        const fileName = `${randomUUID()}${ext}`;
        const filePath = path.join(mediaDir, fileName);

        // 5. Write File
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        // 6. Return Relative Path (for auto_respond.json)
        // We store path relative to instance root or data folder
        const relativePath = `./data/media/${fileName}`;
        const publicUrl = fileName; // Just the name, logic will handle path

        return NextResponse.json({ 
            success: true, 
            path: relativePath,
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' : 'video'
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
