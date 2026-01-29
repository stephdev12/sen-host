import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export const dynamic = 'force-dynamic';

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
        lastDailyCoinAt: true,
        referralCode: true,
        emailVerified: true,
        dailyAdCount: true,
        lastAdWatchAt: true,
        lastDailyAdReset: true,
        isPremium: true,
        premiumExpiresAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const now = new Date();

    // Logic for Daily Ad Reset
    const lastAdReset = user.lastDailyAdReset ? new Date(user.lastDailyAdReset) : new Date(0);
    const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    };

    if (!isSameDay(now, lastAdReset)) {
       await prisma.user.update({
           where: { id: user.id },
           data: {
               dailyAdCount: 0,
               lastDailyAdReset: now
           }
       });
       user.dailyAdCount = 0;
       user.lastDailyAdReset = now;
    }

    // Logic for Daily Reward (Legacy/Bonus)
    const lastDaily = user.lastDailyCoinAt ? new Date(user.lastDailyCoinAt) : null;
    
    // Check if more than 24 hours passed or never received
    if (!lastDaily || (now.getTime() - lastDaily.getTime()) > 24 * 60 * 60 * 1000) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                coins: { increment: 1 },
                lastDailyCoinAt: now
            }
        });
        user.coins += 1;
    }

    const response = NextResponse.json(user);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }
}
