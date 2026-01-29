import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getVerificationEmailContent, sendEmail } from '@/lib/emailUtils';

export async function POST(request: Request) {
  try {
    const { email, password, username, referralCode: ref } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    // Strict Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json(
            { error: 'Format d\'email invalide.' },
            { status: 400 }
        );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Find referrer if code provided
    let referrer = null;
    if (ref) {
      referrer = await prisma.user.findUnique({
        where: { referralCode: ref }
      });
    }

    // Generate unique referral code and verification token
    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const verificationToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        coins: 0, 
        referralCode: newReferralCode,
        referredById: referrer ? referrer.id : null,
        verificationToken,
        emailVerified: null // Not verified yet
      },
    });

    // Send Verification Email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/verify-email?token=${verificationToken}`;
    
    console.log(`>>> LOG ONLY (Backup): Verify at ${verificationLink}`);
    
    const emailResult = await sendEmail({
        to: email,
        subject: 'Vérifiez votre compte / Verify your account',
        html: getVerificationEmailContent(username, verificationLink)
    });

    if (emailResult.success) {
        console.log(`Email envoyé à ${email}`);
    } else {
        console.error("Email sending failed:", emailResult.error);
        // On ne bloque pas l'inscription si l'email échoue
    }

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
        ...userWithoutPassword, 
        message: 'Inscription réussie. Veuillez vérifier vos emails.' 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription.' },
      { status: 500 }
    );
  }
}