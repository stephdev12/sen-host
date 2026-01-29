import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const cookies = parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    const now = new Date();

    // 2. Daily Reset Logic
    let dailyAdCount = user.dailyAdCount;
    let lastReset = user.lastDailyAdReset ? new Date(user.lastDailyAdReset) : new Date(0); // Epoch if null

    const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    };

    if (!isSameDay(now, lastReset)) {
      dailyAdCount = 0;
      // We will update the reset time in the final transaction
    }

    // 3. Check Daily Limit
    if (dailyAdCount >= 10) {
      return NextResponse.json({ error: 'Limite quotidienne atteinte (10/10). Revenez demain !' }, { status: 403 });
    }

    // 4. Check Cooldown (15 seconds)
    if (user.lastAdWatchAt) {
      const diffInSeconds = (now.getTime() - new Date(user.lastAdWatchAt).getTime()) / 1000;
      if (diffInSeconds < 15) {
         return NextResponse.json({ error: 'Veuillez patienter 15 secondes entre chaque publicité.' }, { status: 429 });
      }
    }

    // 5. Reward User
    // We update everything in one go. If we just reset the counter, we use the reset date as now.
    // If not, we keep the old reset date (or update it? better update it to keep it fresh or just logic works)
    // Actually, if !isSameDay, we set lastDailyAdReset to now.
    
    const newResetDate = !isSameDay(now, lastReset) ? now : user.lastDailyAdReset;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: { increment: 1 },
        dailyAdCount: dailyAdCount + 1, // We use the calculated local variable
        lastAdWatchAt: now,
        lastDailyAdReset: newResetDate
      }
    });

    return NextResponse.json({ 
      success: true, 
      coins: updatedUser.coins,
      dailyAdCount: updatedUser.dailyAdCount,
      message: 'Coin ajouté avec succès !' 
    });

  } catch (error: any) {
    console.error('Ad Reward Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
