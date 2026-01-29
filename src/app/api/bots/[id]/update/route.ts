import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import fs from 'fs-extra';
import path from 'path';
import { getInstancePath } from '@/lib/fileUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { phoneNumber, name } = await request.json();

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

        // 3. Update DB
        const updatedBot = await prisma.bot.update({
            where: { id },
            data: { 
                phoneNumber: phoneNumber || bot.phoneNumber,
                name: name || bot.name
            }
        });

        // 4. Update env
        const instancePath = getInstancePath(bot.id);
        const envFilename = bot.template === 'keith-md' ? 'set.env' : '.env';
        const envPath = path.join(instancePath, envFilename);
        
        if (await fs.pathExists(envPath)) {
            let envContent = await fs.readFile(envPath, 'utf8');
            if (phoneNumber) {
                envContent = envContent.replace(/PHONE_NUMBER=.*/, `PHONE_NUMBER=${phoneNumber}`);
                envContent = envContent.replace(/OWNER_NUMBER=.*/, `OWNER_NUMBER=${phoneNumber}`);
            }
            if (name) {
                envContent = envContent.replace(/BOT_NAME=.*/, `BOT_NAME=${name}`);
            }
            await fs.writeFile(envPath, envContent);
        }

        return NextResponse.json({ success: true, bot: updatedBot });
    } catch (error: any) {
        console.error('Update Bot Error:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
    }
}
