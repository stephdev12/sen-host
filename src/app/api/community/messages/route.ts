import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const cookies = parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    
    // Verify token to ensure user is logged in
    jwt.verify(token, JWT_SECRET);

    const messages = await prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, id: true, role: true } // Don't expose sensitive info
        }
      }
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const cookies = parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const image = formData.get('image') as File | null;

    if (!content && !image) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    }

    let imagePath = null;
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = `${Date.now()}_${uuidv4()}_${image.name.replace(/\s/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/community');
      
      try {
        await writeFile(path.join(uploadDir, filename), buffer);
      } catch (e: any) {
        if (e.code === 'ENOENT') {
          const fs = require('fs');
          fs.mkdirSync(uploadDir, { recursive: true });
          await writeFile(path.join(uploadDir, filename), buffer);
        } else {
            throw e;
        }
      }
      imagePath = `/uploads/community/${filename}`;
    }

    const message = await prisma.message.create({
      data: {
        content: content || '',
        image: imagePath,
        userId: decoded.userId
      },
      include: {
        user: {
            select: { username: true, id: true, role: true }
        }
      }
    });

    return NextResponse.json({ message });

  } catch (error: any) {
    console.error('Community Post Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
