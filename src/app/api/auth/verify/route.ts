import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });
    }

    // Verify User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // Consume token
      },
    });

    // Reward Referrer if exists and first verification
    if (user.referredById) {
        // Ensure we haven't already rewarded (though token consume prevents double verify)
        // Ideally we could have a "referralRewardStatus" but simplicity:
        // Verification happens once, so reward happens once.
        
        await prisma.user.update({
            where: { id: user.referredById },
            data: { coins: { increment: 2 } }
        });
        console.log(`Referral reward given to ${user.referredById} for user ${user.id}`);
    }

    return NextResponse.json({ success: true, message: 'Email vérifié avec succès !' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
