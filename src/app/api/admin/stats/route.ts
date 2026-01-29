import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const password = request.headers.get('x-admin-password');
  if (password !== 'stephadmin123@') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
      const usersCount = await prisma.user.count();
      const totalBotsCount = await prisma.bot.count();
      const activeBotsCount = await prisma.bot.count({ where: { status: 'running' } });
      const users = await prisma.user.findMany({
          include: { bots: true },
          orderBy: { createdAt: 'desc' },
          take: 10
      });
      
      const totalCoinsAgg = await prisma.user.aggregate({
          _sum: { coins: true }
      });

      return NextResponse.json({
          usersCount,
          totalBotsCount,
          activeBotsCount,
          totalCoins: totalCoinsAgg._sum.coins || 0,
          users
      });
  } catch (e) {
      return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
