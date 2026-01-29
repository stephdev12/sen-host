import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const password = request.headers.get('x-admin-password');
    if (password !== 'stephadmin123@') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, isPremium, days } = await request.json();
        
        let expiresAt = null;
        if (isPremium) {
            const now = new Date();
            expiresAt = new Date(now.setDate(now.getDate() + (days || 30)));
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isPremium,
                premiumExpiresAt: expiresAt
            }
        });

        return NextResponse.json({ success: true, user });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || 'Error updating premium status' }, { status: 500 });
    }
}
