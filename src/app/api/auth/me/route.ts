import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const cookies = parse(cookieHeader);
  const token = cookies.auth_token;

  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        coins: true,
        role: true,
        bots: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }
}
