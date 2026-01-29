import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getVerificationEmailContent, sendEmail } from '@/lib/emailUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const cookies = parse(cookieHeader);
  const token = cookies.auth_token;
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ error: 'Déjà vérifié' }, { status: 400 });

    // Reuse existing token or create new one if null
    let verificationToken = user.verificationToken;
    if (!verificationToken) {
        verificationToken = uuidv4();
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken }
        });
    }

    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://senstudio.space'}/verify-email?token=${verificationToken}`;

    const emailResult = await sendEmail({
        to: user.email,
        subject: 'Vérifiez votre compte / Verify your account',
        html: getVerificationEmailContent(user.username, verificationLink)
    });

    if (!emailResult.success) {
        console.error("Resend error details:", emailResult.error);
        return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email envoyé' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
  }
}