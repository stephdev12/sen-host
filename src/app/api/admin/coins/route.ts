import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const password = request.headers.get('x-admin-password');
  if (password !== 'stephadmin123@') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
      const { email, amount } = await request.json();
      
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      await prisma.user.update({
          where: { email },
          data: { coins: { increment: amount } }
      });

      return NextResponse.json({ success: true });
  } catch (e) {
      return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
