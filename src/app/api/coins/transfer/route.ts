import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(request: Request) {
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
    const { targetEmail, amount } = await request.json();

    if (!targetEmail || !amount || amount < 20) {
      return NextResponse.json({ error: 'Montant minimum: 20 coins. Email requis.' }, { status: 400 });
    }

    const sender = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!sender || sender.coins < amount) {
      return NextResponse.json({ error: 'Coins insuffisants' }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({
      where: { email: targetEmail }
    });

    if (!receiver) {
      return NextResponse.json({ error: 'Destinataire introuvable' }, { status: 404 });
    }

    if (receiver.id === sender.id) {
        return NextResponse.json({ error: 'Impossible de s\'envoyer des coins' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { coins: { decrement: amount } }
      }),
      prisma.user.update({
        where: { id: receiver.id },
        data: { coins: { increment: amount } }
      })
    ]);

    return NextResponse.json({ success: true, message: `Transféré ${amount} coins à ${targetEmail}` });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du transfert' }, { status: 500 });
  }
}
